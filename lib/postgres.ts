import { Pool } from "pg";
import type { Application, AuditEvent, ChunkRecord, DocumentRecord, User } from "./types";

let pool: Pool | null = null;

export function hasDatabaseUrl() {
  return Boolean(process.env.DATABASE_URL);
}

function getPool() {
  if (!process.env.DATABASE_URL) return null;
  pool ??= new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });
  return pool;
}

function userFromRow(row: Record<string, unknown>): User {
  return {
    id: String(row.id),
    name: String(row.name),
    email: String(row.email),
    passwordHash: String(row.password_hash),
    firmName: String(row.firm_name),
    role: row.role as User["role"],
    createdAt: new Date(String(row.created_at)).toISOString()
  };
}

function applicationFromRow(row: Record<string, unknown>): Application {
  return {
    id: String(row.id),
    userId: String(row.user_id),
    clientName: String(row.client_name),
    service: row.service as Application["service"],
    status: row.status as Application["status"],
    priority: row.priority as Application["priority"],
    dueDate: String(row.due_date).slice(0, 10),
    owner: row.owner ? String(row.owner) : undefined,
    notes: row.notes ? String(row.notes) : undefined,
    createdAt: new Date(String(row.created_at)).toISOString(),
    updatedAt: row.updated_at ? new Date(String(row.updated_at)).toISOString() : undefined
  };
}

function documentFromRow(row: Record<string, unknown>): DocumentRecord {
  return {
    id: String(row.id),
    userId: String(row.user_id),
    title: String(row.title),
    content: String(row.content),
    createdAt: new Date(String(row.created_at)).toISOString()
  };
}

function chunkFromRow(row: Record<string, unknown>): ChunkRecord {
  return {
    id: String(row.id),
    documentId: String(row.document_id),
    userId: String(row.user_id),
    index: Number(row.chunk_index),
    text: String(row.text),
    embedding: Array.isArray(row.embedding) ? row.embedding.map(Number) : JSON.parse(String(row.embedding)),
    createdAt: new Date(String(row.created_at)).toISOString()
  };
}

function eventFromRow(row: Record<string, unknown>): AuditEvent {
  return {
    id: String(row.id),
    userId: String(row.user_id),
    action: String(row.action),
    metadata: typeof row.metadata === "string" ? JSON.parse(row.metadata) : (row.metadata as Record<string, unknown>),
    createdAt: new Date(String(row.created_at)).toISOString()
  };
}

export const postgres = {
  async createUser(user: User, seedApplications: Omit<Application, "userId">[]) {
    const db = getPool();
    if (!db) return null;
    const client = await db.connect();
    try {
      await client.query("begin");
      await client.query(
        `insert into users (id, name, email, password_hash, firm_name, role, created_at)
         values ($1, $2, $3, $4, $5, $6, $7)`,
        [user.id, user.name, user.email, user.passwordHash, user.firmName, user.role, user.createdAt]
      );
      for (const app of seedApplications) {
        await client.query(
          `insert into applications (id, user_id, client_name, service, status, priority, due_date, owner, notes, created_at, updated_at)
           values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
          [
            `${app.id}_${user.id.slice(0, 6)}`,
            user.id,
            app.clientName,
            app.service,
            app.status,
            app.priority,
            app.dueDate,
            app.owner ?? null,
            app.notes ?? null,
            app.createdAt,
            app.updatedAt ?? null
          ]
        );
      }
      await client.query(
        "insert into audit_events (id, user_id, action, metadata, created_at) values ($1, $2, $3, $4, $5)",
        [crypto.randomUUID(), user.id, "user.created", JSON.stringify({ email: user.email }), new Date().toISOString()]
      );
      await client.query("commit");
      return user;
    } catch (error) {
      await client.query("rollback");
      throw error;
    } finally {
      client.release();
    }
  },

  async findUserByEmail(email: string) {
    const db = getPool();
    if (!db) return null;
    const result = await db.query("select * from users where lower(email) = lower($1) limit 1", [email]);
    return result.rows[0] ? userFromRow(result.rows[0]) : null;
  },

  async findUserById(id: string) {
    const db = getPool();
    if (!db) return null;
    const result = await db.query("select * from users where id = $1 limit 1", [id]);
    return result.rows[0] ? userFromRow(result.rows[0]) : null;
  },

  async listUsersByFirm(firmName: string) {
    const db = getPool();
    if (!db) return null;
    const result = await db.query("select * from users where lower(firm_name) = lower($1) order by name asc", [firmName]);
    return result.rows.map(userFromRow);
  },

  async updateManagedUser(currentUserId: string, firmName: string, id: string, input: Partial<Pick<User, "name" | "role">>) {
    const db = getPool();
    if (!db) return null;
    const result = await db.query(
      `update users
       set name = coalesce($1, name), role = coalesce($2, role)
       where id = $3 and lower(firm_name) = lower($4)
       returning *`,
      [input.name ?? null, input.role ?? null, id, firmName]
    );
    if (!result.rows[0]) return null;
    await this.addAuditEvent({
      id: crypto.randomUUID(),
      userId: currentUserId,
      action: "user.updated",
      metadata: { id, role: result.rows[0].role },
      createdAt: new Date().toISOString()
    });
    return userFromRow(result.rows[0]);
  },

  async deleteManagedUser(currentUserId: string, firmName: string, id: string) {
    const db = getPool();
    if (!db || currentUserId === id) return null;
    const result = await db.query("delete from users where id = $1 and lower(firm_name) = lower($2) returning email", [id, firmName]);
    if (!result.rows[0]) return false;
    await this.addAuditEvent({
      id: crypto.randomUUID(),
      userId: currentUserId,
      action: "user.deleted",
      metadata: { id, email: result.rows[0].email },
      createdAt: new Date().toISOString()
    });
    return true;
  },

  async getDashboard(userId: string) {
    const db = getPool();
    if (!db) return null;
    const [applications, documents, auditEvents] = await Promise.all([
      db.query("select * from applications where user_id = $1 order by due_date asc", [userId]),
      db.query("select * from documents where user_id = $1 order by created_at desc", [userId]),
      db.query("select * from audit_events where user_id = $1 order by created_at desc limit 12", [userId])
    ]);
    return {
      applications: applications.rows.map(applicationFromRow),
      documents: documents.rows.map(documentFromRow),
      auditEvents: auditEvents.rows.map(eventFromRow)
    };
  },

  async listApplications(userId: string) {
    const db = getPool();
    if (!db) return null;
    const result = await db.query("select * from applications where user_id = $1 order by due_date asc", [userId]);
    return result.rows.map(applicationFromRow);
  },

  async createApplication(userId: string, input: Omit<Application, "userId">) {
    const db = getPool();
    if (!db) return null;
    const result = await db.query(
      `insert into applications (id, user_id, client_name, service, status, priority, due_date, owner, notes, created_at, updated_at)
       values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
       returning *`,
      [
        input.id,
        userId,
        input.clientName,
        input.service,
        input.status,
        input.priority,
        input.dueDate,
        input.owner ?? null,
        input.notes ?? null,
        input.createdAt,
        input.updatedAt ?? null
      ]
    );
    await this.addAuditEvent({
      id: crypto.randomUUID(),
      userId,
      action: "application.created",
      metadata: { clientName: input.clientName, service: input.service },
      createdAt: new Date().toISOString()
    });
    return applicationFromRow(result.rows[0]);
  },

  async updateApplication(userId: string, id: string, input: Partial<Application>) {
    const db = getPool();
    if (!db) return null;
    const current = await db.query("select * from applications where user_id = $1 and id = $2 limit 1", [userId, id]);
    if (!current.rows[0]) return false;
    const merged = { ...applicationFromRow(current.rows[0]), ...input, updatedAt: new Date().toISOString() };
    const result = await db.query(
      `update applications
       set client_name = $1, service = $2, status = $3, priority = $4, due_date = $5, owner = $6, notes = $7, updated_at = $8
       where id = $9 and user_id = $10
       returning *`,
      [
        merged.clientName,
        merged.service,
        merged.status,
        merged.priority,
        merged.dueDate,
        merged.owner ?? null,
        merged.notes ?? null,
        merged.updatedAt,
        id,
        userId
      ]
    );
    await this.addAuditEvent({
      id: crypto.randomUUID(),
      userId,
      action: "application.updated",
      metadata: { id, status: merged.status, priority: merged.priority },
      createdAt: new Date().toISOString()
    });
    return applicationFromRow(result.rows[0]);
  },

  async deleteApplication(userId: string, id: string) {
    const db = getPool();
    if (!db) return null;
    const result = await db.query("delete from applications where id = $1 and user_id = $2 returning client_name", [id, userId]);
    if (!result.rows[0]) return false;
    await this.addAuditEvent({
      id: crypto.randomUUID(),
      userId,
      action: "application.deleted",
      metadata: { id, clientName: result.rows[0].client_name },
      createdAt: new Date().toISOString()
    });
    return true;
  },

  async addDocument(document: DocumentRecord, chunks: ChunkRecord[]) {
    const db = getPool();
    if (!db) return null;
    const client = await db.connect();
    try {
      await client.query("begin");
      await client.query(
        "insert into documents (id, user_id, title, content, created_at) values ($1, $2, $3, $4, $5)",
        [document.id, document.userId, document.title, document.content, document.createdAt]
      );
      for (const chunk of chunks) {
        await client.query(
          `insert into chunks (id, document_id, user_id, chunk_index, text, embedding, created_at)
           values ($1, $2, $3, $4, $5, $6, $7)`,
          [chunk.id, chunk.documentId, chunk.userId, chunk.index, chunk.text, JSON.stringify(chunk.embedding), chunk.createdAt]
        );
      }
      await client.query(
        "insert into audit_events (id, user_id, action, metadata, created_at) values ($1, $2, $3, $4, $5)",
        [
          crypto.randomUUID(),
          document.userId,
          "rag.document_ingested",
          JSON.stringify({ title: document.title, chunks: chunks.length }),
          new Date().toISOString()
        ]
      );
      await client.query("commit");
      return true;
    } catch (error) {
      await client.query("rollback");
      throw error;
    } finally {
      client.release();
    }
  },

  async getChunks(userId: string) {
    const db = getPool();
    if (!db) return null;
    const result = await db.query("select * from chunks where user_id = $1 order by created_at desc", [userId]);
    return result.rows.map(chunkFromRow);
  },

  async addAuditEvent(auditEvent: AuditEvent) {
    const db = getPool();
    if (!db) return null;
    await db.query("insert into audit_events (id, user_id, action, metadata, created_at) values ($1, $2, $3, $4, $5)", [
      auditEvent.id,
      auditEvent.userId,
      auditEvent.action,
      JSON.stringify(auditEvent.metadata),
      auditEvent.createdAt
    ]);
    return true;
  }
};

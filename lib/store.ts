import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import type { Application, AuditEvent, ChunkRecord, Database, DocumentRecord, User } from "./types";
import { postgres } from "./postgres";

const dataDir = path.join(process.cwd(), "data");
const dbPath = path.join(dataDir, "local.json");

const seedApplications: Omit<Application, "userId">[] = [
  {
    id: "app_gst_notice",
    clientName: "Aarav Textiles Pvt Ltd",
    service: "GST",
    status: "review",
    priority: "high",
    dueDate: "2026-08-29",
    owner: "Priya Raman",
    notes: "Prepare vendor-wise ITC reconciliation and penalty exposure memo.",
    createdAt: "2026-08-20T10:00:00.000Z",
    updatedAt: "2026-08-22T11:00:00.000Z"
  },
  {
    id: "app_audit_pack",
    clientName: "Northstar Foods LLP",
    service: "Audit",
    status: "processing",
    priority: "medium",
    dueDate: "2026-09-03",
    owner: "Arjun Mehta",
    notes: "Bank confirmations pending for two accounts.",
    createdAt: "2026-08-19T12:00:00.000Z",
    updatedAt: "2026-08-22T09:20:00.000Z"
  },
  {
    id: "app_kyc",
    clientName: "Bluegrid Mobility",
    service: "KYC",
    status: "filed",
    priority: "low",
    dueDate: "2026-08-25",
    owner: "Nikhil Rao",
    notes: "Client onboarding completed with PAN and GSTIN verified.",
    createdAt: "2026-08-18T09:30:00.000Z",
    updatedAt: "2026-08-21T16:45:00.000Z"
  }
];

export type ApplicationInput = {
  clientName: string;
  service: Application["service"];
  status: Application["status"];
  priority: Application["priority"];
  dueDate: string;
  owner?: string;
  notes?: string;
};

const emptyDb = (): Database => ({
  users: [],
  applications: [],
  documents: [],
  chunks: [],
  auditEvents: []
});

export async function readDb(): Promise<Database> {
  try {
    const raw = await readFile(dbPath, "utf8");
    return JSON.parse(raw) as Database;
  } catch {
    await mkdir(dataDir, { recursive: true });
    const db = emptyDb();
    await writeDb(db);
    return db;
  }
}

export async function writeDb(db: Database) {
  await mkdir(dataDir, { recursive: true });
  await writeFile(dbPath, JSON.stringify(db, null, 2));
}

export async function createUser(user: User) {
  const pgUser = await postgres.createUser(user, seedApplications);
  if (pgUser) return pgUser;

  const db = await readDb();
  db.users.push(user);
  for (const app of seedApplications) {
    db.applications.push({ ...app, id: `${app.id}_${user.id.slice(0, 6)}`, userId: user.id });
  }
  db.auditEvents.push(event(user.id, "user.created", { email: user.email }));
  await writeDb(db);
  return user;
}

export async function findUserByEmail(email: string) {
  const pgUser = await postgres.findUserByEmail(email);
  if (pgUser) return pgUser;

  const db = await readDb();
  return db.users.find((user) => user.email.toLowerCase() === email.toLowerCase()) ?? null;
}

export async function findUserById(id: string) {
  const pgUser = await postgres.findUserById(id);
  if (pgUser) return pgUser;

  const db = await readDb();
  return db.users.find((user) => user.id === id) ?? null;
}

export async function listUsersByFirm(firmName: string) {
  const pgUsers = await postgres.listUsersByFirm(firmName);
  if (pgUsers) return pgUsers;

  const db = await readDb();
  return db.users
    .filter((user) => user.firmName.toLowerCase() === firmName.toLowerCase())
    .sort((a, b) => a.name.localeCompare(b.name));
}

export async function updateManagedUser(
  currentUserId: string,
  firmName: string,
  id: string,
  input: Partial<Pick<User, "name" | "role">>
) {
  const pgUser = await postgres.updateManagedUser(currentUserId, firmName, id, input);
  if (pgUser) return pgUser;

  const db = await readDb();
  const user = db.users.find((item) => item.id === id && item.firmName.toLowerCase() === firmName.toLowerCase());
  if (!user) return null;
  if (input.name !== undefined) user.name = input.name;
  if (input.role !== undefined) user.role = input.role;
  db.auditEvents.push(event(currentUserId, "user.updated", { id, role: user.role }));
  await writeDb(db);
  return user;
}

export async function deleteManagedUser(currentUserId: string, firmName: string, id: string) {
  const pgDeleted = await postgres.deleteManagedUser(currentUserId, firmName, id);
  if (pgDeleted !== null) return pgDeleted;

  if (currentUserId === id) return false;
  const db = await readDb();
  const index = db.users.findIndex((user) => user.id === id && user.firmName.toLowerCase() === firmName.toLowerCase());
  if (index === -1) return false;
  const [removed] = db.users.splice(index, 1);
  db.applications = db.applications.filter((app) => app.userId !== id);
  db.documents = db.documents.filter((doc) => doc.userId !== id);
  db.chunks = db.chunks.filter((chunk) => chunk.userId !== id);
  db.auditEvents.push(event(currentUserId, "user.deleted", { id, email: removed.email }));
  await writeDb(db);
  return true;
}

export async function getDashboard(userId: string) {
  const pgDashboard = await postgres.getDashboard(userId);
  if (pgDashboard) return pgDashboard;

  const db = await readDb();
  return {
    applications: db.applications.filter((app) => app.userId === userId),
    documents: db.documents.filter((doc) => doc.userId === userId),
    auditEvents: db.auditEvents.filter((item) => item.userId === userId).slice(-12).reverse()
  };
}

export async function listApplications(userId: string) {
  const pgApplications = await postgres.listApplications(userId);
  if (pgApplications) return pgApplications;

  const db = await readDb();
  return db.applications
    .filter((app) => app.userId === userId)
    .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
}

export async function createApplication(userId: string, input: ApplicationInput) {
  const now = new Date().toISOString();
  const application: Application = {
    id: crypto.randomUUID(),
    userId,
    ...input,
    createdAt: now,
    updatedAt: now
  };

  const pgApplication = await postgres.createApplication(userId, application);
  if (pgApplication) return pgApplication;

  const db = await readDb();
  db.applications.push(application);
  db.auditEvents.push(event(userId, "application.created", {
    clientName: application.clientName,
    service: application.service
  }));
  await writeDb(db);
  return application;
}

export async function updateApplication(userId: string, id: string, input: Partial<ApplicationInput>) {
  const pgApplication = await postgres.updateApplication(userId, id, input);
  if (pgApplication !== null) return pgApplication || null;

  const db = await readDb();
  const application = db.applications.find((app) => app.id === id && app.userId === userId);
  if (!application) return null;

  Object.assign(application, input, { updatedAt: new Date().toISOString() });
  db.auditEvents.push(event(userId, "application.updated", {
    id,
    status: application.status,
    priority: application.priority
  }));
  await writeDb(db);
  return application;
}

export async function deleteApplication(userId: string, id: string) {
  const pgDeleted = await postgres.deleteApplication(userId, id);
  if (pgDeleted !== null) return pgDeleted;

  const db = await readDb();
  const index = db.applications.findIndex((app) => app.id === id && app.userId === userId);
  if (index === -1) return false;
  const [removed] = db.applications.splice(index, 1);
  db.auditEvents.push(event(userId, "application.deleted", {
    id,
    clientName: removed.clientName
  }));
  await writeDb(db);
  return true;
}

export async function addDocument(document: DocumentRecord, chunks: ChunkRecord[]) {
  const pgAdded = await postgres.addDocument(document, chunks);
  if (pgAdded) return;

  const db = await readDb();
  db.documents.push(document);
  db.chunks.push(...chunks);
  db.auditEvents.push(event(document.userId, "rag.document_ingested", {
    title: document.title,
    chunks: chunks.length
  }));
  await writeDb(db);
}

export async function getChunks(userId: string) {
  const pgChunks = await postgres.getChunks(userId);
  if (pgChunks) return pgChunks;

  const db = await readDb();
  return db.chunks.filter((chunk) => chunk.userId === userId);
}

export async function addAuditEvent(auditEvent: AuditEvent) {
  const pgAdded = await postgres.addAuditEvent(auditEvent);
  if (pgAdded) return;

  const db = await readDb();
  db.auditEvents.push(auditEvent);
  await writeDb(db);
}

export function event(userId: string, action: string, metadata: Record<string, unknown>): AuditEvent {
  return {
    id: crypto.randomUUID(),
    userId,
    action,
    metadata,
    createdAt: new Date().toISOString()
  };
}

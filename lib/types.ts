export type User = {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  firmName: string;
  role: "founder" | "admin" | "member";
  createdAt: string;
};

export type PublicUser = Omit<User, "passwordHash">;

export type Application = {
  id: string;
  userId: string;
  clientName: string;
  service: "GST" | "Income Tax" | "Audit" | "KYC" | "Advisory";
  status: "intake" | "processing" | "review" | "filed" | "blocked";
  priority: "low" | "medium" | "high";
  dueDate: string;
  owner?: string;
  notes?: string;
  createdAt: string;
  updatedAt?: string;
};

export type DocumentRecord = {
  id: string;
  userId: string;
  title: string;
  content: string;
  createdAt: string;
};

export type ChunkRecord = {
  id: string;
  documentId: string;
  userId: string;
  index: number;
  text: string;
  embedding: number[];
  createdAt: string;
};

export type AuditEvent = {
  id: string;
  userId: string;
  action: string;
  metadata: Record<string, unknown>;
  createdAt: string;
};

export type Database = {
  users: User[];
  applications: Application[];
  documents: DocumentRecord[];
  chunks: ChunkRecord[];
  auditEvents: AuditEvent[];
};

"use client";

import {
  Bot,
  BriefcaseBusiness,
  CalendarPlus,
  CheckCircle2,
  Crown,
  FileSearch,
  Mail,
  Pencil,
  Send,
  ShieldCheck,
  Trash2,
  Upload,
  UserRound,
  Users
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { useMemo, useState } from "react";
import type { Application, PublicUser } from "@/lib/types";

type Notice = {
  kind: "info" | "success" | "error";
  text: string;
};

type Props = {
  initialApplications: Application[];
  initialUsers: PublicUser[];
  activeView: "applications" | "pipeline" | "ai" | "team";
};

type ApplicationForm = {
  clientName: string;
  service: Application["service"];
  status: Application["status"];
  priority: Application["priority"];
  dueDate: string;
  owner: string;
  notes: string;
};

const blankApplication: ApplicationForm = {
  clientName: "",
  service: "GST",
  status: "intake",
  priority: "medium",
  dueDate: "2026-09-15",
  owner: "",
  notes: ""
};

const defaultContent =
  "Client received GST notice for mismatch between GSTR-3B and GSTR-2A for FY 2025-26. Department requested reconciliation, vendor-wise ITC summary, tax paid challans, and response within seven working days. Potential exposure is INR 4.8 lakh plus interest if unmatched credits are not explained.";

const defaultPrompt =
  "We received a GST demand notice with penalty risk. Prepare the fastest internal workflow and tell me what needs partner review.";

const team = [
  { id: "u_partner", name: "Priya Raman", email: "priya@demo-ca.com", role: "Partner", group: "partners" },
  { id: "u_preparer", name: "Arjun Mehta", email: "arjun@demo-ca.com", role: "Preparer", group: "preparers" },
  { id: "u_client", name: "Kavya Shah", email: "kavya@client-demo.com", role: "Client", group: "clients" },
  { id: "u_admin", name: "Nikhil Rao", email: "nikhil@demo-ca.com", role: "Admin", group: "admins" }
];

const templates = {
  deadline: {
    subject: "Action needed: compliance documents due this week",
    message:
      "Hi team,\n\nPlease upload the pending compliance documents and confirm ownership today. Obliq has flagged this workflow as deadline-sensitive, so update status, blockers, and next actions before end of day.\n\nThanks,\nObliq Operations"
  },
  review: {
    subject: "Partner review required for high-risk filing",
    message:
      "Hi,\n\nA high-risk workflow is ready for review. Please check the extracted facts, source citations, penalty exposure, and final response draft before it is sent externally.\n\nThanks,\nObliq Operations"
  },
  onboarding: {
    subject: "Welcome to your Obliq client workspace",
    message:
      "Hi,\n\nYour Obliq workspace is ready. You can now track document requests, filing progress, comments, and AI-generated checklists from one place.\n\nThanks,\nObliq Team"
  }
};

const statusLabels: Record<Application["status"], string> = {
  intake: "Intake",
  processing: "Processing",
  review: "Review",
  filed: "Filed",
  blocked: "Blocked"
};

function statusClass(status: Application["status"]) {
  if (status === "filed") return "green";
  if (status === "blocked") return "rose";
  if (status === "review") return "yellow";
  return "blue";
}

function roleIcon(role: string) {
  if (role === "Partner") return Crown;
  if (role === "Admin") return ShieldCheck;
  if (role === "Client") return UserRound;
  return BriefcaseBusiness;
}

export default function DashboardClient({ initialApplications, initialUsers, activeView }: Props) {
  const [applications, setApplications] = useState(initialApplications);
  const [managedUsers, setManagedUsers] = useState(initialUsers);
  const [userNotice, setUserNotice] = useState<Notice | null>(null);
  const [userForm, setUserForm] = useState({
    name: "",
    email: "",
    role: "member" as PublicUser["role"],
    password: "Password1"
  });
  const [form, setForm] = useState<ApplicationForm>({
    ...blankApplication,
    owner: team[1].name
  });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [appNotice, setAppNotice] = useState<Notice | null>(null);
  const [ragResult, setRagResult] = useState("");
  const [agentResult, setAgentResult] = useState("");
  const [notice, setNotice] = useState<Notice | null>(null);
  const [mailNotice, setMailNotice] = useState<Notice | null>(null);
  const [contentLength, setContentLength] = useState(defaultContent.length);
  const [agentLength, setAgentLength] = useState(defaultPrompt.length);
  const [mailGroup, setMailGroup] = useState("all");
  const [templateKey, setTemplateKey] = useState<keyof typeof templates>("deadline");
  const [mailSubject, setMailSubject] = useState(templates.deadline.subject);
  const [mailMessage, setMailMessage] = useState(templates.deadline.message);

  const selectedRecipients = team.filter((user) => mailGroup === "all" || user.group === mailGroup);
  const grouped = useMemo(
    () => Object.keys(statusLabels).map((status) => ({
      status: status as Application["status"],
      items: applications.filter((app) => app.status === status)
    })),
    [applications]
  );

  async function saveApplication(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (form.clientName.trim().length < 2) {
      setAppNotice({ kind: "error", text: "Add a client name before saving." });
      return;
    }

    const response = await fetch(editingId ? `/api/applications/${editingId}` : "/api/applications", {
      method: editingId ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form)
    });
    const data = await response.json();
    if (!response.ok) {
      setAppNotice({ kind: "error", text: data.error ?? "Application save failed." });
      return;
    }

    setApplications((current) =>
      editingId
        ? current.map((app) => (app.id === editingId ? data.application : app))
        : [data.application, ...current]
    );
    setForm({ ...blankApplication, owner: team[1].name });
    setEditingId(null);
    setAppNotice({ kind: "success", text: editingId ? "Application updated." : "Application created." });
  }

  function editApplication(application: Application) {
    setEditingId(application.id);
    setForm({
      clientName: application.clientName,
      service: application.service,
      status: application.status,
      priority: application.priority,
      dueDate: application.dueDate,
      owner: application.owner ?? "",
      notes: application.notes ?? ""
    });
    setAppNotice({ kind: "info", text: `Editing ${application.clientName}.` });
  }

  async function removeApplication(id: string) {
    const response = await fetch(`/api/applications/${id}`, { method: "DELETE" });
    const data = await response.json();
    if (!response.ok) {
      setAppNotice({ kind: "error", text: data.error ?? "Delete failed." });
      return;
    }
    setApplications((current) => current.filter((app) => app.id !== id));
    setAppNotice({ kind: "success", text: "Application deleted." });
  }

  async function ingest(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const values = Object.fromEntries(formData) as Record<string, string>;

    if ((values.title ?? "").trim().length < 2) {
      setNotice({ kind: "error", text: "Add a clear document title before indexing." });
      return;
    }
    if ((values.content ?? "").trim().length < 80) {
      setNotice({ kind: "error", text: "Paste at least 80 characters so retrieval has enough context." });
      return;
    }

    setNotice({ kind: "info", text: "Indexing document and generating searchable chunks..." });
    const response = await fetch("/api/rag/ingest", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values)
    });
    const data = await response.json();
    setNotice(
      response.ok
        ? { kind: "success", text: `Indexed ${data.chunks} chunk${data.chunks === 1 ? "" : "s"} successfully.` }
        : { kind: "error", text: data.error ?? "Document indexing failed." }
    );
  }

  async function query(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const values = Object.fromEntries(formData) as Record<string, string>;
    if ((values.query ?? "").trim().length < 4) {
      setRagResult("Ask a more specific question, for example: What evidence is needed for this GST notice?");
      return;
    }

    setRagResult("Searching indexed context...");
    const response = await fetch("/api/rag/query", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values)
    });
    const data = await response.json();
    setRagResult(response.ok ? data.answer : data.error ?? "RAG query failed.");
  }

  async function plan(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const values = Object.fromEntries(formData) as Record<string, string>;
    if ((values.prompt ?? "").trim().length < 10) {
      setAgentResult("Describe the client request in at least 10 characters so the agent can classify it.");
      return;
    }

    setAgentResult("Planning agent workflow...");
    const response = await fetch("/api/agent/plan", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values)
    });
    const data = await response.json();
    setAgentResult(response.ok ? JSON.stringify(data.plan, null, 2) : data.error ?? "Agent planning failed.");
  }

  async function sendMail(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (selectedRecipients.length === 0) {
      setMailNotice({ kind: "error", text: "No recipients match this group." });
      return;
    }

    setMailNotice({ kind: "info", text: "Queueing mail campaign in demo mode..." });
    const response = await fetch("/api/mail/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        group: mailGroup,
        subject: mailSubject,
        message: mailMessage,
        recipients: selectedRecipients.map((user) => user.email)
      })
    });
    const data = await response.json();
    setMailNotice(
      response.ok
        ? { kind: "success", text: `${data.recipients} recipient${data.recipients === 1 ? "" : "s"} queued. ${data.message}` }
        : { kind: "error", text: data.error ?? "Mail campaign failed." }
    );
  }

  function applyTemplate(key: keyof typeof templates) {
    setTemplateKey(key);
    setMailSubject(templates[key].subject);
    setMailMessage(templates[key].message);
  }

  async function createManagedUser(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const response = await fetch("/api/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(userForm)
    });
    const data = await response.json();
    if (!response.ok) {
      setUserNotice({ kind: "error", text: data.error ?? "User creation failed." });
      return;
    }
    setManagedUsers((current) => [...current, data.user].sort((a, b) => a.name.localeCompare(b.name)));
    setUserForm({ name: "", email: "", role: "member", password: "Password1" });
    setUserNotice({ kind: "success", text: "User created and added to the firm workspace." });
  }

  async function updateManagedRole(id: string, role: PublicUser["role"]) {
    const response = await fetch(`/api/users/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role })
    });
    const data = await response.json();
    if (!response.ok) {
      setUserNotice({ kind: "error", text: data.error ?? "User update failed." });
      return;
    }
    setManagedUsers((current) => current.map((user) => (user.id === id ? data.user : user)));
    setUserNotice({ kind: "success", text: "User role updated." });
  }

  async function removeManagedUser(id: string) {
    const response = await fetch(`/api/users/${id}`, { method: "DELETE" });
    const data = await response.json();
    if (!response.ok) {
      setUserNotice({ kind: "error", text: data.error ?? "User delete failed." });
      return;
    }
    setManagedUsers((current) => current.filter((user) => user.id !== id));
    setUserNotice({ kind: "success", text: "User removed from workspace." });
  }

  return (
    <>
      {activeView === "applications" ? (
        <>
          <div className="section-label">
            <span>01</span>
            <div>
              <strong>Application management</strong>
              <p>Create client work, assign owners, and update deadline-critical metadata.</p>
            </div>
          </div>
          <section id="applications" className="dashboard-grid workspace-top">
            <motion.div className="panel motion-safe" initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }}>
          <h3>
            <CalendarPlus size={20} /> {editingId ? "Edit application" : "Create application"}
          </h3>
          <form onSubmit={saveApplication} noValidate>
            <div className="form-split">
              <div className="field">
                <label htmlFor="clientName">Client</label>
                <input
                  id="clientName"
                  value={form.clientName}
                  onChange={(event) => setForm({ ...form, clientName: event.target.value })}
                  placeholder="Aarav Textiles Pvt Ltd"
                />
              </div>
              <div className="field">
                <label htmlFor="owner">Owner</label>
                <input
                  id="owner"
                  value={form.owner}
                  onChange={(event) => setForm({ ...form, owner: event.target.value })}
                  placeholder="Team owner"
                />
              </div>
            </div>
            <div className="form-split">
              <div className="field">
                <label htmlFor="service">Service</label>
                <select
                  id="service"
                  value={form.service}
                  onChange={(event) => setForm({ ...form, service: event.target.value as Application["service"] })}
                >
                  <option>GST</option>
                  <option>Income Tax</option>
                  <option>Audit</option>
                  <option>KYC</option>
                  <option>Advisory</option>
                </select>
              </div>
              <div className="field">
                <label htmlFor="status">Status</label>
                <select
                  id="status"
                  value={form.status}
                  onChange={(event) => setForm({ ...form, status: event.target.value as Application["status"] })}
                >
                  {Object.entries(statusLabels).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="form-split">
              <div className="field">
                <label htmlFor="priority">Priority</label>
                <select
                  id="priority"
                  value={form.priority}
                  onChange={(event) => setForm({ ...form, priority: event.target.value as Application["priority"] })}
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
              <div className="field">
                <label htmlFor="dueDate">Due date</label>
                <input
                  id="dueDate"
                  type="date"
                  value={form.dueDate}
                  onChange={(event) => setForm({ ...form, dueDate: event.target.value })}
                />
              </div>
            </div>
            <div className="field">
              <label htmlFor="notes">Notes</label>
              <textarea
                id="notes"
                value={form.notes}
                onChange={(event) => setForm({ ...form, notes: event.target.value })}
                placeholder="Evidence needed, blocker, internal context, or partner-review instruction."
              />
            </div>
            <div className="form-row">
              <button className="button primary" type="submit">
                <CheckCircle2 size={18} /> {editingId ? "Update" : "Create"}
              </button>
              {editingId ? (
                <button
                  className="button secondary"
                  type="button"
                  onClick={() => {
                    setEditingId(null);
                    setForm({ ...blankApplication, owner: team[1].name });
                  }}
                >
                  Cancel
                </button>
              ) : null}
            </div>
          </form>
          <AnimatePresence>
            {appNotice ? (
              <motion.p className={`alert ${appNotice.kind}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                {appNotice.text}
              </motion.p>
            ) : null}
          </AnimatePresence>
            </motion.div>
            <motion.div className="panel motion-safe app-summary-panel" initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
              <h3>Application list</h3>
              <div className="deadline-list">
                {applications.map((application) => (
                  <article className="deadline-card" key={application.id}>
                    <span className={`tag ${statusClass(application.status)}`}>{application.status}</span>
                    <div>
                      <strong>{application.clientName}</strong>
                      <p>{application.service} / {application.priority} priority / due {application.dueDate}</p>
                    </div>
                  </article>
                ))}
              </div>
            </motion.div>
          </section>
        </>
      ) : null}

      {activeView === "team" ? (
        <>
          <div className="section-label">
            <span>04</span>
            <div>
              <strong>Team and roles</strong>
              <p>Review the operating roles used by workflow ownership, mail groups, and escalation paths.</p>
            </div>
          </div>
          <motion.div className="dashboard-grid team-management-grid motion-safe" initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
            <section className="panel">
              <h3>
                <Users size={20} /> Add user
              </h3>
              <form onSubmit={createManagedUser} noValidate>
                <div className="field">
                  <label htmlFor="managedName">Name</label>
                  <input
                    id="managedName"
                    value={userForm.name}
                    onChange={(event) => setUserForm({ ...userForm, name: event.target.value })}
                    placeholder="Client success owner"
                  />
                </div>
                <div className="field">
                  <label htmlFor="managedEmail">Email</label>
                  <input
                    id="managedEmail"
                    type="email"
                    value={userForm.email}
                    onChange={(event) => setUserForm({ ...userForm, email: event.target.value })}
                    placeholder="owner@firm.com"
                  />
                </div>
                <div className="form-split">
                  <div className="field">
                    <label htmlFor="managedRole">Role</label>
                    <select
                      id="managedRole"
                      value={userForm.role}
                      onChange={(event) => setUserForm({ ...userForm, role: event.target.value as PublicUser["role"] })}
                    >
                      <option value="member">Member</option>
                      <option value="admin">Admin</option>
                      <option value="founder">Founder</option>
                    </select>
                  </div>
                  <div className="field">
                    <label htmlFor="managedPassword">Temp password</label>
                    <input
                      id="managedPassword"
                      value={userForm.password}
                      onChange={(event) => setUserForm({ ...userForm, password: event.target.value })}
                    />
                  </div>
                </div>
                <button className="button primary" type="submit">
                  <CheckCircle2 size={18} /> Create user
                </button>
              </form>
              {userNotice ? <p className={`alert ${userNotice.kind}`}>{userNotice.text}</p> : null}
            </section>

            <section className="panel">
              <div className="panel-head">
                <div>
                  <h3>
                    <Users size={20} /> Workspace users
                  </h3>
                  <p>Manage firm members, admins, and reviewer access.</p>
                </div>
                <span className="tag blue">{managedUsers.length} users</span>
              </div>
              <div className="user-list compact">
                {managedUsers.map((user) => {
                  const Icon = roleIcon(user.role === "founder" ? "Partner" : user.role === "admin" ? "Admin" : "Preparer");
                  return (
                    <motion.article className="user-row managed-user-row" key={user.id} whileHover={{ x: 4 }}>
                      <span className="avatar">
                        <Icon size={18} />
                      </span>
                      <div>
                        <strong>{user.name}</strong>
                        <span>{user.email}</span>
                      </div>
                      <select
                        aria-label={`Role for ${user.name}`}
                        value={user.role}
                        onChange={(event) => updateManagedRole(user.id, event.target.value as PublicUser["role"])}
                      >
                        <option value="member">Member</option>
                        <option value="admin">Admin</option>
                        <option value="founder">Founder</option>
                      </select>
                      <div className="icon-actions">
                        <button type="button" aria-label={`Delete ${user.name}`} onClick={() => removeManagedUser(user.id)}>
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </motion.article>
                  );
                })}
              </div>
            </section>
          </motion.div>
        </>
      ) : null}

      {activeView === "pipeline" ? (
        <>
          <div className="section-label">
            <span>02</span>
            <div>
              <strong>Workflow pipeline</strong>
              <p>Move work from intake to filing with clear priority and status signals.</p>
            </div>
          </div>
          <section className="panel kanban-panel">
        <div className="panel-head">
          <div>
            <h3>Application pipeline</h3>
            <p>Live CRUD board for client work, status, owners, priority, and due dates.</p>
          </div>
          <span className="tag green">{applications.length} workflows</span>
        </div>
        <div className="kanban">
          {grouped.map((column) => (
            <div className="kanban-column" key={column.status}>
              <div className="column-head">
                <strong>{statusLabels[column.status]}</strong>
                <span>{column.items.length}</span>
              </div>
              {column.items.map((application) => (
                <motion.article layout className="app-card" key={application.id} whileHover={{ y: -4 }}>
                  <div className="card-head">
                    <strong>{application.clientName}</strong>
                    <span className={`tag ${statusClass(application.status)}`}>{application.priority}</span>
                  </div>
                  <p>{application.service} due {application.dueDate}</p>
                  <p>{application.notes || "No notes added."}</p>
                  <div className="app-meta">
                    <span>{application.owner || "Unassigned"}</span>
                    <div className="icon-actions">
                      <button type="button" aria-label="Edit application" onClick={() => editApplication(application)}>
                        <Pencil size={16} />
                      </button>
                      <button type="button" aria-label="Delete application" onClick={() => removeApplication(application.id)}>
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </motion.article>
              ))}
            </div>
          ))}
        </div>
          </section>
        </>
      ) : null}

      {activeView === "ai" ? (
        <>
          <div className="section-label">
            <span>03</span>
            <div>
              <strong>AI workbench</strong>
              <p>Index documents, ask retrieval questions, plan agent workflows, and queue client communication.</p>
            </div>
          </div>
          <div className="dashboard-grid tools-grid">
        <motion.section id="rag" className="panel motion-safe" initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }}>
          <h3>
            <FileSearch size={20} /> RAG console
          </h3>
          <form onSubmit={ingest} noValidate>
            <div className="field">
              <label htmlFor="title">Document title</label>
              <input id="title" name="title" defaultValue="GST notice sample" />
            </div>
            <div className="field">
              <div className="form-row">
                <label htmlFor="content">Document text</label>
                <span className="char-count">{contentLength} characters</span>
              </div>
              <textarea
                id="content"
                name="content"
                minLength={80}
                onChange={(event) => setContentLength(event.currentTarget.value.length)}
                defaultValue={defaultContent}
              />
            </div>
            <button className="button primary" type="submit">
              <Upload size={18} /> Ingest
            </button>
            {notice ? <p className={`alert ${notice.kind}`}>{notice.text}</p> : null}
          </form>
          <form onSubmit={query} noValidate>
            <div className="field">
              <label htmlFor="query">Ask indexed documents</label>
              <input id="query" name="query" defaultValue="What evidence is needed for the GST notice?" />
            </div>
            <button className="button secondary" type="submit">
              <Send size={18} /> Query
            </button>
          </form>
          {ragResult ? <motion.pre className="result">{ragResult}</motion.pre> : null}
        </motion.section>

        <motion.section id="agent" className="panel motion-safe" initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
          <h3>
            <Bot size={20} /> AI agent planner
          </h3>
          <form onSubmit={plan} noValidate>
            <div className="field">
              <div className="form-row">
                <label htmlFor="prompt">Client request</label>
                <span className="char-count">{agentLength} characters</span>
              </div>
              <textarea
                id="prompt"
                name="prompt"
                onChange={(event) => setAgentLength(event.currentTarget.value.length)}
                defaultValue={defaultPrompt}
              />
            </div>
            <button className="button primary" type="submit">
              <Bot size={18} /> Plan workflow
            </button>
          </form>
          {agentResult ? <motion.pre className="result">{agentResult}</motion.pre> : null}
        </motion.section>

        <motion.section className="panel motion-safe" initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <h3>
            <Mail size={20} /> Mail campaigns
          </h3>
          <form onSubmit={sendMail} noValidate>
            <div className="form-split">
              <div className="field">
                <label htmlFor="mailGroup">Recipients</label>
                <select id="mailGroup" value={mailGroup} onChange={(event) => setMailGroup(event.target.value)}>
                  <option value="all">All users</option>
                  <option value="partners">Partners only</option>
                  <option value="preparers">Preparers only</option>
                  <option value="clients">Clients only</option>
                  <option value="admins">Admins only</option>
                </select>
              </div>
              <div className="field">
                <label htmlFor="template">Scenario</label>
                <select id="template" value={templateKey} onChange={(event) => applyTemplate(event.target.value as keyof typeof templates)}>
                  <option value="deadline">Deadline reminder</option>
                  <option value="review">Partner review</option>
                  <option value="onboarding">Client onboarding</option>
                </select>
              </div>
            </div>
            <div className="field">
              <label htmlFor="mailSubject">Subject</label>
              <input id="mailSubject" value={mailSubject} onChange={(event) => setMailSubject(event.target.value)} />
            </div>
            <div className="field">
              <div className="form-row">
                <label htmlFor="mailMessage">Custom message</label>
                <span className="char-count">{mailMessage.length} characters</span>
              </div>
              <textarea id="mailMessage" value={mailMessage} onChange={(event) => setMailMessage(event.target.value)} />
            </div>
            <div className="mail-preview">
              <strong>{selectedRecipients.length} recipients selected</strong>
              <p>{selectedRecipients.map((user) => user.email).join(", ")}</p>
            </div>
            <button className="button primary" type="submit">
              <Mail size={18} /> Queue mail
            </button>
            {mailNotice ? <p className={`alert ${mailNotice.kind}`}>{mailNotice.text}</p> : null}
          </form>
        </motion.section>
          </div>
        </>
      ) : null}
    </>
  );
}

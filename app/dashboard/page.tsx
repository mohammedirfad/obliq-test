import { redirect } from "next/navigation";
import {
  Bot,
  CalendarClock,
  Database,
  FileSearch,
  LayoutDashboard,
  LogOut,
  ShieldCheck,
  Sparkles
} from "lucide-react";
import { currentUser } from "@/lib/auth";
import { getDashboard } from "@/lib/store";
import DashboardClient from "./workspace";

export default async function DashboardPage() {
  const user = await currentUser();
  if (!user) redirect("/login");
  const data = await getDashboard(user.id);

  const active = data.applications.filter((app) => app.status !== "filed").length;
  const highRisk = data.applications.filter((app) => app.priority === "high").length;

  return (
    <main className="dashboard-page">
      <div className="dashboard-layout">
        <aside className="sidebar">
          <div className="brand">
            <span className="brand-mark">O</span>
            Obliq-io
          </div>
          <nav className="side-nav">
            <a href="#overview">
              <LayoutDashboard size={18} /> Overview
            </a>
            <a href="#applications">
              <CalendarClock size={18} /> Applications
            </a>
            <a href="#rag">
              <FileSearch size={18} /> RAG console
            </a>
            <a href="#agent">
              <Bot size={18} /> Agent planner
            </a>
            <form action="/api/auth/logout" method="post">
              <button className="logout" type="submit">
                <LogOut size={18} /> Logout
              </button>
            </form>
          </nav>
        </aside>
        <section className="main">
          <div className="topline">
            <div>
              <span className="eyebrow">
                <ShieldCheck size={17} /> {user.firmName}
              </span>
              <h2>Welcome, {user.name}</h2>
              <p className="hint">Command center for applications, indexed knowledge, and AI review flows.</p>
            </div>
            <span className="tag green">Secure session</span>
          </div>

          <div id="overview" className="kpis">
            <div className="kpi">
              <strong>{data.applications.length}</strong>
              <span>applications</span>
            </div>
            <div className="kpi">
              <strong>{active}</strong>
              <span>active workflows</span>
            </div>
            <div className="kpi">
              <strong>{highRisk}</strong>
              <span>high priority</span>
            </div>
            <div className="kpi">
              <strong>{data.documents.length}</strong>
              <span>indexed docs</span>
            </div>
          </div>

          <div className="dashboard-grid overview-grid">
            <section className="panel">
              <h3>
                <CalendarClock size={20} /> Client applications
              </h3>
              {data.applications.map((app) => (
                <article className="work-card" key={app.id}>
                  <div className="card-head">
                    <strong>{app.clientName}</strong>
                    <span className={app.priority === "high" ? "tag yellow" : "tag blue"}>
                      {app.service}
                    </span>
                  </div>
                  <p>
                    {app.status} / {app.priority} priority / due {app.dueDate}
                  </p>
                </article>
              ))}
            </section>

            <section className="panel">
              <h3>
                <Sparkles size={20} /> System events
              </h3>
              {data.auditEvents.length === 0 ? <p>No events yet.</p> : null}
              {data.auditEvents.map((event) => (
                <article className="work-card" key={event.id}>
                  <div className="card-head">
                    <strong>{event.action}</strong>
                    <Database size={18} />
                  </div>
                  <p>{new Date(event.createdAt).toLocaleString()}</p>
                </article>
              ))}
            </section>
          </div>

          <DashboardClient initialApplications={data.applications} />
        </section>
      </div>
    </main>
  );
}

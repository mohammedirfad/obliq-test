import { redirect } from "next/navigation";
import Link from "next/link";
import {
  Bot,
  CalendarClock,
  ChartNoAxesColumnIncreasing,
  Database,
  FileSearch,
  LayoutDashboard,
  LogOut,
  ShieldCheck,
  Sparkles
} from "lucide-react";
import { currentUser } from "@/lib/auth";
import { getDashboard, listUsersByFirm } from "@/lib/store";
import DashboardClient from "./workspace";

const views = ["overview", "applications", "pipeline", "ai", "team"] as const;
type DashboardView = (typeof views)[number];

function readView(value: string | undefined): DashboardView {
  return views.includes(value as DashboardView) ? (value as DashboardView) : "overview";
}

export default async function DashboardPage({
  searchParams
}: {
  searchParams?: Promise<{ view?: string }>;
}) {
  const user = await currentUser();
  if (!user) redirect("/login");
  const data = await getDashboard(user.id);
  const users = await listUsersByFirm(user.firmName);
  const params = await searchParams;
  const view = readView(params?.view);

  const active = data.applications.filter((app) => app.status !== "filed").length;
  const highRisk = data.applications.filter((app) => app.priority === "high").length;
  const statusCounts = {
    intake: data.applications.filter((app) => app.status === "intake").length,
    processing: data.applications.filter((app) => app.status === "processing").length,
    review: data.applications.filter((app) => app.status === "review").length,
    filed: data.applications.filter((app) => app.status === "filed").length,
    blocked: data.applications.filter((app) => app.status === "blocked").length
  };
  const maxStatusCount = Math.max(...Object.values(statusCounts), 1);
  const completionRate = data.applications.length
    ? Math.round((statusCounts.filed / data.applications.length) * 100)
    : 0;
  const nextApplications = [...data.applications]
    .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
    .slice(0, 3);

  return (
    <main className="dashboard-page">
      <div className="dashboard-layout">
        <aside className="sidebar">
          <div className="brand">
            <span className="brand-mark">O</span>
            Obliq-io
          </div>
          <nav className="side-nav">
            <Link className={view === "overview" ? "active" : ""} href="/dashboard?view=overview">
              <LayoutDashboard size={18} /> Overview
            </Link>
            <Link className={view === "applications" ? "active" : ""} href="/dashboard?view=applications">
              <CalendarClock size={18} /> Applications
            </Link>
            <Link className={view === "pipeline" ? "active" : ""} href="/dashboard?view=pipeline">
              <Sparkles size={18} /> Pipeline
            </Link>
            <Link className={view === "ai" ? "active" : ""} href="/dashboard?view=ai">
              <Bot size={18} /> AI workbench
            </Link>
            <Link className={view === "team" ? "active" : ""} href="/dashboard?view=team">
              <FileSearch size={18} /> Team
            </Link>
            <form action="/api/auth/logout" method="post">
              <button className="logout" type="submit">
                <LogOut size={18} /> Logout
              </button>
            </form>
          </nav>
        </aside>
        <section className="main">
          <div className="dashboard-hero">
            <div>
              <span className="eyebrow">
                <ShieldCheck size={17} /> {user.firmName}
              </span>
              <h2>Operations command center</h2>
              <p>Welcome, {user.name}. Track deadlines, automate document review, and keep every compliance workflow moving.</p>
            </div>
            <div className="hero-score">
              <strong>{completionRate}%</strong>
              <span>completion rate</span>
            </div>
          </div>

          {view === "overview" ? (
            <>
              <div id="overview" className="kpis">
                <div className="kpi">
                  <ChartNoAxesColumnIncreasing size={20} />
                  <strong>{data.applications.length}</strong>
                  <span>applications</span>
                </div>
                <div className="kpi">
                  <Sparkles size={20} />
                  <strong>{active}</strong>
                  <span>active workflows</span>
                </div>
                <div className="kpi">
                  <ShieldCheck size={20} />
                  <strong>{highRisk}</strong>
                  <span>high priority</span>
                </div>
                <div className="kpi">
                  <Database size={20} />
                  <strong>{data.documents.length}</strong>
                  <span>indexed docs</span>
                </div>
              </div>

              <div className="dashboard-grid overview-grid">
                <section className="panel analytics-panel">
                  <div className="panel-head">
                    <div>
                      <h3>
                        <ChartNoAxesColumnIncreasing size={20} /> Pipeline health
                      </h3>
                      <p>Status distribution across the active CA workflow board.</p>
                    </div>
                    <span className="tag blue">Live</span>
                  </div>
                  <div className="status-chart">
                    {Object.entries(statusCounts).map(([status, count]) => (
                      <div className="status-bar" key={status}>
                        <span>{status}</span>
                        <div>
                          <i style={{ width: `${Math.max((count / maxStatusCount) * 100, count ? 12 : 2)}%` }} />
                        </div>
                        <strong>{count}</strong>
                      </div>
                    ))}
                  </div>
                </section>

                <section className="panel next-panel">
                  <div className="panel-head">
                    <div>
                      <h3>
                        <CalendarClock size={20} /> Next deadlines
                      </h3>
                      <p>Closest client commitments, ordered by due date.</p>
                    </div>
                  </div>
                  <div className="deadline-list">
                    {nextApplications.map((app) => (
                      <article className="deadline-card" key={app.id}>
                        <span className={app.priority === "high" ? "tag yellow" : "tag blue"}>{app.service}</span>
                        <div>
                          <strong>{app.clientName}</strong>
                          <p>{app.status} / due {app.dueDate}</p>
                        </div>
                      </article>
                    ))}
                  </div>
                </section>

                <section className="panel event-panel">
                  <div className="panel-head">
                    <div>
                      <h3>
                        <Sparkles size={20} /> Audit trail
                      </h3>
                      <p>Recent auth, CRUD, RAG, and agent events.</p>
                    </div>
                  </div>
                  <div className="event-timeline">
                    {data.auditEvents.length === 0 ? <p className="hint">No events yet.</p> : null}
                    {data.auditEvents.slice(0, 6).map((event) => (
                      <article className="event-row" key={event.id}>
                        <span />
                        <div>
                          <strong>{event.action}</strong>
                          <p>{event.createdAt.replace("T", " ").slice(0, 16)} UTC</p>
                        </div>
                      </article>
                    ))}
                  </div>
                </section>
              </div>
            </>
          ) : (
            <div className="view-shell">
              <DashboardClient
                initialApplications={data.applications}
                initialUsers={users.map(({ passwordHash: _passwordHash, ...item }) => item)}
                activeView={view}
              />
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

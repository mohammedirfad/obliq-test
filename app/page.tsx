"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Bot,
  BrainCircuit,
  CheckCircle2,
  Database,
  FileSearch,
  GitBranch,
  LockKeyhole,
  ShieldCheck,
  Sparkles,
  Workflow
} from "lucide-react";

const features = [
  {
    icon: FileSearch,
    title: "CA firm document intelligence",
    text: "Ingest engagement letters, GST notices, filings, audit evidence, and client PDFs into a retrievable knowledge layer."
  },
  {
    icon: Workflow,
    title: "Workflow command center",
    text: "Track applications, client requests, compliance deadlines, ownership, and agent activity from one focused dashboard."
  },
  {
    icon: BrainCircuit,
    title: "Agent orchestration",
    text: "A provider-agnostic agent router can coordinate OpenAI, Gemini, or Groq with auditable tool plans and citations."
  },
  {
    icon: Database,
    title: "Supabase-ready data model",
    text: "Profiles, applications, documents, chunks, embeddings, audit events, and role policies are mapped in SQL."
  },
  {
    icon: ShieldCheck,
    title: "Security-first prototype",
    text: "Scrypt password hashing, signed HTTP-only sessions, input limits, least-privilege schema, and CI gates are included."
  },
  {
    icon: GitBranch,
    title: "Deployable engineering base",
    text: "Next.js app routes, typed modules, GitHub Actions, deploy script, env template, and architecture docs are ready to ship."
  }
];

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0 }
};

export default function Home() {
  return (
    <main className="shell">
      <nav className="nav">
        <Link className="brand" href="/">
          <span className="brand-mark">O</span>
          Obliq-io
        </Link>
        <div className="nav-links">
          <a href="#platform">Platform</a>
          <a href="#pipeline">RAG</a>
          <a href="#security">Security</a>
          <Link className="button secondary" href="/login">
            Login
          </Link>
          <Link className="button primary" href="/register">
            Start prototype <ArrowRight size={18} />
          </Link>
        </div>
      </nav>

      <section className="hero">
        <motion.div
          className="hero-copy motion-safe"
          initial="hidden"
          animate="visible"
          transition={{ duration: 0.7, ease: "easeOut" }}
          variants={fadeUp}
        >
          <span className="eyebrow">
            <Sparkles size={17} /> AI workflow OS for modern CA firms
          </span>
          <h1>Obliq-io</h1>
          <p className="lead">
            A fast, secure prototype that turns client documents, compliance tasks,
            and internal knowledge into an AI-assisted operating layer for chartered
            accounting teams.
          </p>
          <div className="hero-actions">
            <Link className="button primary" href="/register">
              Create workspace <ArrowRight size={18} />
            </Link>
            <Link className="button ghost" href="/dashboard">
              View dashboard
            </Link>
          </div>
          <div className="hero-chips" aria-label="Prototype capabilities">
            <span className="chip">
              <CheckCircle2 size={15} /> Auth
            </span>
            <span className="chip">
              <CheckCircle2 size={15} /> RAG
            </span>
            <span className="chip">
              <CheckCircle2 size={15} /> Agent planner
            </span>
            <span className="chip">
              <CheckCircle2 size={15} /> CI/CD
            </span>
          </div>
          <div className="metrics" aria-label="Prototype metrics">
            <div className="metric">
              <strong>4</strong>
              <span>core API groups</span>
            </div>
            <div className="metric">
              <strong>7</strong>
              <span>schema domains</span>
            </div>
            <div className="metric">
              <strong>&lt;1s</strong>
              <span>local RAG query path</span>
            </div>
          </div>
        </motion.div>

        <motion.div
          className="ops-board motion-safe"
          aria-label="Live workflow preview"
          initial={{ opacity: 0, scale: 0.96, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.12, ease: "easeOut" }}
        >
          <div className="board-top">
            <strong>Compliance operations</strong>
            <span className="eyebrow">
              <span className="status-dot" /> Live
            </span>
          </div>
          <div className="workflow">
            <article className="work-card">
              <div className="card-head">
                <strong>GST notice triage</strong>
                <span className="tag blue">RAG</span>
              </div>
              <p>Agent extracted facts, mapped clauses, and prepared a response checklist.</p>
              <div className="progress">
                <span style={{ width: "82%" }} />
              </div>
            </article>
            <article className="work-card">
              <div className="card-head">
                <strong>Client KYC application</strong>
                <span className="tag green">Ready</span>
              </div>
              <p>Profile, documents, risk flags, and assignee state synchronized.</p>
              <div className="progress">
                <span style={{ width: "96%", background: "var(--brand-2)" }} />
              </div>
            </article>
            <article className="work-card">
              <div className="card-head">
                <strong>Audit evidence request</strong>
                <span className="tag yellow">Review</span>
              </div>
              <p>Missing bank statement range detected and routed to the relationship owner.</p>
              <div className="progress">
                <span style={{ width: "58%", background: "var(--accent)" }} />
              </div>
            </article>
            <article className="work-card">
              <div className="card-head">
                <strong>Income tax filing pack</strong>
                <span className="tag blue">Agent</span>
              </div>
              <p>Drafting summary, anomaly checks, and source citations for partner review.</p>
              <div className="progress">
                <span style={{ width: "70%" }} />
              </div>
            </article>
          </div>
        </motion.div>
      </section>

      <section id="platform" className="band white">
        <div className="section-title">
          <span className="eyebrow">Product surface</span>
          <h2>Built as a working vertical slice, not a static mockup.</h2>
          <p>
            The prototype includes auth, user management endpoints, a responsive
            dashboard, application tracking, RAG ingestion/querying, and an agent
            planning endpoint that can later call real LLM providers.
          </p>
        </div>
        <div className="grid">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <motion.article
                className="feature motion-safe"
                key={feature.title}
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                whileHover={{ y: -6 }}
                transition={{ duration: 0.35 }}
              >
                <Icon size={28} />
                <h3>{feature.title}</h3>
                <p>{feature.text}</p>
              </motion.article>
            );
          })}
        </div>
      </section>

      <section id="pipeline" className="band">
        <div className="section-title">
          <span className="eyebrow">
            <Bot size={17} /> AI architecture
          </span>
          <h2>Chunking to answer generation is wired end to end.</h2>
          <p>
            The local prototype uses deterministic embeddings so reviewers can run it
            immediately. The interfaces are ready to swap in pgvector, OpenAI,
            Gemini, Groq, or another embedding provider.
          </p>
        </div>
        <div className="pipeline">
          <motion.div className="step" whileHover={{ y: -7 }}>
            <span>01</span>
            Document intake with validation and workspace ownership.
          </motion.div>
          <motion.div className="step" whileHover={{ y: -7 }}>
            <span>02</span>
            Token-aware chunking with overlap for source continuity.
          </motion.div>
          <motion.div className="step" whileHover={{ y: -7 }}>
            <span>03</span>
            Embedding and vector search with cosine similarity.
          </motion.div>
          <motion.div className="step" whileHover={{ y: -7 }}>
            <span>04</span>
            Agent response with citations, risk flags, and next actions.
          </motion.div>
        </div>
      </section>

      <section id="security" className="band white">
        <div className="section-title">
          <span className="eyebrow">
            <LockKeyhole size={17} /> Delivery
          </span>
          <h2>Secure enough for review, structured enough to scale.</h2>
          <p>
            The repo includes a Supabase schema with RLS notes, a JSON-backed local
            store for demo speed, signed session cookies, CI checks, and a deployment
            script for Vercel-style hosting.
          </p>
        </div>
      </section>
    </main>
  );
}

"use client";

import Link from "next/link";
import { motion, useScroll, useTransform } from "framer-motion";
import {
  ArrowRight,
  Bot,
  BrainCircuit,
  CheckCircle2,
  Database,
  FileSearch,
  GitBranch,
  Layers3,
  LockKeyhole,
  MessageSquareText,
  Newspaper,
  ShieldCheck,
  Sparkles,
  UsersRound,
  Workflow,
  Linkedin,
  Twitter
} from "lucide-react";
import PricingToggle from "./pricing-toggle";
import TestimonialCarousel from "./testimonial-carousel";

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

const ticker = [
  "GST notices",
  "Audit evidence",
  "Client KYC",
  "ITR packs",
  "TDS checks",
  "Partner review"
];

const posts = [
  "How CA firms can reduce pre-filing chaos",
  "Designing a RAG pipeline for compliance documents",
  "What to automate first in a small accounting firm"
];

export default function Home() {
  const { scrollYProgress } = useScroll();
  const progressScale = useTransform(scrollYProgress, [0, 1], [0, 1]);

  return (
    <main className="shell">
      <motion.div className="scroll-progress" style={{ scaleX: progressScale }} />
      <nav className="nav">
        <Link className="brand" href="/">
          <span className="brand-mark">O</span>
          Obliq-io
        </Link>
        <div className="nav-links">
          <a href="#platform">Platform</a>
          <a href="#pipeline">RAG</a>
          <a href="#pricing">Pricing</a>
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
            Type a client request once. Obliq turns it into documents to collect,
            filings to track, team ownership, RAG-backed answers, and partner-ready
            review steps.
          </p>
          <motion.div
            className="mandate-box"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.2 }}
          >
            <MessageSquareText size={18} />
            <span>GST notice received. Reconcile ITC mismatch, assign preparer, and prepare partner review.</span>
          </motion.div>
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
              <strong>1</strong>
              <span>controlled work queue</span>
            </div>
            <div className="metric">
              <strong>5</strong>
              <span>CA workflow stages</span>
            </div>
            <div className="metric">
              <strong>AI</strong>
              <span>retrieval and planning</span>
            </div>
          </div>
          <div className="hero-ticker" aria-label="Supported workflows">
            <motion.div
              className="ticker-track"
              animate={{ x: ["0%", "-50%"] }}
              transition={{ duration: 16, repeat: Infinity, ease: "linear" }}
            >
              {[...ticker, ...ticker].map((item, index) => (
                <span key={`${item}-${index}`}>{item}</span>
              ))}
            </motion.div>
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

      <section className="logo-strip" aria-label="Trusted by">
        <p>Trusted by CA firms, startups, freelancers and studios</p>
        <div>
          {["Theo", "Amsterdam", "Savannah", "Milano", "Luminous"].map((logo) => (
            <span key={logo}>{logo}</span>
          ))}
        </div>
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

      <section className="split-feature band">
        <motion.div
          className="device-stack"
          initial={{ opacity: 0, x: -24 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5 }}
        >
          <div className="phone-preview">
            <span>Mobile App</span>
            <strong>Notice due in 7 days</strong>
            <p>ITC mismatch pack assigned to Arjun.</p>
          </div>
          <div className="web-preview">
            <span>Web App</span>
            <div className="mini-bars">
              <i style={{ width: "92%" }} />
              <i style={{ width: "68%" }} />
              <i style={{ width: "82%" }} />
            </div>
          </div>
        </motion.div>
        <div className="section-title">
          <span className="eyebrow">Seamless across devices</span>
          <h2>Work from anywhere, stay in sync.</h2>
          <p>
            Partners, preparers, admins, and clients can review status,
            deadlines, evidence requests, and AI-generated next actions from
            one responsive workspace.
          </p>
        </div>
      </section>

      <section className="band outcomes-band">
        <div className="section-title">
          <span className="eyebrow">Firm outcomes</span>
          <h2>Designed around the work CA teams repeat every week.</h2>
          <p>
            Obliq is not a generic chatbot wrapper. It keeps the workflow,
            document context, accountability, and review trail together.
          </p>
        </div>
        <div className="outcomes-grid">
          {[
            ["Document chase", "Turn scattered WhatsApp and email requests into a tracked evidence queue."],
            ["Notice response", "Extract deadlines, risk, amounts, and missing records before partner review."],
            ["Filing packs", "Keep GST, TDS, ITR, ROC, and audit work moving through one pipeline."]
          ].map(([title, text], index) => (
            <motion.article
              className="outcome-card"
              key={title}
              initial={{ opacity: 0, y: 22 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.4, delay: index * 0.08 }}
            >
              <span>0{index + 1}</span>
              <h3>{title}</h3>
              <p>{text}</p>
            </motion.article>
          ))}
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
        <div className="pipeline" aria-label="RAG pipeline">
          {[
            ["01", "Intake", "Validate document ownership, title, and content size before indexing."],
            ["02", "Chunk", "Normalize text and split with overlap so context survives retrieval."],
            ["03", "Embed", "Generate local vectors now; swap to pgvector and provider embeddings later."],
            ["04", "Answer", "Search by cosine score, cite source chunks, and route risky work to review."]
          ].map(([number, title, text], index) => (
            <motion.article
              className="step"
              key={number}
              initial={{ opacity: 0, x: -24 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.45, delay: index * 0.08 }}
              whileHover={{ y: -7 }}
            >
              <span>{number}</span>
              <h3>
                <Layers3 size={18} /> {title}
              </h3>
              <p>{text}</p>
            </motion.article>
          ))}
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

      <TestimonialCarousel />

      <section id="pricing" className="band pricing-band">
        <div className="section-title">
          <span className="eyebrow">Pricing</span>
          <h2>Simple plans for serious compliance work.</h2>
          <p>Use the current prototype as the product base, then scale storage, teams, and AI providers as the firm grows.</p>
        </div>
        <PricingToggle />
      </section>

      <section className="band blog-band">
        <div className="section-title">
          <span className="eyebrow">
            <Newspaper size={17} /> Blog
          </span>
          <h2>Ideas to level up CA firm operations.</h2>
        </div>
        <div className="blog-grid">
          {posts.map((post, index) => (
            <motion.article className="blog-card" key={post} whileHover={{ y: -6 }}>
              <span>{index === 0 ? "Must read" : "Insight"}</span>
              <h3>{post}</h3>
              <p>Practical notes for workflow design, document intelligence, and AI adoption.</p>
            </motion.article>
          ))}
        </div>
      </section>

      <section className="community-band">
        <div>
          <span className="eyebrow">
            <UsersRound size={17} /> Community
          </span>
          <h2>Stay in the loop</h2>
          <p>Follow product updates, implementation notes, and CA workflow automation ideas.</p>
          <div className="social-actions">
            <a href="https://www.linkedin.com" target="_blank" rel="noreferrer">
              <Linkedin size={17} /> LinkedIn
            </a>
            <a href="https://twitter.com" target="_blank" rel="noreferrer">
              <Twitter size={17} /> Twitter
            </a>
          </div>
        </div>
        <Link className="button primary" href="/register">
          Try Obliq free <ArrowRight size={18} />
        </Link>
      </section>

      <footer className="site-footer">
        <div>
          <Link className="brand" href="/">
            <span className="brand-mark">O</span>
            Obliq-io
          </Link>
          <p>AI workflow automation for modern CA firms.</p>
        </div>
        <nav>
          <a href="#platform">Features</a>
          <a href="#pipeline">RAG</a>
          <a href="#pricing">Pricing</a>
          <Link href="/login">Login</Link>
        </nav>
      </footer>
    </main>
  );
}

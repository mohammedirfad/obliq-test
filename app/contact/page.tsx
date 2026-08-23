import Link from "next/link";
import { ArrowRight, Mail, MessageSquareText, ShieldCheck } from "lucide-react";

export default function ContactPage() {
  return (
    <main className="auth-page">
      <nav className="nav auth-nav">
        <Link className="brand" href="/">
          <span className="brand-mark">O</span>
          Obliq-io
        </Link>
        <Link className="button secondary" href="/register">
          Try Obliq free
        </Link>
      </nav>
      <section className="contact-shell">
        <div className="contact-card">
          <span className="eyebrow">
            <Mail size={17} /> Contact sales
          </span>
          <h1>Build the right AI workflow setup for your CA firm.</h1>
          <p>
            Tell us about your users, client volume, document types, and preferred
            AI providers. We will map the right deployment path for Obliq-io.
          </p>
          <div className="contact-actions">
            <a className="button primary" href="mailto:sales@obliq.local?subject=Obliq-io%20Enterprise%20demo">
              Email sales <ArrowRight size={18} />
            </a>
            <Link className="button secondary" href="/register">
              Start free
            </Link>
          </div>
        </div>
        <div className="contact-side">
          <article>
            <ShieldCheck size={20} />
            <strong>Deployment planning</strong>
            <p>Supabase, pgvector, auth, storage, and CI/CD checklist.</p>
          </article>
          <article>
            <MessageSquareText size={20} />
            <strong>Workflow mapping</strong>
            <p>GST, audit, KYC, filings, advisory, notices, and client communication.</p>
          </article>
        </div>
      </section>
    </main>
  );
}

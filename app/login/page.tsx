"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, CheckCircle2, LockKeyhole, Mail, ShieldCheck, Workflow } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";

type Errors = Partial<Record<"email" | "password" | "form", string>>;

export default function LoginPage() {
  const router = useRouter();
  const [errors, setErrors] = useState<Errors>({});
  const [loading, setLoading] = useState(false);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const values = Object.fromEntries(formData) as Record<string, string>;
    const next: Errors = {};
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) next.email = "Enter a valid email.";
    if (!values.password) next.password = "Password is required.";
    if (Object.keys(next).length > 0) {
      setErrors(next);
      return;
    }

    setLoading(true);
    setErrors({});
    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values)
    });
    const data = await response.json();
    setLoading(false);
    if (!response.ok) {
      setErrors({ form: data.error ?? "Login failed. Please check your email and password." });
      return;
    }
    router.push("/dashboard");
  }

  return (
    <main className="auth-page">
      <nav className="nav auth-nav">
        <Link className="brand" href="/">
          <span className="brand-mark">O</span>
          Obliq-io
        </Link>
        <Link className="button secondary" href="/register">
          Create account
        </Link>
      </nav>
      <section className="auth-shell">
        <motion.aside
          className="auth-story motion-safe"
          initial={{ opacity: 0, x: -24 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.55, ease: "easeOut" }}
        >
          <span className="eyebrow">
            <LockKeyhole size={17} /> Secure CA workspace
          </span>
          <h1>Pick up every client workflow where you left it.</h1>
          <p className="lead">
            Sign in to review applications, retrieve document context, manage users,
            and route risky filing work to partner approval.
          </p>
          <div className="auth-preview">
            <div className="preview-head">
              <span className="status-dot" />
              Live compliance queue
            </div>
            {["GST notice triage", "Audit evidence pack", "Client KYC follow-up"].map((item, index) => (
              <motion.div
                className="preview-row"
                key={item}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.16 + index * 0.08 }}
              >
                <CheckCircle2 size={17} />
                <span>{item}</span>
                <i style={{ width: `${82 - index * 16}%` }} />
              </motion.div>
            ))}
          </div>
        </motion.aside>

        <motion.form
          className="auth-card motion-safe"
          onSubmit={submit}
          noValidate
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.08, ease: "easeOut" }}
        >
          <div className="auth-card-head">
            <span>
              <ShieldCheck size={18} /> Protected login
            </span>
            <h2>Welcome back</h2>
            <p>Enter your workspace credentials to open the operations dashboard.</p>
          </div>
          <div className="field icon-field">
            <label htmlFor="email">Work email</label>
            <span>
              <Mail size={18} />
              <input id="email" name="email" type="email" placeholder="you@firm.com" aria-invalid={Boolean(errors.email)} />
            </span>
            {errors.email ? <p className="field-error">{errors.email}</p> : null}
          </div>
          <div className="field icon-field">
            <label htmlFor="password">Password</label>
            <span>
              <LockKeyhole size={18} />
              <input id="password" name="password" type="password" placeholder="Your password" aria-invalid={Boolean(errors.password)} />
            </span>
            {errors.password ? <p className="field-error">{errors.password}</p> : null}
          </div>
          {errors.form ? <p className="alert error">{errors.form}</p> : null}
          <button className="button primary auth-submit" type="submit" disabled={loading}>
            {loading ? "Checking..." : "Enter dashboard"} <ArrowRight size={18} />
          </button>
          <p className="auth-switch">
            New to Obliq? <Link href="/register">Create a workspace</Link>
          </p>
          <div className="auth-mini-grid">
            <span>
              <Workflow size={16} /> CRUD workflows
            </span>
            <span>
              <ShieldCheck size={16} /> HTTP-only session
            </span>
          </div>
        </motion.form>
      </section>
    </main>
  );
}

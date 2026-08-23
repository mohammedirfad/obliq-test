"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Building2, CheckCircle2, LockKeyhole, Mail, ShieldCheck, UserRound } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";

type Errors = Partial<Record<"name" | "firmName" | "email" | "password" | "form", string>>;

export default function RegisterPage() {
  const router = useRouter();
  const [errors, setErrors] = useState<Errors>({});
  const [loading, setLoading] = useState(false);

  function validate(values: Record<string, string>) {
    const next: Errors = {};
    if (values.name.trim().length < 2) next.name = "Use at least 2 characters.";
    if (values.firmName.trim().length < 2) next.firmName = "Firm name is required.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) next.email = "Enter a valid work email.";
    if (values.password.length < 8) next.password = "Password must be at least 8 characters.";
    if (!/[A-Z]/.test(values.password) || !/[0-9]/.test(values.password)) {
      next.password = "Use 8+ characters with a number and uppercase letter.";
    }
    return next;
  }

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const values = Object.fromEntries(formData) as Record<string, string>;
    const nextErrors = validate(values);
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    setLoading(true);
    setErrors({});
    const response = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values)
    });
    const data = await response.json();
    setLoading(false);
    if (!response.ok) {
      setErrors({ form: data.error ?? "Registration failed. Please check the details and try again." });
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
        <Link className="button secondary" href="/login">
          Login
        </Link>
      </nav>
      <section className="auth-shell register-shell">
        <motion.aside
          className="auth-story motion-safe"
          initial={{ opacity: 0, x: -24 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.55, ease: "easeOut" }}
        >
          <span className="eyebrow">
            <Building2 size={17} /> Workspace setup
          </span>
          <h1>Launch a secure AI command center for your CA firm.</h1>
          <p className="lead">
            Create your workspace, seed sample client applications, and test RAG,
            user management, and agent planning in minutes.
          </p>
          <div className="auth-proof-grid">
            {[
              ["01", "Profile + firm workspace"],
              ["02", "Seeded application pipeline"],
              ["03", "RAG and agent console"],
              ["04", "User management API"]
            ].map(([number, text]) => (
              <motion.div className="proof-card" key={number} whileHover={{ y: -4 }}>
                <strong>{number}</strong>
                <span>{text}</span>
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
              <ShieldCheck size={18} /> Founder account
            </span>
            <h2>Create workspace</h2>
            <p>Use a work email. Your demo account signs in immediately after setup.</p>
          </div>
          <div className="field icon-field">
            <label htmlFor="name">Your name</label>
            <span>
              <UserRound size={18} />
              <input id="name" name="name" placeholder="Mohammed Irfad" aria-invalid={Boolean(errors.name)} />
            </span>
            {errors.name ? <p className="field-error">{errors.name}</p> : null}
          </div>
          <div className="field icon-field">
            <label htmlFor="firmName">Firm name</label>
            <span>
              <Building2 size={18} />
              <input id="firmName" name="firmName" placeholder="Obliq Demo CA" aria-invalid={Boolean(errors.firmName)} />
            </span>
            {errors.firmName ? <p className="field-error">{errors.firmName}</p> : null}
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
              <input id="password" name="password" type="password" placeholder="8+ chars, number, uppercase" aria-invalid={Boolean(errors.password)} />
            </span>
            {errors.password ? <p className="field-error">{errors.password}</p> : <p className="hint">Use 8+ characters with a number and uppercase letter.</p>}
          </div>
          {errors.form ? <p className="alert error">{errors.form}</p> : null}
          <button className="button primary auth-submit" type="submit" disabled={loading}>
            {loading ? "Creating..." : "Create workspace"} <ArrowRight size={18} />
          </button>
          <p className="auth-switch">
            Already have an account? <Link href="/login">Login</Link>
          </p>
        </motion.form>
      </section>
    </main>
  );
}

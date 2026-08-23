"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Building2, CheckCircle2, LockKeyhole, ShieldCheck } from "lucide-react";
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
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) {
      next.email = "Enter a valid work email.";
    }
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
      <nav className="nav">
        <Link className="brand" href="/">
          <span className="brand-mark">O</span>
          Obliq-io
        </Link>
        <Link className="button secondary" href="/login">
          Login
        </Link>
      </nav>
      <section className="auth-wrap">
        <motion.div
          className="band motion-safe"
          initial={{ opacity: 0, x: -24 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.55, ease: "easeOut" }}
        >
          <span className="eyebrow">
            <Building2 size={17} /> Workspace setup
          </span>
          <h1>Launch a secure CA automation workspace.</h1>
          <p className="lead">
            Create a demo account, seed client applications, and enter the dashboard
            with RAG and agent tooling ready to test.
          </p>
          <div className="auth-perks">
            <span>
              <ShieldCheck size={18} /> Scrypt password hashing
            </span>
            <span>
              <LockKeyhole size={18} /> Signed HTTP-only session
            </span>
            <span>
              <CheckCircle2 size={18} /> Demo data seeded instantly
            </span>
          </div>
        </motion.div>
        <motion.form
          className="auth-panel motion-safe"
          onSubmit={submit}
          noValidate
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.08, ease: "easeOut" }}
        >
          <h1>Create account</h1>
          <div className="field">
            <label htmlFor="name">Your name</label>
            <input id="name" name="name" aria-invalid={Boolean(errors.name)} />
            {errors.name ? <p className="field-error">{errors.name}</p> : null}
          </div>
          <div className="field">
            <label htmlFor="firmName">Firm name</label>
            <input id="firmName" name="firmName" aria-invalid={Boolean(errors.firmName)} />
            {errors.firmName ? <p className="field-error">{errors.firmName}</p> : null}
          </div>
          <div className="field">
            <label htmlFor="email">Email</label>
            <input id="email" name="email" type="email" aria-invalid={Boolean(errors.email)} />
            {errors.email ? <p className="field-error">{errors.email}</p> : null}
          </div>
          <div className="field">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              name="password"
              type="password"
              aria-invalid={Boolean(errors.password)}
            />
            <p className="hint">Use 8+ characters with a number and uppercase letter.</p>
            {errors.password ? <p className="field-error">{errors.password}</p> : null}
          </div>
          {errors.form ? <p className="alert error">{errors.form}</p> : null}
          <button className="button primary" type="submit" disabled={loading}>
            {loading ? "Creating..." : "Create workspace"} <ArrowRight size={18} />
          </button>
        </motion.form>
      </section>
    </main>
  );
}

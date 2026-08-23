"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, CheckCircle2, LockKeyhole, ShieldCheck, Workflow } from "lucide-react";
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
      <nav className="nav">
        <Link className="brand" href="/">
          <span className="brand-mark">O</span>
          Obliq-io
        </Link>
        <Link className="button secondary" href="/register">
          Register
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
            <LockKeyhole size={17} /> Secure session
          </span>
          <h1>Continue your workflow review.</h1>
          <p className="lead">
            Passwords are hashed with scrypt and sessions are signed in HTTP-only
            cookies for a practical prototype baseline.
          </p>
          <div className="auth-perks">
            <span>
              <ShieldCheck size={18} /> Protected dashboard
            </span>
            <span>
              <Workflow size={18} /> Client workflow console
            </span>
            <span>
              <CheckCircle2 size={18} /> RAG and agent tools ready
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
          <h1>Login</h1>
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
            {errors.password ? <p className="field-error">{errors.password}</p> : null}
          </div>
          {errors.form ? <p className="alert error">{errors.form}</p> : null}
          <button className="button primary" type="submit" disabled={loading}>
            {loading ? "Checking..." : "Enter dashboard"} <ArrowRight size={18} />
          </button>
        </motion.form>
      </section>
    </main>
  );
}

"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { CheckCircle2 } from "lucide-react";
import { useState } from "react";

type Plan = {
  name: string;
  badge: string;
  monthly: string;
  annual: string;
  text: string;
  cta: string;
  href: "/register" | "/contact";
  featured?: boolean;
  items: string[];
};

const plans: Plan[] = [
  {
    name: "Obliq Basic",
    badge: "Free",
    monthly: "Free",
    annual: "Free",
    text: "For solo CA operators testing workflow automation.",
    cta: "Try Obliq free",
    href: "/register",
    items: ["Client applications", "Basic RAG console", "User profile", "CI-ready repo"]
  },
  {
    name: "Obliq Premium",
    badge: "Save 20%",
    monthly: "$198/mo",
    annual: "$198/yr",
    text: "For CA firms managing recurring client deadlines.",
    cta: "Get started",
    href: "/register",
    featured: true,
    items: ["Everything in Basic", "User management", "Agent planner", "Mail campaigns"]
  },
  {
    name: "Obliq Enterprise",
    badge: "Flexible",
    monthly: "Talk to us",
    annual: "Talk to us",
    text: "For teams that need migration, storage, and provider routing.",
    cta: "Contact sales",
    href: "/contact",
    items: ["Supabase schema", "pgvector path", "Gemini/Groq/OpenAI routing", "Advanced audit trail"]
  }
];

export default function PricingToggle() {
  const [billing, setBilling] = useState<"monthly" | "annual">("annual");

  return (
    <>
      <div className="billing-toggle" role="tablist" aria-label="Billing period">
        <button type="button" className={billing === "monthly" ? "active" : ""} onClick={() => setBilling("monthly")}>
          Monthly
        </button>
        <button type="button" className={billing === "annual" ? "active" : ""} onClick={() => setBilling("annual")}>
          Annually
        </button>
      </div>
      <div className="pricing-grid">
        {plans.map((plan, index) => (
          <motion.article
            className={plan.featured ? "price-card featured" : "price-card"}
            key={plan.name}
            initial={{ opacity: 0, y: 22 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.4, delay: index * 0.08 }}
          >
            <div className="price-head">
              <span>{plan.name}</span>
              <i>{plan.badge}</i>
            </div>
            <strong>{billing === "monthly" ? plan.monthly : plan.annual}</strong>
            <p>{plan.text}</p>
            <ul>
              {plan.items.map((item) => (
                <li key={item}>
                  <CheckCircle2 size={16} /> {item}
                </li>
              ))}
            </ul>
            <Link className={plan.featured ? "button primary" : "button secondary"} href={plan.href}>
              {plan.cta}
            </Link>
          </motion.article>
        ))}
      </div>
    </>
  );
}

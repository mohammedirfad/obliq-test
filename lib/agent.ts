export type AgentPlan = {
  providerStrategy: string;
  intent: string;
  risk: "low" | "medium" | "high";
  steps: string[];
  tools: string[];
  handoff: string;
};

export function planAgentWorkflow(prompt: string): AgentPlan {
  const lower = prompt.toLowerCase();
  const isNotice = /notice|penalty|demand|scrutiny|summon/.test(lower);
  const isFiling = /itr|return|gst|filing|gstr|tds/.test(lower);
  const isAudit = /audit|evidence|ledger|bank|reconciliation/.test(lower);

  const risk: AgentPlan["risk"] = isNotice ? "high" : isAudit ? "medium" : "low";
  const intent = isNotice
    ? "Compliance notice response"
    : isAudit
      ? "Audit evidence workflow"
      : isFiling
        ? "Filing preparation"
        : "General CA operations";

  return {
    providerStrategy:
      "Use a fast model such as Groq for classification, Gemini for long-document extraction, and OpenAI for final cited drafting when keys are configured.",
    intent,
    risk,
    tools: ["profile_lookup", "application_status", "rag_search", "deadline_extractor", "audit_log"],
    steps: [
      "Classify the client request and detect statutory urgency.",
      "Search indexed documents and retrieve top cited chunks.",
      "Extract missing fields, dates, amounts, and required evidence.",
      "Generate a preparer checklist with confidence and source references.",
      "Create an audit event and hand off risky drafts to partner review."
    ],
    handoff:
      risk === "high"
        ? "Partner review required before sending client-facing or department-facing response."
        : "Prepared for team review with citations and next actions."
  };
}

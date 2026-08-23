import { NextResponse } from "next/server";
import { currentUser } from "@/lib/auth";
import { planAgentWorkflow } from "@/lib/agent";
import { addAuditEvent, event } from "@/lib/store";

export async function POST(request: Request) {
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const prompt = String(body.prompt ?? "").trim().slice(0, 2_000);
  if (prompt.length < 10) {
    return NextResponse.json({ error: "Describe the workflow request in more detail." }, { status: 400 });
  }

  const plan = planAgentWorkflow(prompt);
  await addAuditEvent(event(user.id, "agent.plan_created", { intent: plan.intent, risk: plan.risk }));
  return NextResponse.json({ plan });
}

import { NextResponse } from "next/server";
import { currentUser } from "@/lib/auth";
import { deleteApplication, updateApplication, type ApplicationInput } from "@/lib/store";
import type { Application } from "@/lib/types";

const services: Application["service"][] = ["GST", "Income Tax", "Audit", "KYC", "Advisory"];
const statuses: Application["status"][] = ["intake", "processing", "review", "filed", "blocked"];
const priorities: Application["priority"][] = ["low", "medium", "high"];

function readPatch(body: Record<string, unknown>): Partial<ApplicationInput> {
  const input: Partial<ApplicationInput> = {};
  if ("clientName" in body) input.clientName = String(body.clientName ?? "").trim().slice(0, 120);
  if (services.includes(String(body.service) as Application["service"])) {
    input.service = String(body.service) as Application["service"];
  }
  if (statuses.includes(String(body.status) as Application["status"])) {
    input.status = String(body.status) as Application["status"];
  }
  if (priorities.includes(String(body.priority) as Application["priority"])) {
    input.priority = String(body.priority) as Application["priority"];
  }
  if ("dueDate" in body) input.dueDate = String(body.dueDate ?? "").trim();
  if ("owner" in body) input.owner = String(body.owner ?? "").trim().slice(0, 80);
  if ("notes" in body) input.notes = String(body.notes ?? "").trim().slice(0, 700);
  return input;
}

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await context.params;
  const body = (await request.json()) as Record<string, unknown>;
  const input = readPatch(body);

  if (input.clientName !== undefined && input.clientName.length < 2) {
    return NextResponse.json({ error: "Client name must be at least 2 characters." }, { status: 400 });
  }
  if (input.dueDate !== undefined && !/^\d{4}-\d{2}-\d{2}$/.test(input.dueDate)) {
    return NextResponse.json({ error: "Use a YYYY-MM-DD due date." }, { status: 400 });
  }

  const application = await updateApplication(user.id, id, input);
  if (!application) return NextResponse.json({ error: "Application not found." }, { status: 404 });
  return NextResponse.json({ application });
}

export async function DELETE(_request: Request, context: { params: Promise<{ id: string }> }) {
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await context.params;
  const deleted = await deleteApplication(user.id, id);
  if (!deleted) return NextResponse.json({ error: "Application not found." }, { status: 404 });
  return NextResponse.json({ ok: true });
}

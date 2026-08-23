import { NextResponse } from "next/server";
import { currentUser } from "@/lib/auth";
import { createApplication, listApplications, type ApplicationInput } from "@/lib/store";
import type { Application } from "@/lib/types";

const services: Application["service"][] = ["GST", "Income Tax", "Audit", "KYC", "Advisory"];
const statuses: Application["status"][] = ["intake", "processing", "review", "filed", "blocked"];
const priorities: Application["priority"][] = ["low", "medium", "high"];

function readInput(body: Record<string, unknown>, partial = false): Partial<ApplicationInput> {
  const input: Partial<ApplicationInput> = {};
  const clientName = String(body.clientName ?? "").trim();
  const service = String(body.service ?? "");
  const status = String(body.status ?? "");
  const priority = String(body.priority ?? "");
  const dueDate = String(body.dueDate ?? "").trim();
  const owner = String(body.owner ?? "").trim();
  const notes = String(body.notes ?? "").trim();

  if (clientName || !partial) input.clientName = clientName.slice(0, 120);
  if (services.includes(service as Application["service"])) input.service = service as Application["service"];
  if (statuses.includes(status as Application["status"])) input.status = status as Application["status"];
  if (priorities.includes(priority as Application["priority"])) input.priority = priority as Application["priority"];
  if (dueDate || !partial) input.dueDate = dueDate;
  if (owner || !partial) input.owner = owner.slice(0, 80);
  if (notes || !partial) input.notes = notes.slice(0, 700);
  return input;
}

function validate(input: Partial<ApplicationInput>): input is ApplicationInput {
  return Boolean(
    input.clientName &&
      input.clientName.length >= 2 &&
      input.service &&
      input.status &&
      input.priority &&
      input.dueDate &&
      /^\d{4}-\d{2}-\d{2}$/.test(input.dueDate)
  );
}

export async function GET() {
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  return NextResponse.json({ applications: await listApplications(user.id) });
}

export async function POST(request: Request) {
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = (await request.json()) as Record<string, unknown>;
  const input = readInput(body);
  if (!validate(input)) {
    return NextResponse.json({ error: "Provide client, service, status, priority, and YYYY-MM-DD due date." }, { status: 400 });
  }

  const application = await createApplication(user.id, input);
  return NextResponse.json({ application }, { status: 201 });
}

import { NextResponse } from "next/server";
import { currentUser } from "@/lib/auth";
import { addAuditEvent, event } from "@/lib/store";

const allowedGroups = new Set(["all", "partners", "preparers", "clients", "admins", "custom"]);

export async function POST(request: Request) {
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const group = String(body.group ?? "").trim();
  const subject = String(body.subject ?? "").trim();
  const message = String(body.message ?? "").trim();
  const recipients = Array.isArray(body.recipients)
    ? body.recipients.map((item: unknown) => String(item)).filter(Boolean)
    : [];

  if (!allowedGroups.has(group)) {
    return NextResponse.json({ error: "Choose a valid recipient group." }, { status: 400 });
  }
  if (recipients.length === 0) {
    return NextResponse.json({ error: "Select at least one recipient." }, { status: 400 });
  }
  if (subject.length < 6 || subject.length > 120) {
    return NextResponse.json({ error: "Subject must be 6-120 characters." }, { status: 400 });
  }
  if (message.length < 20 || message.length > 5000) {
    return NextResponse.json({ error: "Message must be 20-5000 characters." }, { status: 400 });
  }

  await addAuditEvent(
    event(user.id, "mail.campaign_queued", {
      group,
      recipients: recipients.length,
      subject
    })
  );

  return NextResponse.json({
    status: "queued",
    provider: "demo-mailer",
    recipients: recipients.length,
    message: "Mail campaign queued in demo mode. Connect Resend, SendGrid, SES, or SMTP for production delivery."
  });
}

import { NextResponse } from "next/server";
import { createSession, hashPassword, publicUser } from "@/lib/auth";
import { createUser, findUserByEmail } from "@/lib/store";
import type { User } from "@/lib/types";

export async function POST(request: Request) {
  const body = await request.json();
  const name = String(body.name ?? "").trim();
  const firmName = String(body.firmName ?? "").trim();
  const email = String(body.email ?? "").trim().toLowerCase();
  const password = String(body.password ?? "");

  if (name.length < 2 || firmName.length < 2 || !email.includes("@") || password.length < 8) {
    return NextResponse.json({ error: "Enter a valid name, firm, email, and 8+ character password." }, { status: 400 });
  }

  if (await findUserByEmail(email)) {
    return NextResponse.json({ error: "An account with this email already exists." }, { status: 409 });
  }

  const user: User = {
    id: crypto.randomUUID(),
    name,
    firmName,
    email,
    role: "founder",
    passwordHash: await hashPassword(password),
    createdAt: new Date().toISOString()
  };

  await createUser(user);
  await createSession(user.id);
  return NextResponse.json({ user: publicUser(user) }, { status: 201 });
}

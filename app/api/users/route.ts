import { NextResponse } from "next/server";
import { currentUser, hashPassword, publicUser } from "@/lib/auth";
import { createUser, findUserByEmail, listUsersByFirm } from "@/lib/store";
import type { User } from "@/lib/types";

const roles: User["role"][] = ["founder", "admin", "member"];

export async function GET() {
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const users = await listUsersByFirm(user.firmName);
  return NextResponse.json({ users: users.map(publicUser) });
}

export async function POST(request: Request) {
  const current = await currentUser();
  if (!current) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = (await request.json()) as Record<string, unknown>;
  const name = String(body.name ?? "").trim();
  const email = String(body.email ?? "").trim().toLowerCase();
  const role = String(body.role ?? "member") as User["role"];
  const password = String(body.password ?? "Password1");

  if (name.length < 2 || !email.includes("@") || !roles.includes(role) || password.length < 8) {
    return NextResponse.json({ error: "Provide name, valid email, role, and 8+ character password." }, { status: 400 });
  }
  if (await findUserByEmail(email)) {
    return NextResponse.json({ error: "A user with this email already exists." }, { status: 409 });
  }

  const user: User = {
    id: crypto.randomUUID(),
    name,
    email,
    firmName: current.firmName,
    role,
    passwordHash: await hashPassword(password),
    createdAt: new Date().toISOString()
  };

  await createUser(user);
  return NextResponse.json({ user: publicUser(user) }, { status: 201 });
}

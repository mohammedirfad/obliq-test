import { NextResponse } from "next/server";
import { createSession, hashPassword, publicUser } from "@/lib/auth";
import { createUser, findUserByEmail } from "@/lib/store";
import type { User } from "@/lib/types";

function authErrorMessage(error: unknown) {
  if (error instanceof Error && error.message.includes("DATABASE_URL")) return error.message;
  return "Registration failed because the server could not reach the database.";
}

export async function POST(request: Request) {
  try {
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
  } catch (error) {
    console.error("Registration failed", error);
    return NextResponse.json(
      {
        error: authErrorMessage(error)
      },
      { status: 500 }
    );
  }
}

import { NextResponse } from "next/server";
import { createSession, publicUser, verifyPassword } from "@/lib/auth";
import { findUserByEmail } from "@/lib/store";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const email = String(body.email ?? "").trim().toLowerCase();
    const password = String(body.password ?? "");
    const user = await findUserByEmail(email);

    if (!user || !(await verifyPassword(password, user.passwordHash))) {
      return NextResponse.json({ error: "Invalid email or password." }, { status: 401 });
    }

    await createSession(user.id);
    return NextResponse.json({ user: publicUser(user) });
  } catch (error) {
    console.error("Login failed", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Login failed because the server could not reach the database."
      },
      { status: 500 }
    );
  }
}

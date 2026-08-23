import { NextResponse } from "next/server";
import { hasValidPasswordHash } from "@/lib/auth";
import { databaseErrorMessage } from "@/lib/postgres";
import { findUserByEmail } from "@/lib/store";

export async function GET(request: Request) {
  const email = new URL(request.url).searchParams.get("email")?.trim().toLowerCase();

  if (!email) {
    return NextResponse.json(
      {
        ok: false,
        message: "Add ?email=user@example.com to check whether a production Neon user exists."
      },
      { status: 400 }
    );
  }

  try {
    const user = await findUserByEmail(email);

    return NextResponse.json({
      ok: true,
      database: "ready",
      userExists: Boolean(user),
      passwordHashFormat: user ? (hasValidPasswordHash(user.passwordHash) ? "valid" : "invalid") : "none"
    });
  } catch (error) {
    console.error("Auth health check failed", error);
    return NextResponse.json(
      {
        ok: false,
        message: databaseErrorMessage(error)
      },
      { status: 500 }
    );
  }
}

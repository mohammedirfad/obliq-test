import { NextResponse } from "next/server";
import { currentUser, publicUser } from "@/lib/auth";
import { deleteManagedUser, updateManagedUser } from "@/lib/store";
import type { User } from "@/lib/types";

const roles: User["role"][] = ["founder", "admin", "member"];

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  const current = await currentUser();
  if (!current) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await context.params;
  const body = (await request.json()) as Record<string, unknown>;
  const name = String(body.name ?? "").trim();
  const role = String(body.role ?? "") as User["role"];

  if ((name && name.length < 2) || (role && !roles.includes(role))) {
    return NextResponse.json({ error: "Provide a valid name and role." }, { status: 400 });
  }

  const user = await updateManagedUser(current.id, current.firmName, id, {
    ...(name ? { name } : {}),
    ...(role ? { role } : {})
  });
  if (!user) return NextResponse.json({ error: "User not found." }, { status: 404 });
  return NextResponse.json({ user: publicUser(user) });
}

export async function DELETE(_request: Request, context: { params: Promise<{ id: string }> }) {
  const current = await currentUser();
  if (!current) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await context.params;
  const deleted = await deleteManagedUser(current.id, current.firmName, id);
  if (!deleted) return NextResponse.json({ error: "User not found or cannot delete active user." }, { status: 404 });
  return NextResponse.json({ ok: true });
}

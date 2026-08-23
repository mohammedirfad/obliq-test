import { NextResponse } from "next/server";
import { postgres } from "@/lib/postgres";

export async function GET() {
  const health = await postgres.healthCheck();
  return NextResponse.json(health, { status: health.ok ? 200 : 500 });
}

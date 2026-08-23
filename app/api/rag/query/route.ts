import { NextResponse } from "next/server";
import { currentUser } from "@/lib/auth";
import { getChunks } from "@/lib/store";
import { answerFromContext, searchChunks } from "@/lib/rag";

export async function POST(request: Request) {
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const query = String(body.query ?? "").trim().slice(0, 400);
  if (query.length < 4) {
    return NextResponse.json({ error: "Ask a longer question." }, { status: 400 });
  }

  const matches = searchChunks(query, await getChunks(user.id));
  return NextResponse.json({
    answer: answerFromContext(query, matches),
    citations: matches.map((match) => ({
      chunkId: match.chunk.id,
      documentId: match.chunk.documentId,
      score: Number(match.score.toFixed(4)),
      preview: match.chunk.text.slice(0, 220)
    }))
  });
}

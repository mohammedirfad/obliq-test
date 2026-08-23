import { NextResponse } from "next/server";
import { currentUser } from "@/lib/auth";
import { addDocument } from "@/lib/store";
import { chunkText, embed } from "@/lib/rag";
import type { ChunkRecord, DocumentRecord } from "@/lib/types";

export async function POST(request: Request) {
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const title = String(body.title ?? "").trim().slice(0, 120);
  const content = String(body.content ?? "").trim();

  if (title.length < 2 || content.length < 80 || content.length > 80_000) {
    return NextResponse.json({ error: "Provide a title and 80-80,000 characters of document text." }, { status: 400 });
  }

  const document: DocumentRecord = {
    id: crypto.randomUUID(),
    userId: user.id,
    title,
    content,
    createdAt: new Date().toISOString()
  };

  const chunks: ChunkRecord[] = chunkText(content).map((text, index) => ({
    id: crypto.randomUUID(),
    documentId: document.id,
    userId: user.id,
    index,
    text,
    embedding: embed(text),
    createdAt: new Date().toISOString()
  }));

  await addDocument(document, chunks);
  return NextResponse.json({ documentId: document.id, chunks: chunks.length });
}

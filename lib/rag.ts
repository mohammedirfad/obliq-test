import type { ChunkRecord } from "./types";

const dimensions = 96;

export function chunkText(text: string, size = 900, overlap = 160) {
  const clean = text.replace(/\s+/g, " ").trim();
  const chunks: string[] = [];
  let index = 0;
  while (index < clean.length) {
    chunks.push(clean.slice(index, index + size));
    index += size - overlap;
  }
  return chunks.filter(Boolean);
}

export function embed(text: string) {
  const vector = Array.from({ length: dimensions }, () => 0);
  const tokens = text.toLowerCase().match(/[a-z0-9]+/g) ?? [];
  for (const token of tokens) {
    let hash = 2166136261;
    for (let i = 0; i < token.length; i += 1) {
      hash ^= token.charCodeAt(i);
      hash = Math.imul(hash, 16777619);
    }
    const bucket = Math.abs(hash) % dimensions;
    vector[bucket] += 1 + Math.min(token.length, 12) / 12;
  }
  const norm = Math.hypot(...vector) || 1;
  return vector.map((value) => value / norm);
}

export function cosine(a: number[], b: number[]) {
  return a.reduce((sum, value, index) => sum + value * (b[index] ?? 0), 0);
}

export function searchChunks(query: string, chunks: ChunkRecord[], limit = 4) {
  const queryEmbedding = embed(query);
  return chunks
    .map((chunk) => ({ chunk, score: cosine(queryEmbedding, chunk.embedding) }))
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}

export function answerFromContext(query: string, matches: ReturnType<typeof searchChunks>) {
  if (matches.length === 0) {
    return "No indexed documents yet. Ingest a client file or paste a notice, then ask again.";
  }

  const context = matches
    .map((match, index) => `${index + 1}. ${match.chunk.text}`)
    .join("\n\n");

  return [
    `Answer for: ${query}`,
    "",
    "The most relevant source material indicates:",
    context,
    "",
    "Recommended CA workflow:",
    "1. Confirm client/entity identity and filing period.",
    "2. Extract deadlines, monetary exposure, missing evidence, and statutory references.",
    "3. Route to preparer with source citations attached.",
    "4. Escalate to partner review when risk, penalty, or notice response language is present."
  ].join("\n");
}

type Node = Record<string, unknown>;
const prose = new Set(["text", "quote", "attribution", "title", "caption", "alt"]);
export function collectProse(value: unknown): string[] {
  const out: string[] = [];
  function visit(node: unknown) {
    if (Array.isArray(node)) {
      node.forEach(visit);
      return;
    }
    if (!node || typeof node !== "object") return;
    for (const [key, v] of Object.entries(node)) {
      if (prose.has(key) && typeof v === "string") out.push(v);
      else if (v && typeof v === "object") visit(v);
    }
  }
  visit(value);
  return out;
}
export function replaceProse(value: unknown, texts: string[]): unknown {
  let index = 0;
  function visit(node: unknown): unknown {
    if (Array.isArray(node)) return node.map(visit);
    if (!node || typeof node !== "object") return node;
    const copy: Node = {};
    for (const [key, v] of Object.entries(node)) {
      if (prose.has(key) && typeof v === "string") {
        const text = texts[index++];
        if (typeof text !== "string")
          throw new Error("translation_structure_failed");
        copy[key] = text;
      } else copy[key] = visit(v);
    }
    return copy;
  }
  const result = visit(value);
  if (index !== texts.length) throw new Error("translation_structure_failed");
  return result;
}
export function sourceHashInput(doc: {
  title: string;
  summary?: string | null;
  description?: string | null;
  body?: unknown;
  transcript?: string | null;
  coverCaption?: string | null;
  coverAlt?: string | null;
  correctionNote?: string | null;
  evidenceNote?: unknown;
  sources?: unknown;
}) {
  return JSON.stringify([
    doc.title,
    doc.summary || "",
    doc.description || "",
    doc.body || null,
    doc.transcript || "",
    doc.coverCaption || "",
    doc.coverAlt || "",
    doc.correctionNote || "",
    doc.evidenceNote || null,
    doc.sources || null,
  ]);
}

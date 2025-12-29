export function chunkText(text, size = 500, overlap = 80) {
  const words = text.split(/\s+/).filter(Boolean);
  const chunks = [];
  for (let i = 0; i < words.length; i += (size - overlap)) {
    const part = words.slice(i, i + size).join(" ");
    if (part.length > 0) chunks.push(part);
  }
  return chunks;
}

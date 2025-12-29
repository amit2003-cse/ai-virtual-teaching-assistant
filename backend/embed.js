import { pipeline } from "@xenova/transformers";
import dotenv from "dotenv";
dotenv.config();

let embPipe = null;
const MODEL = process.env.EMBED_MODEL || "Xenova/bge-small-en-v1.5";

export async function getEmbedder() {
  if (!embPipe) {
    embPipe = await pipeline("feature-extraction", MODEL, { quantized: true });
  }
  return async (texts) => {
    const items = Array.isArray(texts) ? texts : [texts];
    const out = [];
    for (const t of items) {
      const res = await embPipe(t, { pooling: "mean", normalize: true });
      out.push(Array.from(res.data));
    }
    return out;
  };
}

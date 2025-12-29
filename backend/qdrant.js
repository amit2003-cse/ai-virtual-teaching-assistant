// qdrant.js
import { QdrantClient } from "@qdrant/js-client-rest";
import dotenv from "dotenv";
dotenv.config();

const QDRANT_URL = process.env.QDRANT_URL || "http://127.0.0.1:6333";
const COLLECTION = process.env.QDRANT_COLLECTION || "ai_ta_chunks";

export const qd = new QdrantClient({ url: QDRANT_URL });

export async function ensureCollection(vectorSize) {
  const { collections } = await qd.getCollections();
  const found = collections?.some(c => c.name === COLLECTION);
  if (!found) {
    await qd.createCollection(COLLECTION, {
      vectors: { size: vectorSize, distance: "Cosine" },
    });
  } else {
    // safety: mismatch ho to recreate
    const info = await qd.getCollection(COLLECTION);
    const current = info.config?.params?.vectors?.size;
    if (current && current !== vectorSize) {
      await qd.deleteCollection(COLLECTION);
      await qd.createCollection(COLLECTION, {
        vectors: { size: vectorSize, distance: "Cosine" },
      });
    }
  }
}

export async function upsertPoints(points) {
  await qd.upsert(COLLECTION, { points });
}

export async function searchTopK(vector, k = 4) {
  // ✅ classic search API
  const res = await qd.search(COLLECTION, {
    vector,
    limit: k,
    with_payload: true,
  });
  return res; // array of points
}

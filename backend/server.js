// backend/server.js
import express from "express";
import cors from "cors";
import multer from "multer";
import pdf from "pdf-parse";
import fs from "fs/promises";
import dotenv from "dotenv";

import { getEmbedder } from "./embed.js";
import { chunkText } from "./chunk.js";
import { ensureCollection, upsertPoints, searchTopK } from "./qdrant.js";
import { chatOllama } from "./ollama.js";

dotenv.config();

const app = express();
app.use(cors({ origin: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging — har request dikhe
app.use((req, _res, next) => {
  console.log("REQ", req.method, req.url);
  next();
});

const upload = multer({ dest: "uploads/" });

const PORT = process.env.PORT || 8080;
const TOP_K = Number(process.env.TOP_K || 4);

let embed = null;
let vectorDim = null;

// ------------------- INIT -----------------------------

async function init() {
  console.log("Initializing embedding model...");
  embed = await getEmbedder();

  const test = await embed(["hello world"]);
  vectorDim = test[0].length;

  console.log("Embedding dimension =", vectorDim);
  console.log("Ensuring Qdrant collection exists...");
  await ensureCollection(vectorDim);

  console.log("Ready.");
}

init().catch((err) => {
  console.error("INIT ERROR:", err);
  process.exit(1);
});

// ------------------- INGEST PDFs -----------------------------

app.post("/ingest", upload.array("files"), async (req, res) => {
  try {
    const files = req.files || [];
    if (!files.length) return res.status(400).json({ error: "No files uploaded" });

    let totalChunks = 0;

    for (const f of files) {
      const buf = await fs.readFile(f.path);
      const data = await pdf(buf);
      const text = (data.text || "").replace(/\s+/g, " ").trim();
      await fs.unlink(f.path).catch(() => {});

      if (!text) continue;

      const chunks = chunkText(text, 500, 80);
      const embs = await embed(chunks);

      const points = embs.map((vec, i) => ({
        id: Date.now() * 10000 + i + Math.floor(Math.random() * 1000),
        vector: vec,
        payload: {
          source: f.originalname,
          idx: i,
          text: chunks[i],
        },
      }));

      await upsertPoints(points);
      totalChunks += chunks.length;
    }

    res.json({ ok: true, chunks_added: totalChunks });
  } catch (err) {
    console.error("INGEST ERROR:", err);
    res.status(500).json({ error: err.message });
  }
});

// ------------------- CHAT ENDPOINT (NORMAL + RAG) -----------------------------

app.post("/chat", async (req, res) => {
  try {
    const q = (req.body.q || "").trim();
    const mode = (req.body.mode || "rag").toLowerCase();

    if (!q) return res.status(400).json({ error: "q required" });

    // ----------------------------------------------------
    // MODE 1 → NORMAL AI (ChatGPT-like, NO PDFs)
    // ----------------------------------------------------
    if (mode === "normal") {
      console.log("Mode: NORMAL AI");

      const answer = await chatOllama({
        system: "You are a helpful assistant. Answer normally.",
        messages: [{ role: "user", content: q }],
        temperature: 0.7,
      });

      return res.json({ answer, contexts: [] });
    }

    // ----------------------------------------------------
    // MODE 2 → RAG AI (PDF-based)
    // ----------------------------------------------------
    console.log("Mode: RAG MODE");

    const [qvec] = await embed([q]);
    const hits = await searchTopK(qvec, TOP_K);
    console.log("RAG hits:", hits?.length);

    if (!hits?.length) {
      return res.json({
        answer: "I don't know from the provided sources.",
        contexts: [],
      });
    }

    const contexts = hits.map((h) => ({
      source: h.payload.source,
      text: h.payload.text,
    }));

    const ctxBlock = contexts
      .map((c) => `[source: ${c.source}]\n${c.text}`)
      .join("\n\n");

    const systemPrompt = `
You are a strict teaching assistant.
Answer ONLY using the provided sources.
If the answer is not available in the sources, say: "I don't know from the provided sources."
Keep answers short, clear, and include citations like [source: file.pdf].
`;

    const userPrompt = `Question: ${q}\n\nRelevant material:\n${ctxBlock}`;

    const answer = await chatOllama({
      system: systemPrompt,
      messages: [{ role: "user", content: userPrompt }],
      temperature: 0.2,
    });

    res.json({ answer, contexts });
  } catch (err) {
    console.error("CHAT ERROR:", err);
    res.status(500).json({ error: err.message });
  }
});

// ------------------- SERVER START -----------------------------

app.listen(PORT, () => {
  console.log(`API running at http://localhost:${PORT}`);
});

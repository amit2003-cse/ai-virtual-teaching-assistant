import dotenv from "dotenv";
dotenv.config();

const OLLAMA_URL = process.env.OLLAMA_BASEURL || "http://127.0.0.1:11434";
const MODEL = process.env.OLLAMA_MODEL || "qwen2.5:1.5b-instruct";

export async function chatOllama({ system, messages, temperature = 0.2 }) {
  const payload = {
    model: MODEL,
    messages: [
      ...(system ? [{ role: "system", content: system }] : []),
      ...messages
    ],
    stream: false,
    options: { temperature }
  };
  const r = await fetch(`${OLLAMA_URL}/v1/chat/completions`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(payload)
  });
  if (!r.ok) throw new Error("Ollama error");
  const j = await r.json();
  return j.choices?.[0]?.message?.content?.trim() ?? "";
}

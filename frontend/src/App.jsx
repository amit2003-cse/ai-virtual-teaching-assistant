// frontend/src/App.jsx
import { useState } from "react";
import { api } from "./api";

export default function App() {
  const [files, setFiles] = useState([]);
  const [q, setQ] = useState("");
  const [answer, setAnswer] = useState("");
  const [contexts, setContexts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState("rag"); // "rag" | "normal"

  // UPLOAD + INGEST PDFs
  const ingest = async () => {
    try {
      if (!files?.length) {
        alert("Please select at least one PDF.");
        return;
      }
      const form = new FormData();
      for (const f of files) form.append("files", f);
      const { data } = await api.post("/ingest", form);
      alert(`Ingested chunks: ${data.chunks_added}`);
    } catch (err) {
      console.error("INGEST ERROR:", err);
      alert("Ingest failed: " + (err?.response?.data?.error || err.message));
    }
  };

  // ASK QUESTION (RAG / NORMAL mode)
  const ask = async () => {
    try {
      if (!q.trim()) {
        alert("Please type a question.");
        return;
      }

      setLoading(true);
      setAnswer("");
      setContexts([]);

      const { data } = await api.post("/chat", { q, mode });

      setAnswer(data.answer || "(no answer)");
      setContexts(data.contexts || []);
    } catch (err) {
      console.error("ASK ERROR:", err);
      alert("Ask failed: " + (err?.response?.data?.error || err.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        maxWidth: 820,
        margin: "32px auto",
        padding: "0 16px",
        fontFamily: "Inter, system-ui, sans-serif",
        color: "#e6e6e6",
      }}
    >
      <h1 style={{ marginBottom: 8 }}>🎓 AI Teaching Assistant (Local)</h1>
      <p style={{ opacity: 0.8, marginTop: 0 }}>
        Switch between <b>Normal AI</b> and <b>RAG (PDF-based)</b> answering.
      </p>

      {/* MODE SELECTOR */}
      <section style={{ marginTop: 20 }}>
        <h3>Mode</h3>

        <label style={{ marginRight: 20 }}>
          <input
            type="radio"
            name="mode"
            checked={mode === "rag"}
            onChange={() => setMode("rag")}
          />{" "}
          <b>RAG Mode</b> (Use PDF context)
        </label>

        <label>
          <input
            type="radio"
            name="mode"
            checked={mode === "normal"}
            onChange={() => setMode("normal")}
          />{" "}
          <b>Normal AI</b> (ChatGPT style)
        </label>
      </section>

      {/* PDF UPLOAD */}
      <section style={{ marginTop: 28 }}>
        <h3>1) Upload PDFs</h3>
        <input
          type="file"
          multiple
          accept="application/pdf"
          onChange={(e) => setFiles([...e.target.files])}
          style={{
            background: "#111827",
            color: "#e5e7eb",
            border: "1px solid #374151",
            borderRadius: 8,
            padding: 8,
            width: "100%",
          }}
        />
        <button
          onClick={ingest}
          style={{
            marginTop: 12,
            background: "#2563eb",
            border: 0,
            color: "#fff",
            padding: "8px 12px",
            borderRadius: 8,
            cursor: "pointer",
          }}
        >
          Ingest
        </button>
      </section>

      {/* ASK */}
      <section style={{ marginTop: 28 }}>
        <h3>2) Ask</h3>
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="e.g., Define DFA with closure properties"
          style={{
            width: "100%",
            padding: 10,
            background: "#111827",
            color: "#e5e7eb",
            border: "1px solid #374151",
            borderRadius: 8,
          }}
        />
        <button
          onClick={ask}
          disabled={loading}
          style={{
            marginTop: 12,
            background: loading ? "#374151" : "#10b981",
            border: 0,
            color: "#fff",
            padding: "8px 12px",
            borderRadius: 8,
            cursor: loading ? "not-allowed" : "pointer",
          }}
        >
          {loading ? "Thinking..." : "Ask"}
        </button>
      </section>

      {/* ANSWER */}
      {answer && (
        <section style={{ marginTop: 28 }}>
          <h3>Answer</h3>

          <div
            style={{
              whiteSpace: "pre-wrap",
              background: "#f7f7f7",
              color: "#111",
              padding: 14,
              borderRadius: 10,
              lineHeight: 1.6,
            }}
          >
            {answer}
          </div>

          {/* CONTEXTS */}
          <details style={{ marginTop: 12 }}>
            <summary style={{ cursor: "pointer" }}>Sources</summary>

            <div style={{ marginTop: 10 }}>
              {contexts?.length > 0 &&
                contexts.map((c, i) => (
                  <div
                    key={i}
                    style={{
                      background: "#f1f5f9",
                      color: "#111",
                      padding: 10,
                      borderRadius: 8,
                      marginBottom: 10,
                      fontSize: 14,
                    }}
                  >
                    <strong>{c.source}</strong>
                    <div style={{ opacity: 0.9, marginTop: 6 }}>
                      {c.text?.slice(0, 500)}
                      {c.text?.length > 500 && "..."}
                    </div>
                  </div>
                ))}

              {!contexts?.length && (
                <div style={{ opacity: 0.8 }}>No sources used in this mode.</div>
              )}
            </div>
          </details>
        </section>
      )}
    </div>
  );
}

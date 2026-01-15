import { useState } from "react";
import { api } from "./api";

export default function App() {
  const [files, setFiles] = useState([]);
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [sources, setSources] = useState([]);
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState("rag");

  const ingest = async () => {
    if (!files.length) return alert("Kam se kam ek PDF select karo");
    try {
      const form = new FormData();
      files.forEach((f) => form.append("files", f));
      const { data } = await api.post("/ingest", form);
      alert(`Ingested ${data.chunks_added} chunks`);
    } catch {
      alert("Ingest failed");
    }
  };

  const ask = async () => {
    if (!question.trim()) return alert("Question likho");
    try {
      setLoading(true);
      setAnswer("");
      setSources([]);
      const { data } = await api.post("/chat", { q: question, mode });
      setAnswer(data.answer || "(no answer)");
      setSources(data.contexts || []);
    } catch {
      alert("Ask failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-gray-100 text-gray-900">
      {/* NAV */}
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
          <h1 className="font-bold text-lg flex items-center gap-2">
            🐼 Panda AI
            <span className="text-sm font-normal text-gray-500">
              Teaching Assistant
            </span>
          </h1>
          <div className="flex gap-2 text-sm">
            <button
              onClick={() => setMode("rag")}
              className={`px-3 py-1.5 rounded-full ${
                mode === "rag"
                  ? "bg-black text-white"
                  : "bg-gray-100 hover:bg-gray-200"
              }`}
            >
              RAG
            </button>
            <button
              onClick={() => setMode("normal")}
              className={`px-3 py-1.5 rounded-full ${
                mode === "normal"
                  ? "bg-black text-white"
                  : "bg-gray-100 hover:bg-gray-200"
              }`}
            >
              Normal
            </button>
          </div>
        </div>
      </nav>

      {/* MAIN */}
      <main className="max-w-6xl mx-auto px-6 py-10 grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* LEFT */}
        <div className="space-y-6">
          {/* Upload */}
          <div className="bg-white border-2 border-dashed border-gray-300 rounded-3xl p-6 space-y-4 shadow-sm">
            <h2 className="font-semibold text-lg">📂 Panda Knowledge</h2>
            <p className="text-sm text-gray-500">
              Panda ko PDFs khilaao 🐼📄
            </p>
            <input
              type="file"
              multiple
              accept="application/pdf"
              onChange={(e) => setFiles([...e.target.files])}
              className="w-full bg-gray-50 rounded-xl p-2 border border-gray-200 file:bg-black file:text-white file:border-0 file:px-4 file:py-2 file:rounded-full"
            />
            <button
              onClick={ingest}
              className="bg-black hover:bg-gray-800 text-white px-5 py-2 rounded-full font-medium"
            >
              Feed Panda
            </button>
          </div>

          {/* Ask */}
          <div className="bg-white border border-gray-200 rounded-3xl p-6 space-y-4 shadow-sm">
            <h2 className="font-semibold text-lg">❓ Ask Panda</h2>
            <textarea
              rows={4}
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Panda se poochho..."
              className="w-full p-3 rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-black"
            />
            <button
              onClick={ask}
              disabled={loading}
              className={`w-full py-2 rounded-full font-medium ${
                loading
                  ? "bg-gray-300 cursor-not-allowed"
                  : "bg-pink-500 hover:bg-pink-600 text-white"
              }`}
            >
              {loading ? "Panda soch raha hai..." : "Ask Panda"}
            </button>
          </div>
        </div>

        {/* RIGHT */}
        <div className="bg-white border border-gray-200 rounded-3xl shadow-md p-6 flex flex-col">
          <h2 className="font-semibold text-lg mb-3">🐼 Panda Answer</h2>

          {!answer && (
            <div className="flex-1 flex items-center justify-center text-gray-400 text-sm">
              Panda ka jawab yahan aayega...
            </div>
          )}

          {answer && (
            <>
              <div className="whitespace-pre-wrap text-sm leading-relaxed mb-4">
                {answer}
              </div>

              <details className="mt-auto">
                <summary className="cursor-pointer text-sm font-medium">
                  Bamboo Sources 🌿
                </summary>
                <div className="mt-3 space-y-2 max-h-48 overflow-auto">
                  {sources.length ? (
                    sources.map((s, i) => (
                      <div
                        key={i}
                        className="bg-gray-50 p-3 rounded-xl text-xs border border-gray-200"
                      >
                        <b>{s.source}</b>
                        <p className="mt-1 opacity-80">
                          {s.text?.slice(0, 400)}
                          {s.text?.length > 400 && "..."}
                        </p>
                      </div>
                    ))
                  ) : (
                    <p className="opacity-70">No bamboo used.</p>
                  )}
                </div>
              </details>
            </>
          )}
        </div>
      </main>
    </div>
  );
}

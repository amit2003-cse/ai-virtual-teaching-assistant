📚 Local AI Teaching Assistant (RAG-based)

A privacy-first, fully local AI Teaching Assistant built using Retrieval-Augmented Generation (RAG) that allows users to upload academic PDFs and ask syllabus-based questions.
The system runs entirely on a local machine without any cloud dependency.

🚀 Why this project?

Most AI chatbots:
Depend on cloud APIs
Do not use user-provided study material
May generate hallucinated answers
Raise data privacy concerns

👉 This project solves all of that by building a local, document-grounded AI system suitable for education.

🧠 Key Features

📄 Upload academic PDF documents
🔍 Semantic search over documents using vector embeddings
🤖 Accurate answers using Retrieval-Augmented Generation (RAG)
🔁 Dual-mode system:
 RAG Mode → syllabus-based answers from PDF
 Normal AI Mode → general AI conversation
🔐 Fully local & privacy-preserving (no cloud APIs)
⚡ Fast response using local vector DB & LLM

🏗️ System Architecture (High Level)

PDF Upload
   ↓
Text Extraction (pdf-parse)
   ↓
Chunking + Embeddings (384-dim)
   ↓
Vector Storage (Qdrant)
   ↓
Similarity Search (Top-K)
   ↓
LLM Generation (Ollama + Qwen2.5)
   ↓
Final Answer

🛠️ Tech Stack
Frontend
React.js
Vite
Axios

Backend
Node.js
Express.js
Multer (file upload)
pdf-parse (PDF text extraction)

AI & Data
Ollama (Local LLM runtime)
Qwen2.5 model
Qdrant (Vector Database)
Embeddings (384 dimensions)

DevOps
Docker & Docker Compose

🧩 Core Concepts Used

Retrieval-Augmented Generation (RAG)
Vector Embeddings & Semantic Search
Chunking with overlap
REST API design
Dual-mode AI architecture
Local LLM inference
Vector database indexing

📦 How to Run Locally

1️⃣ Start Qdrant (Vector DB)
docker compose up -d

2️⃣ Start Ollama & Pull Model
ollama pull qwen2.5:1.5b-instruct
ollama serve

3️⃣ Start Backend
cd backend
node server.js

4️⃣ Start Frontend
cd frontend
npm install
npm run dev

🎯 What Makes This Project Special?

❌ No OpenAI / cloud API
✅ Complete control over data
✅ Real-world RAG implementation
✅ Recruiter-friendly AI system
✅ Works on low-resource machines (8GB RAM)

This project demonstrates practical understanding of modern AI systems, not just model usage.

📈 Future Improvements
Voice-based interaction
Multi-language support
OCR for scanned PDFs
User profiles & learning analytics
Quiz & MCQ generation

👨‍💻 Author

Amit
Final Year Computer Science Student
Interested in AI Engineering, Backend Development, and System Design

📌 Built as an academic project with real-world AI architecture principles.

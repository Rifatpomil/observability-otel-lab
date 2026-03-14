# 🚀 AI‑Powered Production‑Grade Astronomy Shop

This showcase extension adds cutting‑edge AI capabilities to the platform, designed for scalability, observability, and premium user experience.

## 🧠 AI Engineering Features

### 1. **Semantic Smart Search (RAG-lite)**
*   **Vector Store**: Built a local FAISS index on product reviews using the `all-MiniLM-L6-v2` embedding model.
*   **Semantic Retrieval**: Users can search for products using natural language (e.g., "cool education toys for kids") instead of just keyword matching.
*   **Endpoint**: `/v1/search` in the `llm` service.

### 2. **AI Shopping Assistant**
*   **Premium UI**: Integrated a sleek, glassmorphism‑style chat drawer on every product page.
*   **Local LLM**: Configured the backend to support local inference via `llama-cpp-python`, ensuring data privacy and zero API costs.
*   **Chain‑of‑Thought**: The system handles tool calls to fetch real‑time product data and reviews before synthesizing a response.

### 3. **Smart Recommendations (Node.js)**
*   **Microservice**: Created a new Node.js recommendation engine.
*   **Feature Flagging**: Uses OpenFeature (Flagd) to switch between a basic random algorithm and a "Canary" category‑based algorithm.

## 🛠️ Production Engineering

### 1. **Observability (The "O" in OTel)**
*   **Tracing**: Every AI request is traced from the Next.js frontend, through the ProductReview service, down to the LLM backend.
*   **Metrics**: Custom metrics for AI request frequency and vector search latency.
*   **Baggage**: Propagates session IDs and category context across service boundaries.

### 2. **Modern Frontend**
*   **Next.js & Tailwind**: Upgraded UI elements with modern styling, including backdrop blurs and micro‑animations.
*   **Responsive AI Components**: The chat drawer and search bar are fully responsive.

### 3. **Deployment & GitOps**
*   **Dockerized**: Every new service includes a production‑ready Dockerfile.
*   **Service Mesh Ready**: Integrated with the existing Envoy‑based frontend proxy.

---

## 🚦 Feature Flags in play
*   `llmInaccurateResponse`: Roll out a "chaotic" version of the AI for reliability testing.
*   `llmRateLimitError`: Simulate high‑load scenarios for testing 429 error handling in the UI.
*   `recommendationCanary`: AB test the new recommendation algorithm.

## 🏃 How to run these features
1.  Ensure you have a local model file (e.g., `.gguf`) in `src/llm/models/`.
2.  `docker compose up -d --build`
3.  Navigate to `localhost:8080`.
4.  Try the **Search** in the header or the **Chat** button on any product page.

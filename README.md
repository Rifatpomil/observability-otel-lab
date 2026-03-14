# 🔭 Observability Lab — AI-Powered Microservices Platform

A production-grade, AI-enhanced microservices e-commerce platform with full-stack observability powered by OpenTelemetry. Built to demonstrate modern distributed systems engineering, AI integration, and end-to-end observability across 15+ polyglot services.

## ✨ Key Features

### 🧠 AI Engineering
- **Semantic Smart Search (RAG)** — FAISS vector index with `all-MiniLM-L6-v2` embeddings for natural language product search
- **AI Shopping Assistant** — Glassmorphism chat UI with local LLM inference via `llama-cpp-python`
- **Smart Recommendations** — Category-based recommendation engine with A/B testing via feature flags
- **AI Product Reviews** — LLM-generated review summaries with OpenTelemetry GenAI instrumentation

### 📡 Observability Stack
- **Distributed Tracing** — End-to-end traces across all services (Jaeger)
- **Metrics & Dashboards** — Prometheus + Grafana with APM, service map, and host metrics dashboards
- **Centralized Logging** — Structured logs via OpenSearch with log-trace correlation
- **Synthetic Monitoring** — HTTP health checks and load testing with Playwright

### 🏗️ Architecture
- **15+ Microservices** in Go, Python, Java/Kotlin, .NET, Node.js, Rust, PHP, Ruby, Elixir, and C++
- **Event-Driven Workflows** — Kafka-based async processing (checkout → accounting → fraud detection)
- **Feature Flags** — OpenFeature with Flagd for controlled rollouts and chaos engineering
- **Service Mesh** — Envoy-based frontend proxy with access logging and tracing

## 🏛️ Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                         Frontend Proxy (Envoy)                      │
│                    Load Balancing · Routing · Tracing                │
└──────────────┬──────────────┬───────────────┬───────────────────────┘
               │              │               │
        ┌──────▼──────┐ ┌────▼────┐   ┌──────▼──────┐
        │  Frontend    │ │ Grafana │   │   Jaeger    │
        │  (Next.js)   │ │         │   │             │
        └──────┬───────┘ └─────────┘   └─────────────┘
               │
    ┌──────────┼──────────┬──────────┬──────────┬──────────┐
    │          │          │          │          │          │
┌───▼───┐ ┌───▼───┐ ┌────▼───┐ ┌───▼────┐ ┌───▼───┐ ┌───▼────┐
│  Ad   │ │ Cart  │ │Checkout│ │Currency│ │Product │ │Recommend│
│(Java) │ │(.NET) │ │ (Go)   │ │ (C++)  │ │Catalog │ │ (Python)│
└───────┘ └───┬───┘ └───┬────┘ └────────┘ │ (Go)   │ └─────────┘
              │         │                  └────────┘
         ┌────▼───┐  ┌──▼───┐     ┌──────────┐
         │ Valkey  │  │Kafka │────▶│Accounting│
         │(Cache)  │  │      │     │  (.NET)  │
         └────────┘  │      │     └──────────┘
                     │      │────▶┌──────────────┐
                     └──────┘     │Fraud Detection│
                                  │   (Kotlin)    │
                                  └───────────────┘
```

## 🛠️ Tech Stack

| Layer | Technologies |
|-------|-------------|
| **Frontend** | Next.js, React, TypeScript |
| **Backend Services** | Go, Python, Java, Kotlin, .NET, Node.js, Rust, PHP, Ruby, Elixir, C++ |
| **AI/ML** | FAISS, Sentence Transformers, llama-cpp-python, OpenAI-compatible API |
| **Messaging** | Apache Kafka |
| **Databases** | PostgreSQL, Valkey (Redis-compatible) |
| **Observability** | OpenTelemetry, Jaeger, Prometheus, Grafana, OpenSearch |
| **Feature Flags** | OpenFeature, Flagd |
| **Infrastructure** | Docker Compose, Envoy Proxy, Kubernetes (Helm) |

## 🚀 Quick Start

### Prerequisites
- [Docker](https://www.docker.com/get-started/) & Docker Compose v2.0+
- [Make](https://www.gnu.org/software/make/) (optional, for convenience commands)

### Run the Platform

```bash
# Start all services
docker compose up -d --build

# Or use Make
make start
```

### Access the UIs

| Service | URL |
|---------|-----|
| **Storefront** | [http://localhost:8080](http://localhost:8080) |
| **Jaeger (Traces)** | [http://localhost:8080/jaeger/ui](http://localhost:8080/jaeger/ui) |
| **Grafana (Dashboards)** | [http://localhost:8080/grafana](http://localhost:8080/grafana) |
| **Feature Flags** | [http://localhost:8080/feature](http://localhost:8080/feature) |
| **Load Generator** | [http://localhost:8080/loadgen](http://localhost:8080/loadgen) |

### Stop the Platform

```bash
docker compose down --remove-orphans --volumes
# or
make stop
```

## 🚦 Feature Flags

The platform includes built-in feature flags for chaos engineering and A/B testing:

| Flag | Description |
|------|-------------|
| `adServiceFailure` | Triggers Ad Service errors |
| `adServiceHighCpu` | Simulates high CPU usage on Ad Service |
| `cartServiceFailure` | Triggers Cart Service errors |
| `paymentServiceFailure` | Simulates payment processing failures |
| `paymentServiceUnreachable` | Makes payment service unreachable from checkout |
| `loadGeneratorFloodHomepage` | Floods homepage with requests |
| `kafkaQueueProblems` | Simulates Kafka queue issues |
| `imageSlowLoad` | Slows down image loading |
| `recommendationCanary` | A/B tests the smart recommendation algorithm |
| `llmInaccurateResponse` | Rolls out a "chaotic" AI version for reliability testing |
| `llmRateLimitError` | Simulates high-load 429 error scenarios |

## 📂 Project Structure

```
├── src/
│   ├── accounting/          # .NET — Kafka consumer, order processing
│   ├── ad/                  # Java — Advertisement service
│   ├── cart/                # .NET — Shopping cart with Valkey
│   ├── checkout/            # Go — Order checkout with Kafka producer
│   ├── currency/            # C++ — Currency conversion
│   ├── email/               # Ruby — Email notifications
│   ├── flagd/               # Feature flag configurations
│   ├── flagd-ui/            # Elixir — Feature flag management UI
│   ├── fraud-detection/     # Kotlin — Kafka consumer, fraud analysis
│   ├── frontend/            # Next.js — Storefront UI
│   ├── frontend-proxy/      # Envoy — API gateway & reverse proxy
│   ├── gateway/             # Node.js — API gateway service
│   ├── image-provider/      # Nginx — Static image hosting
│   ├── llm/                 # Python — Mock LLM service
│   ├── load-generator/      # Python — Locust load testing
│   ├── payment/             # Node.js — Payment processing
│   ├── product-catalog/     # Go — Product data (PostgreSQL)
│   ├── product-reviews/     # Python — AI-powered review summaries
│   ├── recommendation/      # Python — Product recommendations
│   ├── quote/               # PHP — Shipping quotes
│   └── shipping/            # Rust — Shipping calculations
├── observability/           # Collector, Grafana, Prometheus configs
├── kubernetes/              # Kubernetes deployment manifests
├── pb/                      # Protocol Buffer definitions
├── docker-compose.yml       # Full deployment
├── docker-compose.minimal.yml  # Minimal deployment
└── Makefile                 # Build & deployment commands
```

## 📄 License

This project is licensed under the Apache License 2.0 — see the [LICENSE](LICENSE) file for details.

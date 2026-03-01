# Observability Stack

Standalone observability stack: **OTel Collector**, **Jaeger**, **Prometheus**, **Grafana**.

Instrumented services: **gateway** (Fastify TS), **queueflow** (FastAPI), **authz** (middleware in gateway).

---

## How to Run the Stack

### Option A: Full stack (observability + gateway + queueflow)

From the **project root**:

```bash
docker compose -f observability/docker-compose.yml up -d
```

### Option B: Observability only (run services locally)

Comment out the `gateway` and `queueflow` services in `docker-compose.yml`, then:

```bash
docker compose -f observability/docker-compose.yml up -d
```

Then run services locally:

```bash
# Terminal 1 - queueflow
cd src/queueflow && pip install -r requirements.txt && uvicorn main:app --reload --port 8000

# Terminal 2 - gateway
cd src/gateway && npm install && npm run dev
```

Set `OTEL_EXPORTER_OTLP_ENDPOINT=http://localhost:4318` if running services on host.

---

## How to Trigger a Trace (one curl)

```bash
curl -X POST http://localhost:3001/queueflow/queue/jobs
```

Or via gateway health + proxy:

```bash
curl http://localhost:3001/health
curl http://localhost:3001/queueflow/queue/depth
curl -X POST http://localhost:3001/queueflow/queue/jobs
```

With tenant header (for authz span attributes):

```bash
curl -H "X-Tenant-ID: tenant-123" http://localhost:3001/queueflow/queue/depth
```

---

## Where to View

| Tool | URL | Purpose |
|------|-----|---------|
| **Jaeger** | http://localhost:16686 | Traces (search by service: `gateway`, `queueflow`) |
| **Grafana** | http://localhost:3000 | Dashboards, metrics, trace links |
| **Prometheus** | http://localhost:9090 | Raw metrics |

### Jaeger

1. Open http://localhost:16686
2. Service: `gateway` or `queueflow`
3. Click **Find Traces**

### Grafana

1. Open http://localhost:3000
2. Dashboards → **Observability** → **Observability - p95 Latency & Queue Depth**
3. Data may take 1–2 minutes to appear after first requests

---

## Screenshots (placeholders)

<!-- Add screenshots here after running the stack -->

| View | Screenshot |
|------|------------|
| Jaeger trace | `![Jaeger trace](screenshots/jaeger-trace.png)` |
| Grafana dashboard | `![Grafana](screenshots/grafana-dashboard.png)` |

Create `observability/screenshots/` and add `jaeger-trace.png`, `grafana-dashboard.png` after capturing.

---

## Architecture

```
[curl] → gateway:3001 → queueflow:8000
              ↓              ↓
         authz.check    db.get_depth
         proxy.route    db.increment_depth
              ↓              ↓
         OTel Collector (4317/4318)
              ↓
    ┌─────────┴─────────┐
    ↓                   ↓
Jaeger:16686      Prometheus:9090
    ↓                   ↓
    └─────────┬─────────┘
              ↓
         Grafana:3000
```

---

## Instrumentation Summary

| Service | Auto-instrument | Custom spans |
|---------|-----------------|--------------|
| **gateway** | Fastify HTTP, fetch | `gateway.proxy.route`, `authz.check` |
| **queueflow** | FastAPI HTTP | `queueflow.db.get_depth`, `queueflow.db.increment_depth` |
| **authz** | (middleware in gateway) | `authz.check` with `tenant_id_hash`, `relation`, `object_type` (no secrets) |

---

## Files

- `docker-compose.yml` – OTel Collector, Jaeger, Prometheus, Grafana, gateway, queueflow
- `otel-collector-config.yaml` – OTLP receivers, spanmetrics connector, exporters
- `prometheus.yml` – Prometheus scrape config
- `grafana/provisioning/` – Datasources + dashboards

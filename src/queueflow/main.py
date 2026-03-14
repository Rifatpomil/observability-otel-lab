"""
Queueflow service - FastAPI with middleware spans + DB spans.
Exposes queue depth and job endpoints.
"""
import os
import sqlite3
from contextlib import asynccontextmanager

from fastapi import FastAPI

from opentelemetry import trace, metrics
from opentelemetry.exporter.otlp.proto.http.trace_exporter import OTLPSpanExporter
from opentelemetry.exporter.otlp.proto.http.metric_exporter import OTLPMetricExporter
from opentelemetry.instrumentation.fastapi import FastAPIInstrumentor
from opentelemetry.sdk.metrics import MeterProvider
from opentelemetry.sdk.metrics.export import PeriodicExportingMetricReader
from opentelemetry.sdk.resources import Resource
from opentelemetry.sdk.trace import TracerProvider
from opentelemetry.sdk.trace.export import BatchSpanProcessor

# --- OpenTelemetry setup ---
OTEL_ENDPOINT = os.getenv("OTEL_EXPORTER_OTLP_ENDPOINT", "http://localhost:4318")
resource = Resource.create({"service.name": "queueflow", "service.version": "1.0.0"})

# Traces
trace_provider = TracerProvider(resource=resource)
trace_provider.add_span_processor(
    BatchSpanProcessor(OTLPSpanExporter(endpoint=f"{OTEL_ENDPOINT}/v1/traces"))
)
trace.set_tracer_provider(trace_provider)

# Metrics (queue depth)
metric_reader = PeriodicExportingMetricReader(
    OTLPMetricExporter(endpoint=f"{OTEL_ENDPOINT}/v1/metrics"),
    export_interval_millis=10000,
)
meter_provider = MeterProvider(resource=resource, metric_readers=[metric_reader])
metrics.set_meter_provider(meter_provider)

tracer = trace.get_tracer("queueflow", "1.0.0")
meter = metrics.get_meter("queueflow", "1.0.0")

# SQLite for simplicity
DB_PATH = os.getenv("QUEUEFLOW_DB_PATH", "./queueflow.db")


def get_depth_sync() -> int:
    conn = sqlite3.connect(DB_PATH)
    row = conn.execute("SELECT depth FROM queue WHERE id = 1").fetchone()
    conn.close()
    return row[0] if row else 0


def _queue_depth_callback(options):
    yield metrics.Observation(get_depth_sync(), {})


queue_depth_gauge = meter.create_observable_gauge(
    "queueflow_queue_depth",
    callbacks=[_queue_depth_callback],
    description="Current queue depth",
    unit="1",
)


def init_db():
    conn = sqlite3.connect(DB_PATH)
    conn.execute("CREATE TABLE IF NOT EXISTS queue (id INTEGER PRIMARY KEY, depth INTEGER DEFAULT 0)")
    conn.execute("INSERT OR IGNORE INTO queue (id, depth) VALUES (1, 0)")
    conn.commit()
    conn.close()




def increment_depth() -> int:
    conn = sqlite3.connect(DB_PATH)
    conn.execute("UPDATE queue SET depth = depth + 1 WHERE id = 1")
    conn.commit()
    row = conn.execute("SELECT depth FROM queue WHERE id = 1").fetchone()
    conn.close()
    return row[0] if row else 0


@asynccontextmanager
async def lifespan(app: FastAPI):
    init_db()
    yield


app = FastAPI(title="Queueflow", lifespan=lifespan)


@app.get("/health")
async def health():
    return {"status": "ok", "service": "queueflow"}


@app.get("/")
async def root():
    return {"service": "queueflow", "endpoints": ["/health", "/queue/depth", "/queue/jobs"]}


@app.get("/queue/depth")
async def queue_depth():
    """Get queue depth - creates DB span."""
    with tracer.start_as_current_span("queueflow.db.get_depth") as span:
        span.set_attribute("db.operation", "SELECT")
        span.set_attribute("db.table", "queue")
        depth = get_depth_sync()
        span.set_attribute("queue.depth", depth)
        return {"depth": depth}


@app.post("/queue/jobs")
async def add_job():
    """Simulate adding a job - increments queue depth."""
    with tracer.start_as_current_span("queueflow.db.increment_depth") as span:
        span.set_attribute("db.operation", "UPDATE")
        span.set_attribute("db.table", "queue")
        depth = increment_depth()
        span.set_attribute("queue.depth", depth)
        return {"depth": depth}


# Instrument FastAPI (middleware spans)
FastAPIInstrumentor.instrument_app(app)

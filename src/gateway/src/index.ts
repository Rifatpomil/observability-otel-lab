// Copyright The OpenTelemetry Authors
// SPDX-License-Identifier: Apache-2.0
import Fastify from "fastify";
import proxy from "@fastify/http-proxy";
import { trace, SpanStatusCode } from "@opentelemetry/api";
import { authzMiddleware } from "./authz.js";

const QUEUEFLOW_URL = process.env.QUEUEFLOW_URL || "http://localhost:8000";

const fastify = Fastify({ logger: true });

// Authz middleware - adds span attributes for (tenant_id, relation, object) without leaking secrets
fastify.addHook("preHandler", authzMiddleware);

// Proxy /queueflow/* to queueflow service with custom span for routing
fastify.register(proxy, {
  upstream: QUEUEFLOW_URL,
  prefix: "/queueflow",
  rewritePrefix: "/",
  preHandler: async (request, _reply) => {
    const tracer = trace.getTracer("gateway", "1.0.0");
    const span = tracer.startSpan("gateway.proxy.route", {
      attributes: {
        "proxy.target": QUEUEFLOW_URL,
        "proxy.path": String(request.url),
        "http.route": "/queueflow/*",
      },
    });
    (request as { proxySpan?: ReturnType<typeof tracer.startSpan> }).proxySpan = span;
  },
  replyOptions: {
    onResponse: (_req, reply, _res) => {
      const fastifyReq = reply.request as { proxySpan?: { setStatus: (s: object) => void; end: () => void } };
      if (fastifyReq?.proxySpan) {
        fastifyReq.proxySpan.setStatus({ code: SpanStatusCode.OK });
        fastifyReq.proxySpan.end();
      }
    },
  },
});

// Health check
fastify.get("/health", async () => ({ status: "ok", service: "gateway" }));

// Root - info
fastify.get("/", async () => ({
  service: "gateway",
  routes: {
    "/health": "Health check",
    "/queueflow/*": `Proxy to queueflow at ${QUEUEFLOW_URL}`,
  },
}));

const port = Number(process.env.PORT) || 3001;
fastify.listen({ port, host: "0.0.0.0" }, (err) => {
  if (err) {
    fastify.log.error(err);
    process.exit(1);
  }
  console.log(`Gateway listening on http://0.0.0.0:${port}`);
});

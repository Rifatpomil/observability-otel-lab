// Copyright The OpenTelemetry Authors
// SPDX-License-Identifier: Apache-2.0
// Authz checks: add span attributes for (tenant_id, relation, object) without leaking secrets.
// Uses hashed/redacted values for PII - only structural info in spans.
import { trace } from "@opentelemetry/api";
import type { FastifyRequest, FastifyReply } from "fastify";

function hashForSpan(value: string): string {
  // Simple hash for span attributes - avoids leaking raw tenant/object IDs
  let h = 0;
  for (let i = 0; i < value.length; i++) {
    h = (h << 5) - h + value.charCodeAt(i);
    h |= 0;
  }
  return `h:${Math.abs(h).toString(16).slice(0, 8)}`;
}

export async function authzMiddleware(
  request: FastifyRequest,
  reply: FastifyReply
): Promise<void> {
  const tracer = trace.getTracer("gateway", "1.0.0");
  const span = tracer.startSpan("authz.check", {
    attributes: {
      "authz.relation": "access",
      "authz.object_type": inferObjectType(request.url),
    },
  });

  // Extract tenant_id from header (e.g. X-Tenant-ID) - never log raw value
  const tenantId = (request.headers["x-tenant-id"] as string) || "anonymous";
  const relation = "access";
  const object = inferObjectType(request.url);

  span.setAttributes({
    "authz.tenant_id_hash": hashForSpan(tenantId),
    "authz.relation": relation,
    "authz.object_type": object,
  });

  // Simulate authz check - in real impl, call policy engine
  const allowed = true;
  span.setAttribute("authz.allowed", allowed);
  span.setStatus({ code: allowed ? 1 : 2 }); // OK or ERROR
  span.end();

  if (!allowed) {
    reply.status(403).send({ error: "Forbidden" });
  }
}

function inferObjectType(url: string): string {
  if (url.startsWith("/queueflow/")) return "queueflow";
  if (url.startsWith("/health")) return "health";
  return "unknown";
}

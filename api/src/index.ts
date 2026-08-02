import Fastify from "fastify";
import cors from "@fastify/cors";
import {
  analyzeCompany,
  listRailsCases,
  loadRailsDossier,
} from "./pipeline/analyze.js";
import { resolveCompany } from "./pipeline/edgar.js";
import { ensureCacheDir } from "./pipeline/cache.js";

const PORT = Number(process.env.PORT || 8787);
const HOST = process.env.HOST || "0.0.0.0";

const allowedOrigins = (
  process.env.CORS_ORIGINS ||
  "http://localhost:5275,http://127.0.0.1:5275,https://jtflack-grc.github.io"
)
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

async function main() {
  await ensureCacheDir();
  const app = Fastify({ logger: true });

  await app.register(cors, {
    origin(origin, cb) {
      if (!origin) return cb(null, true);
      if (
        allowedOrigins.some(
          (o) => origin === o || origin.startsWith(o.replace(/\/$/, ""))
        )
      ) {
        return cb(null, true);
      }
      // allow local vite variants
      if (/^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)) {
        return cb(null, true);
      }
      cb(new Error("CORS blocked"), false);
    },
  });

  app.get("/health", async () => ({ ok: true, service: "interdependency-api" }));

  app.get("/api/rails", async () => ({ cases: await listRailsCases() }));

  app.get<{ Params: { id: string } }>("/api/rails/:id", async (req, reply) => {
    const dossier = await loadRailsDossier(req.params.id);
    if (!dossier) return reply.code(404).send({ error: "Rails case not found" });
    return dossier;
  });

  app.get<{ Querystring: { q?: string } }>("/api/resolve", async (req, reply) => {
    const q = req.query.q || "";
    const result = await resolveCompany(q);
    if (!result) return reply.code(404).send({ error: "Not found" });
    return result;
  });

  app.get<{ Querystring: { q?: string } }>("/api/analyze", async (req, reply) => {
    const q = (req.query.q || "").trim();
    if (!q) return reply.code(400).send({ error: "Missing q" });
    try {
      return await analyzeCompany(q);
    } catch (err) {
      const e = err as Error & { statusCode?: number };
      req.log.error(e);
      return reply.code(e.statusCode || 500).send({ error: e.message });
    }
  });

  app.post<{ Body: { query?: string } }>("/api/analyze", async (req, reply) => {
    const q = (req.body?.query || "").trim();
    if (!q) return reply.code(400).send({ error: "Missing query" });
    try {
      return await analyzeCompany(q);
    } catch (err) {
      const e = err as Error & { statusCode?: number };
      req.log.error(e);
      return reply.code(e.statusCode || 500).send({ error: e.message });
    }
  });

  await app.listen({ port: PORT, host: HOST });
  app.log.info(`Interdependency API listening on ${HOST}:${PORT}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

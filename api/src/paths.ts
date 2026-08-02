import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));

/** Monorepo root (api/src -> api -> root). */
export const ROOT = path.resolve(here, "../..");
export const DATA_DIR = path.join(ROOT, "data");
export const RAILS_DIR = path.join(DATA_DIR, "rails");
export const KB_DIR = path.join(DATA_DIR, "kb");
export const CACHE_DIR = path.join(ROOT, "api", "cache");

import fs from "node:fs/promises";
import path from "node:path";
import { CACHE_DIR } from "../paths.js";

export async function ensureCacheDir(): Promise<void> {
  await fs.mkdir(CACHE_DIR, { recursive: true });
}

export async function readCache<T>(key: string): Promise<T | null> {
  const file = path.join(CACHE_DIR, `${sanitize(key)}.json`);
  try {
    const raw = await fs.readFile(file, "utf8");
    const parsed = JSON.parse(raw) as { expiresAt: number; value: T };
    if (Date.now() > parsed.expiresAt) return null;
    return parsed.value;
  } catch {
    return null;
  }
}

export async function writeCache<T>(
  key: string,
  value: T,
  ttlMs: number
): Promise<void> {
  await ensureCacheDir();
  const file = path.join(CACHE_DIR, `${sanitize(key)}.json`);
  await fs.writeFile(
    file,
    JSON.stringify({ expiresAt: Date.now() + ttlMs, value }, null, 0),
    "utf8"
  );
}

function sanitize(key: string): string {
  return key.replace(/[^a-zA-Z0-9._-]+/g, "_").slice(0, 180);
}

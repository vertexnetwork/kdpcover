import fs from "node:fs";
import path from "node:path";

type AiBotsFile = { version?: string; allow?: string[]; disallow?: string[] };

const AI_BOTS_PATH = path.join(process.cwd(), "public", "ai-bots.json");

let cached: AiBotsFile | null = null;

function load(): AiBotsFile {
  if (cached) return cached;
  try {
    cached = JSON.parse(fs.readFileSync(AI_BOTS_PATH, "utf8")) as AiBotsFile;
  } catch {
    cached = { allow: [], disallow: [] };
  }
  return cached;
}

export function aiAllow(): string[] {
  return load().allow ?? [];
}

export function aiDisallow(): string[] {
  return load().disallow ?? [];
}

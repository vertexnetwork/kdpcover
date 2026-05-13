import fs from "node:fs";
import path from "node:path";
import { siteConfig } from "@/lib/site-config";

export type NetworkProperty = {
  slug: string;
  name: string;
  domain: string;
  url: string;
  tagline: string;
  description: string;
  audience: string;
  tags: string[];
  status: "live" | "soon";
};

type NetworkFile = {
  version?: string;
  brand?: string;
  sites?: NetworkProperty[];
};

const NETWORK_JSON_PATH = path.join(process.cwd(), "public", "network.json");

let cached: NetworkProperty[] | null = null;

export function loadNetwork(): NetworkProperty[] {
  if (cached) return cached;
  try {
    const raw = fs.readFileSync(NETWORK_JSON_PATH, "utf8");
    const parsed = JSON.parse(raw) as NetworkFile;
    cached = parsed.sites ?? [];
  } catch {
    cached = [];
  }
  return cached;
}

export function loadSisterSites(): NetworkProperty[] {
  return loadNetwork().filter((s) => s.domain !== siteConfig.domain);
}

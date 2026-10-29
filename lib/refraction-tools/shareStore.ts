// Server-only: minimal Upstash Redis REST client (works with the Vercel Marketplace env names too).

function config() {
  const url = process.env.KV_REST_API_URL ?? process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.KV_REST_API_TOKEN ?? process.env.UPSTASH_REDIS_REST_TOKEN;
  return url && token ? { url: url.replace(/\/$/, ""), token } : null;
}

export function storeConfigured(): boolean {
  return config() !== null;
}

async function command(args: (string | number)[]): Promise<unknown> {
  const c = config();
  if (!c) throw new Error("store not configured");
  const res = await fetch(c.url, {
    method: "POST",
    headers: { Authorization: `Bearer ${c.token}`, "Content-Type": "application/json" },
    body: JSON.stringify(args),
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`store HTTP ${res.status}`);
  const data = (await res.json()) as { result?: unknown; error?: string };
  if (data.error) throw new Error(data.error);
  return data.result ?? null;
}

/** SET key value NX EX ttl — true when written, false when the key already exists. */
export async function setIfAbsent(key: string, value: string, ttlSeconds: number): Promise<boolean> {
  return (await command(["SET", key, value, "NX", "EX", ttlSeconds])) === "OK";
}

export async function getValue(key: string): Promise<string | null> {
  const r = await command(["GET", key]);
  return typeof r === "string" ? r : null;
}

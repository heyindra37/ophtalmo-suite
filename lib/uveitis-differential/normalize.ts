// Normalizer untuk bentuk data yang tidak seragam di knowledge base v2.
// WAJIB dipakai oleh semua komponen yang membaca `investigations`/`differential_note` —
// jangan akses field mentah langsung, karena knowledge base v2 punya 3 bentuk `investigations`
// berbeda dalam satu file yang sama (lihat PRD Uveitis Differential v2, section 2B).

export type NormalizedTier = "basic" | "referral" | "unknown";

export interface NormalizedInvestigation {
  name: string;
  tier: NormalizedTier;
  note?: string;
}

function normalizeTier(raw: unknown): NormalizedTier {
  if (raw === "basic" || raw === "referral") return raw;
  if (raw === "basic/referral") return "basic";
  return "unknown";
}

export function normalizeInvestigations(raw: unknown): NormalizedInvestigation[] {
  if (!Array.isArray(raw)) return [];
  return raw.map((item) => {
    if (typeof item === "string") return { name: item, tier: "unknown" as const };
    if (item && typeof item === "object") {
      const obj = item as { name?: unknown; tier?: unknown; note?: unknown };
      return {
        name: typeof obj.name === "string" ? obj.name : String(obj.name ?? ""),
        tier: normalizeTier(obj.tier),
        note: typeof obj.note === "string" ? obj.note : undefined,
      };
    }
    return { name: String(item), tier: "unknown" as const };
  });
}

export type NormalizedDifferentialNote =
  | { kind: "text"; text: string }
  | { kind: "staged"; stages: Record<string, string> };

export function normalizeDifferentialNote(raw: unknown): NormalizedDifferentialNote | null {
  if (!raw) return null;
  if (typeof raw === "string") return { kind: "text", text: raw };
  if (typeof raw === "object") return { kind: "staged", stages: raw as Record<string, string> };
  return null;
}

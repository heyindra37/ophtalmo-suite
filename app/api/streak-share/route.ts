import { NextResponse } from "next/server";
import { SHARE_MAX_BYTES, SHARE_TTL_SECONDS, isSnapshot, newShareCode } from "@/lib/refraction-tools/share";
import { setIfAbsent, storeConfigured } from "@/lib/refraction-tools/shareStore";

export async function POST(req: Request) {
  if (!storeConfigured()) {
    return NextResponse.json({ error: "Penyimpanan belum diaktifkan di server." }, { status: 503 });
  }
  const raw = await req.text();
  if (raw.length > SHARE_MAX_BYTES) return NextResponse.json({ error: "Data terlalu besar." }, { status: 413 });
  let body: unknown;
  try {
    body = JSON.parse(raw);
  } catch {
    return NextResponse.json({ error: "Data tidak valid." }, { status: 400 });
  }
  if (!isSnapshot(body)) return NextResponse.json({ error: "Data tidak valid." }, { status: 400 });

  try {
    for (let attempt = 0; attempt < 5; attempt++) {
      const code = newShareCode();
      if (await setIfAbsent(`streak:${code}`, raw, SHARE_TTL_SECONDS)) {
        return NextResponse.json({ code, ttlSeconds: SHARE_TTL_SECONDS });
      }
    }
    return NextResponse.json({ error: "Gagal membuat kode, coba lagi." }, { status: 503 });
  } catch {
    return NextResponse.json({ error: "Server penyimpanan tidak bisa dihubungi." }, { status: 502 });
  }
}

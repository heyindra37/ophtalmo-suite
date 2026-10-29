import { NextResponse } from "next/server";
import { SHARE_CODE_RE } from "@/lib/refraction-tools/share";
import { getValue, storeConfigured } from "@/lib/refraction-tools/shareStore";

export async function GET(_req: Request, { params }: { params: Promise<{ code: string }> }) {
  if (!storeConfigured()) {
    return NextResponse.json({ error: "Penyimpanan belum diaktifkan di server." }, { status: 503 });
  }
  const { code } = await params;
  if (!SHARE_CODE_RE.test(code)) return NextResponse.json({ error: "Kode harus 6 angka." }, { status: 400 });
  try {
    const value = await getValue(`streak:${code}`);
    if (!value) return NextResponse.json({ error: "Kode tidak ditemukan atau sudah kedaluwarsa (2 jam)." }, { status: 404 });
    return new NextResponse(value, { headers: { "Content-Type": "application/json", "Cache-Control": "no-store" } });
  } catch {
    return NextResponse.json({ error: "Server penyimpanan tidak bisa dihubungi." }, { status: 502 });
  }
}

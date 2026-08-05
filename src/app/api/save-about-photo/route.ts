import { NextResponse } from "next/server";
import { writeFile } from "node:fs/promises";
import path from "node:path";

/**
 * Local-dev-only utility: writes the cropped avatar straight into public/.
 * Won't work on a deployed serverless target (read-only filesystem) — this
 * is meant to be run once locally before shipping, not as a live endpoint.
 */
export async function POST(req: Request) {
  const buf = Buffer.from(await req.arrayBuffer());
  if (!buf.length) {
    return NextResponse.json({ error: "empty body" }, { status: 400 });
  }
  const dest = path.join(process.cwd(), "public", "about-photo.jpg");
  await writeFile(dest, buf);
  return NextResponse.json({ ok: true });
}

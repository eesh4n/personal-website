import { NextResponse } from "next/server";

export const runtime = "edge";

export async function GET() {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (!url || !token) {
    return NextResponse.json({ count: null }, { status: 503 });
  }

  const res = await fetch(`${url}/incr/lifetime_visits`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) {
    return NextResponse.json({ count: null }, { status: 502 });
  }

  const data = await res.json();
  return NextResponse.json({ count: typeof data?.result === "number" ? data.result : null });
}

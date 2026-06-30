import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = "http://129.226.222.242:3481/api/image/proxy";
const BACKEND_URL_CF = "https://api.komida.site/api/image/proxy";

export async function GET(request: NextRequest) {
  const urlParam = request.nextUrl.searchParams.get("url");
  const source = request.nextUrl.searchParams.get("source") || "kiryuu";

  if (!urlParam) {
    return NextResponse.json({ error: "Missing url parameter" }, { status: 400 });
  }

  const qs = `?url=${encodeURIComponent(urlParam)}&source=${encodeURIComponent(source)}`;
  const apiKey = process.env.API_KEY || process.env.NEXT_PUBLIC_API_KEY || "komida-api-key-2026";

  // Try direct VPS first, fallback to Cloudflare Tunnel
  for (const base of [BACKEND_URL, BACKEND_URL_CF]) {
    try {
      const res = await fetch(`${base}${qs}`, {
        headers: { "x-api-key": apiKey },
        signal: AbortSignal.timeout(base === BACKEND_URL ? 10000 : 15000),
      });
      if (res.ok) {
        const data = await res.arrayBuffer();
        const contentType = res.headers.get("content-type") || "image/jpeg";
        return new NextResponse(data, {
          status: res.status,
          headers: {
            "content-type": contentType,
            "cache-control": "public, max-age=86400, stale-while-revalidate=604800",
          },
        });
      }
    } catch {}
  }

  return NextResponse.json({ error: "Proxy failed" }, { status: 502 });
}

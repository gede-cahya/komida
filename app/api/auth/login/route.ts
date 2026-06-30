import { NextRequest, NextResponse } from "next/server";

const LOGIN_URL_PRIMARY = "http://129.226.222.242:3481/api/auth/login";
const LOGIN_URL_FALLBACK = "https://api.komida.site/api/auth/login";
const API_KEY = "komida-api-key-2026";

export async function POST(request: NextRequest) {
  let body: string;

  try {
    body = JSON.stringify(await request.json());
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  // Try direct VPS first, fallback to Cloudflare Tunnel
  let res: Response | null = null;
  for (const url of [LOGIN_URL_PRIMARY, LOGIN_URL_FALLBACK]) {
    try {
      res = await fetch(url, {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "x-api-key": API_KEY,
        },
        body,
        cache: "no-store",
        signal: AbortSignal.timeout(url === LOGIN_URL_PRIMARY ? 10000 : 15000),
      });
      if (res.ok || res.status === 400 || res.status === 401) break; // valid response
    } catch {}
  }

  if (!res) {
    return NextResponse.json({ error: "Backend unreachable" }, { status: 502 });
  }

  const data = await res.arrayBuffer();
  const headers = new Headers();
  const contentType = res.headers.get("content-type");
  const setCookie = res.headers.get("set-cookie");

  if (contentType) headers.set("content-type", contentType);
  if (setCookie) headers.set("set-cookie", setCookie);
  headers.set("cache-control", "no-store");

  return new NextResponse(data, {
    status: res.status,
    statusText: res.statusText,
    headers,
  });
}

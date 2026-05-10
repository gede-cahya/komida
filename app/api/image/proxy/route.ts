import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = "http://129.226.222.242/api/image/proxy";

export async function GET(request: NextRequest) {
  const urlParam = request.nextUrl.searchParams.get("url");
  const source = request.nextUrl.searchParams.get("source") || "kiryuu";

  if (!urlParam) {
    return NextResponse.json({ error: "Missing url parameter" }, { status: 400 });
  }

  const backendUrl = `${BACKEND_URL}?url=${encodeURIComponent(urlParam)}&source=${encodeURIComponent(source)}`;

  try {
    const res = await fetch(backendUrl, {
      headers: {
        "x-api-key": process.env.API_KEY || "",
      },
      signal: AbortSignal.timeout(15000),
    });

    const data = await res.arrayBuffer();
    const contentType = res.headers.get("content-type") || "image/jpeg";

    return new NextResponse(data, {
      status: res.status,
      headers: {
        "content-type": contentType,
        "cache-control": "public, max-age=86400, stale-while-revalidate=604800",
      },
    });
  } catch (err: any) {
    console.error("[IMAGE PROXY] Error:", err.message);
    return NextResponse.json({ error: "Proxy failed" }, { status: 502 });
  }
}

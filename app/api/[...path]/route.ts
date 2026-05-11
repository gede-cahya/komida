import { NextRequest, NextResponse } from "next/server";

// Go sidecar via Cloudflare Tunnel
const API_URL = "https://api.komida.site/api";
const LOCAL_API_URL = "http://localhost:3481/api";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> },
) {
  return handleProxy(request, await params);
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> },
) {
  return handleProxy(request, await params);
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> },
) {
  return handleProxy(request, await params);
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> },
) {
  return handleProxy(request, await params);
}

async function handleProxy(request: NextRequest, { path }: { path: string[] }) {
  const endpoint = `/${path.join("/")}`;
  const searchParams = request.nextUrl.searchParams.toString();
  const queryString = searchParams ? `?${searchParams}` : "";

  const isDev = process.env.NODE_ENV === "development";
  const targetBase = isDev ? LOCAL_API_URL : API_URL;
  const apiKey = process.env.API_KEY || process.env.NEXT_PUBLIC_API_KEY || "komida-api-key-2026";

  // Handle body for non-GET requests
  let body: any = null;
  if (request.method !== "GET" && request.method !== "HEAD") {
    try {
      const contentType = request.headers.get("content-type");
      if (contentType?.includes("application/json")) {
        body = JSON.stringify(await request.json());
      } else {
        body = await request.blob();
      }
    } catch (e) {
      // body remain null
    }
  }

  // Construct headers, forwarding necessary ones but excluding host to avoid SSL/Routing issues
  const safeHeaders = new Headers();
  request.headers.forEach((value, key) => {
    if (!["host", "connection", "content-length"].includes(key.toLowerCase())) {
      safeHeaders.set(key, value);
    }
  });

  // Inject server-side API key so the backend accepts proxied requests
  safeHeaders.set("x-api-key", apiKey);

  if (endpoint === "/auth/login" && request.method === "POST") {
    safeHeaders.set("content-type", "application/json");
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 15000);

  try {
    const url = `${targetBase}${endpoint}${queryString}`;
    console.log(`[PROXY] Fetching: ${url}`);

    const res = await fetch(url, {
      method: request.method,
      headers: safeHeaders,
      body,
      signal: controller.signal,
      cache: "no-store",
    });

    console.log(`[PROXY] Status from ${targetBase}: ${res.status}`);
    return await convertFetchToNextResponse(res, endpoint);
  } catch (err: any) {
    console.error(
      `[PROXY FATAL] Backend unreachable for ${endpoint}. Error: ${err.message}`,
    );
    return NextResponse.json(
      { error: "Backend unreachable", details: { target: targetBase, endpoint } },
      { status: 503 },
    );
  } finally {
    clearTimeout(timeoutId);
  }
}

const TRANSPARENT_PNG = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",
  "base64"
);

async function convertFetchToNextResponse(res: Response, endpoint?: string) {
  const data = await res.arrayBuffer();

  // Filter headers to avoid conflicts
  const responseHeaders = new Headers();
  res.headers.forEach((value, key) => {
    const lowerKey = key.toLowerCase();
    // Skip headers that Next.js will handle or that might cause issues when proxied
    if (
      ![
        "content-encoding",
        "transfer-encoding",
        "content-length",
        "connection",
      ].includes(lowerKey)
    ) {
      responseHeaders.set(key, value);
    }
  });

  // Add long-lived cache for image proxy responses (covers rarely change)
  if (endpoint?.startsWith("/image/")) {
    // Validate upstream actually returned an image, not an error page
    const contentType = res.headers.get("content-type") || "";
    const isImage = contentType.startsWith("image/");
    const isValidSize = data.byteLength > 100; // Reject empty or tiny error responses

    if (!isImage || !isValidSize) {
      console.warn(
        `[PROXY IMAGE] Upstream returned non-image (ctype=${contentType}, size=${data.byteLength}). Serving placeholder.`
      );
      responseHeaders.set("content-type", "image/png");
      responseHeaders.set(
        "Cache-Control",
        "public, max-age=60, stale-while-revalidate=300"
      );
      return new NextResponse(TRANSPARENT_PNG, {
        status: 200,
        headers: responseHeaders,
      });
    }

    responseHeaders.set(
      "Cache-Control",
      "public, max-age=86400, stale-while-revalidate=604800"
    );
  }

  return new NextResponse(data, {
    status: res.status,
    statusText: res.statusText,
    headers: responseHeaders,
  });
}

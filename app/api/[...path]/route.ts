import { NextRequest, NextResponse } from "next/server";

// Constants to match lib/api.ts
const PRIMARY_API_URL = "https://komida-backend-production.up.railway.app/api";
const SECONDARY_API_URL = "https://api.komida.site/api";
const LOCAL_API_URL = "http://localhost:3002/api";

// Failover state
let isFallbackActive = false;
let lastHealthCheck = 0;
const HEALTH_CHECK_INTERVAL = 5 * 60 * 1000; // 5 minutes

// Statuses that should trigger failover (origin dead)
const FAILOVER_STATUSES = new Set([404, 500, 502, 503, 504, 530]);

/**
 * Periodically check if the primary API has recovered.
 * If it has, switch back from the secondary.
 */
async function maybeResetToPrimary() {
  if (!isFallbackActive) return;
  const now = Date.now();
  if (now - lastHealthCheck < HEALTH_CHECK_INTERVAL) return;
  lastHealthCheck = now;

  try {
    const res = await fetch(`${PRIMARY_API_URL}/popular`, {
      signal: AbortSignal.timeout(4000),
      cache: "no-store",
    });
    if (res.ok) {
      console.log("[PROXY HEALTH] Primary API recovered! Switching back.");
      isFallbackActive = false;
    }
  } catch {
    // Primary still down, stay on secondary
  }
}

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

  // In production, periodically check if primary has recovered
  if (!isDev) await maybeResetToPrimary();

  // Determine initial target base URL
  let targetBase = isDev
    ? LOCAL_API_URL
    : isFallbackActive
      ? SECONDARY_API_URL
      : PRIMARY_API_URL;

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

  const attemptFetch = async (baseUrl: string): Promise<Response> => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);

    try {
      const url = `${baseUrl}${endpoint}${queryString}`;
      console.log(`[PROXY] Fetching: ${url}`);

      const res = await fetch(url, {
        method: request.method,
        headers: safeHeaders,
        body,
        signal: controller.signal,
        cache: "no-store",
      });

      console.log(`[PROXY] Status from ${baseUrl}: ${res.status}`);

      // Trigger failover for known-bad statuses (404 suspended, 5xx, 530 tunnel dead)
      if (!res.ok && FAILOVER_STATUSES.has(res.status)) {
        throw new Error(`Upstream Error ${res.status}`);
      }
      return res;
    } finally {
      clearTimeout(timeoutId);
    }
  };

  let firstError: any = null;
  try {
    const response = await attemptFetch(targetBase);
    return await convertFetchToNextResponse(response);
  } catch (err: any) {
    firstError = err;

    // Build ordered fallback chain depending on what just failed
    const fallbackChain: string[] = [];
    if (isDev) {
      // Dev: Local → Railway → Cloudflare
      if (targetBase === LOCAL_API_URL) {
        fallbackChain.push(PRIMARY_API_URL, SECONDARY_API_URL);
      } else if (targetBase === PRIMARY_API_URL) {
        fallbackChain.push(SECONDARY_API_URL);
      } else {
        fallbackChain.push(PRIMARY_API_URL);
      }
    } else {
      // Prod: Railway → Cloudflare (or vice versa)
      if (targetBase === PRIMARY_API_URL) {
        fallbackChain.push(SECONDARY_API_URL);
      } else {
        fallbackChain.push(PRIMARY_API_URL);
      }
    }

    for (const nextTarget of fallbackChain) {
      console.warn(
        `[PROXY] Attempt to ${targetBase} failed: ${err.message}. Trying ${nextTarget}...`,
      );
      try {
        const response = await attemptFetch(nextTarget);

        // Update failover state for production
        if (!isDev) {
          isFallbackActive = nextTarget === SECONDARY_API_URL;
          lastHealthCheck = Date.now(); // Reset timer after a switch
          console.log(
            `[PROXY] Failover state updated: active=${isFallbackActive ? "SECONDARY" : "PRIMARY"}`,
          );
        }

        return await convertFetchToNextResponse(response);
      } catch (nextErr: any) {
        err = nextErr; // Track latest error for final message
      }
    }

    // All backends failed
    console.error(
      `[PROXY FATAL] All backends unreachable for ${endpoint}. First: ${firstError.message}, Last: ${err.message}`,
    );
    return NextResponse.json(
      {
        error: "Backend unreachable",
        details: {
          primary: PRIMARY_API_URL,
          secondary: SECONDARY_API_URL,
          failover_active: isFallbackActive,
          endpoint,
        },
      },
      { status: 503 },
    );
  }
}

async function convertFetchToNextResponse(res: Response) {
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

  return new NextResponse(data, {
    status: res.status,
    statusText: res.statusText,
    headers: responseHeaders,
  });
}

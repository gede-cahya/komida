import { NextRequest, NextResponse } from 'next/server';

// Constants to match lib/api.ts
const PRIMARY_API_URL = 'https://komida-backend-production.up.railway.app/api';
const SECONDARY_API_URL = 'https://api.komida.site/api';
const LOCAL_API_URL = 'http://localhost:3002/api';

// We use a simple global flag for failover in the current instance
// This is non-persistent across different serverless instances but helps during a single build or session
let isFallbackActive = false;

export async function GET(request: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
    return handleProxy(request, await params);
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
    return handleProxy(request, await params);
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
    return handleProxy(request, await params);
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
    return handleProxy(request, await params);
}

async function handleProxy(request: NextRequest, { path }: { path: string[] }) {
    const endpoint = `/${path.join('/')}`;
    const searchParams = request.nextUrl.searchParams.toString();
    const queryString = searchParams ? `?${searchParams}` : '';

    // Determine initial target base URL
    const isDev = process.env.NODE_ENV === 'development';
    let targetBase = isDev ? LOCAL_API_URL : (isFallbackActive ? SECONDARY_API_URL : PRIMARY_API_URL);

    // Handle body for non-GET requests
    let body: any = null;
    if (request.method !== 'GET' && request.method !== 'HEAD') {
        try {
            const contentType = request.headers.get('content-type');
            if (contentType?.includes('application/json')) {
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
        if (!['host', 'connection', 'content-length'].includes(key.toLowerCase())) {
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
                cache: 'no-store'
            });

            console.log(`[PROXY] Status from ${baseUrl}: ${res.status}`);

            // Trigger failover if Railway returns 404 App Not Found or 5xx
            if (baseUrl === PRIMARY_API_URL && !res.ok) {
                if (res.status === 404 || res.status >= 500) {
                    throw new Error(`Upstream Error ${res.status}`);
                }
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

        // Determine the next target based on what just failed
        let nextTarget = '';
        if (targetBase === LOCAL_API_URL) {
            nextTarget = PRIMARY_API_URL;
        } else if (targetBase === PRIMARY_API_URL) {
            nextTarget = SECONDARY_API_URL;
        } else {
            nextTarget = PRIMARY_API_URL; // Attempt recovery to primary if secondary fails
        }

        console.warn(`[PROXY] First attempt to ${targetBase} failed: ${err.message}. Trying ${nextTarget}...`);

        try {
            const response = await attemptFetch(nextTarget);

            // Only toggle production failover if we are NOT in dev mode using Local
            if (!isDev) {
                if (nextTarget === SECONDARY_API_URL) isFallbackActive = true;
                else if (nextTarget === PRIMARY_API_URL) isFallbackActive = false;
            }

            return await convertFetchToNextResponse(response);
        } catch (secondErr: any) {
            console.error(`[PROXY FATAL] Multiple backends unreachable. Error 1: ${firstError.message}, Error 2: ${secondErr.message}`);
            return NextResponse.json({
                error: 'Backend unreachable',
                details: {
                    attempt_1: { target: targetBase, error: firstError.message },
                    attempt_2: { target: nextTarget, error: secondErr.message },
                    is_dev: isDev
                }
            }, { status: 503 });
        }
    }
}

async function convertFetchToNextResponse(res: Response) {
    const data = await res.arrayBuffer();

    // Filter headers to avoid conflicts
    const responseHeaders = new Headers();
    res.headers.forEach((value, key) => {
        const lowerKey = key.toLowerCase();
        // Skip headers that Next.js will handle or that might cause issues when proxied
        if (!['content-encoding', 'transfer-encoding', 'content-length', 'connection'].includes(lowerKey)) {
            responseHeaders.set(key, value);
        }
    });

    return new NextResponse(data, {
        status: res.status,
        statusText: res.statusText,
        headers: responseHeaders,
    });
}

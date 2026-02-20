import { NextRequest, NextResponse } from 'next/server';

// Constants to match lib/api.ts
const PRIMARY_API_URL = 'https://komida-backend-production.up.railway.app/api';
const SECONDARY_API_URL = 'https://api.komida.site/api';

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

    // Determine target base URL
    let targetBase = isFallbackActive ? SECONDARY_API_URL : PRIMARY_API_URL;

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
        const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout for proxy

        try {
            const res = await fetch(`${baseUrl}${endpoint}${queryString}`, {
                method: request.method,
                headers: safeHeaders,
                body,
                signal: controller.signal,
                cache: 'no-store'
            });

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

    try {
        let response = await attemptFetch(targetBase);
        return await convertFetchToNextResponse(response);
    } catch (err) {
        if (!isFallbackActive && targetBase === PRIMARY_API_URL) {
            console.warn(`[PROXY FAILOVER] Primary API failed. Switching to Secondary for ${endpoint}`);
            isFallbackActive = true;
            try {
                const response = await attemptFetch(SECONDARY_API_URL);
                return await convertFetchToNextResponse(response);
            } catch (secondErr) {
                console.error(`[PROXY FAILOVER] Both APIs failed for ${endpoint}`);
                return NextResponse.json({ error: 'All backends are unreachable' }, { status: 503 });
            }
        }
        return NextResponse.json({ error: 'Backend unreachable' }, { status: 503 });
    }
}

async function convertFetchToNextResponse(res: Response) {
    const data = await res.blob();
    const nextResponse = new NextResponse(data, {
        status: res.status,
        statusText: res.statusText,
        headers: res.headers,
    });

    // Copy headers carefully
    res.headers.forEach((value, key) => {
        if (key.toLowerCase() !== 'content-encoding') {
            nextResponse.headers.set(key, value);
        }
    });

    return nextResponse;
}

import { NextRequest, NextResponse } from "next/server";

const LOGIN_URL = "https://api.komida.site/api/auth/login";
const API_KEY = "komida-api-key-2026";

export async function POST(request: NextRequest) {
  let body: string;

  try {
    body = JSON.stringify(await request.json());
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const res = await fetch(LOGIN_URL, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-api-key": API_KEY,
    },
    body,
    cache: "no-store",
  });

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

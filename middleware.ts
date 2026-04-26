import { NextRequest, NextResponse } from "next/server";

type UserRole = "instructor" | "student";
type SessionPayload = {
  userId: string;
  role: UserRole;
  exp: number;
};

const SESSION_COOKIE_NAME = "assessment_session";
const encoder = new TextEncoder();

function decodeBase64Url(value: string) {
  const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
  const padding = "=".repeat((4 - (normalized.length % 4)) % 4);

  return atob(`${normalized}${padding}`);
}

function toBase64Url(buffer: ArrayBuffer) {
  const bytes = new Uint8Array(buffer);
  let binary = "";

  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }

  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

async function verifySessionToken(token: string) {
  const secret = process.env.AUTH_SECRET;

  if (!secret) {
    throw new Error("AUTH_SECRET is not set");
  }

  const [encodedPayload, signature] = token.split(".");

  if (!encodedPayload || !signature) {
    return null;
  }

  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );

  const signed = await crypto.subtle.sign("HMAC", key, encoder.encode(encodedPayload));
  const expectedSignature = toBase64Url(signed);

  if (signature !== expectedSignature) {
    return null;
  }

  const payload = JSON.parse(decodeBase64Url(encodedPayload)) as SessionPayload;

  if (payload.exp <= Math.floor(Date.now() / 1000)) {
    return null;
  }

  return payload;
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (
    !pathname.startsWith("/dashboard/instructor") &&
    !pathname.startsWith("/dashboard/student")
  ) {
    return NextResponse.next();
  }

  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;

  if (!token) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  const session = await verifySessionToken(token);

  if (!session) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (pathname.startsWith("/dashboard/instructor") && session.role !== "instructor") {
    return NextResponse.redirect(new URL("/dashboard/student", request.url));
  }

  if (pathname.startsWith("/dashboard/student") && session.role !== "student") {
    return NextResponse.redirect(new URL("/dashboard/instructor", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/instructor/:path*", "/dashboard/student/:path*"],
};

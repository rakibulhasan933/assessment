import { cookies } from "next/headers";
import { createHmac, timingSafeEqual } from "crypto";
import { cache } from "react";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { users, type UserRole } from "@/lib/db/schema";

export const SESSION_COOKIE_NAME = "assessment_session";
const SESSION_TTL_SECONDS = 60 * 60 * 24 * 7;

type SessionPayload = {
  userId: string;
  role: UserRole;
  exp: number;
};

function getAuthSecret() {
  const secret = process.env.AUTH_SECRET;

  if (!secret) {
    throw new Error("AUTH_SECRET is not set");
  }

  return secret;
}

function encodeBase64Url(value: string) {
  return Buffer.from(value, "utf8").toString("base64url");
}

function decodeBase64Url(value: string) {
  return Buffer.from(value, "base64url").toString("utf8");
}

function signValue(value: string) {
  return createHmac("sha256", getAuthSecret()).update(value).digest("base64url");
}

export function createSessionToken(data: Omit<SessionPayload, "exp">) {
  const payload: SessionPayload = {
    ...data,
    exp: Math.floor(Date.now() / 1000) + SESSION_TTL_SECONDS,
  };

  const encodedPayload = encodeBase64Url(JSON.stringify(payload));
  const signature = signValue(encodedPayload);

  return `${encodedPayload}.${signature}`;
}

export function verifySessionToken(token: string) {
  const [encodedPayload, signature] = token.split(".");

  if (!encodedPayload || !signature) {
    return null;
  }

  const expectedSignature = signValue(encodedPayload);
  const actual = Buffer.from(signature);
  const expected = Buffer.from(expectedSignature);

  if (actual.length !== expected.length) {
    return null;
  }

  if (!timingSafeEqual(actual, expected)) {
    return null;
  }

  const payload = JSON.parse(decodeBase64Url(encodedPayload)) as SessionPayload;

  if (payload.exp <= Math.floor(Date.now() / 1000)) {
    return null;
  }

  return payload;
}

export async function setSessionCookie(data: Omit<SessionPayload, "exp">) {
  const cookieStore = await cookies();
  const token = createSessionToken(data);

  cookieStore.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_TTL_SECONDS,
  });
}

export async function clearSessionCookie() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
}

export const getCurrentSession = cache(async () => {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (!token) {
    return null;
  }

  return verifySessionToken(token);
});

export const getCurrentUser = cache(async () => {
  const session = await getCurrentSession();

  if (!session) {
    return null;
  }

  const user = await db().query.users.findFirst({
    where: eq(users.id, session.userId),
    columns: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  if (!user) {
    return null;
  }

  return user;
});

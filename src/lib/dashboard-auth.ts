import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import crypto from "crypto";

const JWT_SECRET = new TextEncoder().encode(process.env.DASHBOARD_JWT_SECRET || "fallback-dev-secret-change-me");

export function verifyTelegramAuth(data: Record<string, string>): boolean {
  const { hash, ...rest } = data;
  const botToken = process.env.BOT_TOKEN!;
  const secretKey = crypto.createHash("sha256").update(botToken).digest();
  const checkString = Object.keys(rest).sort().map((k) => `${k}=${rest[k]}`).join("\n");
  const hmac = crypto.createHmac("sha256", secretKey).update(checkString).digest("hex");
  const authDate = parseInt(rest.auth_date);
  if (Math.floor(Date.now() / 1000) - authDate > 86400) return false;
  return hmac === hash;
}

export async function createDashboardSession(user: { id: number; first_name: string; username?: string; photo_url?: string }) {
  const token = await new SignJWT(user).setProtectedHeader({ alg: "HS256" }).setExpirationTime("7d").setIssuedAt().sign(JWT_SECRET);
  (await cookies()).set("dashboard_session", token, { httpOnly: true, secure: true, sameSite: "strict", maxAge: 604800, path: "/" });
  return token;
}

export async function getDashboardSession() {
  const token = (await cookies()).get("dashboard_session")?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload as { id: number; first_name: string; username?: string; photo_url?: string };
  } catch {
    return null;
  }
}

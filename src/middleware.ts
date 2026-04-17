import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;

  // Telegram Login pages — NO restrictive CSP at all
  if (path === "/dashboard/login" || path.endsWith(".html")) {
    const response = NextResponse.next();
    response.headers.set("Content-Security-Policy",
      "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://telegram.org https://oauth.telegram.org; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https:; connect-src 'self' https://api.tuman.help https://api.ipify.org; frame-src 'self' https://telegram.org https://oauth.telegram.org; frame-ancestors 'self'"
    );
    return response;
  }

  // Dashboard auth check (except login page handled above)
  if (path.startsWith("/dashboard")) {
    const token = request.cookies.get("dashboard_session")?.value;
    if (!token) return NextResponse.redirect(new URL("/dashboard/login", request.url));
    try {
      const secret = new TextEncoder().encode(process.env.DASHBOARD_JWT_SECRET || "fallback-dev-secret-change-me");
      await jwtVerify(token, secret);
    } catch {
      return NextResponse.redirect(new URL("/dashboard/login", request.url));
    }
  }

  // CSP nonce for all other pages
  const nonce = Buffer.from(crypto.randomUUID()).toString("base64");

  const csp = [
    "default-src 'self'",
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'`,
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com",
    "img-src 'self' data: https:",
    "connect-src 'self' https://api.tuman.help https://api.uptimerobot.com https://api.ipify.org",
    "frame-ancestors 'none'",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
  ].join("; ");

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-nonce", nonce);

  const response = NextResponse.next({ request: { headers: requestHeaders } });
  response.headers.set("Content-Security-Policy", csp);

  return response;
}

export const config = {
  matcher: [
    {
      source: "/((?!api|_next/static|_next/image|favicon\\.ico|favicon\\.svg|robots\\.txt|sitemap\\.xml).*)",
    },
  ],
};

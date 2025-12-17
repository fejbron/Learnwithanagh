import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(request: NextRequest) {
  // Get the secret from environment variable
  // Next.js middleware has access to process.env, but we need to ensure it's set
  const secret = process.env.NEXTAUTH_SECRET || process.env.AUTH_SECRET || 'fallback-secret-change-in-production';
  
  try {
    const token = await getToken({ 
      req: request,
      secret: secret,
    });

    if (!token) {
      const loginUrl = new URL("/login", request.url);
      // Add redirect parameter so user can return after login
      loginUrl.searchParams.set("callbackUrl", request.url);
      return NextResponse.redirect(loginUrl);
    }

    return NextResponse.next();
  } catch (error) {
    console.error("Middleware error:", error);
    // On error, redirect to login
    const loginUrl = new URL("/login", request.url);
    return NextResponse.redirect(loginUrl);
  }
}

export const config = {
  matcher: ["/dashboard/:path*", "/products/:path*", "/scan/:path*", "/inventory/:path*", "/discounts/:path*", "/analytics/:path*"],
};


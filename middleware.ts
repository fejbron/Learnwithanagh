import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { auth } from "@/lib/auth";

export async function middleware(request: NextRequest) {
  try {
    // Use the auth() helper from NextAuth v5 instead of getToken
    const session = await auth();

    console.log("Middleware - checking session for:", request.nextUrl.pathname);
    console.log("Middleware - session exists:", !!session);
    
    if (!session) {
      console.log("Middleware - no session, redirecting to login");
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("callbackUrl", request.url);
      return NextResponse.redirect(loginUrl);
    }

    console.log("Middleware - session valid, allowing access");
    return NextResponse.next();
  } catch (error) {
    console.error("Middleware error:", error);
    const loginUrl = new URL("/login", request.url);
    return NextResponse.redirect(loginUrl);
  }
}

export const config = {
  matcher: ["/dashboard/:path*", "/products/:path*", "/scan/:path*", "/inventory/:path*", "/discounts/:path*", "/analytics/:path*"],
};


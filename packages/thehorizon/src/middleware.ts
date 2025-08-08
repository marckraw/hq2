import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  // Get the pathname
  const path = request.nextUrl.pathname;

  // Check if the path is the login page or api/login
  const isLoginPage = path === "/login";
  const isLoginApi = path === "/api/login";

  // Get the token from cookies
  const token = request.cookies.get("auth-token");

  // If we're on the login page and have a valid token, redirect to home
  if (isLoginPage && token) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  // If we're not on the login page and don't have a token, redirect to login
  if (!isLoginPage && !isLoginApi && !token) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

// Configure the middleware to run on specific paths
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (public directory)
     */
    "/((?!_next/static|_next/image|favicon.ico|public).*)",
  ],
};

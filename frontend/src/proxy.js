import { NextResponse } from "next/server";
import { getCurrentUser } from "./lib/auth/server";

export default async function middleware(request) {
  const { pathname } = request.nextUrl;

  // Prevent redirect loops
  if (pathname === "/unauthorized") {
    return NextResponse.next();
  }

  let requiredRole = null;

  if (pathname.startsWith("/admin")) {
    requiredRole = "admin";
  } else if (pathname.startsWith("/student")) {
    requiredRole = "student";
  }

  // If route doesn't require role (extra safety)
  if (!requiredRole) {
    return NextResponse.next();
  }

  const user = await getCurrentUser(request);

  if (!user) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  if (user.role !== requiredRole) {
    return NextResponse.redirect(new URL("/unauthorized", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/student/:path*"],
};

import { NextResponse } from "next/server";
import { getCurrentUser } from "./lib/auth/server";

export default async function middleware(request) {
  const { pathname } = request.nextUrl;

  // Prevent redirect loops
  if (pathname === "/unauthorized") {
    return NextResponse.next();
  }

  const user = await getCurrentUser(request);

  if (!user) {
    return NextResponse.redirect(new URL("/auth/sign-in", request.url));
  }

  // Superadmin bypasses feature flag checks
  if (user.is_superadmin || user.role === "superadmin") {
    return NextResponse.next();
  }

  let requiredFlags = [];

  if (pathname.startsWith("/lms")) {
    requiredFlags = ["lms"];
  } else if (pathname.startsWith("/settings")) {
    requiredFlags = ["settings"];
  } else if (pathname.startsWith("/academy")) {
    requiredFlags = ["academy"];
  }

  // If route doesn't require specific feature flags, let request pass
  if (requiredFlags.length === 0) {
    return NextResponse.next();
  }

  const userFlags = (user.feature_flags ?? []).map((f) => f.toLowerCase());

  const hasFlag = requiredFlags.some((flag) =>
    userFlags.includes(flag.toLowerCase())
  );

  if (!hasFlag) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/lms/:path*", "/settings/:path*", "/academy/:path*"],
};


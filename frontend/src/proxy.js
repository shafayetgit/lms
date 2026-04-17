import { NextResponse } from "next/server";
import { getCurrentUser } from "./lib/auth/server";

export default async function middleware(request) {
  const { pathname } = request.nextUrl;

  const user = await getCurrentUser(request);

  // admin access
  if (pathname.startsWith("/admin")) {
    if (!user) {
      return NextResponse.redirect(new URL("/", request.url));
    }

    if (user.role !== "admin") {
      return NextResponse.redirect(new URL("/unauthorized", request.url));
    }
  }

  // student access
  if (pathname.startsWith("/student")) {
    if (!user) {
      return NextResponse.redirect(new URL("/", request.url));
    }

    if (user.role !== "student") {
      return NextResponse.redirect(new URL("/unauthorized", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/student/:path*"],
};

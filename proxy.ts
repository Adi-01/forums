import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export const config = {
  // ✅ Added "/kajli/:path*" to the matcher
  matcher: ["/", "/login", "/nightchecking/:path*", "/kajli/:path*"],
};

export default function proxy(request: NextRequest) {
  const session = request.cookies.get("appwrite-session");
  const { pathname, searchParams } = request.nextUrl;

  // 1️⃣ Root route
  if (pathname === "/") {
    if (session?.value) {
      // You can decide where the root redirects.
      // For now, keeping it as /nightchecking, or you can change to /kajli
      return NextResponse.redirect(new URL("/nightchecking", request.url));
    }
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // 2️⃣ Login page
  if (pathname === "/login") {
    if (session?.value) {
      const nextUrl = searchParams.get("next");

      // Only redirect if next exists
      if (nextUrl) {
        return NextResponse.redirect(new URL(nextUrl, request.url));
      }

      // Optional: If logged in but visiting /login without params,
      // you might want to force them to dashboard:
      // return NextResponse.redirect(new URL("/nightchecking", request.url));

      return NextResponse.next();
    }

    return NextResponse.next();
  }

  // 3️⃣ Protected pages (Nightchecking AND Kajli)
  // ✅ Added the check for "/kajli" here
  if (pathname.startsWith("/nightchecking") || pathname.startsWith("/kajli")) {
    if (!session?.value) {
      return NextResponse.redirect(
        new URL(`/login?next=${pathname}`, request.url)
      );
    }
    return NextResponse.next();
  }

  return NextResponse.next();
}

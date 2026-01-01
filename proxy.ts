import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export const config = {
  matcher: ["/", "/login", "/nightchecking/:path*"],
};

export default function proxy(request: NextRequest) {
  const session = request.cookies.get("appwrite-session");
  const { pathname, searchParams } = request.nextUrl;

  // 1️⃣ Root route
  if (pathname === "/") {
    if (session?.value) {
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

      return NextResponse.next();
    }

    return NextResponse.next();
  }

  // 3️⃣ Protected pages (Nightchecking only)
  if (pathname.startsWith("/nightchecking")) {
    if (!session?.value) {
      return NextResponse.redirect(
        new URL(`/login?next=${pathname}`, request.url)
      );
    }
    return NextResponse.next();
  }

  return NextResponse.next();
}

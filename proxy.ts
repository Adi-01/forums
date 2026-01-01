import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export const config = {
  matcher: ["/", "/login", "/nightchecking/:path*", "/admin"],
};

export default function proxy(request: NextRequest) {
  const session = request.cookies.get("appwrite-session");
  const { pathname, searchParams } = request.nextUrl; // Get searchParams here

  // 1️⃣ Root route
  if (pathname === "/") {
    if (session?.value) {
      return NextResponse.redirect(new URL("/nightchecking", request.url));
    }
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // 2️⃣ Login page (THE FIX)
  if (pathname === "/login") {
    if (session?.value) {
      // If we have a 'next' parameter (e.g., /login?next=/admin), go there!
      const nextUrl = searchParams.get("next");
      if (nextUrl) {
        return NextResponse.redirect(new URL(nextUrl, request.url));
      }
      // Otherwise, default to dashboard
      return NextResponse.redirect(new URL("/nightchecking", request.url));
    }
    return NextResponse.next();
  }

  // 3️⃣ Protected pages (Nightchecking)
  if (pathname.startsWith("/nightchecking")) {
    if (!session?.value) {
      // Pass the current page as 'next' so they come back after login
      return NextResponse.redirect(
        new URL(`/login?next=${pathname}`, request.url)
      );
    }
    return NextResponse.next();
  }

  // 4️⃣ Protected pages (Admin)
  if (pathname === "/admin") {
    if (!session?.value) {
      return NextResponse.redirect(new URL("/login?next=/admin", request.url));
    }
    return NextResponse.next();
  }

  return NextResponse.next();
}

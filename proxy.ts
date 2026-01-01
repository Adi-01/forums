import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export const config = {
  // ✅ FIX: Add "/admin" to the matcher so this file actually runs!
  matcher: ["/", "/login", "/nightchecking/:path*", "/admin"],
};

export default function proxy(request: NextRequest) {
  const session = request.cookies.get("appwrite-session");
  const { pathname } = request.nextUrl;

  // 1️⃣ Root route: decide where to send the user
  if (pathname === "/") {
    if (session?.value) {
      return NextResponse.redirect(new URL("/nightchecking", request.url));
    }
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // 2️⃣ Login page
  if (pathname === "/login") {
    if (session?.value) {
      // already logged in → go to dashboard
      return NextResponse.redirect(new URL("/nightchecking", request.url));
    }
    return NextResponse.next();
  }

  // 3️⃣ Protected pages (Nightchecking)
  if (pathname.startsWith("/nightchecking")) {
    if (!session?.value) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
    return NextResponse.next();
  }

  // 4️⃣ Protected pages (Admin)
  if (pathname === "/admin") {
    // If NOT logged in, kick to login immediately
    if (!session?.value) {
      return NextResponse.redirect(new URL("/login", request.url));
    }

    // ⚡ PERFORMANCE NOTE:
    // We only check if the user is "Logged In" here.
    // We let the Server Component handle the "Is Admin" label check.
    // Why? Checking labels here requires an API call which makes the site slow.
    return NextResponse.next();
  }

  return NextResponse.next();
}

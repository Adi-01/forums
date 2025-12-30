import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export const config = {
  matcher: ["/", "/login", "/nightchecking/:path*"],
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

  // 3️⃣ Protected pages
  if (pathname.startsWith("/nightchecking")) {
    if (!session?.value) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
    return NextResponse.next();
  }

  return NextResponse.next();
}

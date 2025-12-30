import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export const config = {
  // It's good practice to match sub-paths too (/:path*)
  matcher: ["/", "/nightchecking/:path*"],
};

export default function proxy(request: NextRequest) {
  const session = request.cookies.get("appwrite-session");
  const { pathname } = request.nextUrl;

  // 1. Logic for the Login Page ("/")
  if (pathname === "/") {
    if (session) {
      // ✅ If logged in, redirect AWAY to dashboard
      return NextResponse.redirect(new URL("/nightchecking", request.url));
    }
    // ✅ If NOT logged in, do nothing (let them see the login page)
    return NextResponse.next();
  }

  // 2. Logic for Protected Pages ("/nightchecking")
  // Since you added it to the matcher, you should protect it!
  if (pathname.startsWith("/nightchecking")) {
    if (!session) {
      // ✅ If NOT logged in, redirect AWAY to login
      return NextResponse.redirect(new URL("/", request.url));
    }
    // ✅ If logged in, do nothing (let them see the page) QssGhcl@7890
    return NextResponse.next();
  }

  return NextResponse.next();
}

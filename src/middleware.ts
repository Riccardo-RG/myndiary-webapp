import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });

  // Check auth status
  const {
    data: { session },
    error,
  } = await supabase.auth.getSession();

  if (error) {
    console.error("Auth middleware error:", error);
  }

  // Only handle auth routes, let client-side handle protected routes
  const authPaths = ["/login"];
  const isAuthPath = authPaths.some((path) =>
    req.nextUrl.pathname.startsWith(path)
  );

  // Only redirect away from auth paths if already authenticated
  if (isAuthPath && session) {
    console.log(
      "Authenticated user accessing auth route:",
      req.nextUrl.pathname
    );
    return NextResponse.redirect(new URL("/", req.url));
  }

  return res;
}

// Configure which routes to run middleware on
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!_next/static|_next/image|favicon.ico|public).*)",
  ],
};

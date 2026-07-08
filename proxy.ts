import { type NextRequest, NextResponse } from "next/server";
import { updateSession } from "@/src/lib/supabase/middleware";

const PUBLIC_PATHS = ["/login", "/register", "/auth/callback"] as const;

function isPublicPath(pathname: string) {
  return PUBLIC_PATHS.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`),
  );
}

function withSessionCookies(
  source: NextResponse,
  target: NextResponse,
): NextResponse {
  source.cookies.getAll().forEach(({ name, value }) => {
    target.cookies.set(name, value);
  });
  return target;
}

export async function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-pathname", pathname);
  requestHeaders.set("x-search", search);

  const { response, user } = await updateSession(request, requestHeaders);

  if (user && (pathname === "/login" || pathname === "/register")) {
    return withSessionCookies(
      response,
      NextResponse.redirect(new URL("/", request.url)),
    );
  }

  if (!user && !isPublicPath(pathname)) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", `${pathname}${search}`);
    return withSessionCookies(
      response,
      NextResponse.redirect(loginUrl),
    );
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};

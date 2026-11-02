import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const AUTH_COOKIE = "devpilot_auth";

export function proxy(request: NextRequest) {
    const { pathname } = request.nextUrl;

    const isAuthed =
        request.cookies.get(AUTH_COOKIE)?.value === "1";

    // Allow OAuth callback
    if (pathname.startsWith("/auth/callback")) {
        return NextResponse.next();
    }

    // Redirect authenticated users away from login
    if (pathname === "/login" && isAuthed) {
        const dashboardUrl = request.nextUrl.clone();
        dashboardUrl.pathname = "/dashboard";
        dashboardUrl.search = "";

        return NextResponse.redirect(dashboardUrl);
    }

    // Protect dashboard and chat routes
    const isProtectedRoute =
        pathname.startsWith("/dashboard") ||
        pathname.startsWith("/chat");

    if (isProtectedRoute && !isAuthed) {
        const loginUrl = request.nextUrl.clone();
        loginUrl.pathname = "/login";
        loginUrl.search = "";

        loginUrl.searchParams.set(
            "next",
            pathname + request.nextUrl.search
        );

        return NextResponse.redirect(loginUrl);
    }

    // Allow all other requests to continue
    return NextResponse.next();
}

export const config = {
    matcher: [
        "/dashboard/:path*",
        "/chat/:path*",
        "/login",
        "/auth/callback/:path*",
    ],
};

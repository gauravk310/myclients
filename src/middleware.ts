import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Get the token
    const token = await getToken({
        req: request,
        secret: process.env.NEXTAUTH_SECRET,
    });

    // Protect dashboard routes
    if (pathname.startsWith('/dashboard')) {
        if (!token) {
            const signInUrl = new URL('/auth/signin', request.url);
            signInUrl.searchParams.set('callbackUrl', pathname);
            return NextResponse.redirect(signInUrl);
        }
    }

    // Redirect authenticated users away from auth pages
    if (pathname.startsWith('/auth/') && token) {
        return NextResponse.redirect(new URL('/dashboard', request.url));
    }

    // Protect admin-only routes
    if (pathname.startsWith('/dashboard/team')) {
        if (!token || token.role !== 'admin') {
            return NextResponse.redirect(new URL('/dashboard', request.url));
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/dashboard/:path*', '/auth/:path*'],
};

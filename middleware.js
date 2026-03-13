import { NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

// Define protected routes
const protectedRoutes = ['/dashboard', '/request', '/admin'];

export async function middleware(request) {
    const { pathname } = request.nextUrl;

    // Check if it's a protected route
    const isProtectedRoute = protectedRoutes.some((route) => pathname.startsWith(route));

    if (isProtectedRoute) {
        const token = request.cookies.get('token')?.value;

        if (!token) {
            return NextResponse.redirect(new URL('/login', request.url));
        }

        try {
            const secret = new TextEncoder().encode(process.env.JWT_SECRET);

            // Verify token
            const { payload } = await jwtVerify(token, secret);

            // Basic RBAC for admin route
            if (pathname.startsWith('/admin') && payload.role !== 'admin') {
                return NextResponse.redirect(new URL('/dashboard', request.url));
            }

            return NextResponse.next();
        } catch (error) {
            // Token is invalid/expired
            return NextResponse.redirect(new URL('/login', request.url));
        }
    }

    // If user is logged in, restrict access to login/register pages
    if (pathname === '/login' || pathname === '/register') {
        const token = request.cookies.get('token')?.value;
        if (token) {
            try {
                const secret = new TextEncoder().encode(process.env.JWT_SECRET);
                await jwtVerify(token, secret);
                return NextResponse.redirect(new URL('/dashboard', request.url));
            } catch (error) {
                // Token invalid, allow to proceed to login
            }
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};

import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
    let supabaseResponse = NextResponse.next({
        request,
    });

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll();
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value }) =>
                        request.cookies.set(name, value)
                    );
                    supabaseResponse = NextResponse.next({
                        request,
                    });
                    cookiesToSet.forEach(({ name, value, options }) =>
                        supabaseResponse.cookies.set(name, value, options)
                    );
                },
            },
        }
    );

    const {
        data: { user },
    } = await supabase.auth.getUser();

    // Guest ID logic
    const GUEST_ID_COOKIE = 'guest-id';
    const guestId = request.cookies.get(GUEST_ID_COOKIE)?.value;

    // Don't redirect API routes — just refresh session cookies
    if (request.nextUrl.pathname.startsWith('/api')) {
        // If not logged in and no guest id, we might want to set one even for API calls?
        // Usually, the first page load will set it.
        return supabaseResponse;
    }

    // Publicly accessible paths (always allowed)
    const alwaysPublicPaths = ['/login', '/signup', '/landing', '/privacy', '/terms', '/doc', '/auth/callback', '/forgot-password', '/reset-password'];
    // Paths accessible by both logged-in users and guests
    const guestAllowedPaths = ['/sheet', '/jump'];

    const isAlwaysPublic = alwaysPublicPaths.some(path => request.nextUrl.pathname.startsWith(path)) ||
        request.nextUrl.pathname === '/';
    const isGuestAllowed = guestAllowedPaths.some(path => request.nextUrl.pathname.startsWith(path));

    // If no user and not a public/guest path, redirect to landing
    if (!user && !isAlwaysPublic && !isGuestAllowed) {
        const url = request.nextUrl.clone();
        url.pathname = '/landing';
        return NextResponse.redirect(url);
    }

    // Set guest-id if missing and not logged in
    if (!user && !guestId) {
        // Generate a simple UUID-like string if we can't use crypto.randomUUID here easily
        // Middleware runtime is limited, but crypto.randomUUID is usually available in modern Next.js
        const newGuestId = crypto.randomUUID();
        supabaseResponse.cookies.set(GUEST_ID_COOKIE, newGuestId, {
            path: '/',
            maxAge: 60 * 60 * 24 * 365, // 1 year
            httpOnly: true,
            sameSite: 'lax',
        });
    }

    if (user) {
        // Redirect from landing/login/signup to dashboard (current week)
        const isAuthPage = request.nextUrl.pathname.startsWith('/login') ||
            request.nextUrl.pathname.startsWith('/signup');
        const isLandingPage = request.nextUrl.pathname === '/' ||
            request.nextUrl.pathname === '/landing';

        if (isAuthPage || isLandingPage) {
            const url = request.nextUrl.clone();
            const now = new Date();
            const month = now.getMonth() + 1;
            const weekPeriod = (month - 1) * 5 + Math.min(Math.ceil(now.getDate() / 7), 5);
            url.pathname = `/sheet/week/${now.getFullYear()}/${weekPeriod}`;
            return NextResponse.redirect(url);
        }
    }

    return supabaseResponse;
}

export const config = {
    matcher: [
        '/((?!_next/static|_next/image|favicon.ico).*)',
    ],
};

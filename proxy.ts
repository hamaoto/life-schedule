import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function proxy(request: NextRequest) {
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

    // Don't redirect API routes — just refresh session cookies
    if (request.nextUrl.pathname.startsWith('/api')) {
        return supabaseResponse;
    }

    // Publicly accessible paths
    const publicPaths = ['/login', '/signup', '/landing', '/privacy', '/terms', '/doc'];
    const isPublicPath = publicPaths.some(path => request.nextUrl.pathname.startsWith(path)) ||
        request.nextUrl.pathname === '/';

    if (!user && !isPublicPath) {
        const url = request.nextUrl.clone();
        url.pathname = '/landing';
        return NextResponse.redirect(url);
    }

    if (user) {
        // Redirect from landing/login/signup to dashboard
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

import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  // console.log('--- Middleware Executed ---', request.method, request.nextUrl.pathname);
  // console.log('Middleware - Incoming Request Cookies:', request.cookies.getAll());

  const response = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options))
        },
      },
    }
  )

  // IMPORTANT: Avoid writing any logic between createServerClient and
  // supabase.auth.getUser(). A simple mistake could make it very hard to debug
  // issues with users being randomly logged out.

  const {
    data: { user },
  } = await supabase.auth.getUser()

  // console.log('Middleware - User from Supabase:', user ? user.id : 'No user');
  // console.log('Middleware - Response Cookies (before return):', response.cookies.getAll());

  // Protect routes that require authentication
  if (!user && (request.nextUrl.pathname.startsWith('/create') || request.nextUrl.pathname.startsWith('/my-polls'))) {
    const url = request.nextUrl.clone()
    url.pathname = '/signin'
    return NextResponse.redirect(url)
  }

  return response
}

export const config = {
  matcher: [
    // Match all API routes
    '/api/:path*', 
    // Match all other routes except static files, images, favicon
    '/(?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*', 
  ],
}
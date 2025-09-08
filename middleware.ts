import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  console.log('--- Middleware Executed ---', request.method, request.nextUrl.pathname);
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

  console.log('Middleware - Request Cookies (Incoming):', request.cookies.getAll());
  console.log('Middleware - user:', user ? user.id : 'No user');
  console.log('Middleware - Response Cookies (after auth.getUser):', response.cookies.getAll());
  console.log('Middleware - Response Headers (after auth.getUser):', response.headers.getSetCookie());

  // Protect routes that require authentication
  if (!user && (request.nextUrl.pathname.startsWith('/create') || request.nextUrl.pathname.startsWith('/my-polls'))) {
    const url = request.nextUrl.clone()
    url.pathname = '/signin'
    return NextResponse.redirect(url)
  }

  // IMPORTANT: You *must* return the supabaseResponse object as it is. If you're
  // creating a new response object with NextResponse.next() make sure to:
  // 1. Pass the request in it, like so:
  //    const myNewResponse = NextResponse.next({ request })
  // 2. Copy over the cookies, like so:
  //    myNewResponse.cookies.setAll(supabaseResponse.cookies.getAll())
  // 3. Change the myNewResponse object to fit your needs, but avoid changing
  //    the cookies!

  // This is the crucial part to ensure the session is refreshed and propagated.
  // The `supabase` client's `cookies` object (configured with `setAll`) handles
  // setting the cookies on the `response` object directly when `supabase.auth.getUser()`
  // or other auth methods are called.
  // So, we just need to return the `response` object that was modified by the Supabase client.
  // 4. Finally:
  return response;
  // If this is not done, you may be causing the browser and server to go out
  // of sync and terminate the user's session prematurely!

  return response
}

export const config = {
  matcher: [
    '/(?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*',
  ],
}
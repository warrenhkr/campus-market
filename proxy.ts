import { type NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'

export async function proxy(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll() },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set(name, value)
            void options
          })
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) => {
            const cookieOptions = { ...options, secure: process.env.NODE_ENV === 'production' ? options.secure : false }
            supabaseResponse.cookies.set(name, value, cookieOptions)
          })
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  const protectedRoutes = ['/account', '/seller']
  const isProtected = protectedRoutes.some((r) =>
    request.nextUrl.pathname.startsWith(r)
  )

  // Helper to forward cookies from supabaseResponse to a redirect response
  const redirectWithCookies = (url: URL) => {
    const res = NextResponse.redirect(url)
    supabaseResponse.cookies.getAll().forEach(cookie => {
      res.cookies.set(cookie.name, cookie.value, cookie)
    })
    return res
  }

  if (isProtected && !user) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return redirectWithCookies(url)
  }

  const isAuthRoute = request.nextUrl.pathname.startsWith('/login') || request.nextUrl.pathname.startsWith('/register')
  if (isAuthRoute && user) {
    const url = request.nextUrl.clone()
    // Si onboarding pas encore complété, envoie directement sur /onboarding
    url.pathname = user.user_metadata?.onboarding_complete === true ? '/account' : '/onboarding'
    return redirectWithCookies(url)
  }

  // ── Onboarding obligatoire ──────────────────────────────────────────────
  // Si l'utilisateur est connecté mais n'a pas complété son onboarding,
  // on le redirige vers /onboarding (sauf s'il y est déjà ou sur API/auth).
  if (user) {
    const pathname = request.nextUrl.pathname
    const isOnboardingExempt =
      pathname === '/onboarding' ||
      pathname.startsWith('/api/') ||
      pathname.startsWith('/auth/')

    const onboardingComplete =
      user.user_metadata?.onboarding_complete === true

    if (!onboardingComplete && !isOnboardingExempt) {
      const url = request.nextUrl.clone()
      url.pathname = '/onboarding'
      return redirectWithCookies(url)
    }
  }

  return supabaseResponse

}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}


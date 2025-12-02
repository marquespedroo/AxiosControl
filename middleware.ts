import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { jwtVerify } from 'jose'

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'axioscontrol-jwt-secret-change-in-production-min-32-chars'
)

// Protected routes that require authentication
const protectedRoutes = [
  '/dashboard',
  '/pacientes',
  '/aplicar',
  '/resultados',
  '/biblioteca',
  '/registros-manuais',
  '/admin',
  '/api/pacientes',
  // '/api/testes-aplicados', // Handled individually to support patient portal
  '/api/testes-templates',
  '/api/export-pdf',
]

// Public routes that don't require authentication
const publicRoutes = [
  '/login',
  '/api/auth/login',
]

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Check if route requires authentication
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route))
  const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route))

  // Allow public routes
  if (isPublicRoute) {
    return NextResponse.next()
  }

  // Check authentication for protected routes
  if (isProtectedRoute) {
    // Get token from cookie or authorization header
    const token = request.cookies.get('auth_token')?.value ||
      request.headers.get('authorization')?.replace('Bearer ', '')

    console.log('[Middleware]', pathname, '- Token:', token ? `${token.substring(0, 20)}...` : 'MISSING')

    if (!token) {
      console.log('[Middleware] No token found, redirecting to login')
      // Redirect to login with return URL
      const loginUrl = new URL('/login', request.url)
      loginUrl.searchParams.set('redirect', pathname)
      return NextResponse.redirect(loginUrl)
    }

    // Verify token using jose (Edge-compatible)
    try {
      const { payload } = await jwtVerify(token, JWT_SECRET)
      console.log('[Middleware] Token valid for user:', payload.email)
      return NextResponse.next()
    } catch (error) {
      console.log('[Middleware] Token verification failed:', (error as Error).message)
      // Invalid or expired token - redirect to login
      const loginUrl = new URL('/login', request.url)
      loginUrl.searchParams.set('redirect', pathname)
      const response = NextResponse.redirect(loginUrl)
      response.cookies.delete('auth_token')
      return response
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}

import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'

const isProtectedRoute = createRouteMatcher([
  '/dashboard(.*)',
])

const isAPIRoute = createRouteMatcher([
  '/api(.*)',
])

export default clerkMiddleware(async (auth, req) => {
  if (isProtectedRoute(req)) {
    await auth.protect()
  }
  
  // Pass user ID to API routes
  if (isAPIRoute(req)) {
    const { userId } = await auth()
    
    if (userId) {
      const requestHeaders = new Headers(req.headers)
      requestHeaders.set('x-user-id', userId)
      
      return NextResponse.next({
        request: {
          headers: requestHeaders,
        },
      })
    }
  }
})

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
}

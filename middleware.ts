import { withAuth } from "next-auth/middleware"

export default withAuth(
  function middleware(req) {
    // Add custom middleware logic here if needed
  },
  {
  callbacks: {
    authorized: ({ token, req }) => {
      const { pathname } = req.nextUrl

      // Protect admin routes
      if (pathname.startsWith('/admin')) {
        return token?.role === 'admin'
      }

      // Protect user dashboard (only authenticated users)
      if (pathname.startsWith('/dashboard')) {
        return !!token
      }

      // Allow all other routes
      return true
    },
  },
  }
)

export const config = {
  matcher: ["/admin/:path*", "/dashboard/:path*"]
}
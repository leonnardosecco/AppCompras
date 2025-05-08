import { withAuth } from 'next-auth/middleware'

export default withAuth({
  callbacks: {
    authorized({ req, token }) {
      // Verifica se existe um token válido
      if (!token) return false

      // Protege rotas do dashboard
      if (req.nextUrl.pathname.startsWith('/dashboard')) {
        return !!token
      }

      return true
    },
  },
})

export const config = {
  matcher: ['/dashboard/:path*']
} 
import NextAuth, { NextAuthOptions } from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'

const normalizeBackendApiBaseUrl = (baseUrl?: string) => {
  if (!baseUrl) {
    return 'http://localhost:8080/api'
  }

  return baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl
}

const backendApiBaseUrl = normalizeBackendApiBaseUrl(process.env.BACKEND_API_BASE_URL)
export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
    }),
  ],
  callbacks: {
    async jwt({ token, account }) {
      if (!account) {
        return token
      }

      delete token.backendAuthError
      delete token.accessToken

      if (!account.id_token) {
        token.backendAuthError = 'Google no entrego un token valido para iniciar sesion.'
        return token
      }

      try {
        const response = await fetch(`${backendApiBaseUrl}/auth/google`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ idToken: account.id_token }),
        })

        const data = await response.json().catch(() => null)
        const backendError =
          data?.error || data?.message || `El backend rechazo la autenticacion con estado ${response.status}.`

        if (response.ok && data?.token) {
          token.accessToken = data.token
          token.userEmail = data.correo
          token.userName = data.nombre
        } else {
          token.backendAuthError = backendError
        }
      } catch (error) {
        console.error('Error intercambiando token con el backend:', error)
        token.backendAuthError = 'No se pudo conectar el login de Google con el backend.'
      }

      return token
    },
    async session({ session, token }) {
      if (token.accessToken) {
        session.accessToken = token.accessToken as string
        session.user = {
          ...session.user,
          email: token.userEmail as string,
          name: token.userName as string,
        }
      }

      if (token.backendAuthError) {
        session.error = token.backendAuthError as string
      }

      return session
    },
  },
  pages: {
    signIn: '/login',
  },
}

export default NextAuth(authOptions)

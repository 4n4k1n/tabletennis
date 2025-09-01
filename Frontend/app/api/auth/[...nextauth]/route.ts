import NextAuth from "next-auth"
import type { NextAuthOptions } from "next-auth"

const authOptions: NextAuthOptions = {
  providers: [
    {
      id: "42-school",
      name: "42 School",
      type: "oauth",
      authorization: {
        url: "https://api.intra.42.fr/oauth/authorize",
        params: {
          scope: "public",
          response_type: "code",
        },
      },
      token: "https://api.intra.42.fr/oauth/token",
      userinfo: "https://api.intra.42.fr/v2/me",
      clientId: process.env.AUTH_42_ID!,
      clientSecret: process.env.AUTH_42_SECRET!,
      profile(profile: any) {
        return {
          id: profile.id.toString(),
          name: `${profile.first_name} ${profile.last_name}`,
          email: profile.email,
          image: profile.image?.link || null,
          login: profile.login,
        }
      },
      httpOptions: {
        timeout: 10000,
      },
    },
  ],
  callbacks: {
    async jwt({ token, account, user }) {
      if (account && user) {
        token.accessToken = account.access_token
        token.login = (user as any).login
      }
      return token
    },
    async session({ session, token }) {
      (session as any).accessToken = token.accessToken
      ;(session as any).login = token.login
      return session
    },
  },
  pages: {
    signIn: "/login",
  },
}

const handler = NextAuth(authOptions)
export { handler as GET, handler as POST }
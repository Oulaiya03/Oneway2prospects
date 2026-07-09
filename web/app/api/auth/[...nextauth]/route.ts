// web/app/api/auth/[...nextauth]/route.ts
// Login Google -> récupère le token (Agenda + Gmail) côté serveur. NextAuth v4.
// Redirect URI à déclarer côté Google Cloud : http://localhost:3000/api/auth/callback/google
import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";

const handler = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          scope:
            "openid email profile https://www.googleapis.com/auth/calendar.readonly https://www.googleapis.com/auth/gmail.compose",
          access_type: "offline",
          prompt: "consent",
        },
      },
    }),
  ],
  callbacks: {
    // au login : on capte le token Google dans le JWT (côté serveur)
    async jwt({ token, account }) {
      if (account) {
        token.accessToken = account.access_token;
        token.refreshToken = account.refresh_token;
        token.expiresAt = account.expires_at;
      }
      return token;
    },
    async session({ session, token }) {
      (session as unknown as { accessToken?: unknown }).accessToken = token.accessToken;
      return session;
    },
  },
});

export { handler as GET, handler as POST };

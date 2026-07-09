// web/app/api/auth/[...nextauth]/route.ts
// Login Microsoft (Azure AD) -> récupère le token Graph côté serveur. NextAuth v4.
// Redirect URI à déclarer côté Azure : http://localhost:3000/api/auth/callback/azure-ad
import NextAuth from "next-auth";
import AzureADProvider from "next-auth/providers/azure-ad";

const handler = NextAuth({
  providers: [
    AzureADProvider({
      clientId: process.env.AZURE_AD_CLIENT_ID!,
      clientSecret: process.env.AZURE_AD_CLIENT_SECRET!,
      tenantId: process.env.AZURE_AD_TENANT_ID!,
      authorization: {
        params: {
          scope: "openid profile email offline_access User.Read Calendars.Read Mail.ReadWrite",
        },
      },
    }),
  ],
  callbacks: {
    // au login : on capte le token Graph dans le JWT (côté serveur)
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

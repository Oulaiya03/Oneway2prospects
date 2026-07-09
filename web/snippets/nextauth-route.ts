// A copier dans : web/app/api/auth/[...nextauth]/route.ts (apres create-next-app)
// Login Microsoft -> recupere le token Graph (server-side). NextAuth v4.
// deps : npm i next-auth
import NextAuth from "next-auth";
import AzureADProvider from "next-auth/providers/azure-ad";

const handler = NextAuth({
  providers: [
    AzureADProvider({
      clientId: process.env.AZURE_AD_CLIENT_ID!,
      clientSecret: process.env.AZURE_AD_CLIENT_SECRET!,
      tenantId: process.env.AZURE_AD_TENANT_ID!, // "common" pour comptes perso+org (evite admin consent)
      authorization: {
        params: {
          scope:
            "openid profile email offline_access User.Read Calendars.Read Mail.ReadWrite",
        },
      },
    }),
  ],
  callbacks: {
    // au login : on capte les tokens dans le JWT (cote serveur)
    async jwt({ token, account }) {
      if (account) {
        token.accessToken = account.access_token;
        token.refreshToken = account.refresh_token;
        token.expiresAt = account.expires_at;
      }
      return token;
      // TODO (optionnel) : refresh si expiresAt depasse (via refresh_token). Pas obligatoire pour la demo (~1h).
    },
    async session({ session, token }) {
      (session as any).accessToken = token.accessToken; // dispo cote serveur
      return session;
    },
  },
});

export { handler as GET, handler as POST };

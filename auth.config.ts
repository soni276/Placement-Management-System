import type { NextAuthConfig } from "next-auth";

/**
 * Edge-safe auth config - NO Prisma, Credentials, or heavy deps.
 * Used by middleware to stay under Vercel 1MB limit.
 */
export const authConfig = {
  providers: [], // Only for middleware; real providers in lib/auth.ts
  secret: process.env.NEXTAUTH_SECRET,
  trustHost: true,
  pages: { signIn: "/" },
  session: { strategy: "jwt" as const, maxAge: 30 * 24 * 60 * 60 },
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.role = user.role;
        token.id = user.id;
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        (session.user as { role?: string }).role = token.role as string;
        (session.user as { id?: string }).id = token.id as string;
      }
      return session;
    },
  },
} satisfies NextAuthConfig;

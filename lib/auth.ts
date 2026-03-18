import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { prisma } from "./prisma";
import { hashPassword } from "./hash";

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Credentials({
      id: "student",
      name: "Student",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;
        const pwdHash = await hashPassword(credentials.password as string);
        const student = await prisma.student.findFirst({
          where: {
            email: (credentials.email as string).trim().toLowerCase(),
            passwordHash: pwdHash,
          },
        });
        if (student)
          return {
            id: String(student.id),
            name: student.name,
            email: student.email,
            role: "student",
          };
        return null;
      },
    }),
    Credentials({
      id: "admin",
      name: "Admin",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) return null;
        const pwdHash = await hashPassword(credentials.password as string);
        const admin = await prisma.admin.findFirst({
          where: {
            username: (credentials.username as string).trim(),
            passwordHash: pwdHash,
          },
        });
        if (admin)
          return {
            id: String(admin.id),
            name: admin.name,
            email: admin.username,
            role: "admin",
          };
        return null;
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as { role?: string }).role = token.role as string;
        (session.user as { id?: string }).id = token.id as string;
      }
      return session;
    },
  },
  pages: {
    signIn: "/",
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60,
  },
  secret: process.env.NEXTAUTH_SECRET,
});

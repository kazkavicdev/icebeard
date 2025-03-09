import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import NextAuth from "next-auth/next";
import { prisma } from "@/lib/prisma";

declare module "next-auth" {
  interface User {
    id: string;
    username: string;
    email: string;
  }
  
  interface Session {
    user: User
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    username: string;
    email: string;
  }
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Missing credentials");
        }

        try {
          const user = await prisma.user.findUnique({
            where: {
              email: credentials.email
            }
          });

          if (!user) {
            throw new Error("No user found");
          }

          const passwordMatch = await bcrypt.compare(credentials.password, user.password);

          if (!passwordMatch) {
            throw new Error("Invalid password");
          }

          return {
            id: user.id,
            email: user.email,
            username: user.username
          };
        } catch (error) {
          console.error("Auth error:", error);
          return null;
        }
      }
    })
  ],
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  pages: {
    signIn: "/",
    error: "/",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.username = user.username;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id;
        session.user.email = token.email;
        session.user.username = token.username;
      }
      return session;
    }
  },
  debug: process.env.NODE_ENV === "development",
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST }; 
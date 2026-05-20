import type { NextAuthConfig } from "next-auth";

export const authConfig = {
  pages: {
    signIn: "/login",
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isOnAdmin = nextUrl.pathname.startsWith("/admin");
      const isOnProfile = nextUrl.pathname.startsWith("/profile");
      const isOnCheckout = nextUrl.pathname.startsWith("/checkout");

      if (isOnAdmin) {
        if (isLoggedIn) {
          // Verify user role is ADMIN
          return auth.user?.role === "ADMIN";
        }
        return false; // Redirect to login
      }

      if (isOnProfile || isOnCheckout) {
        if (isLoggedIn) return true;
        return false; // Redirect to login
      }

      return true;
    },
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.role = token.role as string;
        session.user.id = token.id as string;
      }
      return session;
    },
  },
  providers: [], // Providers are populated inside auth.ts to keep this config edge-compatible
} satisfies NextAuthConfig;

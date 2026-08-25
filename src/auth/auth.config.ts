import type { NextAuthConfig } from "next-auth";

export const authConfig = {
  pages: {
    signIn: '/login',
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      
      // Protected routes
      const isOnDashboard = nextUrl.pathname.startsWith('/dashboard') || 
                            nextUrl.pathname.startsWith('/clients') || 
                            nextUrl.pathname.startsWith('/projects') || 
                            nextUrl.pathname.startsWith('/invoices');
                            
      // Auth routes
      const isOnAuthRoutes = nextUrl.pathname.startsWith('/login') || 
                             nextUrl.pathname.startsWith('/register');

      if (isOnDashboard) {
        if (isLoggedIn) return true;
        return false; // Redirect unauthenticated users to login page
      } else if (isLoggedIn && isOnAuthRoutes) {
        return Response.redirect(new URL('/dashboard', nextUrl));
      }
      
      return true;
    },
  },
  providers: [], // Add providers with an empty array for edge compatibility
} satisfies NextAuthConfig;

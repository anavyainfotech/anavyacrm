import NextAuth from 'next-auth';
import { authConfig } from '@/auth/auth.config';

export default NextAuth(authConfig).auth;

export const config = {
  // Protect all routes except static assets, API, and the root/marketing page
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|$).*)'],
};

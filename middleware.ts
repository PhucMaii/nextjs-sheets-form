export { default } from 'next-auth/middleware';

export const config = {
  matcher: ['/create-form', '/delivery', '/form/:path*'],
};

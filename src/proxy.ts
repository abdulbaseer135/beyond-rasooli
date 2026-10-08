import { NextResponse, type NextRequest } from 'next/server';
import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/config';

const localeMiddleware = createMiddleware(routing);
export default function proxy(req: NextRequest) {
  if (req.nextUrl.pathname === "/") return NextResponse.next();
  return localeMiddleware(req);
}

export const config = {
  // Match all pathnames except for
  // - … if they start with `/api`, `/_next` or `/_vercel`
  // - … the ones containing a dot (e.g. `favicon.ico`)
  // - … `/admin` routes reserved for Payload CMS
  matcher: ['/((?!api|_next|_vercel|admin|.*\\..*).*)'],
};

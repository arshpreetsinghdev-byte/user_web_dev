import { NextRequest, NextResponse } from 'next/server';
import { i18nConfig } from './config/i18n.config';

export default async function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  if (
    pathname.startsWith('/service-unavailable') ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  // try {
  //   const { runInitTasks } = await import('./lib/init/initTasks');
  //   const initResult = await runInitTasks();

  //   // If service is not available, redirect to error page
  //   if (!initResult.serviceAvailable) {
  //     console.error('Service unavailable:', initResult.error);
  //     return NextResponse.redirect(new URL('/service-unavailable', request.url));
  //   }

  //   // Store Google Maps key in header for server component access
  //   if (initResult.googleMapsKey) {
  //     const response = handleLocale(request);
  //     response.headers.set('x-google-maps-key', initResult.googleMapsKey);
  //     return response;
  //   }

  // } catch (error) {
  //   console.error('Init tasks failed:', error);
  //   return NextResponse.redirect(new URL('/service-unavailable', request.url));
  // }

  // Default: continue with locale handling
  return handleLocale(request);
}

function handleLocale(request: NextRequest, response?: NextResponse) {
  const pathname = request.nextUrl.pathname;

  // 1. If path is exactly a locale (e.g. /en) or locale with slash (/en/), redirect to /[locale]/home
  const exactLocale = i18nConfig.locales.find(
    (locale) => pathname === `/${locale}` || pathname === `/${locale}/`
  );
  if (exactLocale) {
    return NextResponse.redirect(new URL(`/${exactLocale}/home`, request.url));
  }

  // 2. If path is root (/), redirect to /defaultLocale/home
  if (pathname === '/') {
    return NextResponse.redirect(
      new URL(`/${i18nConfig.defaultLocale}/home`, request.url)
    );
  }

  // 3. Check if any supported locale is missing in the pathname prefix
  const pathnameIsMissingLocale = i18nConfig.locales.every(
    (locale) => !pathname.startsWith(`/${locale}/`)
  );

  if (pathnameIsMissingLocale) {
    const locale = i18nConfig.defaultLocale;
    return NextResponse.redirect(
      new URL(`/${locale}${pathname}`, request.url)
    );
  }

  return response || NextResponse.next();
}

export const config = {
  // Matcher ignoring `/_next/` and `/api/`
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)'],
};

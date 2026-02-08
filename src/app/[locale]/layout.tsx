import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import '../globals.css';
import { i18nConfig } from '@/config/i18n.config';
import { siteConfig } from '@/config/site.config';
import { TranslationsProvider } from '@/lib/i18n/TranslationsProvider';
import enTranslations from '../../../public/locales/en.json';
import esTranslations from '../../../public/locales/es.json';
import frTranslations from '../../../public/locales/fr.json';
import hiTranslations from '../../../public/locales/hi.json';
import Navbar from '@/components/navbar/navbar';
import { GoogleMapsLoader } from '@/components/shared/GoogleMapsLoader';
import { ThemeProvider } from '@/components/shared/ThemeProvider';
import { Toaster } from '@/components/ui/sonner';
import HippoProvider from '@/components/providers/HippoProvider';
import { runInitTasks } from '@/lib/init/initTasks';
import { redirect } from 'next/navigation';
import ClientSessionHydrator from '@/components/shared/ClientSessionHydrator';
import BookingNavigationGuard from '@/components/BookingNavigationGuard';
import QueryProvider from '@/components/providers/QueryProvider';
import { PageLoadingSpinner } from '@/components/shared/PageLoadingSpinner';
import { OperatorParamsProvider } from '@/components/shared/OperatorParamsProvider';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

const inter = Inter({ subsets: ['latin'] });

export async function generateStaticParams() {
  return i18nConfig.locales.map((locale) => ({ locale }));
}

export const dynamicParams = false;

export const metadata: Metadata = {
  title: siteConfig.name,
  description: siteConfig.description,
  keywords: siteConfig.seo.keywords.toString(),
  authors: [{ name: siteConfig.seo.author }],
};

const translationsMap = {
  en: enTranslations,
  es: esTranslations,
  fr: frTranslations,
  hi: hiTranslations,
};

export default async function RootLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const initResult = await runInitTasks();
  if (!initResult.serviceAvailable) {
    redirect("/service-unavailable")
  }
  const translations = translationsMap[locale as keyof typeof translationsMap] || enTranslations;

  return (
    <html lang={locale} suppressHydrationWarning>
      <body className={inter.className} suppressHydrationWarning>
        <ThemeProvider>
          <HippoProvider />
          <BookingNavigationGuard />
          <ClientSessionHydrator session={initResult.sessionDetails} />
          <GoogleMapsLoader apiKey={(initResult.googleMapsKey || '')} />
          <PageLoadingSpinner />
          <OperatorParamsProvider operatorParams={initResult.operatorParams}>
            <TranslationsProvider translations={translations}>
              <QueryProvider>
                <div className='min-h-screen flex flex-col'>
                  <Navbar />
                  <main className="flex-1">
                    {children}
                  </main>
                </div>
              </QueryProvider>
            </TranslationsProvider>
          </OperatorParamsProvider>
          <Toaster position="bottom-right" richColors />
        </ThemeProvider>
      </body>
    </html>
  );
}

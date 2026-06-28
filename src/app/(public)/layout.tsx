import { PageViewTracker } from "@/components/analytics/PageViewTracker";
import { BackgroundLayer } from "@/components/layout/BackgroundLayer";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { CMSProvider } from "@/components/providers/CMSProvider";
import { getCMSContent, getPublicSiteConfig } from "@/lib/cms/get-content";

export default async function PublicLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [content, config] = await Promise.all([
    getCMSContent(),
    getPublicSiteConfig(),
  ]);

  return (
    <CMSProvider config={config} content={content}>
      <PageViewTracker />
      <BackgroundLayer />
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-xl focus:border focus:border-white/20 focus:bg-[#0f1a17] focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-white focus:shadow-lg focus:outline-none focus:ring-2 focus:ring-[#a3c9a8]"
      >
        Skip to content
      </a>
      <Header />
      <main id="main-content" className="relative min-w-0 flex-1">
        {children}
      </main>
      <Footer />
    </CMSProvider>
  );
}

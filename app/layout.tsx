import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";
import { LanguageProvider } from "@/contexts/LanguageContext";
import FloatingContact from "@/components/FloatingContact";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "e-Vizza - Your Visa Journey Simplified",
  description: "Apply for eVisas online in minutes with our fast and secure platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" dir="ltr" suppressHydrationWarning>
      <body className={`${inter.className} max-w-full overflow-x-hidden`}>
        <Script id="init-language-dir" strategy="beforeInteractive">
          {`(function () { try { var lang = localStorage.getItem('app_lang') || localStorage.getItem('lang') || localStorage.getItem('language') || 'fr'; document.documentElement.lang = lang; document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr'; } catch (e) {} })();`}
        </Script>
        <div className="max-w-full overflow-hidden">
          <LanguageProvider>
            <AuthProvider>
              {children}
              <FloatingContact />
            </AuthProvider>
          </LanguageProvider>
        </div>
      </body>
    </html>
  );
}

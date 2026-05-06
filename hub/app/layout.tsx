import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "./contexts/AuthContext";
import { NotificationProvider } from "./contexts/NotificationContext";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Script from "next/script";
import { Toaster } from "react-hot-toast";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Bugema Hub - University Platform",
  description: "Your gateway to campus life at Bugema University",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col pt-16 lg:pt-28 pb-20 md:pb-0">
        <div id="google_translate_element" style={{ display: "none" }}></div>
        <Script
          src="//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit"
          strategy="afterInteractive"
        />
        <Script id="google-translate-init" strategy="afterInteractive">
          {`
            window.googleTranslateElementInit = function() {
              new window.google.translate.TranslateElement({
                pageLanguage: 'en',
                autoDisplay: false
              }, 'google_translate_element');
            }
          `}
        </Script>
        <Script id="google-translate-cleanup" strategy="afterInteractive">
          {`
            if (typeof window !== 'undefined') {
              const observer = new MutationObserver((mutations) => {
                const banner = document.querySelector('.goog-te-banner-frame');
                if (banner) {
                  banner.style.display = 'none';
                  banner.style.visibility = 'hidden';
                }
                const skiptranslate = document.querySelector('.skiptranslate > iframe.skiptranslate');
                if (skiptranslate) {
                  skiptranslate.style.display = 'none';
                  skiptranslate.style.visibility = 'hidden';
                }
                if (document.body && document.body.style.top !== '0px') {
                  document.body.style.setProperty('top', '0px', 'important');
                }
              });
              observer.observe(document.documentElement, { childList: true, subtree: true, attributes: true, attributeFilter: ['style'] });
            }
          `}
        </Script>
        <AuthProvider>
          <NotificationProvider>
            <Toaster position="top-center" />
            <Navbar />
            <main className="flex-1">{children}</main>
            <Footer />
          </NotificationProvider>
        </AuthProvider>
      </body>
    </html>
  );
}

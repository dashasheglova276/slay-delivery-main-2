import type { Metadata, Viewport } from "next";
import { Manrope } from "next/font/google";
import "./globals.css";
import ServiceWorkerRegister from "@/components/service-worker-register";
import StoreHydration from "@/components/store-hydration";
import ToastContainer from "@/components/toast-container";

const manrope = Manrope({
  subsets: ["latin", "cyrillic"],
  variable: "--font-display",
  weight: ["500", "600", "700", "800"]
});

export const metadata: Metadata = {
  title: {
    default: "StarFood — доставка продуктов",
    template: "%s — StarFood"
  },
  description:
    "StarFood — свежие продукты и готовая еда с доставкой на дом.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "StarFood"
  },
  openGraph: {
    title: "StarFood — доставка продуктов",
    description: "Свежие продукты с доставкой на дом. Быстро, удобно, выгодно.",
    type: "website",
    locale: "ru_RU",
    siteName: "StarFood"
  },
  icons: {
    icon: "/icons/icon-192.png",
    apple: "/icons/icon-192.png"
  }
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
  themeColor: "#ffffff"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru" className={manrope.variable}>
      <body className="font-display antialiased min-h-screen text-ink">
        <ServiceWorkerRegister />
        <StoreHydration />
        <ToastContainer />
        {children}
      </body>
    </html>
  );
}

import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { SessionProvider } from "@/components/session-provider";
import { PWARegister } from "@/components/pwa-register";
import { PWAInstallBanner } from "@/components/pwa-install-banner";
import { LanguageProvider } from "@/lib/i18n/context";
import { LangSyncer } from "@/components/lang-syncer";
import { auth } from "@/lib/auth";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "GymQuest - Seu Fitness Gamificado",
  description:
    "Transforme seus objetivos fitness em missões épicas. Treino, alimentação e progresso gamificados.",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "GymQuest",
  },
  formatDetection: { telephone: false },
};

export const viewport: Viewport = {
  themeColor: "#10b981",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  return (
    <html lang="pt-BR" className="dark h-full">
      <body
        className={`${inter.className} min-h-full bg-gray-950 text-gray-100 antialiased`}
      >
        <SessionProvider session={session}>
          <LanguageProvider>
            <LangSyncer />
            {children}
            <Toaster richColors position="top-right" />
            <PWARegister />
            <PWAInstallBanner />
          </LanguageProvider>
        </SessionProvider>
      </body>
    </html>
  );
}

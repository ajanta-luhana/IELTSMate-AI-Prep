import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://ielts-mate-ai-prep.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  openGraph: { type: "website", siteName: "IELTSMate", title: "IELTSMate: your free AI IELTS coach" },
  twitter: { card: "summary_large_image" },
  title: { default: "IELTSMate — Your free AI IELTS coach", template: "%s · IELTSMate" },
  description: "Practice with your personal AI IELTS coach, improve your weak areas, and build confidence before exam day.",
};

export const viewport: Viewport = { width: "device-width", initialScale: 1 };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="min-h-screen font-sans">{children}</body>
    </html>
  );
}

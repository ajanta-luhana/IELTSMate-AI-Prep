import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
  metadataBase: new URL("https://ielts-mate-ai-prep.vercel.app"),
  title: { default: "IELTSMate — Your free AI IELTS coach", template: "%s · IELTSMate" },
  description: "Practice with your personal AI IELTS coach, improve your weak areas, and build confidence before exam day.",
  openGraph: {
    title: "IELTSMate: AI-Powered IELTS Preparation",
    description: "Practice with your personal AI IELTS coach, improve your weak areas, and build confidence before exam day.",
    url: "https://ielts-mate-ai-prep.vercel.app",
    siteName: "IELTSMate",
    type: "website",
    images: [{ url: "/og.jpeg", width: 1200, height: 630, alt: "IELTSMate" }],
  },
};

export const viewport: Viewport = { width: "device-width", initialScale: 1 };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="min-h-screen font-sans">{children}</body>
    </html>
  );
}
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});



export const metadata: Metadata = {
  metadataBase: new URL("https://bdsm-test-pink.vercel.app"),
  title: "BDSM 성향 테스트",
  description: "합의 기반 성향 가이드 및 테스트",

  openGraph: {
    title: "BDSM 성향 테스트",
    description: "합의 기반 성향 가이드 및 테스트",
    url: "https://bdsm-test-pink.vercel.app",
    siteName: "BDSM 성향 테스트",
    type: "website",
    locale: "ko_KR",
    images: [
      {
        url: "/og.png",
        width: 1200,
        height: 630,
        alt: "BDSM 성향 테스트",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    title: "BDSM 성향 테스트",
    description: "합의 기반 성향 가이드 및 테스트",
    images: ["/og.png"],
  },

  alternates: {
    canonical: "https://bdsm-test-pink.vercel.app",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
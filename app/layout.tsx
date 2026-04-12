import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Cuppa — Find & Hire Baristas",
    template: "%s | Cuppa",
  },
  description:
    "The lowest-fee barista hiring platform in Australia. Post a shift, find vetted baristas, and pay just 7% — baristas keep 100% of their rate.",
  keywords: ["barista", "hire", "cafe", "coffee", "shift", "casual work", "hospitality"],
  openGraph: {
    title: "Cuppa — Find & Hire Baristas",
    description: "Australia's lowest-fee barista hiring platform. Post shifts, book vetted baristas.",
    type: "website",
  },
  robots: "index, follow",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} h-full`}>
      <body className="min-h-full flex flex-col bg-background text-foreground antialiased">
        {children}
      </body>
    </html>
  );
}

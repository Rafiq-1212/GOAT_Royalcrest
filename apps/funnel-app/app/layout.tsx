import type { Metadata, Viewport } from "next";
import { Geist } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const viewport: Viewport = {
  themeColor: "#060913",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export const metadata: Metadata = {
  metadataBase: new URL("https://goatassets.ae"),
  title: "Start Invest in Dubai | Goat Assets - High-Yield Dubai Real Estate & Wealth Management",
  description:
    "Capitalize on 0% tax, world-leading rental yields, and luxury off-market properties in Dubai with Goat Assets. Exclusive portfolios curated for elite investors.",
  keywords: [
    "Start Invest in Dubai",
    "Invest in Dubai",
    "Goat Assets",
    "Dubai Real Estate",
    "Dubai Property Investment",
    "Golden Visa UAE",
    "High Yield Dubai Assets",
  ],
  openGraph: {
    title: "Start Invest in Dubai with Goat Assets",
    description:
      "Access high-yield, tax-free property investments and off-market luxury developments in Dubai.",
    images: ["/dubai.jpg"],
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={geistSans.variable}>
      <body>{children}</body>
    </html>
  );
}

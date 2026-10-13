import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Goat Assets Dubai | Admin Portal",
  description: "Executive investor portal and lead management for Goat Assets Dubai Real Estate.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}

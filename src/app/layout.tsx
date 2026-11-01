import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ECO POINT - UPJ Campus Waste Management",
  description: "Platform bank sampah kampus dengan sistem poin dan merchandise",
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
    <html lang="id">
      <body className="min-h-screen bg-offwhite">{children}</body>
    </html>
  );
}

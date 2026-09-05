import type { Metadata } from "next";
import "./globals.css";
import { siteConfig } from "@/config/site";
import { fontHeading, fontSans } from "@/config/fonts";
import { Toaster } from "@/components/Toaster";

export const metadata: Metadata = {
  title: `${siteConfig.name} — Intelligent, Self-Governing Sales Operations Platform`,
  description: siteConfig.description,
  icons: {
    icon: "/dealorbit-logo.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${fontSans.variable} ${fontHeading.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        {children}
        <Toaster />
      </body>
    </html>
  );
}

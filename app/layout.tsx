import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "CartGuard AI — Store Fortification & AI Sentinel",
  description: "Next-generation security monitoring, threat correlation, and response platform for e-commerce and shopping agents.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-background text-foreground antialiased">
        {children}
      </body>
    </html>
  );
}

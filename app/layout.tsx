import type { Metadata } from "next";
import ClientProviders from "@/components/providers/ClientProviders";
import "./globals.css";

export const metadata: Metadata = {
  title: "SaganFG — Tax Workflow Platform",
  description:
    "End-to-end tax workflow platform for Sagan Financial Group. Manage intake, workpapers, prep, and delivery in one place.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased">
        <ClientProviders>{children}</ClientProviders>
      </body>
    </html>
  );
}

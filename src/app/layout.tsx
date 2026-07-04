import type { Metadata } from "next";
import { Fraunces, IBM_Plex_Sans } from "next/font/google";
import { AppShell } from "@/src/components/layout/AppShell";
import { QueryProvider } from "@/src/providers/query-provider";
import { SearchProvider } from "@/src/providers/search-provider";
import "./globals.css";

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

const ibmPlexSans = IBM_Plex_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-body",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Quill",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${fraunces.variable} ${ibmPlexSans.variable} antialiased`}>
        <QueryProvider>
          <SearchProvider>
            <AppShell>{children}</AppShell>
          </SearchProvider>
        </QueryProvider>
      </body>
    </html>
  );
}

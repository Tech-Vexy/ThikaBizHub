import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { NotificationProvider } from "@/components/ui/NotificationSystem";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "ThikaBizHub - Your Local Business Directory",
  description: "Connecting you with local businesses in Thika, Kenya. Discover deals, share experiences, and find verified businesses near you.",
  keywords: "Thika, Kenya, business directory, local businesses, deals, discounts",
  authors: [{ name: "ThikaBizHub Team" }],
  manifest: "/manifest.json",
  openGraph: {
    title: "ThikaBizHub - Your Local Business Directory",
    description: "Connecting you with local businesses in Thika, Kenya",
    type: "website",
    locale: "en_US",
  },
  themeColor: "#9333ea",
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 5,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className={`${inter.className} antialiased bg-gray-50`}>
        <NotificationProvider>
          <Header />
          <main className="min-h-screen">
            {children}
          </main>
          <Footer />
        </NotificationProvider>
      </body>
    </html>
  );
}

import type { Metadata } from "next";
import { Geist } from "next/font/google";
import { AppFooter } from "@/components/AppFooter";
import "./globals.css";

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Amanah Admin",
  description: "Admin panel for managing corporates and members",
  icons: {
    icon: "/logo-amanaha.png",
    apple: "/logo-amanaha.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geist.variable} h-full antialiased`}>
      <body className="min-h-screen bg-background pb-12 font-sans text-foreground">
        {children}
        <AppFooter />
      </body>
    </html>
  );
}

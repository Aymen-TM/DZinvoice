import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import ForceLightMode from "@/components/ForceLightMode";
import SettingsProvider from "@/components/SettingsProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ERP - DZ Invoice",
  description: "Application de génération de factures professionnelles",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        style={{ background: '#fff' }}
      >
        <SettingsProvider>
          <ForceLightMode />
          <Navbar />
          {children}
        </SettingsProvider>
      </body>
    </html>
  );
}

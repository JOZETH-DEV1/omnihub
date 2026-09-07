import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import WaterBackground from "@/components/WaterBackground";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Omnihub - Explore the Deep",
  description: "A premium community platform for sharing and discovering.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} bg-[#010A15] text-white antialiased min-h-screen selection:bg-cyan-500/30 selection:text-cyan-50`}>
        <WaterBackground />
        <main className="relative z-10 flex min-h-screen flex-col">
          {children}
        </main>
      </body>
    </html>
  );
}

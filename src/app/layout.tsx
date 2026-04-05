import type { Metadata } from "next";
import { Inter, Source_Sans_3 } from "next/font/google";
import "./globals.css";

const sans = Inter({
  subsets: ["latin"],
  variable: "--font-gf-sans",
});

const mono = Source_Sans_3({
  subsets: ["latin"],
  variable: "--font-gf-mono",
});

export const metadata: Metadata = {
  title: "Parking Rotation System",
  description: "Fair parking slot rotation and optimization system",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${mono.variable} ${sans.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <div className="min-h-screen bg-zinc-100">{children}</div>
      </body>
    </html>
  );
}

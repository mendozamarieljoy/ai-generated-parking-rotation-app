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
        <footer className="w-full bg-zinc-100 px-6 pb-4">
          <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 text-center sm:flex-row sm:text-left">
            <p className="text-sm text-zinc-500">
              Created by{" "}
              <span className="font-medium text-zinc-800">
                Mariel Joy Mendoza
              </span>
            </p>

            <div className="flex items-center gap-2 text-xs text-zinc-400">
              <span className="h-1 w-1 rounded-full bg-zinc-300" />
              <span>Assisted with AI</span>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}

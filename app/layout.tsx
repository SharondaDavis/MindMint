import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "MindMint",
  description: "Turn your photos into a kaleidoscopic mind-movie",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}

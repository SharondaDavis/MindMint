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
      <head>
        <meta name="base:app_id" content="69400b49d19763ca26ddc309" />
      </head>
      <body className="antialiased">{children}</body>
    </html>
  );
}

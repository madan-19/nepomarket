import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Nepomarket — What Nepal Really Thinks",
  description: "Real-time polls and sentiment analysis for Nepal. Track politics, cricket, development and more.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
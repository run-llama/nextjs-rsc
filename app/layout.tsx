import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AI } from "./rsc/ai";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Create Llama App",
  description: "Generated by create-llama",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AI>{children}</AI>
      </body>
    </html>
  );
}

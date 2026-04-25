import type { Metadata } from "next";
import { Figtree } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";

const figtree = Figtree({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
  weight: ["300", "400", "500", "600", "700", "800", "900"],
});

export const metadata: Metadata = {
  title: "Programming Hero | Assignment & Learning Analytics Platform",
  description:
    "Programming Hero is a production-grade assignment and learning analytics platform for instructors and students.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={cn("h-full antialiased", figtree.className)}
      suppressHydrationWarning
    >
      <body className="min-h-screen flex flex-col">{children}</body>
    </html>
  );
}

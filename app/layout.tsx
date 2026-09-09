import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Suspense } from "react";

import { PostHogPageView } from "@/components/analytics/PostHogPageView";

import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "Job Hunt",
  description:
    "Job Hunt finds fitting roles, researches companies, and helps technical job seekers apply with confidence.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        <Suspense fallback={null}>
          <PostHogPageView />
        </Suspense>
        {children}
      </body>
    </html>
  );
}

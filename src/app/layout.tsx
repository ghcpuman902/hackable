import type { Metadata } from "next";
import "./globals.css";
import SiteFooter from "@/components/SiteFooter";

export const metadata: Metadata = {
  title: "Hackable",
  openGraph: { title: "Hackable" },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en-GB">
      <body>{children}<SiteFooter /></body>
    </html>
  );
}

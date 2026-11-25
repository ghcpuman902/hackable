import type { Metadata } from "next";
import "./globals.css";
import SiteFooter from "@/components/SiteFooter";

export const metadata: Metadata = {
  metadataBase: new URL("https://mangle-hackable.vercel.app"),
  title: {
    default: "Hackable",
    template: "%s | Hackable",
  },
  description: "A personal exposure check for public traces and scam patterns.",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    url: "/",
    siteName: "Hackable",
    title: "Hackable",
    description: "A personal exposure check for public traces and scam patterns.",
    images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: "Hackable" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Hackable",
    description: "A personal exposure check for public traces and scam patterns.",
    images: ["/opengraph-image"],
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en-GB">
      <body>{children}<SiteFooter /></body>
    </html>
  );
}

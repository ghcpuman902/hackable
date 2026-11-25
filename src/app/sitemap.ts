import type { MetadataRoute } from "next";

const baseUrl = "https://mangle-hackable.vercel.app";
const lastModified = new Date("2026-11-25T00:00:00.000Z");

export default function sitemap(): MetadataRoute.Sitemap {
  return ["", "/how-it-works", "/patterns", "/privacy"].map((path) => ({
    url: `${baseUrl}${path}`,
    lastModified,
  }));
}

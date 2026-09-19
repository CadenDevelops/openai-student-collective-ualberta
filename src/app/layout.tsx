import type { Metadata, Viewport } from "next";
import "./globals.css";
import { siteUrl } from "@/content/collective";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  twitter: { card: "summary_large_image" },
  title: "OpenAI Student Collective | University of Alberta",
  description: "Explore AI with us. OpenAI’s student program at the University of Alberta. Workshops, studio sessions, and student projects with ChatGPT and Codex.",
  openGraph: {
    title: "OpenAI Student Collective at UAlberta",
    description: "Explore AI with us. OpenAI’s student program at UAlberta, led by Caden Johnson and Michael Seguin.",
    url: siteUrl,
    type: "website",
    locale: "en_CA",
  },
  icons: { icon: "/collective-mark.png" },
};

export const viewport: Viewport = { themeColor: "#08090f", colorScheme: "dark" };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}

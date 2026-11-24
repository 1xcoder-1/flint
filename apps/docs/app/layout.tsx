import type { Metadata, Viewport } from "next";
import Link from "next/link";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import "./globals.css";

const DESCRIPTION =
  "Twenty-three ready-made, dependency-free grain effects for React. Reduced-motion aware and SSR friendly.";

export const metadata: Metadata = {
  title: {
    default: "Flint — text effects for React",
    template: "%s — Flint",
  },
  description: DESCRIPTION,
  keywords: [
    "React text animation",
    "text effects React",
    "typewriter React",
    "text reveal",
    "scramble text",
    "odometer ticker",
    "neon text",
    "kinetic typography",
    "dependency-free React components",
  ],
  applicationName: "react-flint",
  authors: [{ name: "Flint", url: "https://github.com/1xcoder-1/swash" }],
  creator: "Flint",
  openGraph: {
    title: "Flint — text effects for React",
    description: DESCRIPTION,
    type: "website",
    siteName: "Flint",
    locale: "en_US",
    url: "https://github.com/1xcoder-1/swash",
  },
  twitter: {
    card: "summary_large_image",
    title: "Flint — text effects for React",
    description: DESCRIPTION,
    creator: "@1xcoder",
  },
  category: "developer tools",
  alternates: { canonical: "/" },
};

export const viewport: Viewport = {
  themeColor: "#08090a",
  colorScheme: "dark",
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  name: "react-flint",
  description: DESCRIPTION,
  codeRepository: "https://github.com/1xcoder-1/swash",
  programmingLanguage: "TypeScript",
  runtimePlatform: "React",
  license: "https://github.com/1xcoder-1/swash/blob/main/LICENSE",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <div className="banner">
          <span className="pill">New</span>
          <Link href="/docs/quickstart">
            Flint v0.1.0 is out — twenty-three effects, zero dependencies →
          </Link>
        </div>
        <div className="sheet-page">
          <div className="sheet">
            <Header />
            <main>{children}</main>
            <Footer />
          </div>
        </div>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </body>
    </html>
  );
}

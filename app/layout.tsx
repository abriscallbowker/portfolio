import type {Metadata} from "next";
import {Geist_Mono, Gochi_Hand, Inter} from "next/font/google";
import {CustomCursor} from "@/components/custom-cursor";
import {GreetingRevealProvider} from "@/components/greeting-reveal";
import {MotionProvider} from "@/components/motion-provider";
import {ViewportGlass} from "@/components/viewport-glass";
import {SanityLive} from "@/sanity/lib/live";
import {site} from "@/lib/site";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const gochiHand = Gochi_Hand({
  variable: "--font-gochi",
  subsets: ["latin"],
  weight: "400",
});

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: site.name,
    template: `%s | ${site.name}`,
  },
  description: site.description,
  icons: {
    icon: {url: site.favicon, type: "image/png"},
    apple: site.favicon,
  },
  openGraph: {
    title: site.name,
    description: site.description,
    url: site.url,
    siteName: site.name,
    type: "website",
    images: [site.ogImage],
  },
  twitter: {
    card: "summary_large_image",
    title: site.name,
    description: site.description,
    images: [site.ogImage],
  },
};

export default function RootLayout({children}: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${geistMono.variable} ${gochiHand.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-background text-ink">
        <MotionProvider>
          <GreetingRevealProvider>
            <CustomCursor />
            <ViewportGlass />
            {children}
          </GreetingRevealProvider>
        </MotionProvider>
        <SanityLive />
      </body>
    </html>
  );
}

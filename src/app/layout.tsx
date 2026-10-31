import type { Metadata } from "next";
import localFont from "next/font/local";
import Script from "next/script";
import { Suspense } from "react";

import { CookieBanner } from "@/components/sites/vibebevvy-com-5acc75fc/shared/CookieBanner";
import { PageTransition } from "@/components/sites/vibebevvy-com-5acc75fc/shared/PageTransition";
import { VibeLoader } from "@/components/sites/vibebevvy-com-5acc75fc/shared/VibeLoader";

import "./globals.css";
import "./vibe.css";

const henrietta = localFont({
  src: [
    { path: "../fonts/vibe/henrietta-regular.woff2", weight: "400", style: "normal" },
    { path: "../fonts/vibe/henrietta-semibold.woff2", weight: "600", style: "normal" },
  ],
  variable: "--font-vibe-display",
  display: "swap",
});

const spaceMono = localFont({
  src: [{ path: "../fonts/vibe/space-mono-regular.woff2", weight: "400", style: "normal" }],
  variable: "--font-vibe-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Gimme Drinks",
  description:
    "Zero-sugar drinks made with real fruit, each with a job to do. Energy, focus, calm, sleep and glow. Whatever you need, there’s a gimme for that.",
};

/* vibebevvy.com: decide() runs in <head> before first paint so the lavender
   loader cover is on from the very first frame (once per session). */
const LOADER_DECIDE =
  "(function(){function decide(){try{if(sessionStorage.getItem('vibe-pt')==='1'){sessionStorage.setItem('vibe-loader-seen','1');document.documentElement.classList.add('vibe-pt-covered');return;}if(!sessionStorage.getItem('vibe-loader-seen')&&!window.matchMedia('(prefers-reduced-motion: reduce)').matches){document.documentElement.classList.add('vibe-loading');}}catch(e){}}if(document.prerendering){document.addEventListener('prerenderingchange',decide,{once:true});}else{decide();}})();";

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${henrietta.variable} ${spaceMono.variable}`} suppressHydrationWarning>
      <body className="page-width-narrow" suppressHydrationWarning>
        <Script id="vibe-loader-decide" strategy="beforeInteractive">
          {LOADER_DECIDE}
        </Script>
        {children}
        <VibeLoader />
        {/* reads the pathname; the boundary keeps unlisted catch-all paths prerenderable */}
        <Suspense fallback={null}>
          <PageTransition />
        </Suspense>
        <CookieBanner />
      </body>
    </html>
  );
}

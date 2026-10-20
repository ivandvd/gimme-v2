import type { CSSProperties } from "react";

import { cn } from "@/lib/utils";

/** Cleaned "gimme" wordmark (cream on transparent), 1767×599 source, 720px copy for the header. */
export const BRAND_LOGO_SRC = "/sites/vibebevvy-com-5acc75fc/shared/brand/gimme-logo.png";
export const BRAND_LOGO_SRC_SMALL = "/sites/vibebevvy-com-5acc75fc/shared/brand/gimme-logo-720.png";
export const BRAND_LOGO_ASPECT = 1767 / 599;

/**
 * The wordmark rendered as a CSS mask filled with `currentColor`, so it behaves
 * exactly like the original inline-SVG wordmark: cream over the transparent
 * header, lavender once the bar is stuck or hovered (see `.brand-logo` in vibe.css).
 */
export function BrandLogo({
  className,
  style,
  "aria-hidden": hidden,
}: {
  className?: string;
  style?: CSSProperties;
  "aria-hidden"?: boolean;
}) {
  return (
    <span
      className={cn("brand-logo", className)}
      role={hidden ? undefined : "img"}
      aria-label={hidden ? undefined : "gimme"}
      aria-hidden={hidden || undefined}
      style={style}
    />
  );
}

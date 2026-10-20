import type { CSSProperties, ElementType, ReactNode } from "react";

import { cn } from "@/lib/utils";

interface RevealOnScrollProps {
  children: ReactNode;
  as?: ElementType;
  className?: string;
  /** seconds, maps to `--vibe-reveal-delay` */
  delay?: number;
}

/**
 * vibebevvy.com `[data-vibe-reveal]` mask-slide: the inner block starts at
 * translateY(110%) rotate(5deg) and settles over 0.6s once the global
 * <VibeEntrances> runner marks the element `is-in` (12% past the fold).
 */
export function RevealOnScroll({ children, as: Tag = "div", className, delay = 0 }: RevealOnScrollProps) {
  return (
    <Tag
      data-vibe-reveal=""
      className={cn(className)}
      style={delay ? ({ "--vibe-reveal-delay": `${delay}s` } as CSSProperties) : undefined}
    >
      <span className="vibe-reveal__inner">{children}</span>
    </Tag>
  );
}

import Link from "next/link";
import { Fragment, type ElementType, type ReactNode } from "react";

import { cn } from "@/lib/utils";

interface PillButtonProps {
  href?: string;
  onClick?: () => void;
  children: ReactNode;
  className?: string;
  showArrow?: boolean;
}

function Arrow({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 22 14" fill="none" aria-hidden="true">
      <path d="M1 7h18M14 1l6 6-6 6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/**
 * vibebevvy.com blob button (`.vibe-hero__cta` / `.button` skin + `.vibe-btnm`):
 * the hand-drawn yellow oval (`vibe-button-bg.svg`) stretched 100%/100% behind
 * a 15px uppercase underlined label; on hover the label fades and a tilted
 * 8-copy marquee of the label slides inside the blob clip path.
 */
export function PillButton({ href, onClick, children, className, showArrow = true }: PillButtonProps) {
  const Tag: ElementType = href ? Link : "button";
  return (
    <Tag {...(href ? { href } : { type: "button" })} className={cn("vibe-btn vibe-btnm", className)} onClick={onClick}>
      <span>{children}</span>
      {showArrow && <Arrow className="vibe-btn__arrow" />}
      <div className="vibe-btnm__marquee" aria-hidden="true">
        <div className="vibe-btnm__rot">
          <div className="vibe-btnm__inner">
            {Array.from({ length: 8 }, (_, i) => (
              <Fragment key={i}>
                <span>{children}</span>
                {showArrow && <Arrow />}
              </Fragment>
            ))}
          </div>
        </div>
      </div>
    </Tag>
  );
}

import type { CSSProperties, ReactNode } from "react";

/**
 * Renders the live `[data-vibe-title]` split: every word becomes a
 * `.vibe-title-word` inline-block and every character a `.vibe-title-char`
 * with an incrementing `--char-i` (0.03s stagger in CSS). Words are separated
 * by real spaces so the line wraps exactly like the un-split text.
 */
export function SplitTitle({ text, offset = 0 }: { text: string; offset?: number }): ReactNode {
  let i = offset;
  const parts = text.trim().split(/(\s+)/);
  return (
    <span aria-hidden="true">
      {parts.map((part, pi) => {
        if (!part) return null;
        if (/^\s+$/.test(part)) return " ";
        return (
          <span key={pi} className="vibe-title-word">
            {part.split("").map((ch, ci) => {
              const idx = i++;
              return (
                <span key={ci} className="vibe-title-char" style={{ "--char-i": idx } as CSSProperties}>
                  {ch}
                </span>
              );
            })}
          </span>
        );
      })}
    </span>
  );
}

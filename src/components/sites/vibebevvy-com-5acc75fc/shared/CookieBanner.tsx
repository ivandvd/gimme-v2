"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { PillButton } from "@/components/sites/vibebevvy-com-5acc75fc/shared/PillButton";

const KEY = "gimme-cookie-consent";

/**
 * Cookie notice in the site's own system: a cream card with a plum hairline,
 * mono copy, the blob button to accept and a plain link to decline. The
 * choice is kept in localStorage; nothing beyond the site's own essentials
 * runs until it is "accepted". House rule: no "can" in copy.
 */
export function CookieBanner() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    let stored: string | null = null;
    try {
      stored = localStorage.getItem(KEY);
    } catch {
      /* storage unavailable: show the notice every visit */
    }
    if (stored) return;
    const id = window.setTimeout(() => setOpen(true), 900);
    return () => window.clearTimeout(id);
  }, []);

  const choose = (value: "accepted" | "declined") => {
    try {
      localStorage.setItem(KEY, value);
    } catch {
      /* storage unavailable */
    }
    setOpen(false);
  };

  if (!open) return null;

  return (
    <div className="vibe-cookie" role="region" aria-label="Cookie notice">
      <p className="vibe-cookie__text">
        We use a few cookies to keep the site working and remember your choices. Analytics only run if you say yes.{" "}
        <Link href="/privacy-policy" className="vibe-cookie__link">
          Privacy policy
        </Link>
      </p>
      <div className="vibe-cookie__actions">
        <PillButton onClick={() => choose("accepted")} showArrow={false}>
          Accept
        </PillButton>
        <button type="button" className="vibe-cookie__decline" onClick={() => choose("declined")}>
          No thanks
        </button>
      </div>
    </div>
  );
}

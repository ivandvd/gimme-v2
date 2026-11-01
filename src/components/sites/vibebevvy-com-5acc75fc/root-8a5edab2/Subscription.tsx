"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef } from "react";

import { PillButton } from "@/components/sites/vibebevvy-com-5acc75fc/shared/PillButton";
import { RevealOnScroll } from "@/components/sites/vibebevvy-com-5acc75fc/shared/RevealOnScroll";
import { useVibeParallax } from "@/components/sites/vibebevvy-com-5acc75fc/shared/useVibeParallax";

/* His fridge shot (a hand reaching for Focus on a shelf of the lineup),
   through the house grade. The 2026-10-31 version is landscape, so the box
   shows its middle: Calm, Focus in hand, Sleep. */
const PHOTO = "/sites/vibebevvy-com-5acc75fc/shared/photos/gimme-subscription-fridge-grade.webp";

/* After the "Get Cann on tap" reference: a soft panel with the pitch, the
   blob button and the perks, beside the photo. Words are his ("stay stocked
   up", "refresh my fridge") plus the perks list he sent. House rules: no
   "can", no fixed count of drinks. */
const HEADING = "Stay stocked up.";
const LEAD_A = "Subscribe and save 20% on every delivery. Pick your drinks, pick how often, and your fridge refills itself.";
const LEAD_B = "Already subscribed?";
const SIGN_IN = { label: "Sign in", href: "/account/login" };
const BUTTON = { label: "Refresh my fridge", href: "/pages/subscribe" };
const PERKS_TITLE = "Subscriber perks";
/* his five, plus "early access" (mine) to make an even six */
const PERKS = [
  "20% off all deliveries",
  "Free shipping on all orders",
  "Pause, skip, cancel anytime",
  "Easily swap and add items",
  "Early access to new flavors",
  "Free gifts*",
];

function CheckIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="m3 8.5 3.2 3.2L13 5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/**
 * Subscription block under the packs: one bordered, rounded card (the
 * accordion's box) split into a soft lilac panel (eyebrow, heading with the
 * letter pop, lead, blob button, then the perks under a hairline) and a
 * photo with the drift-and-zoom scroll effect. Every target is a coming-soon
 * page for now.
 */
export function Subscription() {
  const mediaRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  useVibeParallax(mediaRef, imageRef);

  return (
    <section className="vibe-sub" id="subscribe" aria-label={HEADING}>
      <div className="vibe-sub__card">
        <div className="vibe-sub__panel">
          <RevealOnScroll as="p" className="vibe-sub__eyebrow">
            Subscription
          </RevealOnScroll>
          <RevealOnScroll as="h2" className="vibe-sub__heading">
            {HEADING}
          </RevealOnScroll>
          <RevealOnScroll as="p" className="vibe-sub__lead" delay={0.2}>
            {LEAD_A} {LEAD_B}{" "}
            <Link href={SIGN_IN.href} className="vibe-sub__signin">
              {SIGN_IN.label}
            </Link>
            .
          </RevealOnScroll>
          <div className="vibe-sub__cta" data-vibe-pop="">
            <PillButton href={BUTTON.href}>{BUTTON.label}</PillButton>
          </div>

          <RevealOnScroll as="div" className="vibe-sub__perks" delay={0.35}>
            <p className="vibe-sub__perks-title">{PERKS_TITLE}</p>
            <ul className="vibe-sub__list">
              {PERKS.map((perk) => (
                <li key={perk} className="vibe-sub__perk">
                  <CheckIcon />
                  <span>{perk}</span>
                </li>
              ))}
            </ul>
          </RevealOnScroll>
        </div>

        <div ref={mediaRef} className="vibe-sub__media">
          <Image ref={imageRef} src={PHOTO} width={1413} height={1113} sizes="(min-width: 990px) 52vw, 100vw" alt="" />
        </div>
      </div>
    </section>
  );
}

export default Subscription;

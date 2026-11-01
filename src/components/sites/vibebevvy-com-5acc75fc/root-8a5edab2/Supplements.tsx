"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

import { PillButton } from "@/components/sites/vibebevvy-com-5acc75fc/shared/PillButton";
import { RevealOnScroll } from "@/components/sites/vibebevvy-com-5acc75fc/shared/RevealOnScroll";
import { SUPPLEMENTS } from "@/components/sites/vibebevvy-com-5acc75fc/shared/supplements";
import type { VibeSupplement } from "@/components/sites/vibebevvy-com-5acc75fc/shared/types";

const SUBSCRIBE_OFF = 0.2;
const HEADING = "Some jobs need a softgel.";
/* the Urinary Health jar says "Helps prevent recurrent UTIs†", so the footnote
   that dagger points to has to be on the page */
const NOTE =
  "†These statements have not been evaluated by the Food and Drug Administration. This product is not intended to diagnose, treat, cure or prevent any disease.";
const IMAGE_SIZES = "(min-width: 990px) 31vw, (min-width: 750px) 560px, 100vw";

const money = (value: number) => `$${value.toFixed(2)}`;

/* The pack card without the size switch: one size, 60 softgels. House rule:
   the word "can" never appears in copy. */
function SupplementCard({ supplement }: { supplement: VibeSupplement }) {
  const [quantity, setQuantity] = useState(1);
  const [subscribe, setSubscribe] = useState(true);
  const [status, setStatus] = useState<"idle" | "adding" | "added">("idle");
  const timer = useRef(0);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  const unit = subscribe ? Math.round(supplement.unitPrice * (1 - SUBSCRIBE_OFF) * 100) / 100 : supplement.unitPrice;
  const total = unit * quantity;

  const add = () => {
    /* there is no cart yet: a short working state, then the notice, then reset */
    window.clearTimeout(timer.current);
    setStatus("adding");
    timer.current = window.setTimeout(() => {
      setStatus("added");
      timer.current = window.setTimeout(() => setStatus("idle"), 1800);
    }, 500);
  };

  return (
    <article className="vibe-packs__card">
      <div className="vibe-packs__media">
        <Image src={supplement.primaryImage} alt={supplement.name} fill sizes={IMAGE_SIZES} quality={85} />
        {/* the open jar with its ingredient, over the cut-out on hover; where
            there is no hover it shows from the start */}
        <Image className="vibe-packs__scene" src={supplement.hoverImage} alt={supplement.sceneAlt} fill sizes={IMAGE_SIZES} quality={85} />
      </div>

      <div className="vibe-packs__body" data-vibe-reveal="">
        <span className="vibe-reveal__inner">
          <h3 className="vibe-packs__name">{supplement.shortName}</h3>
          <p className="vibe-packs__contents">{supplement.flavorSubtitle}</p>
        </span>
      </div>

      <div className="vibe-packs__controls">
        <div className="vibe-packs__stepper" role="group" aria-label="Quantity">
          <button type="button" onClick={() => setQuantity((q) => Math.max(1, q - 1))} aria-label="Fewer" disabled={quantity === 1}>
            −
          </button>
          <output aria-live="polite">{quantity}</output>
          <button type="button" onClick={() => setQuantity((q) => Math.min(12, q + 1))} aria-label="More" disabled={quantity === 12}>
            +
          </button>
        </div>
      </div>

      <fieldset className="vibe-packs__plan">
        <legend className="sr-only">Purchase plan</legend>
        <label>
          <input type="radio" name={`${supplement.slug}-plan`} checked={!subscribe} onChange={() => setSubscribe(false)} />
          <span className="vibe-packs__radio" aria-hidden="true" />
          One-time
        </label>
        <label>
          <input type="radio" name={`${supplement.slug}-plan`} checked={subscribe} onChange={() => setSubscribe(true)} />
          <span className="vibe-packs__radio" aria-hidden="true" />
          Subscribe &amp; save 20%
        </label>
      </fieldset>

      <div className="vibe-packs__price">
        <span className="vibe-packs__now">{money(total)}</span>
        {subscribe ? <s className="vibe-packs__was">{money(supplement.unitPrice * quantity)}</s> : null}
        <span className="vibe-packs__each">{supplement.count * quantity} softgels</span>
      </div>

      <button
        type="button"
        className={`vibe-packs__add${status === "added" ? " is-added" : ""}${status === "adding" ? " is-adding" : ""}`}
        onClick={add}
        disabled={status !== "idle"}
        aria-live="polite"
      >
        {status === "idle" ? "Add to cart" : status === "adding" ? "Adding…" : "Coming soon"}
      </button>
    </article>
  );
}

/**
 * The three softgels, right after the variety packs and in their clothes:
 * the same eyebrow, display heading, bordered rounded media boxes and
 * controls, with the three cards across the whole row (the packs take two
 * of its thirds). The box shows the jar cut-out on the cream; the open-jar
 * scene fades in over it on hover, like the drinks' on-ice shots. The note
 * under the cards is the supplement footnote, then the blob button.
 */
export function Supplements() {
  return (
    <section className="vibe-packs vibe-packs--supplements" id="supplements">
      <div className="vibe-packs__head">
        <RevealOnScroll as="p" className="vibe-packs__eyebrow">
          Supplements
        </RevealOnScroll>
        <RevealOnScroll as="h2" className="vibe-packs__heading">
          {HEADING}
        </RevealOnScroll>
      </div>

      <div className="vibe-packs__grid">
        {SUPPLEMENTS.map((supplement) => (
          <SupplementCard key={supplement.slug} supplement={supplement} />
        ))}
      </div>

      <RevealOnScroll as="p" className="vibe-packs__note">
        {NOTE}
      </RevealOnScroll>
      <div className="vibe-packs__cta" data-vibe-pop="">
        <PillButton href="/collections/supplements">Shop all supplements</PillButton>
      </div>
    </section>
  );
}

export default Supplements;

"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

import { DEFAULT_MIX, PACKS, separately, type Pack } from "@/components/sites/vibebevvy-com-5acc75fc/shared/packs";
import { PillButton } from "@/components/sites/vibebevvy-com-5acc75fc/shared/PillButton";
import { PRODUCTS } from "@/components/sites/vibebevvy-com-5acc75fc/shared/products";
import { RevealOnScroll } from "@/components/sites/vibebevvy-com-5acc75fc/shared/RevealOnScroll";

const SUBSCRIBE_OFF = 0.2;
const HEADING = "Why pick one? Get them all.";
const IMAGE_SIZES = "(min-width: 1200px) 24vw, (min-width: 750px) 47vw, 100vw";

const money = (value: number) => `$${value.toFixed(2)}`;
/* "Gimme Energy" is "Energy" in the picker, where the section already says gimme */
const short = (name: string) => name.replace(/^Gimme /, "");
/* the balanced mix for a size: 3/3/2/2/2 per dozen */
const mixFor = (count: number) => DEFAULT_MIX.map((n) => (n * count) / 12);

function PackCard({ pack }: { pack: Pack }) {
  const picks = pack.kind === "mix";
  const [sizeIndex, setSizeIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [subscribe, setSubscribe] = useState(true);
  const [status, setStatus] = useState<"idle" | "adding" | "added">("idle");
  const [mix, setMix] = useState(() => (picks ? mixFor(pack.sizes[0].count) : []));
  /* the picker opens over the card, so the row of cards keeps its shape */
  const [mixOpen, setMixOpen] = useState(false);
  const [option, setOption] = useState(0);
  const timer = useRef(0);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => () => window.clearTimeout(timer.current), []);
  useEffect(() => {
    if (mixOpen) panelRef.current?.focus();
  }, [mixOpen]);

  const size = pack.sizes[sizeIndex];
  const chosen = mix.reduce((sum, n) => sum + n, 0);
  const missing = picks ? size.count - chosen : 0;
  const unit = subscribe ? Math.round(size.price * (1 - SUBSCRIBE_OFF) * 100) / 100 : size.price;
  const total = unit * quantity;
  /* a set says what it saves against its contents bought one by one */
  const saving = picks ? 0 : separately(size) - size.price;
  const current = pack.options?.[option];
  const image = current?.image ?? pack.image;
  const hoverImage = current ? current.hoverImage : pack.hoverImage;
  const alt = current?.alt ?? pack.alt;

  const chooseSize = (index: number) => {
    setSizeIndex(index);
    if (picks) setMix(mixFor(pack.sizes[index].count));
  };
  const bump = (i: number, by: 1 | -1) => setMix((m) => m.map((n, j) => (j === i ? n + by : n)));

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
        {pack.badge ? <span className="vibe-packs__badge">{pack.badge}</span> : null}
        <Image key={image} src={image} alt={alt} fill sizes={IMAGE_SIZES} quality={85} />
        {hoverImage ? (
          /* the box from the side, over the front view while the pointer is on it */
          <Image className="vibe-packs__scene" src={hoverImage} alt="" fill sizes={IMAGE_SIZES} quality={85} />
        ) : null}
      </div>

      <div className="vibe-packs__body" data-vibe-reveal="">
        <span className="vibe-reveal__inner">
          <h3 className="vibe-packs__name">{pack.name}</h3>
          <p className="vibe-packs__contents">{pack.contents}</p>
        </span>
      </div>
      <p className="vibe-packs__blurb">{pack.blurb}</p>

      <div className="vibe-packs__controls">
        {pack.sizes.length > 1 ? (
          /* two sizes per pack, so a pill switch instead of a native dropdown */
          <fieldset className="vibe-packs__sizes">
            <legend className="sr-only">Pack size</legend>
            {pack.sizes.map((s, index) => (
              <label key={s.label} className={index === sizeIndex ? "is-active" : undefined}>
                <input type="radio" name={`${pack.id}-size`} checked={index === sizeIndex} onChange={() => chooseSize(index)} />
                {s.label}
              </label>
            ))}
          </fieldset>
        ) : null}

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

      {pack.options ? (
        /* which pair goes in the box; the picture follows */
        <fieldset className="vibe-packs__sizes vibe-packs__options">
          <legend className="sr-only">{pack.optionsLabel ?? "Choice"}</legend>
          {pack.options.map((o, index) => (
            <label key={o.key} className={index === option ? "is-active" : undefined}>
              <input type="radio" name={`${pack.id}-option`} checked={index === option} onChange={() => setOption(index)} />
              {o.label}
            </label>
          ))}
        </fieldset>
      ) : null}

      {picks ? (
        /* the mix at a glance: each drink with its count, and the way into the picker */
        <div className="vibe-packs__chips">
          {PRODUCTS.map((drink, i) => (
            <span key={drink.slug} className="vibe-packs__chip" title={`${mix[i]} ${short(drink.name)}`}>
              <Image src={drink.primaryImage} alt="" width={14} height={32} />
              <span>{mix[i]}</span>
            </span>
          ))}
          <button type="button" className="vibe-packs__mix-toggle" onClick={() => setMixOpen(true)} aria-expanded={mixOpen}>
            Change
          </button>
        </div>
      ) : null}

      <fieldset className="vibe-packs__plan">
        <legend className="sr-only">Purchase plan</legend>
        <label>
          <input type="radio" name={`${pack.id}-plan`} checked={!subscribe} onChange={() => setSubscribe(false)} />
          <span className="vibe-packs__radio" aria-hidden="true" />
          One-time
        </label>
        <label>
          <input type="radio" name={`${pack.id}-plan`} checked={subscribe} onChange={() => setSubscribe(true)} />
          <span className="vibe-packs__radio" aria-hidden="true" />
          Subscribe &amp; save 20%
        </label>
      </fieldset>

      <div className="vibe-packs__price">
        <span className="vibe-packs__now">{money(total)}</span>
        {subscribe ? <s className="vibe-packs__was">{money(size.price * quantity)}</s> : null}
        <span className="vibe-packs__each">
          {saving > 0.005 ? `Save ${money(saving * quantity)} vs separately` : `${money(unit / size.count)} each`}
        </span>
      </div>

      <button
        type="button"
        className={`vibe-packs__add${status === "added" ? " is-added" : ""}${status === "adding" ? " is-adding" : ""}`}
        onClick={missing > 0 ? () => setMixOpen(true) : add}
        disabled={status !== "idle"}
        aria-live="polite"
      >
        {missing > 0 ? "Finish your mix" : status === "idle" ? "Add to cart" : status === "adding" ? "Adding…" : "Coming soon"}
      </button>

      {picks && mixOpen ? (
        /* the picker, over the card's lower half */
        <div
          ref={panelRef}
          className="vibe-packs__mix"
          role="group"
          aria-label="Your mix"
          tabIndex={-1}
          onKeyDown={(event) => {
            if (event.key === "Escape") setMixOpen(false);
          }}
        >
          <div className="vibe-packs__mix-head">
            <span>Your mix</span>
            <output aria-live="polite">
              {chosen} / {size.count}
            </output>
          </div>
          {PRODUCTS.map((drink, i) => (
            <div key={drink.slug} className="vibe-packs__mix-row">
              <Image src={drink.primaryImage} alt="" width={22} height={51} />
              <span className="vibe-packs__mix-name">{short(drink.name)}</span>
              <div className="vibe-packs__stepper vibe-packs__stepper--small" role="group" aria-label={short(drink.name)}>
                <button type="button" onClick={() => bump(i, -1)} aria-label={`Fewer ${short(drink.name)}`} disabled={mix[i] === 0}>
                  −
                </button>
                <output>{mix[i]}</output>
                <button type="button" onClick={() => bump(i, 1)} aria-label={`More ${short(drink.name)}`} disabled={missing === 0}>
                  +
                </button>
              </div>
            </div>
          ))}
          <button type="button" className="vibe-packs__mix-done" onClick={() => setMixOpen(false)} disabled={missing > 0}>
            {missing > 0 ? `Pick ${missing} more` : "Done"}
          </button>
        </div>
      ) : null}
    </article>
  );
}

/**
 * The packs, in the slot vibebevvy.com uses for the scroll-scrubbed spinning
 * can: one to try (the starter), one to live on (the lineup, pick your own
 * mix), a set with the softgels in (the glow set) and the softgels in pairs
 * (the duo). Same section rhythm as the rest of the page: 150/1440vw of top
 * padding, a mono eyebrow, the display heading with the scroll wipe, four
 * bordered, rounded media boxes (the accordion's box) with their price and
 * button pinned to the same line, then a plan note and the blob button.
 */
export function VarietyPacks() {
  return (
    <section className="vibe-packs" id="packs">
      <div className="vibe-packs__head">
        <RevealOnScroll as="p" className="vibe-packs__eyebrow">
          Variety packs
        </RevealOnScroll>
        <RevealOnScroll as="h2" className="vibe-packs__heading">
          {HEADING}
        </RevealOnScroll>
      </div>

      <div className="vibe-packs__grid">
        {PACKS.map((pack) => (
          <PackCard key={pack.id} pack={pack} />
        ))}
      </div>

      <RevealOnScroll as="p" className="vibe-packs__note">
        Subscribe and save 20%. Ships every 4 weeks. Pause, skip or cancel anytime.
      </RevealOnScroll>
      <div className="vibe-packs__cta" data-vibe-pop="">
        <PillButton href="/collections/packs">Shop all packs</PillButton>
      </div>
    </section>
  );
}

export default VarietyPacks;

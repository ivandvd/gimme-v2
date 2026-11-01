"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

import { DEFAULT_MIX, PACKS, separately, type Pack } from "@/components/sites/vibebevvy-com-5acc75fc/shared/packs";
import { PillButton } from "@/components/sites/vibebevvy-com-5acc75fc/shared/PillButton";
import { PRODUCTS } from "@/components/sites/vibebevvy-com-5acc75fc/shared/products";
import { RevealOnScroll } from "@/components/sites/vibebevvy-com-5acc75fc/shared/RevealOnScroll";
import { SUPPLEMENTS } from "@/components/sites/vibebevvy-com-5acc75fc/shared/supplements";

const SUBSCRIBE_OFF = 0.2;
const HEADING = "Why pick one? Get them all.";
const IMAGE_SIZES = "(min-width: 990px) 31vw, (min-width: 750px) 560px, 100vw";

const money = (value: number) => `$${value.toFixed(2)}`;
/* "Gimme Energy" is "Energy" in the picker, where the section already says gimme */
const short = (name: string) => name.replace(/^Gimme /, "");
/* the balanced mix for a size: 3/3/2/2/2 per dozen */
const mixFor = (count: number) => DEFAULT_MIX.map((n) => (n * count) / 12);

function PackCard({ pack }: { pack: Pack }) {
  const picks = pack.kind !== "starter";
  const [sizeIndex, setSizeIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [subscribe, setSubscribe] = useState(true);
  const [status, setStatus] = useState<"idle" | "adding" | "added">("idle");
  const [mix, setMix] = useState(() => (picks ? mixFor(pack.sizes[0].count) : []));
  /* the lineup shows its picker from the start; the routine starts on the balanced mix */
  const [mixOpen, setMixOpen] = useState(pack.kind === "mix");
  const [softgel, setSoftgel] = useState(0);
  const timer = useRef(0);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  const size = pack.sizes[sizeIndex];
  const chosen = mix.reduce((sum, n) => sum + n, 0);
  const missing = picks ? size.count - chosen : 0;
  const unit = subscribe ? Math.round(size.price * (1 - SUBSCRIBE_OFF) * 100) / 100 : size.price;
  const total = unit * quantity;
  const perDrink = unit / size.count;
  const saving = pack.kind === "routine" ? separately(size) - size.price : 0;
  const jar = SUPPLEMENTS[softgel];
  const image = pack.images?.[jar.slug] ?? pack.image;
  const summary = mix
    .map((n, i) => (n ? `${n} ${short(PRODUCTS[i].name)}` : null))
    .filter(Boolean)
    .join(" · ");

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
        <Image src={image} alt={pack.alt} fill sizes={IMAGE_SIZES} quality={85} />
      </div>

      <div className="vibe-packs__body" data-vibe-reveal="">
        <span className="vibe-reveal__inner">
          <h3 className="vibe-packs__name">{pack.name}</h3>
          <p className="vibe-packs__contents">{pack.contents}</p>
        </span>
      </div>

      <div className="vibe-packs__controls">
        {pack.sizes.length > 1 ? (
          /* two sizes per pack, so a pill switch instead of a native dropdown */
          <fieldset className="vibe-packs__sizes">
            <legend className="sr-only">Pack size</legend>
            {pack.sizes.map((option, index) => (
              <label key={option.label} className={index === sizeIndex ? "is-active" : undefined}>
                <input type="radio" name={`${pack.id}-size`} checked={index === sizeIndex} onChange={() => chooseSize(index)} />
                {option.label}
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

      {pack.kind === "routine" ? (
        /* which softgels go in; the picture follows */
        <fieldset className="vibe-packs__sizes vibe-packs__softgel">
          <legend className="sr-only">Softgels</legend>
          {SUPPLEMENTS.map((s, index) => (
            <label key={s.slug} className={index === softgel ? "is-active" : undefined}>
              <input type="radio" name={`${pack.id}-softgel`} checked={index === softgel} onChange={() => setSoftgel(index)} />
              {s.shortName}
            </label>
          ))}
        </fieldset>
      ) : null}

      {picks ? (
        <div className="vibe-packs__mix">
          <div className="vibe-packs__mix-head">
            <span>Your mix</span>
            {mixOpen ? (
              <output aria-live="polite">
                {chosen} / {size.count}
              </output>
            ) : (
              <button type="button" className="vibe-packs__mix-toggle" onClick={() => setMixOpen(true)}>
                Change
              </button>
            )}
          </div>
          {!mixOpen ? <p className="vibe-packs__mix-summary">{summary}</p> : null}
          {mixOpen
            ? PRODUCTS.map((drink, i) => (
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
              ))
            : null}
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
          {saving > 0 ? `Save ${money(saving * quantity)} vs separately` : `${money(perDrink)} each`}
        </span>
      </div>

      <button
        type="button"
        className={`vibe-packs__add${status === "added" ? " is-added" : ""}${status === "adding" ? " is-adding" : ""}`}
        onClick={add}
        disabled={status !== "idle" || missing > 0}
        aria-live="polite"
      >
        {missing > 0 ? `Pick ${missing} more` : status === "idle" ? "Add to cart" : status === "adding" ? "Adding…" : "Coming soon"}
      </button>
    </article>
  );
}

/**
 * The packs, in the slot vibebevvy.com uses for the scroll-scrubbed spinning
 * can: one to try (the starter), one to live on (the lineup, pick your own
 * mix) and one with the softgels in (the routine). Same section rhythm as
 * the rest of the page: 150/1440vw of top padding, a mono eyebrow, the
 * display heading with the scroll wipe, three bordered, rounded media boxes
 * (the accordion's box), then a plan note and the blob button.
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

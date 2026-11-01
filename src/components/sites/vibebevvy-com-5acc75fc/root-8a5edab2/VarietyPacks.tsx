"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

import { defaultMix, PACKS, separately, type Pack } from "@/components/sites/vibebevvy-com-5acc75fc/shared/packs";
import { PillButton } from "@/components/sites/vibebevvy-com-5acc75fc/shared/PillButton";
import { PRODUCTS } from "@/components/sites/vibebevvy-com-5acc75fc/shared/products";
import { RevealOnScroll } from "@/components/sites/vibebevvy-com-5acc75fc/shared/RevealOnScroll";

const SUBSCRIBE_OFF = 0.2;
const HEADING = "Why pick one? Get them all.";
const IMAGE_SIZES = "(min-width: 990px) 31vw, (min-width: 750px) 560px, 100vw";
const MAX_QUANTITY = 12;

const money = (value: number) => `$${value.toFixed(2)}`;
/* "Gimme Energy" is "Energy" in the picker, where the section already says gimme */
const short = (name: string) => name.replace(/^Gimme /, "");
/* "Two of each" for ten, "Four of each" for twenty */
const EACH = ["", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten", "Eleven", "Twelve"];

/* the mix for a new total: the same proportions where they divide evenly
   (two boxes of your mix), otherwise the even split */
function rescale(mix: number[], from: number, to: number): number[] {
  const scaled = mix.map((n) => (n * to) / from);
  return scaled.every(Number.isInteger) ? scaled : defaultMix(to);
}

function PackCard({ pack }: { pack: Pack }) {
  const picks = pack.kind === "mix";
  const [quantity, setQuantity] = useState(1);
  const [subscribe, setSubscribe] = useState(true);
  const [status, setStatus] = useState<"idle" | "adding" | "added">("idle");
  const [mix, setMix] = useState(() => (picks ? defaultMix(pack.sizes[0].count) : []));
  /* the picker opens over the card, so the row of cards keeps its shape */
  const [mixOpen, setMixOpen] = useState(false);
  const [option, setOption] = useState(0);
  const timer = useRef(0);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => () => window.clearTimeout(timer.current), []);
  useEffect(() => {
    if (mixOpen) panelRef.current?.focus();
  }, [mixOpen]);

  const size = pack.sizes[0];
  /* a pick-your-own pack is mixed across the whole order: ten drinks a box */
  const total = size.count * quantity;
  const chosen = mix.reduce((sum, n) => sum + n, 0);
  const missing = picks ? total - chosen : 0;
  /* the line under the name says "two of each" until the mix is changed */
  const untouched = !picks || mix.every((n, i) => n === defaultMix(total)[i]);
  const unit = subscribe ? Math.round(size.price * (1 - SUBSCRIBE_OFF) * 100) / 100 : size.price;
  const price = unit * quantity;
  /* a set says what it saves against its contents bought one by one */
  const saving = picks ? 0 : separately(size) - size.price;
  const current = pack.options?.[option];
  const image = current?.image ?? pack.image;
  const hoverImage = current ? current.hoverImage : pack.hoverImage;
  const alt = current?.alt ?? pack.alt;
  const name = current?.name ?? pack.name;
  const blurb = current?.blurb ?? pack.blurb;
  const contents = !picks
    ? pack.contents
    : !untouched
      ? `Your mix of ${total}`
      : total % 5 === 0
        ? `${EACH[total / 5] ?? total / 5} of each, try all five`
        : pack.contents;

  const changeQuantity = (next: number) => {
    const q = Math.max(1, Math.min(MAX_QUANTITY, next));
    if (picks) setMix((m) => rescale(m, size.count * quantity, size.count * q));
    setQuantity(q);
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
          <h3 className="vibe-packs__name">{name}</h3>
          <p className="vibe-packs__contents">{contents}</p>
        </span>
      </div>
      <p className="vibe-packs__blurb">{blurb}</p>

      <div className="vibe-packs__controls">
        <div className="vibe-packs__stepper" role="group" aria-label="Quantity">
          <button type="button" onClick={() => changeQuantity(quantity - 1)} aria-label="Fewer" disabled={quantity === 1}>
            −
          </button>
          <output aria-live="polite">{quantity}</output>
          <button type="button" onClick={() => changeQuantity(quantity + 1)} aria-label="More" disabled={quantity === MAX_QUANTITY}>
            +
          </button>
        </div>
        {picks ? (
          /* how many drinks the order holds, and the way into the picker */
          <button type="button" className="vibe-packs__customize" onClick={() => setMixOpen(true)} aria-expanded={mixOpen}>
            Customize your {total} drinks
          </button>
        ) : null}
      </div>

      {pack.options ? (
        /* which set, or which pair, goes in the box; the picture and words follow */
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
        /* the mix at a glance: each drink with its count */
        <div className="vibe-packs__chips" aria-label="Your mix">
          {PRODUCTS.map((drink, i) => (
            <span key={drink.slug} className="vibe-packs__chip" title={`${mix[i]} ${short(drink.name)}`}>
              <Image src={drink.primaryImage} alt="" width={14} height={32} />
              <span>{mix[i]}</span>
            </span>
          ))}
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
        <span className="vibe-packs__now">{money(price)}</span>
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
              {chosen} / {total}
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
 * can: the starter (ten drinks a box, an even split or your own mix across
 * the order), a set with the softgels in (Glow, Cycle Care or Daily Care)
 * and the softgels in pairs (the duo). Same section rhythm as the rest of
 * the page: 150/1440vw of top padding, a mono eyebrow, the display heading
 * with the scroll wipe, three bordered, rounded media boxes (the accordion's
 * box) with their price and button pinned to the same line, then a plan
 * note and the blob button.
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

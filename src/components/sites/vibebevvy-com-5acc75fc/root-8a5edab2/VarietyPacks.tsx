"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

import { PillButton } from "@/components/sites/vibebevvy-com-5acc75fc/shared/PillButton";
import { RevealOnScroll } from "@/components/sites/vibebevvy-com-5acc75fc/shared/RevealOnScroll";

const PACKS_BASE = "/sites/vibebevvy-com-5acc75fc/shared/packs";
const SUBSCRIBE_OFF = 0.2;
const HEADING = "Why pick one? Get them all.";

interface PackSize {
  label: string;
  count: number;
  price: number;
}

interface Pack {
  id: string;
  name: string;
  contents: string;
  image: string;
  alt: string;
  sizes: PackSize[];
}

/* Prices are placeholders at about $2.40 a drink against the $2.49 single.
   House rule: the word "can" never appears in copy. */
const PACKS: Pack[] = [
  {
    id: "the-lineup",
    name: "The Lineup",
    contents: "One of each",
    image: `${PACKS_BASE}/the-lineup-g25.jpg`,
    alt: "The Lineup carton with one of each gimme drink visible through the window, and the Energy drink standing in front",
    sizes: [
      { label: "5-pack", count: 5, price: 11.99 },
      { label: "10-pack", count: 10, price: 22.99 },
    ],
  },
  {
    id: "day-and-night",
    name: "Day & Night",
    contents: "Two each of Energy, Focus, Calm and Sleep",
    image: `${PACKS_BASE}/day-and-night-g25.jpg`,
    alt: "Energy, Focus, Calm and Sleep drinks standing together on a periwinkle backdrop",
    sizes: [
      { label: "8-pack", count: 8, price: 18.99 },
      { label: "16-pack", count: 16, price: 35.99 },
    ],
  },
];

const money = (value: number) => `$${value.toFixed(2)}`;

function PackCard({ pack }: { pack: Pack }) {
  const [sizeIndex, setSizeIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [subscribe, setSubscribe] = useState(true);
  const [status, setStatus] = useState<"idle" | "adding" | "added">("idle");
  const timer = useRef(0);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  const size = pack.sizes[sizeIndex];
  const unit = subscribe ? Math.round(size.price * (1 - SUBSCRIBE_OFF) * 100) / 100 : size.price;
  const total = unit * quantity;
  const perDrink = unit / size.count;

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
        <Image src={pack.image} alt={pack.alt} fill sizes="(min-width: 990px) 31vw, (min-width: 750px) 560px, 100vw" />
      </div>

      <div className="vibe-packs__body" data-vibe-reveal="">
        <span className="vibe-reveal__inner">
          <h3 className="vibe-packs__name">{pack.name}</h3>
          <p className="vibe-packs__contents">{pack.contents}</p>
        </span>
      </div>

      <div className="vibe-packs__controls">
        {/* two sizes per pack, so a pill switch instead of a native dropdown */}
        <fieldset className="vibe-packs__sizes">
          <legend className="sr-only">Pack size</legend>
          {pack.sizes.map((option, index) => (
            <label key={option.label} className={index === sizeIndex ? "is-active" : undefined}>
              <input
                type="radio"
                name={`${pack.id}-size`}
                checked={index === sizeIndex}
                onChange={() => setSizeIndex(index)}
              />
              {option.label}
            </label>
          ))}
        </fieldset>

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
        <span className="vibe-packs__each">{money(perDrink)} each</span>
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
 * Variety packs, in the slot vibebevvy.com uses for the scroll-scrubbed
 * spinning can. Same section rhythm as the rest of the page: 150/1440vw of
 * top padding, a mono eyebrow, the display heading with the scroll wipe,
 * two bordered, rounded media boxes (the accordion's box), then a plan
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

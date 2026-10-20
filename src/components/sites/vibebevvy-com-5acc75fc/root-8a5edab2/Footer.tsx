"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

import type { VibeFooterColumn } from "@/components/sites/vibebevvy-com-5acc75fc/shared/types";

const ICONS_BASE = "/sites/vibebevvy-com-5acc75fc/root-8a5edab2/icons";

/* The seven drinks, then the pages. Product hrefs match the catalogue slugs,
   the collection and contact hrefs match the header, Reviews glides to the
   testimonial band like the live footer. Pages that do not exist yet are
   served by the coming-soon catch-all (src/app/[...slug]/page.tsx). */
const LINK_COLUMNS: VibeFooterColumn[] = [
  {
    links: [
      { label: "Gimme Energy", href: "/products/gimme-energy" },
      { label: "Gimme Focus", href: "/products/gimme-focus" },
      { label: "Gimme Probiotics", href: "/products/gimme-probiotics" },
      { label: "Gimme Calm", href: "/products/gimme-calm" },
    ],
  },
  {
    links: [
      { label: "Gimme Sleep", href: "/products/gimme-sleep" },
      { label: "Gimme Her", href: "/products/gimme-her" },
      { label: "Gimme Him", href: "/products/gimme-him" },
      { label: "Variety Packs", href: "/collections/packs" },
    ],
  },
  {
    links: [
      { label: "All Products", href: "/collections/shop-all" },
      { label: "Our Story", href: "/story" },
      { label: "Reviews", href: "/#reviews" },
      { label: "Contact", href: "/pages/contact" },
    ],
  },
];

/**
 * vibebevvy.com `footer.vibe-footer`: 150/1440vw of air, a plum hairline,
 * the signup block (heading, underlined email field with the hand-drawn
 * arrow, the brand mark) beside the link columns, a second hairline, the
 * huge centred lockup with the flower doodle perched on its full stop, then
 * the two mono lines. The ice-cube stamp is Vibe's doodle, kept at his request. There is no mailing list yet, so the form
 * answers "Coming soon." in the live theme's message slot.
 */
export function Footer() {
  const [note, setNote] = useState<string | null>(null);

  return (
    <footer className="vibe-footer">
      <div className="vibe-footer__divider" aria-hidden="true" />

      <div className="vibe-footer__row">
        <div className="vibe-footer__news">
          <p className="vibe-footer__news-heading">Join the gimme club.</p>
          <form
            className="vibe-footer__form"
            onSubmit={(event) => {
              event.preventDefault();
              setNote("Coming soon. The list opens with the first batch.");
            }}
          >
            <div className="vibe-footer__field">
              <input
                className="vibe-footer__input"
                type="email"
                name="email"
                placeholder="Email"
                aria-label="Email"
                autoComplete="email"
                required
              />
              <button type="submit" className="vibe-footer__submit" aria-label="Subscribe">
                <Image src={`${ICONS_BASE}/footer-arrow.svg`} width={29} height={18} alt="" aria-hidden="true" />
              </button>
            </div>
            {note ? (
              <p className="vibe-footer__form-msg" role="status">
                {note}
              </p>
            ) : null}
          </form>
          <div className="vibe-footer__stamp" aria-hidden="true">
            <Image className="vibe-footer__stamp-outer" src={`${ICONS_BASE}/footer-stamp.svg`} width={452} height={291} alt="" />
          </div>
        </div>

        <div className="vibe-footer__cols">
          {LINK_COLUMNS.map((column, index) => (
            <ul key={index} className="vibe-footer__list">
              {column.links.map((link) => (
                <li key={link.href}>
                  <Link href={link.href}>{link.label}</Link>
                </li>
              ))}
            </ul>
          ))}
        </div>
      </div>

      <div className="vibe-footer__divider" aria-hidden="true" />

      <div className="vibe-footer__lockup-zone">
        <p className="vibe-footer__lockup">
          {/* the flower is anchored to the end of the text, so it rides the full stop at every width */}
          <span className="vibe-footer__lockup-text">
            Sip happens
            <span className="vibe-footer__dot">
              .
              <Image
              className="vibe-footer__flower"
              src={`${ICONS_BASE}/footer-ornament.svg`}
              width={84}
              height={81}
              alt=""
                aria-hidden="true"
              />
            </span>
          </span>
        </p>
      </div>

      <p className="vibe-footer__legal">Made for every kind of day.</p>
      <p className="vibe-footer__copyright">Copyright &copy;2026. Gimme Drinks. All rights reserved</p>
    </footer>
  );
}

export default Footer;

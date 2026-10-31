"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import type { VibeFooterColumn } from "@/components/sites/vibebevvy-com-5acc75fc/shared/types";

const ICONS_BASE = "/sites/vibebevvy-com-5acc75fc/root-8a5edab2/icons";

/* The five drinks, then the collections and the pages. Product hrefs match the catalogue slugs,
   the collection and contact hrefs match the header, Reviews glides to the
   testimonial band like the live footer. Pages that do not exist yet are
   served by the coming-soon catch-all (src/app/[...slug]/page.tsx). */
const LINK_COLUMNS: VibeFooterColumn[] = [
  {
    links: [
      { label: "Gimme Energy", href: "/products/gimme-energy" },
      { label: "Gimme Focus", href: "/products/gimme-focus" },
      { label: "Gimme Calm", href: "/products/gimme-calm" },
      { label: "Gimme Sleep", href: "/products/gimme-sleep" },
    ],
  },
  {
    links: [
      { label: "Gimme Glow", href: "/products/gimme-glow" },
      { label: "Variety Packs", href: "/collections/packs" },
      { label: "Supplements", href: "/collections/supplements" },
      { label: "All Products", href: "/collections/shop-all" },
    ],
  },
  {
    links: [
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
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function Footer() {
  const router = useRouter();
  const [state, setState] = useState<"idle" | "error" | "sending">("idle");

  return (
    <footer className="vibe-footer">
      <div className="vibe-footer__divider" aria-hidden="true" />

      <div className="vibe-footer__row">
        <div className="vibe-footer__news">
          <p className="vibe-footer__news-heading">Join the gimme club.</p>
          <form
            className="vibe-footer__form"
            noValidate
            onSubmit={(event) => {
              event.preventDefault();
              if (state === "sending") return;
              const email = String(new FormData(event.currentTarget).get("email") ?? "").trim();
              if (!EMAIL.test(email)) {
                setState("error");
                return;
              }
              /* no mailing list yet: a short sending state, then the welcome page */
              setState("sending");
              window.setTimeout(() => router.push("/thank-you"), 700);
            }}
          >
            <div className={`vibe-footer__field${state === "error" ? " is-error" : ""}`}>
              <input
                className="vibe-footer__input"
                type="email"
                name="email"
                placeholder="Email"
                aria-label="Email"
                aria-invalid={state === "error"}
                aria-describedby="footer-email-msg"
                autoComplete="email"
                onChange={() => {
                  if (state === "error") setState("idle");
                }}
              />
              <button type="submit" className="vibe-footer__submit" aria-label="Subscribe" disabled={state === "sending"}>
                <Image src={`${ICONS_BASE}/footer-arrow.svg`} width={29} height={18} alt="" aria-hidden="true" />
              </button>
            </div>
            <p
              id="footer-email-msg"
              className={`vibe-footer__form-msg${state === "error" ? " vibe-footer__form-msg--error" : ""}`}
              role={state === "error" ? "alert" : "status"}
            >
              {state === "error" ? "Enter a valid email address." : state === "sending" ? "Sending…" : "\u00a0"}
            </p>
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
      <p className="vibe-footer__fine">
        <Link href="/privacy-policy">Privacy policy</Link>
        <span aria-hidden="true"> · </span>
        <Link href="/terms-and-conditions">Terms and conditions</Link>
      </p>
    </footer>
  );
}

export default Footer;

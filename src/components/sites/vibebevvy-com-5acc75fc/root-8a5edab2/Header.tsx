"use client";

import Link from "next/link";
import { useEffect, useRef, useState, type CSSProperties } from "react";

import { cn } from "@/lib/utils";
import { Marquee } from "@/components/sites/vibebevvy-com-5acc75fc/shared/Marquee";
import { BrandLogo } from "@/components/sites/vibebevvy-com-5acc75fc/shared/BrandLogo";
import { AccountPopover, CartDrawer, SearchModal, type HeaderPanel } from "@/components/sites/vibebevvy-com-5acc75fc/shared/HeaderOverlays";
import { MegaMenu } from "@/components/sites/vibebevvy-com-5acc75fc/root-8a5edab2/MegaMenu";
import type { VibeNavLink } from "@/components/sites/vibebevvy-com-5acc75fc/shared/types";

/* the "g" from the wordmark, in plum, between the ticker claims */
const ICON = "/sites/vibebevvy-com-5acc75fc/shared/brand/gimme-g-plum.png";

const PROMO_ITEMS = ["Zero Sugar", "Low Calorie", "Real Fruit", "Low Carb", "Lab Tested", "Deliciously Made"];

const NAV_LINKS: (VibeNavLink & { active?: boolean })[] = [
  { label: "Home", href: "/", active: true },
  { label: "Products", href: "/collections/shop-all" },
  { label: "Contact Us", href: "/pages/contact" },
];

/* live promo ticker vars (marquee-component.vibe-marquee inline style) */
const PROMO_VARS = {
  "--vibe-mq-bg": "#DB98F9",
  "--vibe-mq-fg": "#1F0229",
  "--vibe-mq-size": "13px",
  "--vibe-mq-inner-gap": "15px",
  "--vibe-mq-icon-size": "15px",
  "--vibe-mq-pad": "10px",
} as CSSProperties;

function SearchIcon() {
  return (
    <svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="none">
      <circle cx="9" cy="9" r="4.75" stroke="currentColor" strokeWidth="var(--icon-stroke-width)" />
      <path
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="var(--icon-stroke-width)"
        d="m12.5 12.5 3.25 3.25"
      />
    </svg>
  );
}

function AccountIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="15" height="17" viewBox="0 0 15 17" fill="none" aria-hidden="true">
      <path
        stroke="currentColor"
        strokeLinejoin="round"
        strokeWidth="var(--icon-stroke-width)"
        d="M10.375 3.813a3.063 3.063 0 1 1-6.125 0 3.063 3.063 0 0 1 6.125 0ZM7.313 9.5c-3.667 0-6.24 2.691-6.563 6.125h13.125C13.552 12.191 10.979 9.5 7.312 9.5Z"
      />
    </svg>
  );
}

function CartIcon() {
  return (
    <svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="none">
      <path
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="var(--icon-stroke-width)"
        d="M3.392 6.875h13.216v8.016c0 .567-.224 1.112-.624 1.513-.4.402-.941.627-1.506.627H5.522a2.13 2.13 0 0 1-1.506-.627 2.15 2.15 0 0 1-.624-1.513zM8.818 2.969h2.333c.618 0 1.211.247 1.649.686a2.35 2.35 0 0 1 .683 1.658v1.562H6.486V5.313c0-.622.246-1.218.683-1.658a2.33 2.33 0 0 1 1.65-.686"
      />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg aria-hidden="true" width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M3.75 3.75L10.25 10.25M10.25 3.75L3.75 10.25"
        stroke="currentColor"
        strokeWidth="var(--icon-stroke-width)"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/**
 * vibebevvy.com header group: the lavender promo ticker (in flow, z 17), the
 * sticky header section (top -1px, z 18) holding the absolutely positioned,
 * transparent header bar, and the 0-tall megamenu spacer that pushes
 * #MainContent down by the header height. Transparent at the top of the page
 * (cream text, cream wordmark); solid cream with lavender wordmark and plum
 * links once stuck (IntersectionObserver, threshold 1) or hovered (desktop).
 */
export function Header() {
  const headerRef = useRef<HTMLDivElement>(null);
  const marqueeRef = useRef<HTMLElement>(null);
  const [stuck, setStuck] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [panel, setPanel] = useState<HeaderPanel>(null);

  const triggers = useRef<Record<string, HTMLButtonElement | null>>({});
  const megaRef = useRef<HTMLDivElement>(null);
  const productsRef = useRef<HTMLAnchorElement>(null);
  const [megaOpen, setMegaOpen] = useState(false);
  const [megaTop, setMegaTop] = useState(0);
  const megaClose = useRef(0);
  const panelRef = useRef<HeaderPanel>(null);
  /* a cart, account or search panel takes over: the megamenu steps aside */
  const megaShown = megaOpen && panel === null;
  useEffect(() => {
    panelRef.current = panel;
  }, [panel]);

  /* vibebevvy.com's megamenu script: hover on the Products link opens the
     panel (only once the pointer has been off the link, so an arrival with
     the cursor parked there does not pop it), leaving the link or the panel
     closes it 160ms later, Escape, outside focus and scrolling close it.
     Fine pointers only. */
  useEffect(() => {
    const link = productsRef.current;
    const header = headerRef.current;
    if (!link || !header) return;
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;

    let armed = false;
    const armCheck = (event: MouseEvent) => {
      if (!link.contains(event.target as Node)) {
        armed = true;
        document.removeEventListener("mousemove", armCheck);
      }
    };
    const arm = () => {
      armed = true;
    };
    const open = () => {
      if (panelRef.current) return;
      window.clearTimeout(megaClose.current);
      setMegaTop(Math.round(header.getBoundingClientRect().bottom));
      setMegaOpen(true);
    };
    const close = () => {
      window.clearTimeout(megaClose.current);
      setMegaOpen(false);
    };
    const scheduleClose = () => {
      window.clearTimeout(megaClose.current);
      megaClose.current = window.setTimeout(close, 160);
    };
    const onEnter = () => {
      if (armed) open();
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") close();
    };
    const onFocusIn = (event: FocusEvent) => {
      const target = event.target as Node | null;
      if (target && target !== link && !megaRef.current?.contains(target)) close();
    };

    const hold = () => window.clearTimeout(megaClose.current);
    const panelEl = megaRef.current;

    document.addEventListener("mousemove", armCheck, { passive: true });
    link.addEventListener("mouseleave", arm, { once: true });
    link.addEventListener("mouseenter", onEnter);
    link.addEventListener("focus", open);
    link.addEventListener("mouseleave", scheduleClose);
    /* the whole bar is a safe zone on the way down to the panel */
    header.addEventListener("mouseenter", hold);
    header.addEventListener("mouseleave", scheduleClose);
    panelEl?.addEventListener("mouseenter", hold);
    panelEl?.addEventListener("mouseleave", scheduleClose);
    document.addEventListener("keydown", onKey);
    document.addEventListener("focusin", onFocusIn);
    window.addEventListener("scroll", close, { passive: true });
    return () => {
      document.removeEventListener("mousemove", armCheck);
      link.removeEventListener("mouseleave", arm);
      link.removeEventListener("mouseenter", onEnter);
      link.removeEventListener("focus", open);
      link.removeEventListener("mouseleave", scheduleClose);
      header.removeEventListener("mouseenter", hold);
      header.removeEventListener("mouseleave", scheduleClose);
      panelEl?.removeEventListener("mouseenter", hold);
      panelEl?.removeEventListener("mouseleave", scheduleClose);
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("focusin", onFocusIn);
      window.removeEventListener("scroll", close);
      window.clearTimeout(megaClose.current);
    };
  }, []);

  useEffect(() => {
    const docEl = document.documentElement;
    if (panel) {
      /* lock the page without a layout jump: the scrollbar width becomes html padding */
      docEl.style.setProperty("--vibe-scrollbar", `${window.innerWidth - docEl.clientWidth}px`);
    }
    docEl.classList.toggle("vibe-panel-open", panel !== null);
    docEl.classList.toggle("vibe-cart-open", panel === "cart");
    if (!panel) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      setPanel(null);
      triggers.current[panel]?.focus();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [panel]);

  useEffect(() => {
    const header = headerRef.current;
    const marquee = marqueeRef.current;
    if (!header) return;

    // header.js: sticky="always" → stickyState = fully visible ? inactive : active
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry) return;
        setStuck(entry.intersectionRatio < 1);
      },
      { threshold: 1 },
    );
    io.observe(header);

    // header.js: --header-height / --header-group-height on <body>
    const apply = () => {
      const h = header.getBoundingClientRect().height;
      const m = marquee ? marquee.getBoundingClientRect().height : 0;
      document.body.style.setProperty("--header-height", `${Math.round(h)}px`);
      document.body.style.setProperty("--header-group-height", `${Math.round(m + h)}px`);
    };
    apply();
    const ro = new ResizeObserver(apply);
    ro.observe(header);
    if (marquee) ro.observe(marquee);

    return () => {
      io.disconnect();
      ro.disconnect();
    };
  }, []);

  return (
    <>
      <section ref={marqueeRef} className="vibe-marquee-section">
        <Marquee speedFactor={25} gap={24} style={PROMO_VARS}>
          {PROMO_ITEMS.map((item) => (
            <span key={item} className="vibe-mq-item">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img className="vibe-mq-icon" src={ICON} width={15} height={15} alt="" aria-hidden="true" loading="lazy" />
              <span className="vibe-mq-label">{item}</span>
            </span>
          ))}
        </Marquee>
      </section>

      <header className="header-section">
        <div
          id="header-component"
          ref={headerRef}
          className={cn("header", menuOpen && "vibe-drawer-open", megaShown && "vibe-mega-open")}
          data-sticky-state={stuck ? "active" : "inactive"}
          data-transparent="not-sticky"
          data-sticky="always"
        >
          <div className="header__underlay header__underlay-closed" />
          <p className="sr-only">gimme</p>
          <div className="header__row header__row--top">
            <div className="header__columns">
              <div className="header__column header__column--left">
                <div className="header__drawer">
                  <button
                    type="button"
                    className="header__icon header__icon--menu header__icon--summary"
                    aria-label="Menu"
                    aria-haspopup="dialog"
                    aria-expanded={menuOpen}
                    onClick={() => setMenuOpen(true)}
                  >
                    <span className="header-drawer-icon vibe-menu-label">Menu</span>
                  </button>
                </div>
                <nav className="header-menu" aria-label="Primary">
                  <ul className="menu-list__list">
                    {NAV_LINKS.map((link) => (
                      <li key={link.href} className="menu-list__list-item">
                        <Link
                          ref={link.label === "Products" ? productsRef : undefined}
                          href={link.href}
                          className={cn("menu-list__link", link.active && "menu-list__link--active")}
                          aria-current={link.active ? "page" : undefined}
                          aria-haspopup={link.label === "Products" ? "true" : undefined}
                          aria-expanded={link.label === "Products" ? megaShown : undefined}
                        >
                          <span className="menu-list__link-title">{link.label}</span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </nav>
              </div>

              <div className="header__column header__column--center">
                <Link href="/" className="header-logo">
                  <span className="header-logo__image-container header-logo__image-container--original">
                    <span className="header-logo__vibe-wordmark">
                      <BrandLogo />
                    </span>
                  </span>
                </Link>
              </div>

              <div className="header__column header__column--right">
                <div className="search-action">
                  <button
                    type="button"
                    className="header-actions__action"
                    ref={(el) => {
                      triggers.current.search = el;
                    }}
                    aria-label="Search"
                    aria-haspopup="dialog"
                    aria-expanded={panel === "search"}
                    onClick={() => setPanel(panel === "search" ? null : "search")}
                  >
                    <span className="svg-wrapper">
                      <SearchIcon />
                    </span>
                  </button>
                </div>
                <div className="header-actions">
                  <button
                    type="button"
                    className="account-button header-actions__action"
                    ref={(el) => {
                      triggers.current.account = el;
                    }}
                    aria-label="Account"
                    aria-haspopup="dialog"
                    aria-expanded={panel === "account"}
                    onClick={() => setPanel(panel === "account" ? null : "account")}
                  >
                    <AccountIcon />
                  </button>
                  <button
                    type="button"
                    className="header-actions__action"
                    ref={(el) => {
                      triggers.current.cart = el;
                    }}
                    aria-label="Cart"
                    aria-haspopup="dialog"
                    aria-expanded={panel === "cart"}
                    onClick={() => setPanel(panel === "cart" ? null : "cart")}
                  >
                    <span className="svg-wrapper">
                      <CartIcon />
                    </span>
                  </button>
                </div>
              </div>
            </div>
          </div>
          <AccountPopover open={panel === "account"} onClose={() => setPanel(null)} />
        </div>
      </header>

      <div className="vibe-megamenu-section" aria-hidden="true" />
      <MegaMenu open={megaShown} top={megaTop} panelRef={megaRef} />

      {/* mobile drawer */}
      <div
        className={cn("menu-drawer__underlay", menuOpen && "is-open")}
        onClick={() => setMenuOpen(false)}
        aria-hidden={!menuOpen}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Menu"
        className={cn("menu-drawer", menuOpen && "is-open")}
        data-lenis-prevent=""
      >
        <div className="flex items-center justify-end px-5 py-5">
          <button
            type="button"
            onClick={() => setMenuOpen(false)}
            aria-label="Close"
            className="flex h-[34px] w-[34px] items-center justify-center rounded-full border-[1.5px] border-[#1f0229] text-[#1f0229]"
          >
            <CloseIcon />
          </button>
        </div>
        <nav className="menu-drawer__navigation flex flex-col gap-4 px-5 pb-8" aria-label="Primary">
          {NAV_LINKS.map((link) => (
            <Link key={link.href} href={link.href} onClick={() => setMenuOpen(false)} className="menu-drawer__menu-item">
              {link.label}
            </Link>
          ))}
        </nav>
      </div>

      <CartDrawer open={panel === "cart"} onClose={() => setPanel(null)} onLogin={() => setPanel("account")} />
      <SearchModal open={panel === "search"} onClose={() => setPanel(null)} />
    </>
  );
}

export default Header;

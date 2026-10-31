"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";

import { cn } from "@/lib/utils";
import { PillButton } from "@/components/sites/vibebevvy-com-5acc75fc/shared/PillButton";
import { PRODUCTS } from "@/components/sites/vibebevvy-com-5acc75fc/shared/products";
import { SUPPLEMENTS } from "@/components/sites/vibebevvy-com-5acc75fc/shared/supplements";

export type HeaderPanel = "cart" | "account" | "search" | null;

/* what the search covers: the five drinks, then the three softgels */
const CATALOGUE = [...PRODUCTS, ...SUPPLEMENTS];

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function CloseIcon() {
  return (
    <svg aria-hidden="true" width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M3.75 3.75L10.25 10.25M10.25 3.75L3.75 10.25"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function SearchGlyph() {
  return (
    <svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="none">
      <circle cx="9" cy="9" r="4.75" stroke="currentColor" strokeWidth="1.5" />
      <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="m12.5 12.5 3.25 3.25" />
    </svg>
  );
}

function ArrowGlyph() {
  return (
    <svg aria-hidden="true" width="18" height="12" viewBox="0 0 22 14" fill="none">
      <path d="M1 7h18M14 1l6 6-6 6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function BagGlyph() {
  return (
    <svg aria-hidden="true" viewBox="0 0 20 20" fill="none">
      <path
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.5"
        d="M3.392 6.875h13.216v8.016c0 .567-.224 1.112-.624 1.513-.4.402-.941.627-1.506.627H5.522a2.13 2.13 0 0 1-1.506-.627 2.15 2.15 0 0 1-.624-1.513zM8.818 2.969h2.333c.618 0 1.211.247 1.649.686a2.35 2.35 0 0 1 .683 1.658v1.562H6.486V5.313c0-.622.246-1.218.683-1.658a2.33 2.33 0 0 1 1.65-.686"
      />
    </svg>
  );
}

function PersonGlyph() {
  return (
    <svg aria-hidden="true" viewBox="0 0 15 17" fill="none">
      <path
        stroke="currentColor"
        strokeLinejoin="round"
        strokeWidth="1.5"
        d="M10.375 3.813a3.063 3.063 0 1 1-6.125 0 3.063 3.063 0 0 1 6.125 0ZM7.313 9.5c-3.667 0-6.24 2.691-6.563 6.125h13.125C13.552 12.191 10.979 9.5 7.312 9.5Z"
      />
    </svg>
  );
}

/**
 * Cart drawer, after the live theme's: slides in from the right over a dimmed
 * page, a plum hairline on its edge, the empty state centred. There is no
 * cart yet, so this is the only state it has.
 */
export function CartDrawer({ open, onClose, onLogin }: { open: boolean; onClose: () => void; onLogin: () => void }) {
  const closeRef = useRef<HTMLButtonElement>(null);

  /* focus moves into the drawer, as the live dialog does, so the header
     stops being the focused region */
  useEffect(() => {
    if (!open) return;
    const id = window.setTimeout(() => closeRef.current?.focus({ preventScroll: true }), 50);
    return () => window.clearTimeout(id);
  }, [open]);

  return (
    <>
      <div className={cn("vibe-overlay vibe-overlay--clear", open && "is-open")} onClick={onClose} aria-hidden="true" />
      <aside
        className={cn("vibe-cart", open && "is-open")}
        role="dialog"
        aria-modal="true"
        aria-label="Cart"
        aria-hidden={!open}
        data-lenis-prevent=""
      >
        <button ref={closeRef} type="button" className="vibe-cart__close" onClick={onClose} aria-label="Close" tabIndex={open ? 0 : -1}>
          <CloseIcon />
        </button>
        <div className="vibe-cart__empty">
          <p className="vibe-cart__title">Your cart is empty</p>
          <p className="vibe-cart__hint">
            Have an account?{" "}
            <button type="button" className="vibe-cart__login" onClick={onLogin} tabIndex={open ? 0 : -1}>
              Log in
            </button>{" "}
            to check out faster.
          </p>
          <PillButton onClick={onClose}>Continue shopping</PillButton>
        </div>
      </aside>
    </>
  );
}

/**
 * Account popover under the header icons, after the live theme's: sign in
 * with Shop, or an email, plus Orders and Profile. Every path leads to the
 * coming-soon page until accounts exist.
 */
export function AccountPopover({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [state, setState] = useState<"idle" | "error" | "sending" | "done">("idle");
  const [wasOpen, setWasOpen] = useState(open);
  if (open !== wasOpen) {
    setWasOpen(open);
    if (!open) setState("idle");
  }

  return (
    <>
      <div className={cn("vibe-overlay vibe-overlay--clear", open && "is-open")} onClick={onClose} aria-hidden="true" />
      <div className={cn("vibe-account", open && "is-open")} role="dialog" aria-label="Account" aria-hidden={!open}>
        <div className="vibe-account__head">
          <p className="vibe-account__title">Sign in or create account</p>
          <button type="button" className="vibe-account__close" onClick={onClose} aria-label="Close" tabIndex={open ? 0 : -1}>
            <CloseIcon />
          </button>
        </div>
        <Link href="/account/login" className="vibe-account__shop" tabIndex={open ? 0 : -1}>
          Sign in with <span className="vibe-account__shop-mark">shop</span>
        </Link>
        <div className="vibe-account__or" aria-hidden="true">
          <span>or</span>
        </div>
        <form
          className="vibe-account__form"
          noValidate
          onSubmit={(event) => {
            event.preventDefault();
            if (state === "sending") return;
            const email = String(new FormData(event.currentTarget).get("email") ?? "").trim();
            if (!EMAIL.test(email)) {
              setState("error");
              return;
            }
            setState("sending");
            window.setTimeout(() => setState("done"), 600);
          }}
        >
          <div className={`vibe-account__field${state === "error" ? " is-error" : ""}`}>
            <input
              type="email"
              name="email"
              placeholder="Email"
              aria-label="Email"
              aria-invalid={state === "error"}
              aria-describedby="account-email-msg"
              autoComplete="email"
              tabIndex={open ? 0 : -1}
              onChange={() => {
                if (state === "error") setState("idle");
              }}
            />
            <button type="submit" aria-label="Continue" disabled={state === "sending"} tabIndex={open ? 0 : -1}>
              <ArrowGlyph />
            </button>
          </div>
          <label className="vibe-account__optin">
            <input type="checkbox" name="optin" defaultChecked tabIndex={open ? 0 : -1} />
            <span className="vibe-account__check" aria-hidden="true" />
            Email me with news and offers
          </label>
          {state !== "idle" ? (
            <p
              id="account-email-msg"
              className={`vibe-account__note${state === "error" ? " vibe-account__note--error" : ""}`}
              role={state === "error" ? "alert" : "status"}
            >
              {state === "error" ? "Enter a valid email address." : state === "sending" ? "Sending…" : "Coming soon. Accounts open with the first batch."}
            </p>
          ) : null}
        </form>
        <div className="vibe-account__links">
          <Link href="/account/orders" tabIndex={open ? 0 : -1}>
            <BagGlyph /> Orders
          </Link>
          <Link href="/account/profile" tabIndex={open ? 0 : -1}>
            <PersonGlyph /> Profile
          </Link>
        </div>
      </div>
    </>
  );
}

/**
 * Search modal under the header, after the live theme's predictive search:
 * one field, the five drinks and the three softgels in a grid, filtered as you type.
 */
export function SearchModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [query, setQuery] = useState("");
  const [wasOpen, setWasOpen] = useState(open);
  const inputRef = useRef<HTMLInputElement>(null);
  if (open !== wasOpen) {
    setWasOpen(open);
    if (!open) setQuery("");
  }

  useEffect(() => {
    if (!open) return;
    const id = window.setTimeout(() => inputRef.current?.focus(), 60);
    return () => window.clearTimeout(id);
  }, [open]);

  const needle = query.trim().toLowerCase();
  const results = useMemo(
    () =>
      needle
        ? CATALOGUE.filter((product) =>
            `${product.name} ${product.flavorSubtitle} ${product.benefit ?? ""}`.toLowerCase().includes(needle),
          )
        : CATALOGUE,
    [needle],
  );

  return (
    <>
      <div className={cn("vibe-overlay", open && "is-open")} onClick={onClose} aria-hidden="true" />
      <div
        className={cn("vibe-search", open && "is-open")}
        role="dialog"
        aria-modal="true"
        aria-label="Search"
        aria-hidden={!open}
        data-lenis-prevent=""
      >
        <form className="vibe-search__head" role="search" onSubmit={(event) => event.preventDefault()}>
          <span className="vibe-search__icon">
            <SearchGlyph />
          </span>
          <input
            ref={inputRef}
            type="search"
            name="q"
            placeholder="Search"
            aria-label="Search"
            autoComplete="off"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            tabIndex={open ? 0 : -1}
          />
          <button type="button" className="vibe-search__close" onClick={onClose} aria-label="Close" tabIndex={open ? 0 : -1}>
            <CloseIcon />
          </button>
        </form>
        <div className="vibe-search__body">
          <p className="vibe-search__label">{needle ? `Results for “${query.trim()}”` : "Products"}</p>
          {results.length ? (
            <ul className="vibe-search__grid">
              {results.map((product) => (
                <li key={product.slug}>
                  <Link href={`/products/${product.slug}`} className="vibe-search__card" onClick={onClose} tabIndex={open ? 0 : -1}>
                    <span className="vibe-search__media">
                      <Image
                        src={product.primaryImage}
                        alt=""
                        width={300}
                        height={product.kind === "supplement" ? 300 : 692}
                        sizes="140px"
                      />
                    </span>
                    <span className="vibe-search__name">{product.name}</span>
                    <span className="vibe-search__price">{product.price}</span>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="vibe-search__none">Nothing for “{query.trim()}”. Try a flavor, like peach, or an ingredient, like saffron.</p>
          )}
        </div>
      </div>
    </>
  );
}

"use client";

import Image from "next/image";
import Link from "next/link";
import { Suspense, useCallback, useRef, useState, type CSSProperties } from "react";
import { A11y, EffectCoverflow, Keyboard } from "swiper/modules";
import { Swiper, SwiperSlide, type SwiperClass } from "swiper/react";

import "swiper/css";
import "swiper/css/effect-coverflow";

import { PillButton } from "@/components/sites/vibebevvy-com-5acc75fc/shared/PillButton";
import { PRODUCTS } from "@/components/sites/vibebevvy-com-5acc75fc/shared/products";
import { RevealOnScroll } from "@/components/sites/vibebevvy-com-5acc75fc/shared/RevealOnScroll";
import type { VibeProduct } from "@/components/sites/vibebevvy-com-5acc75fc/shared/types";

const IMAGE_SIZES = "(min-width: 768px) 177px, 160px";
/* the on-ice tile is 4:5 at the can box's height, so about 2.1 times its width */
const ICE_SIZES = "(min-width: 768px) 400px, 340px";
/* the user's own cut-out renders, framed on a 524x1384 canvas with every can 499px
   wide and its lid at the same height, so the seven line up; the box keeps the
   can at ~169px on desktop, like the Liquid Death row */
const CAN_BOX = "can-box relative isolate mx-auto aspect-[524/1384] w-[160px] md:w-[177px]";


/* Swiper's loop needs slidesPerView rounded up (+1 when centered) plus its
   buffer of slides on each side, which at 3.75 per view is 8. Seven products
   are one short, so the set is rendered twice; the dots map back to seven. */
const HEADING_A = "Whatever you need,";
const HEADING_B = "there’s a gimme for that.";

const SLIDES = [...PRODUCTS, ...PRODUCTS];
const COUNT = PRODUCTS.length;

function PlusIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <path
        d="M7 1.2v11.6M1.2 7h11.6"
        stroke="var(--vibe-fg)"
        strokeWidth="1.3"
        strokeLinecap="round"
      />
    </svg>
  );
}

/* Liquid Death style slide: can floating on the page, centered text under it,
   price as a small pill. No box, no border. */
function ProductSlide({ product }: { product: VibeProduct }) {
  return (
    <Link
      href={`/products/${product.slug}`}
      className="group flex w-full flex-col items-center text-center text-(--vibe-fg)"
      draggable={false}
    >
      <div className="can-float">
      <div className={CAN_BOX} style={{ "--can-color": product.color } as CSSProperties}>
        {/* soft glow in the can's own colour, shown behind the centred slide */}
        <span className="can-halo" aria-hidden="true" />
        <Image
          src={product.primaryImage}
          alt={product.name}
          fill
          sizes={IMAGE_SIZES}
          className="object-contain"
          draggable={false}
        />
        {product.hoverImage ? (
          /* the on-ice shot as a rounded 4:5 tile the height of the can, centred on it */
          <span className="can-ice" aria-hidden="true">
            <Image src={product.hoverImage} alt="" fill sizes={ICE_SIZES} className="object-cover" draggable={false} />
          </span>
        ) : null}

        <span aria-hidden="true" className="absolute right-[10%] bottom-[5%] z-10 flex h-[34px] w-[34px] items-center justify-center rounded-full border-[1.5px] border-(--vibe-fg) bg-white opacity-0 transition-opacity duration-200 ease-in-out group-hover:opacity-100">
          <PlusIcon />
        </span>
      </div>
      </div>

      <h3 className="pt-5 font-sans text-[20px] leading-none font-semibold md:pt-6 md:text-[28px]">{product.name}</h3>
      <p className="pt-2.5 font-mono text-[13px] leading-none tracking-[0.04em] uppercase md:pt-3 md:text-[14px]">
        {product.flavorSubtitle}
      </p>
      {product.benefit ? (
        <p className="min-h-[2.7em] pt-2 font-sans text-[14px] leading-[1.35] text-(--vibe-fg)/75 md:text-[16px]">
          {product.benefit}
        </p>
      ) : null}
      {product.price ? (
        <span className="mt-3 inline-block rounded-[6px] bg-(--vibe-fg)/8 px-3 pt-[9px] pb-[6px] font-mono text-[14px] leading-none">
          {product.price}
        </span>
      ) : null}
    </Link>
  );
}

/* Same carousel recipe as liquiddeath.com's featured cans (read from their
   live Swiper instance): coverflow effect with rotate 0, depth 80, side
   slides scaled to 0.9, centered slides, infinite loop, 300ms transitions,
   1.75 slides per view on phones (1.62 here, tuned so a fifth of each
   neighbour shows), 2.75 from 768px and 3.75 from 1280px, with the image box
   fixed at ~200px so the gaps stay wide. */
function Carousel() {
  const swiperRef = useRef<SwiperClass | null>(null);
  const [active, setActive] = useState(0);

  const goTo = useCallback((index: number) => {
    const swiper = swiperRef.current;
    if (!swiper) return;
    /* jump to whichever copy of the product is nearer the current slide */
    const target = swiper.realIndex >= COUNT ? index + COUNT : index;
    swiper.slideToLoop(target);
  }, []);

  return (
    <>
      <Swiper
        modules={[EffectCoverflow, A11y, Keyboard]}
        effect="coverflow"
        coverflowEffect={{ rotate: 0, stretch: 0, depth: 80, scale: 0.9, modifier: 1, slideShadows: false }}
        centeredSlides
        loop
        speed={300}
        watchSlidesProgress
        grabCursor
        slidesPerView={1.62}
        spaceBetween={16}
        breakpoints={{
          768: { slidesPerView: 2.75, spaceBetween: 40 },
          1280: { slidesPerView: 3.75, spaceBetween: 40 },
        }}
        keyboard={{ enabled: true }}
        a11y={{ prevSlideMessage: "Previous drink", nextSlideMessage: "Next drink" }}
        onSwiper={(swiper) => {
          swiperRef.current = swiper;
        }}
        onSlideChange={(swiper) => setActive(swiper.realIndex % COUNT)}
      >
        {SLIDES.map((product, index) => (
          <SwiperSlide key={`${product.slug}-${index < COUNT ? "a" : "b"}`}>
            <ProductSlide product={product} />
          </SwiperSlide>
        ))}
      </Swiper>

      <div className="mt-7 flex justify-center">
        {PRODUCTS.map((product, index) => (
          <button
            key={product.slug}
            type="button"
            aria-label={`Show ${product.name}`}
            aria-current={index === active ? "true" : undefined}
            onClick={() => goTo(index)}
            className="flex h-5 w-3.5 items-center justify-center"
          >
            <span
              className={`h-1.5 w-1.5 rounded-full transition-opacity duration-200 bg-(--vibe-fg) ${index === active ? "opacity-100" : "opacity-30"}`}
            />
          </button>
        ))}
      </div>
    </>
  );
}

/* Static stand-in with the carousel's resting geometry (last product, first
   product centered, second product) so the streamed-in Swiper lands without a
   jump. */
function CarouselFallback() {
  const resting = [PRODUCTS[COUNT - 1], PRODUCTS[0], PRODUCTS[1]];
  return (
    <div className="flex items-start justify-center gap-4 overflow-hidden md:gap-10" aria-hidden="true">
      {resting.map((product, index) => (
        <div
          key={product.slug}
          className={`w-[calc((100%-10px)/1.62)] shrink-0 md:w-[calc((100%-70px)/2.75)] xl:w-[calc((100%-110px)/3.75)] ${index === 1 ? "" : "scale-90"}`}
        >
          <ProductSlide product={product} />
        </div>
      ))}
    </div>
  );
}

export function ProductGrid() {
  return (
    <section className="vibe-cans w-full overflow-hidden bg-(--vibe-bg) pb-10 [padding-block-start:calc(110/1440*100vw)]">
      {/* one calm slide-up for the whole heading (the letter pop wobbled at this size) */}
      <RevealOnScroll
        as="h2"
        className="mx-auto max-w-[73.6vw] px-[10px] text-center [text-wrap:balance] font-sans font-semibold text-[max(26px,3.646vw)] leading-[1.2] tracking-[0.02em] text-(--vibe-fg)"
      >
        {HEADING_A}
        <br className="hidden min-[750px]:block" /> {HEADING_B}
      </RevealOnScroll>

      <div className="[margin-block-start:40px] min-[750px]:[margin-block-start:calc(60/1440*100vw)]">
        {/* Swiper reads the clock while it mounts, which Next refuses to bake
            into the static prerender; the boundary lets it stream instead. */}
        <Suspense fallback={<CarouselFallback />}>
          <Carousel />
        </Suspense>
      </div>

      <div className="mt-10 flex justify-center md:mt-12" data-vibe-pop="">
        <PillButton href="/collections/all">Shop Now</PillButton>
      </div>
    </section>
  );
}

export default ProductGrid;

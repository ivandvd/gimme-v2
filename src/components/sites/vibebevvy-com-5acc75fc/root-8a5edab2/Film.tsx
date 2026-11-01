"use client";

import { useEffect, useRef, useState } from "react";

const FILM = "/sites/vibebevvy-com-5acc75fc/shared/film";

function SpeakerIcon({ muted }: { muted: boolean }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M3 9v6h4l5 4V5L7 9H3z" fill="currentColor" />
      {muted ? (
        <path d="M16.5 9.5l5 5M21.5 9.5l-5 5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      ) : (
        <>
          <path d="M15.5 8.5a5 5 0 0 1 0 7" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
          <path d="M18.5 6a8.5 8.5 0 0 1 0 12" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        </>
      )}
    </svg>
  );
}

/**
 * The brand film (the owner's 30-second cut, 2026-11-01), between the
 * ribbon and the good stuff: the accordion's bordered, rounded box at 16:9,
 * the width of the page. It plays muted and looped while on screen
 * (browsers allow no sound without a tap) and pauses off screen; the round
 * button at the corner turns the sound on. The file is fetched only once
 * the box comes near the viewport: phones get the 720p cut, the rest the
 * 1080p. Under prefers-reduced-motion it waits for the button.
 */
export function Film() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [sound, setSound] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const file = `${FILM}/gimme-film-${window.innerWidth < 750 ? 720 : 1080}.mp4`;
    video.muted = true;
    let loaded = false;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry) return;
        if (entry.isIntersecting) {
          if (!loaded) {
            loaded = true;
            video.src = file;
          }
          if (!reduced) video.play().catch(() => {});
        } else if (!video.paused) {
          video.pause();
        }
      },
      { rootMargin: "25% 0px" },
    );
    io.observe(video);
    return () => io.disconnect();
  }, []);

  const toggleSound = () => {
    const video = videoRef.current;
    if (!video) return;
    const next = !sound;
    video.muted = !next;
    setSound(next);
    if (video.paused) video.play().catch(() => {});
  };

  return (
    <section className="vibe-film" aria-label="The gimme film">
      <div className="vibe-film__box">
        <video
          ref={videoRef}
          className="vibe-film__video"
          poster={`${FILM}/gimme-film-poster.jpg`}
          loop
          muted
          playsInline
          preload="none"
          width={1920}
          height={1080}
        />
        <button
          type="button"
          className="vibe-film__sound"
          onClick={toggleSound}
          aria-pressed={sound}
          aria-label={sound ? "Turn the sound off" : "Turn the sound on"}
        >
          <SpeakerIcon muted={!sound} />
        </button>
      </div>
    </section>
  );
}

export default Film;

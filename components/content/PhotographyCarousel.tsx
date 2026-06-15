"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image, { type StaticImageData } from "next/image";
import { motion } from "motion/react";
import { CaretLeft, CaretRight } from "@phosphor-icons/react";

import bike from "@/assets/about-me/how-design-happened/Bike.png";
import butterfly from "@/assets/about-me/how-design-happened/Butterfly.png";
import cat from "@/assets/about-me/how-design-happened/Cat.png";
import chair from "@/assets/about-me/how-design-happened/Chair.png";
import chicklet from "@/assets/about-me/how-design-happened/Chicklet.png";
import circus from "@/assets/about-me/how-design-happened/Circus.png";
import dragonfly from "@/assets/about-me/how-design-happened/Dragonfly.png";
import flamingo from "@/assets/about-me/how-design-happened/Flamingo.png";
import frame from "@/assets/about-me/how-design-happened/Frame 1410085077.png";
import lotus from "@/assets/about-me/how-design-happened/Lotus.png";
import mumbai from "@/assets/about-me/how-design-happened/Mumbai.png";
import scooter from "@/assets/about-me/how-design-happened/Scooter.png";
import sealink from "@/assets/about-me/how-design-happened/Sealink.png";
import skull from "@/assets/about-me/how-design-happened/Skull.png";
import stars from "@/assets/about-me/how-design-happened/Stars.png";
import theyyam from "@/assets/about-me/how-design-happened/Theyyam.png";

const SLIDES: { src: StaticImageData; alt: string }[] = [
  { src: bike, alt: "Bike" },
  { src: butterfly, alt: "Butterfly" },
  { src: cat, alt: "Cat" },
  { src: chair, alt: "Chair" },
  { src: chicklet, alt: "Chicklet" },
  { src: circus, alt: "Circus" },
  { src: dragonfly, alt: "Dragonfly" },
  { src: flamingo, alt: "Flamingo" },
  { src: frame, alt: "Photography" },
  { src: lotus, alt: "Lotus" },
  { src: mumbai, alt: "Mumbai" },
  { src: scooter, alt: "Scooter" },
  { src: sealink, alt: "Sea Link" },
  { src: skull, alt: "Skull" },
  { src: stars, alt: "Stars" },
  { src: theyyam, alt: "Theyyam" },
];

const GAP = 16;

export default function PhotographyCarousel() {
  const trackRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(false);

  const stride = useCallback(() => {
    const el = trackRef.current;
    return el ? el.clientWidth + GAP : 1;
  }, []);

  const sync = useCallback(() => {
    const el = trackRef.current;
    if (!el) return;
    const i = Math.round(el.scrollLeft / stride());
    setActive(Math.max(0, Math.min(SLIDES.length - 1, i)));
    setAtStart(el.scrollLeft <= 2);
    setAtEnd(el.scrollLeft >= el.scrollWidth - el.clientWidth - 2);
  }, [stride]);

  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    sync();
    el.addEventListener("scroll", sync, { passive: true });
    window.addEventListener("resize", sync);
    return () => {
      el.removeEventListener("scroll", sync);
      window.removeEventListener("resize", sync);
    };
  }, [sync]);

  const scrollTo = useCallback(
    (index: number) => {
      const el = trackRef.current;
      if (!el) return;
      const i = Math.max(0, Math.min(SLIDES.length - 1, index));
      el.scrollTo({ left: i * stride(), behavior: "smooth" });
    },
    [stride]
  );

  const chevronStyle: React.CSSProperties = {
    background: "rgba(255,255,255,0.4)",
    backdropFilter: "blur(14px) saturate(160%)",
    WebkitBackdropFilter: "blur(14px) saturate(160%)",
    border: "1px solid rgba(255,255,255,0.6)",
    boxShadow:
      "0 8px 24px rgba(0,0,0,0.14), inset 0 1px 1px rgba(255,255,255,0.7)",
  };

  return (
    <div
      className="relative w-full overflow-hidden"
      style={{ aspectRatio: "860 / 506" }}
    >
      {/* Track */}
      <div
        ref={trackRef}
        className="flex h-full overflow-x-auto"
        style={{
          gap: GAP,
          scrollSnapType: "x mandatory",
          scrollbarWidth: "none",
          msOverflowStyle: "none",
        }}
      >
        {SLIDES.map(({ src, alt }, i) => (
          <div
            key={i}
            className="relative h-full w-full shrink-0"
            style={{ scrollSnapAlign: "start", background: "#ebebeb" }}
          >
            <Image
              src={src}
              alt={alt}
              fill
              sizes="1041px"
              className="object-cover"
              draggable={false}
              priority={i === 0}
            />
          </div>
        ))}
      </div>

      {/* Hide scrollbar (WebKit) */}
      <style jsx>{`
        div::-webkit-scrollbar {
          display: none;
        }
      `}</style>

      {/* Chevrons */}
      <button
        type="button"
        aria-label="Previous"
        onClick={() => scrollTo(active - 1)}
        disabled={atStart}
        className="absolute top-1/2 flex items-center justify-center rounded-full transition-opacity duration-300"
        style={{
          ...chevronStyle,
          left: 20,
          transform: "translateY(-50%)",
          width: 52,
          height: 52,
          opacity: atStart ? 0 : 1,
          pointerEvents: atStart ? "none" : "auto",
          cursor: "pointer",
        }}
      >
        <CaretLeft size={24} weight="bold" color="#1a1a1a" />
      </button>

      <button
        type="button"
        aria-label="Next"
        onClick={() => scrollTo(active + 1)}
        disabled={atEnd}
        className="absolute top-1/2 flex items-center justify-center rounded-full transition-opacity duration-300"
        style={{
          ...chevronStyle,
          right: 20,
          transform: "translateY(-50%)",
          width: 52,
          height: 52,
          opacity: atEnd ? 0 : 1,
          pointerEvents: atEnd ? "none" : "auto",
          cursor: "pointer",
        }}
      >
        <CaretRight size={24} weight="bold" color="#1a1a1a" />
      </button>

      {/* Fluid dots */}
      <div
        className="absolute left-1/2 flex items-center"
        style={{
          bottom: 18,
          transform: "translateX(-50%)",
          gap: 7,
          padding: "8px 12px",
          borderRadius: 9999,
          background: "rgba(20,20,20,0.3)",
          backdropFilter: "blur(10px)",
          WebkitBackdropFilter: "blur(10px)",
        }}
      >
        {SLIDES.map((_, i) => {
          const isActive = i === active;
          return (
            <motion.button
              key={i}
              type="button"
              aria-label={`Go to image ${i + 1}`}
              onClick={() => scrollTo(i)}
              initial={false}
              animate={{
                width: isActive ? 20 : 6,
                backgroundColor: isActive
                  ? "rgba(255,255,255,0.95)"
                  : "rgba(255,255,255,0.45)",
              }}
              transition={{ type: "spring", stiffness: 420, damping: 34 }}
              style={{ height: 6, borderRadius: 9999, cursor: "pointer" }}
            />
          );
        })}
      </div>
    </div>
  );
}

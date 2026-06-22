"use client";

import Image from "next/image";
import { useRef } from "react";
import { motion, useReducedMotion } from "motion/react";
import heroPhoto from "@/assets/about-me/hero-vinoy-photo.png";
import MobileHeroDots from "./MobileHeroDots";

const EASE = [0.22, 1, 0.36, 1] as [number, number, number, number];

/** Mobile hero: vertical stack — title → bio → portrait dot-field */
export default function MobileHero() {
  const reduce     = useReducedMotion();
  const dotsAnchor = useRef<HTMLDivElement>(null);

  return (
    <div style={{ paddingTop: "52px", paddingBottom: "60px" }}>
      {/* Title */}
      <motion.div
        initial={reduce ? { opacity: 0 } : { opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.1, ease: EASE }}
        style={{
          fontFamily:    "var(--font-averia)",
          fontSize:      "30px",
          lineHeight:    "36px",
          letterSpacing: "-1.2px",
          color:         "#000",
          marginBottom:  "16px",
        }}
      >
        <p style={{ fontWeight: 300 }}>Hi!</p>
        <p>
          <span style={{ fontWeight: 300 }}>{"I'm "}</span>
          <span style={{ fontWeight: 700 }}>Vinoy Varghese</span>
        </p>
      </motion.div>

      {/* First bio */}
      <motion.p
        initial={reduce ? { opacity: 0 } : { opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.1, delay: 0.45, ease: EASE }}
        style={{
          fontFamily:    "var(--font-dm-sans)",
          fontWeight:    400,
          fontSize:      "16px",
          lineHeight:    "24px",
          letterSpacing: "-0.16px",
          color:         "#636363",
          marginBottom:  "24px",
        }}
      >
        My passion for design and creativity has led me to work in various
        fields, from graphic design and branding to product design and user
        experience. I strive to push the boundaries of design and create
        meaningful experiences for the users.
      </motion.p>

      {/* Portrait box — 343×254 with dot canvas */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.1, delay: 0.2, ease: EASE }}
        style={{
          width:        "100%",
          height:       "254px",
          borderRadius: "8px",
          overflow:     "hidden",
          position:     "relative",
        }}
      >
        {reduce ? (
          /* Reduced-motion: static image */
          <Image
            src={heroPhoto}
            alt="Vinoy Varghese"
            fill
            className="object-cover"
            priority
          />
        ) : (
          <>
            {/* Anchor div measured by the canvas */}
            <div
              ref={dotsAnchor}
              style={{ width: "100%", height: "254px", position: "relative" }}
              aria-label="Vinoy Varghese"
            >
              {/* Hidden image: loaded for dot-sampling, invisible on screen */}
              <div
                style={{
                  position:  "absolute",
                  left:      "50%",
                  top:       "-65px",
                  width:     "669px",
                  height:    "375px",
                  transform: "translateX(-50%)",
                  opacity:   0,
                }}
              >
                <Image
                  src={heroPhoto}
                  alt="Vinoy Varghese"
                  fill
                  className="object-cover pointer-events-none"
                  draggable={false}
                  priority
                />
              </div>
            </div>
            <MobileHeroDots anchorRef={dotsAnchor} src={heroPhoto.src} />
          </>
        )}
      </motion.div>
    </div>
  );
}

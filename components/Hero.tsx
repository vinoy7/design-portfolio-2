"use client";

import Image from "next/image";
import { useRef } from "react";
import { motion, useReducedMotion } from "motion/react";
import heroPhoto from "@/assets/about-me/hero-vinoy-photo.png";
import HeroDots from "./HeroDots";

const EASE = [0.22, 1, 0.36, 1] as [number, number, number, number];

export default function Hero() {
  const reduce = useReducedMotion();
  const dotsAnchor = useRef<HTMLDivElement>(null);

  return (
    <div className="relative w-full" style={{ height: "510px" }}>
      {/* Text block — title fades in first, description follows */}
      <div
        className="absolute flex flex-col justify-between"
        style={{
          left: "0",
          top: "265px",
          width: "442px",
          height: "251px",
        }}
      >
        <motion.div
          initial={reduce ? { opacity: 0 } : { opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.3, delay: 0, ease: EASE }}
          style={{
            fontFamily: "var(--font-averia)",
            fontSize: "36px",
            lineHeight: "44px",
            letterSpacing: "-1.44px",
            color: "#000",
          }}
        >
          <p style={{ fontWeight: 300 }}>Hi!</p>
          <p>
            <span style={{ fontWeight: 300 }}>{"I'm "}</span>
            <span style={{ fontWeight: 700 }}>Vinoy Varghese</span>
          </p>
        </motion.div>

        <motion.p
          initial={reduce ? { opacity: 0 } : { opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.3, delay: 1.3, ease: EASE }}
          style={{
            fontFamily: "var(--font-dm-sans)",
            fontWeight: 400,
            fontSize: "16px",
            lineHeight: "24px",
            letterSpacing: "-0.16px",
            color: "#636363",
          }}
        >
          My passion for design and creativity has led me to work in various
          fields, from graphic design and branding to product design and user
          experience. I strive to push the boundaries of design and create
          meaningful experiences for the users.
        </motion.p>
      </div>

      {/* Hero photo */}
      {reduce ? (
        <motion.div
          className="absolute overflow-hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.1, delay: 0.24, ease: EASE }}
          style={{
            left: "calc(50% + 10px)",
            top: "265px",
            width: "510px",
            height: "245px",
          }}
        >
          <div
            className="absolute"
            style={{
              left: "50%",
              top: "-65px",
              width: "669px",
              height: "375px",
              transform: "translateX(-50%)",
            }}
          >
            <Image
              src={heroPhoto}
              alt="Vinoy Varghese"
              fill
              className="object-cover"
              priority
            />
          </div>
        </motion.div>
      ) : (
        <>
          {/* Anchor box measured by the dot field; photo hidden but present for SEO */}
          <div
            ref={dotsAnchor}
            className="absolute overflow-hidden select-none"
            style={{
              left: "calc(50% + 10px)",
              top: "265px",
              width: "510px",
              height: "245px",
              WebkitUserSelect: "none",
              userSelect: "none",
            }}
            aria-label="Vinoy Varghese"
            onDragStart={(e) => e.preventDefault()}
          >
            <div
              className="absolute"
              style={{
                left: "50%",
                top: "-65px",
                width: "669px",
                height: "375px",
                transform: "translateX(-50%)",
                opacity: 0,
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
          <HeroDots anchorRef={dotsAnchor} src={heroPhoto.src} />
        </>
      )}
    </div>
  );
}

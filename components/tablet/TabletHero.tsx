"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import heroPhoto from "@/assets/about-me/hero-vinoy-photo.png";
import MobileHeroDots from "../mobile/MobileHeroDots";

const EASE = [0.22, 1, 0.36, 1] as [number, number, number, number];

// Photo box is fixed at the Figma size so the fixed-grid dot field lands on it.
// ponytail: only the photo column is fixed; the text column flexes with the
// fluid container.
const PHOTO_W = 283;
const PHOTO_H = 284;

export default function TabletHero() {
  const reduce = useReducedMotion();
  const dotsAnchor = useRef<HTMLDivElement>(null);
  const [dotClicks, setDotClicks] = useState(0);
  const [dotsSettled, setDotsSettled] = useState(false);

  return (
    <div
      className="flex items-start justify-between"
      style={{ gap: "18px", paddingTop: "96px" }}
    >
      {/* Text column — flexes */}
      <div className="flex flex-col" style={{ flex: 1, minWidth: 0, gap: "43px" }}>
        <motion.div
          initial={reduce ? { opacity: 0 } : { opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.3, delay: 0, ease: EASE }}
          style={{
            fontFamily: "var(--font-averia)",
            fontSize: "28px",
            lineHeight: "36px",
            letterSpacing: "-1.28px",
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
          transition={{ duration: 1.3, delay: 0.65, ease: EASE }}
          style={{
            fontFamily: "var(--font-dm-sans)",
            fontWeight: 400,
            fontSize: "16px",
            lineHeight: "24px",
            letterSpacing: "-0.16px",
            color: "#757575",
          }}
        >
          My passion for design and creativity has led me to work in various
          fields, from graphic design and branding to product design and user
          experience. I strive to push the boundaries of design and create
          meaningful experiences for the users.
        </motion.p>
      </div>

      {/* Photo box — fixed 283×284 */}
      {reduce ? (
        <motion.div
          className="relative overflow-hidden shrink-0"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.1, delay: 0.24, ease: EASE }}
          style={{ width: PHOTO_W, height: PHOTO_H }}
        >
          <div className="absolute" style={{ left: "-111px", top: 0, width: "506px", height: "284px" }}>
            <Image src={heroPhoto} alt="Vinoy Varghese" fill className="object-cover" priority />
          </div>
        </motion.div>
      ) : (
        <>
          {/* Anchor box measured by the dot field; photo hidden but present for SEO */}
          <div
            ref={dotsAnchor}
            className="relative overflow-hidden select-none shrink-0"
            style={{ width: PHOTO_W, height: PHOTO_H, WebkitUserSelect: "none", userSelect: "none" }}
            aria-label="Vinoy Varghese"
            onDragStart={(e) => e.preventDefault()}
          >
            <div
              className="absolute"
              style={{ left: "-111px", top: 0, width: "506px", height: "284px", opacity: 0 }}
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

            {/* hint — behind canvas (z<50), revealed through repel gaps */}
            <div
              style={{
                position: "absolute",
                inset: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                textAlign: "center",
                padding: "0 24px",
                fontFamily: "var(--font-dm-sans)",
                fontWeight: 400,
                fontSize: "18px",
                lineHeight: "26px",
                color: "#757575",
                pointerEvents: "none",
                opacity: !dotsSettled || dotClicks >= 4 ? 0 : 1,
                transition: "opacity 0.8s ease",
              }}
            >
              Tap here 5 times
            </div>
          </div>
          <MobileHeroDots
            anchorRef={dotsAnchor}
            src={heroPhoto.src}
            winW={PHOTO_W}
            winH={PHOTO_H}
            divW={506}
            cropX={111}
            cropY={0}
            onClickCount={setDotClicks}
            onSettled={() => setDotsSettled(true)}
          />
        </>
      )}
    </div>
  );
}

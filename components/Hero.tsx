"use client";

import Image from "next/image";
import { useEffect } from "react";
import { motion, useReducedMotion, useMotionValue, useSpring, useTransform } from "motion/react";
import heroPhoto from "@/assets/about-me/hero-vinoy-photo.png";

const EASE = [0.22, 1, 0.36, 1] as [number, number, number, number];

export default function Hero() {
  const reduce = useReducedMotion();

  const rawX = useMotionValue(0);
  const rawY = useMotionValue(0);
  const springX = useSpring(rawX, { stiffness: 80, damping: 20 });
  const springY = useSpring(rawY, { stiffness: 80, damping: 20 });
  const x = useTransform(springX, [-0.5, 0.5], [-25, 25]);
  const y = useTransform(springY, [-0.5, 0.5], [-25, 25]);

  useEffect(() => {
    if (reduce) return;
    const handler = (e: MouseEvent) => {
      rawX.set(e.clientX / window.innerWidth - 0.5);
      rawY.set(e.clientY / window.innerHeight - 0.5);
    };
    window.addEventListener("mousemove", handler);
    return () => window.removeEventListener("mousemove", handler);
  }, [reduce, rawX, rawY]);

  return (
    <div className="relative w-full" style={{ height: "510px" }}>
      {/* Text block */}
      <motion.div
        className="absolute flex flex-col justify-between"
        initial={reduce ? { opacity: 0 } : { opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.1, delay: 0, ease: EASE }}
        style={{
          left: "0",
          top: "265px",
          width: "442px",
          height: "251px",
        }}
      >
        <div
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
        </div>

        <p
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
        </p>
      </motion.div>

      {/* Hero photo */}
      <motion.div
        className="absolute overflow-hidden"
        initial={reduce ? { opacity: 0 } : { opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.1, delay: 0.24, ease: EASE }}
        style={{
          left: "calc(50% + 10px)",
          top: "265px",
          width: "510px",
          height: "245px",
          // borderRadius: "12px",
        }}
      >
        <motion.div style={{ x, y }}>
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
      </motion.div>
    </div>
  );
}

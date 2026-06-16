"use client";

import { motion } from "motion/react";

export default function BookACallButton() {
  return (
    <motion.a
      href="https://cal.com/vinoy7/30min"
      target="_blank"
      rel="noopener noreferrer"
      initial="rest"
      whileHover="hover"
      style={{
        background: "#292929",
        borderRadius: "4px",
        padding: "8px 12px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        textDecoration: "none",
        width: "144px",
      }}
    >
      {/* overflow-hidden on a plain div so clipping is reliable */}
      <div style={{ height: "32px", overflow: "hidden" }}>
        <motion.div
          variants={{
            rest: { y: 0 },
            hover: { y: "-50%" },
          }}
          transition={{ type: "spring", stiffness: 400, damping: 32 }}
          style={{ display: "flex", flexDirection: "column" }}
        >
          <span
            style={{
              fontFamily: "var(--font-dm-sans)",
              fontWeight: 500,
              fontSize: "20px",
              lineHeight: "32px",
              letterSpacing: "-0.4px",
              color: "#f5eee2",
              height: "32px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            Book a Call
          </span>
          <span
            style={{
              fontFamily: '"Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji", sans-serif',
              fontSize: "20px",
              lineHeight: "32px",
              height: "32px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            📅
          </span>
        </motion.div>
      </div>
    </motion.a>
  );
}

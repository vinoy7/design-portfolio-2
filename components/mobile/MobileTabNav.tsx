"use client";

import { motion } from "motion/react";

export type MobileTab = "work" | "playground" | "about";

const TABS: { id: MobileTab; label: string }[] = [
  { id: "work",  label: "Work"     },
  { id: "about", label: "About Me" },
  // ponytail: Playground hidden for now — re-add { id:"playground", label:"Playground" } to restore
];

const PILL_BG = "#f5eee2";

interface Props {
  active:   MobileTab;
  onChange: (tab: MobileTab) => void;
}

/** Minimal 3-tab pill nav for mobile — no physics, no easter egg. */
export default function MobileTabNav({ active, onChange }: Props) {
  return (
    <div
      style={{
        display:         "flex",
        alignItems:      "center",
        gap:             "4px",
        borderRadius:    "22px",
        padding:         "4px",
        width:           "fit-content",
      }}
    >
      {TABS.map((tab) => {
        const isActive = tab.id === active;
        return (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            style={{
              position:        "relative",
              padding:         "8px 20px",
              border:          "none",
              background:      "transparent",
              cursor:          "pointer",
              borderRadius:    "18px",
              fontFamily:      "var(--font-dm-sans)",
              fontWeight:      isActive ? 700 : 400,
              fontSize:        "16px",
              lineHeight:      "20px",
              letterSpacing:   "-0.15px",
              color:           "#000",
              whiteSpace:      "nowrap",
              WebkitTapHighlightColor: "transparent",
            }}
          >
            {/* Sliding pill */}
            {isActive && (
              <motion.span
                layoutId="mobile-tab-pill"
                style={{
                  position:     "absolute",
                  inset:        0,
                  borderRadius: "18px",
                  background:   PILL_BG,
                  zIndex:       0,
                }}
                transition={{ type: "spring", stiffness: 380, damping: 36 }}
              />
            )}
            <span style={{ position: "relative", zIndex: 1 }}>{tab.label}</span>
          </button>
        );
      })}
    </div>
  );
}

"use client";

import { motion, useReducedMotion } from "motion/react";

export type Tab = "work" | "playground" | "ai" | "about";

const EASE = [0.22, 1, 0.36, 1] as [number, number, number, number];

const TABS: { id: Tab; label: string }[] = [
  { id: "work", label: "Work" },
  { id: "playground", label: "Playground" },
  { id: "ai", label: "AI experiments" },
  { id: "about", label: "About Me" },
];

interface TabNavProps {
  active: Tab;
  onChange: (tab: Tab) => void;
  /** First-load choreography: stagger the tabs in, then fade the active pill in. */
  intro?: boolean;
  /** When false (during intro, pre-pill), the active tab renders in default style. */
  showActiveStyle?: boolean;
}

export default function TabNav({
  active,
  onChange,
  intro = false,
  showActiveStyle = true,
}: TabNavProps) {
  const reduce = useReducedMotion();
  return (
    <div className="flex items-center gap-4">
      {TABS.map((tab, i) => {
        const isActive = tab.id === active;
        const styledActive = isActive && showActiveStyle;
        return (
          <motion.button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            initial={intro ? (reduce ? { opacity: 0 } : { opacity: 0, y: 8 }) : false}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: intro ? 0.9 + i * 0.15 : 0, ease: EASE }}
            style={{
              position: "relative",
              fontFamily: "var(--font-dm-sans)",
              fontSize: "16px",
              lineHeight: "20px",
              letterSpacing: "-0.16px",
              background: "transparent",
              border: "none",
              borderRadius: "60px",
              padding: "12px 24px",
              cursor: "pointer",
              whiteSpace: "nowrap",
            }}
          >
            {isActive && (
              <motion.span
                layoutId="tab-pill"
                initial={intro ? { opacity: 0 } : false}
                animate={{ opacity: 1 }}
                transition={{
                  layout: { type: "spring", stiffness: 380, damping: 34 },
                  opacity: { duration: 0.8, delay: intro ? 2.0 : 0, ease: EASE },
                }}
                style={{
                  position: "absolute",
                  inset: 0,
                  background: "#f5eee2",
                  borderRadius: "60px",
                }}
              />
            )}
            {/* Dual-layer label: bold layer crossfades over regular so the
                weight + color change dissolves smoothly (font-weight can't tween).
                Both share one grid cell, so width is fixed to the bold width. */}
            <span
              style={{
                position: "relative",
                display: "inline-grid",
                placeItems: "center",
              }}
            >
              <span
                style={{
                  gridArea: "1 / 1",
                  fontWeight: 600,
                  color: "#000",
                  opacity: styledActive ? 1 : 0,
                  transition: "opacity 400ms ease",
                }}
              >
                {tab.label}
              </span>
              <span
                style={{
                  gridArea: "1 / 1",
                  fontWeight: 400,
                  color: "#696969",
                  opacity: styledActive ? 0 : 1,
                  transition: "opacity 400ms ease",
                }}
              >
                {tab.label}
              </span>
            </span>
          </motion.button>
        );
      })}
    </div>
  );
}

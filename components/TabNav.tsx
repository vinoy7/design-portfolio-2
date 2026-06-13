"use client";

import { motion } from "motion/react";

export type Tab = "work" | "playground" | "ai" | "about";

const TABS: { id: Tab; label: string }[] = [
  { id: "work", label: "Work" },
  { id: "playground", label: "Playground" },
  { id: "ai", label: "AI experiments" },
  { id: "about", label: "About Me" },
];

interface TabNavProps {
  active: Tab;
  onChange: (tab: Tab) => void;
}

export default function TabNav({ active, onChange }: TabNavProps) {
  return (
    <div className="flex items-center gap-4">
      {TABS.map((tab) => {
        const isActive = tab.id === active;
        return (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            style={{
              position: "relative",
              fontFamily: "var(--font-dm-sans)",
              fontWeight: isActive ? 600 : 400,
              fontSize: "16px",
              lineHeight: "20px",
              letterSpacing: "-0.16px",
              color: isActive ? "#000" : "#696969",
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
                transition={{ type: "spring", stiffness: 380, damping: 34 }}
                style={{
                  position: "absolute",
                  inset: 0,
                  background: "#f5eee2",
                  borderRadius: "60px",
                }}
              />
            )}
            <span style={{ position: "relative" }}>{tab.label}</span>
          </button>
        );
      })}
    </div>
  );
}

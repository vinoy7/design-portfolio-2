"use client";

import React, { useState, useEffect } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import TabNav, { type Tab } from "../TabNav";
import TabletHero from "./TabletHero";
import TabletWorkContent from "./TabletWorkContent";
import TabletAIExperimentsContent from "./TabletAIExperimentsContent";
import TabletAboutContent from "./TabletAboutContent";
import PlaygroundContent from "../content/PlaygroundContent";
import Testimonials from "../Testimonials";
import Footer from "../Footer";

function TabDescription({ tab }: { tab: Tab }) {
  const descriptions: Record<Tab, string> = {
    work: "I've had the opportunity to design across diverse tech domains; from EdTech & HRTech to implementing AI-driven experiences for SalesTech. Currently, I'm working as a solo designer at a Fintech startup building a modern financial OS for businesses in Seychelles & beyond.",
    playground:
      "The Playground is a collection of experiments, explorations, and interface ideas that didn't quite make it into the final case studies, but still felt worth sharing. Some are unfinished concepts, while others are quick iterations created out of curiosity or spontaneous ideas.",
    ai: "I recently started dabbling with Claude Code and experimenting with things like building a personal Figma plugin, scripting workflows, and generating images and videos for different media use cases. What really amazes me is how easy it has become to build tools that simplify tasks that used to feel repetitive, time-consuming, and frustrating. The barrier between an idea and execution feels smaller than ever now.",
    about: "",
  };

  const desc = descriptions[tab];
  if (!desc) return null;

  return (
    <p
      style={{
        fontFamily: "var(--font-dm-sans)",
        fontWeight: 400,
        fontSize: "16px",
        lineHeight: "24px",
        letterSpacing: "-0.2px",
        color: "#757575",
      }}
    >
      {desc}
    </p>
  );
}

const EASE = [0.22, 1, 0.36, 1] as [number, number, number, number];

export default function TabletPortfolioPage() {
  const [activeTab, setActiveTab] = useState<Tab>("work");
  const [intro, setIntro] = useState(true);
  const [pillIn, setPillIn] = useState(false);
  const reduce = useReducedMotion();

  useEffect(() => {
    history.scrollRestoration = "manual";
    window.scrollTo(0, 0);
    const TABS: Tab[] = ["work", "playground", "ai", "about"];
    const h = window.location.hash.replace("#", "") as Tab;
    if (TABS.includes(h)) setActiveTab(h);
    const tPill = setTimeout(() => setPillIn(true), 2000);
    const t = setTimeout(() => setIntro(false), 4300);
    return () => {
      clearTimeout(tPill);
      clearTimeout(t);
    };
  }, []);

  // Block right-click "Save image/video" and drag across the whole SPA.
  useEffect(() => {
    const block = (e: Event) => {
      const t = e.target as HTMLElement;
      if (t instanceof HTMLImageElement || t instanceof HTMLVideoElement) e.preventDefault();
    };
    document.addEventListener("contextmenu", block);
    document.addEventListener("dragstart", block);
    return () => {
      document.removeEventListener("contextmenu", block);
      document.removeEventListener("dragstart", block);
    };
  }, []);

  const handleTab = (tab: Tab) => {
    setActiveTab(tab);
    history.replaceState(null, "", `#${tab}`);
  };

  const showTestimonials = activeTab === "work";
  const hasDescription = activeTab !== "about";

  // Locked to the Figma tablet width: 744 frame, 80px side margins → 584 content.
  // Centered; outer margins grow with the viewport (768→1279). Content stays the
  // design width so proportions match the artboard exactly.
  const centered: React.CSSProperties = {
    width: "100%",
    maxWidth: "744px",
    paddingLeft: "80px",
    paddingRight: "80px",
    marginLeft: "auto",
    marginRight: "auto",
    boxSizing: "border-box",
  };

  return (
    <main>
      {/* Hero — always visible */}
      <div style={centered}>
        <TabletHero />
      </div>

      {/* Tab nav + description — natural height; gap to content is fixed below */}
      <div style={{ ...centered, marginTop: "120px" }}>
        <div style={{ display: "flex", flexDirection: "column", overflow: "visible" }}>
          <TabNav
            active={activeTab}
            onChange={handleTab}
            intro={intro}
            showActiveStyle={!intro || pillIn}
            magnetic={false}
          />
          {hasDescription && (
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab + "-desc"}
                initial={reduce ? { opacity: 0 } : { opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{
                  opacity: 0,
                  ...(reduce ? {} : { y: -6 }),
                  transition: { duration: 0.3, ease: EASE },
                }}
                transition={{ duration: 0.9, delay: intro ? 2.2 : 0, ease: EASE }}
                style={{ marginTop: "21px" }}
              >
                <TabDescription tab={activeTab} />
              </motion.div>
            </AnimatePresence>
          )}
        </div>
      </div>

      {/* Tab content — fixed 64px gap below the description (21px on About) */}
      <div style={{ ...centered, marginTop: hasDescription ? "64px" : "21px" }}>
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={reduce ? { opacity: 0 } : { opacity: 0, y: 32 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{
              opacity: 0,
              ...(reduce ? {} : { y: -12 }),
              transition: { duration: 0.3, ease: EASE },
            }}
            transition={{
              duration: intro ? 1.6 : 0.55,
              delay: intro ? 2.4 : hasDescription ? 0.3 : 0,
              ease: EASE,
            }}
          >
            {activeTab === "work" && <TabletWorkContent />}
            {activeTab === "playground" && <PlaygroundContent />}
            {activeTab === "ai" && <TabletAIExperimentsContent />}
            {activeTab === "about" && <TabletAboutContent />}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Testimonials (Work tab only) */}
      <AnimatePresence>
        {showTestimonials && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            style={{ ...centered, marginTop: "200px" }}
          >
            <Testimonials />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Footer — hidden on About */}
      {activeTab !== "about" && (
        <div style={{ ...centered, marginTop: "200px" }}>
          <Footer showCta linkGap={14} ctaTitleSize={24} ctaTitleLh={32} ctaHeight={200} ctaGap={24} compactBg />
        </div>
      )}
    </main>
  );
}

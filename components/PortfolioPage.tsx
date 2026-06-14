"use client";

import React, { useState, useEffect } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import Hero from "./Hero";
import TabNav, { type Tab } from "./TabNav";
import WorkContent from "./content/WorkContent";
import AIExperimentsContent from "./content/AIExperimentsContent";
import PlaygroundContent from "./content/PlaygroundContent";
import AboutMeContent from "./content/AboutMeContent";
import Testimonials from "./Testimonials";
import Footer from "./Footer";

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
        fontSize: "18px",
        lineHeight: "26px",
        letterSpacing: "-0.2px",
        color: "#757575",
      }}
    >
      {desc}
    </p>
  );
}

const EASE = [0.22, 1, 0.36, 1] as [number, number, number, number];

export default function PortfolioPage() {
  const [activeTab, setActiveTab] = useState<Tab>("work");
  // Initial-load choreography: hero -> tabs -> active pill -> content (slow).
  // `intro` gates the staggered delays so only the first paint is sequenced;
  // later tab switches animate at normal speed.
  const [intro, setIntro] = useState(true);
  // Active tab stays in default style until the pill fades in (synced to the
  // pill's 2.0s delay in TabNav), then goes bold.
  const [pillIn, setPillIn] = useState(false);
  const reduce = useReducedMotion();

  useEffect(() => {
    history.scrollRestoration = "manual";
    window.scrollTo(0, 0);
    const tPill = setTimeout(() => setPillIn(true), 2000);
    const t = setTimeout(() => setIntro(false), 4300);
    return () => {
      clearTimeout(tPill);
      clearTimeout(t);
    };
  }, []);

  const showTestimonials = activeTab === "work";
  const hasDescription = activeTab !== "about";

  const centered: React.CSSProperties = {
    maxWidth: "1041px",
    marginLeft: "auto",
    marginRight: "auto",
  };

  return (
    <main style={{ minWidth: "1440px" }}>
      {/* Hero — always visible */}
      <div style={centered}>
        <Hero />
      </div>

      {/* Tab nav + description */}
      <div style={{ ...centered, marginTop: "285px" }}>
        {/* Animated height: 265px with a description (pins content at Figma
            y=1060), 76px without (tab nav 44 + 32 gap). Animating instead of
            snapping prevents the content jump when switching to/from About. */}
        <motion.div
          animate={{ height: hasDescription ? 265 : 76 }}
          transition={{ duration: reduce ? 0 : 0.45, ease: EASE }}
          style={{
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
          }}
        >
          <TabNav
            active={activeTab}
            onChange={setActiveTab}
            intro={intro}
            showActiveStyle={!intro || pillIn}
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
                style={{ marginTop: "32px" }}
              >
                <TabDescription tab={activeTab} />
              </motion.div>
            </AnimatePresence>
          )}
        </motion.div>
      </div>

      {/* Tab content — gap to nav is baked into the animated block height above */}
      <div style={{ ...centered, marginTop: "0px" }}>
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
              // Description leads, then content. About has no description, so its
              // content (incl. the portrait) comes in immediately.
              delay: intro ? 2.4 : hasDescription ? 0.3 : 0,
              ease: EASE,
            }}
          >
            {activeTab === "work" && <WorkContent />}
            {activeTab === "playground" && <PlaygroundContent />}
            {activeTab === "ai" && <AIExperimentsContent />}
            {activeTab === "about" && <AboutMeContent />}
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
            style={{ ...centered, marginTop: "285px" }}
          >
            <Testimonials />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Footer */}
      <div style={{ ...centered, marginTop: "285px" }}>
        <Footer />
      </div>
    </main>
  );
}

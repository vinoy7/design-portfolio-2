"use client";

import React, { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
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
        fontSize: "20px",
        lineHeight: "30px",
        letterSpacing: "-0.2px",
        color: "#757575",
      }}
    >
      {desc}
    </p>
  );
}

export default function PortfolioPage() {
  const [activeTab, setActiveTab] = useState<Tab>("work");

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
        {/* Fixed 265px when description present keeps content pinned at Figma y=1060px */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            height: hasDescription ? "265px" : "auto",
          }}
        >
          <TabNav active={activeTab} onChange={setActiveTab} />
          {hasDescription && (
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab + "-desc"}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                style={{ marginTop: "32px" }}
              >
                <TabDescription tab={activeTab} />
              </motion.div>
            </AnimatePresence>
          )}
        </div>
      </div>

      {/* Tab content */}
      <div style={{ ...centered, marginTop: hasDescription ? "0px" : "32px" }}>
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
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

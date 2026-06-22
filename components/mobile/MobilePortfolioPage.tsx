"use client";

import { useState, useEffect } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import Image from "next/image";
import MobileHero        from "./MobileHero";
import MobileTabNav, { type MobileTab } from "./MobileTabNav";
import MobileWorkContent from "./MobileWorkContent";
import MobileTestimonials from "./MobileTestimonials";
import BookACallButton   from "@/components/BookACallButton";
import ctaBg             from "@/assets/about-me/cta-bg-texture.png";

const EASE = [0.22, 1, 0.36, 1] as [number, number, number, number];

// Second bio paragraph per tab (matches desktop TabDescription)
const TAB_BIO: Record<MobileTab, string> = {
  work:       "I've had the opportunity to design across diverse tech domains; from EdTech & HRTech to implementing AI-driven experiences for SalesTech. Currently, I'm working as a solo designer at a Fintech startup building a modern financial OS for businesses in Seychelles & beyond.",
  playground: "The Playground is a collection of experiments, explorations, and interface ideas that didn't quite make it into the final case studies, but still felt worth sharing. Some are unfinished concepts, while others are quick iterations created out of curiosity or spontaneous ideas.",
  about:      "",
};

// Simple "in progress" placeholder for tabs without mobile content yet
function ComingSoon({ tab }: { tab: MobileTab }) {
  const label = tab === "playground" ? "Playground" : "About Me";
  return (
    <div style={{ paddingTop:"48px", paddingBottom:"48px", display:"flex", flexDirection:"column", alignItems:"center", gap:"12px" }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/assets/icons/Logo.svg" alt="" width={40} height={40} style={{ opacity:0.35 }} />
      <p style={{
        fontFamily:  "var(--font-dm-sans)",
        fontWeight:  400,
        fontSize:    "16px",
        lineHeight:  "24px",
        color:       "#b0b0b0",
        textAlign:   "center",
        maxWidth:    "240px",
      }}>
        {label} mobile version is being developed.
      </p>
    </div>
  );
}

// Inline mobile footer (Footer.tsx bar layout doesn't fit 343px)
function MobileFooterCta() {
  return (
    <div style={{ display:"flex", flexDirection:"column", gap:"0" }}>
      {/* CTA block */}
      <div
        style={{
          position: "relative",
          overflow: "hidden",
          background: "#000",
          height: "200px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div style={{ position:"absolute", inset:0 }}>
          <Image src={ctaBg} alt="" fill className="object-cover" sizes="100vw" />
        </div>
        <div style={{ position:"relative", display:"flex", flexDirection:"column", alignItems:"center", gap:"24px", padding:"0 16px" }}>
          <div style={{
            fontFamily:    "var(--font-averia)",
            fontWeight:    400,
            fontSize:      "24px",
            lineHeight:    "32px",
            letterSpacing: "-0.48px",
            color:         "#000",
            textAlign:     "center",
          }}>
            <p>{"Let's get in touch"}</p>
            <p>and bring your idea to life</p>
          </div>
          <BookACallButton />
        </div>
      </div>

      {/* Footer links */}
      <div style={{ paddingTop:"32px", paddingBottom:"32px", display:"flex", flexDirection:"column", gap:"24px", alignItems:"center" }}>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:"0", width:"100%" }}>
          {[
            { label:"Email",    href:"mailto:vinoy.248@gmail.com", external:false },
            { label:"GitHub",   href:"https://github.com/vinoy7", external:true },
            { label:"LinkedIn", href:"https://www.linkedin.com/in/vinoy777", external:true },
            { label:"Resume",   href:"/Vinoy_Varghese_Resume.pdf", external:true },
          ].map((link) => (
            <a
              key={link.label}
              href={link.href}
              {...(link.external ? { target:"_blank", rel:"noopener noreferrer" } : {})}
              style={{
                fontFamily:     "var(--font-dm-sans)",
                fontWeight:     400,
                fontSize:       "16px",
                lineHeight:     "22px",
                color:          "#000",
                textDecoration: "none",
                flex:           1,
                textAlign:      "center",
              }}
            >
              {link.label}
            </a>
          ))}
        </div>

        <div style={{ width:"80px", height:"1px", background:"#e0e0e0" }} />

        <p style={{
          fontFamily: "var(--font-dm-sans)",
          fontWeight: 400,
          fontSize:   "14px",
          lineHeight: "20px",
          color:      "#000",
          textAlign:  "center",
        }}>
          © 2026 Vinoy Varghese
        </p>
      </div>
    </div>
  );
}

export default function MobilePortfolioPage() {
  const [activeTab, setActiveTab] = useState<MobileTab>("work");
  const reduce = useReducedMotion();

  useEffect(() => {
    history.scrollRestoration = "manual";
    window.scrollTo(0, 0);
    // Restore tab from hash
    const TABS: MobileTab[] = ["work", "playground", "about"];
    const h = window.location.hash.replace("#", "") as MobileTab;
    if (TABS.includes(h)) setActiveTab(h);
  }, []);

  // Media-save block — same as PortfolioPage
  useEffect(() => {
    const block = (e: Event) => {
      const t = e.target as HTMLElement;
      if (t instanceof HTMLImageElement || t instanceof HTMLVideoElement) e.preventDefault();
    };
    document.addEventListener("contextmenu", block);
    document.addEventListener("dragstart",   block);
    return () => {
      document.removeEventListener("contextmenu", block);
      document.removeEventListener("dragstart",   block);
    };
  }, []);

  const handleTab = (tab: MobileTab) => {
    setActiveTab(tab);
    history.replaceState(null, "", `#${tab}`);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const tabBio = TAB_BIO[activeTab];

  return (
    <main style={{ minHeight:"100dvh", background:"#fff", overflowX:"hidden" }}>
      {/* Centered content container — 16px side padding, max 375px */}
      <div style={{ maxWidth:"375px", margin:"0 auto", padding:"0 16px" }}>
        <MobileHero />

        {/* Tab nav */}
        <div style={{ marginBottom:"24px" }}>
          <MobileTabNav active={activeTab} onChange={handleTab} />
        </div>

        {/* Second bio — visible for work + playground */}
        <AnimatePresence mode="wait">
          {tabBio && (
            <motion.p
              key={activeTab + "-bio"}
              initial={reduce ? { opacity: 0 } : { opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, transition: { duration: 0.2 } }}
              transition={{ duration: 0.55, ease: EASE }}
              style={{
                fontFamily:    "var(--font-dm-sans)",
                fontWeight:    400,
                fontSize:      "16px",
                lineHeight:    "24px",
                letterSpacing: "-0.16px",
                color:         "#636363",
                marginBottom:  "32px",
              }}
            >
              {tabBio}
            </motion.p>
          )}
        </AnimatePresence>

        {/* Tab content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={reduce ? { opacity: 0 } : { opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, transition: { duration: 0.2, ease: EASE } }}
            transition={{ duration: 0.55, ease: EASE }}
            style={{ marginBottom:"48px" }}
          >
            {activeTab === "work"       && <MobileWorkContent />}
            {activeTab === "playground" && <ComingSoon tab="playground" />}
            {activeTab === "about"      && <ComingSoon tab="about" />}
          </motion.div>
        </AnimatePresence>

        {/* Testimonials — work tab only */}
        {activeTab === "work" && (
          <div style={{ marginBottom:"48px" }}>
            <MobileTestimonials />
          </div>
        )}
      </div>

      {/* CTA + footer — full-bleed, outside the centered container */}
      <MobileFooterCta />
    </main>
  );
}

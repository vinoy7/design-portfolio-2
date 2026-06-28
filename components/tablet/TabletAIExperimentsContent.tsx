"use client";

import Image from "next/image";
import { useRef } from "react";
import { motion } from "motion/react";
import { ExperimentMedia } from "../content/AIExperimentsContent";
import f360DashboardImg from "@/assets/ai-experiments/f360-dashboard-screenshot.png";
import nameMyFrameImg from "@/assets/ai-experiments/name-my-frame-screenshot.png";
import mylosImg from "@/assets/ai-experiments/mylos-adventures-screenshot.png";
import grokImg from "@/assets/ai-experiments/grok-ad-screenshot.png";

const reveal = (delay = 0) => ({
  initial: { opacity: 0, y: 56 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.05 },
  transition: { duration: 0.9, delay, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] },
});

function MetaTag({ children }: { children: React.ReactNode }) {
  return (
    <span style={{ fontFamily: "var(--font-dm-sans)", fontWeight: 500, fontSize: "13px", lineHeight: "20px", color: "#888", whiteSpace: "nowrap" }}>
      {children}
    </span>
  );
}
function Dot() {
  return <span style={{ display: "inline-block", width: "4px", height: "4px", borderRadius: "50%", background: "#888", flexShrink: 0 }} />;
}
function CardTitle({ children }: { children: React.ReactNode }) {
  return (
    <p style={{ fontFamily: "var(--font-averia)", fontWeight: 400, fontSize: "20px", lineHeight: "28px", letterSpacing: "-0.4px", color: "#000" }}>
      {children}
    </p>
  );
}
function CardBody({ children }: { children: React.ReactNode }) {
  return (
    <p style={{ fontFamily: "var(--font-dm-sans)", fontWeight: 400, fontSize: "16px", lineHeight: "24px", letterSpacing: "-0.16px", color: "#757575" }}>
      {children}
    </p>
  );
}

// Bordered text header (no bottom border — media sits flush below).
function TextHeader({ tags, title, children }: { tags: string[]; title: string; children: React.ReactNode }) {
  return (
    <div style={{ padding: "20px", border: "1px solid #e6e6e6", borderBottom: "none" }}>
      <div className="flex flex-col gap-6">
        <div className="flex items-center gap-2">
          {tags.map((t, i) => (
            <span key={t} className="flex items-center gap-2">
              {i > 0 && <Dot />}
              <MetaTag>{t}</MetaTag>
            </span>
          ))}
        </div>
        <div className="flex flex-col gap-2">
          <CardTitle>{title}</CardTitle>
          <CardBody>{children}</CardBody>
        </div>
      </div>
    </div>
  );
}

type Exp = React.ComponentProps<typeof ExperimentMedia>["exp"];

// Whole card clickable: a click anywhere forwards to the inner play button
// (skips when the button itself was clicked, to avoid a double open).
function VideoCard({ tags, title, mediaH, exp, children }: {
  tags: string[];
  title: string;
  mediaH: number;
  exp: Exp;
  children: React.ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);
  return (
    <motion.div
      ref={ref}
      {...reveal(0)}
      onClick={(e) => {
        if ((e.target as HTMLElement).closest('button[aria-label="Play video"]')) return;
        ref.current?.querySelector<HTMLButtonElement>('button[aria-label="Play video"]')?.click();
      }}
      className="flex flex-col overflow-hidden cursor-pointer"
      style={{ background: "#fff" }}
    >
      <TextHeader tags={tags} title={title}>{children}</TextHeader>
      <div className="relative overflow-hidden" style={{ height: `${mediaH}px`, background: "#f2f2f2" }}>
        <ExperimentMedia showScrim={false} exp={exp} />
      </div>
    </motion.div>
  );
}

export default function TabletAIExperimentsContent() {
  return (
    <div className="flex flex-col" style={{ gap: "60px" }}>
      {/* Card 0: AI-assisted Dashboard — whole card links to the prototype */}
      <motion.a
        {...reveal(0)}
        href="https://vinoy7.github.io/F360-Dashboard/"
        target="_blank"
        rel="noopener noreferrer"
        className="flex flex-col overflow-hidden cursor-pointer"
        style={{ background: "#fff", textDecoration: "none", color: "inherit" }}
      >
        <TextHeader tags={["Claude Code", "Figma"]} title="AI-assisted Dashboard Prototyping at Fusepay">
          As AI-assisted prototyping becomes a core skill for designers, I experimented with building a
          dashboard for a product we&apos;re developing at Fusepay. Using Figma design and Claude Code, I
          quickly generated a frontend prototype to explore ideas with stakeholders as well as test it
          with power users.
          <br />
          <br />
          <span style={{ color: "#3341c9", fontWeight: 500 }}>Explore the dashboard prototype</span>
        </TextHeader>
        <div className="relative overflow-hidden w-full" style={{ height: "296px", background: "#ebebeb" }}>
          <div className="absolute" style={{ width: "500px", maxWidth: "92%", left: "50%", top: "24px", transform: "translateX(-50%)" }}>
            <Image src={f360DashboardImg} alt="Fuse360 dashboard prototype" className="block w-full h-auto" />
          </div>
        </div>
      </motion.a>

      {/* Card 1: Name My Frame */}
      <VideoCard
        tags={["Claude Code", "Figma Plugin"]}
        title="Name My Frame - Made a Figma Plugin using AI"
        mediaH={344}
        exp={{ src: "/videos/name-my-frame.mp4", poster: nameMyFrameImg.src, alt: "Name My Frame Figma plugin", aspect: 1280 / 760, rate: 1.5 }}
      >
        Personally, I name my frames in the hand-off file in a certain way. It&apos;s been time-consuming
        to name each and every frame, specially where there are more than 100 screens in each hand-off.
        Hence, I built this plugin using Claude Code, where I could select a batch of frames and with a
        click of a button it renames all the frame names in a sequential format.
      </VideoCard>

      {/* Card 2: Mylo's Adventures */}
      <VideoCard
        tags={["Luma Labs", "ChatGPT"]}
        title="Mylo's Adventures - A Tiny Story Brought to Life with AI"
        mediaH={320}
        exp={{ src: "/videos/mylos-adventures.mp4", poster: mylosImg.src, alt: "Mylo's Adventures AI video", aspect: 1280 / 720 }}
      >
        I generated a short children&apos;s story with ChatGPT and used Luma Labs AI to turn it into a
        fully visualized video experience. Watching simple ideas evolve into animated scenes, characters,
        and motion felt surprisingly magical. The audio and video sync still has a few rough edges, but
        that&apos;s part of the fun of experimenting with emerging tools like this. I&apos;m genuinely
        excited by how accessible creative storytelling is becoming.
      </VideoCard>

      {/* Card 3: Grok Imagine — portrait video */}
      <VideoCard
        tags={["Grok Imagine"]}
        title="Turning a One-Line Prompt into a Product Ad"
        mediaH={440}
        exp={{ src: "/videos/grok-ad.mp4", poster: grokImg.src, alt: "Grok product ad", aspect: 704 / 1280 }}
      >
        I created a quick 10-second concept ad using Grok Imagine, built around a snapshot of
        Fusepay&apos;s CTO, Francesco. What surprised me most was how little input it actually took. The
        entire script started as a simple one-line prompt that got straight to the point. Tools like this
        make it much easier to experiment with storytelling, product marketing, and visual concepts
        without needing a full creative production workflow.
      </VideoCard>
    </div>
  );
}

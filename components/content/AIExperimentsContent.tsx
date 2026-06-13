"use client";

import Image from "next/image";
import { motion } from "motion/react";
import nameMyFrameImg from "@/assets/ai-experiments/name-my-frame-screenshot.png";
import mylosImg from "@/assets/ai-experiments/mylos-adventures-screenshot.png";
import grokImg from "@/assets/ai-experiments/grok-ad-screenshot.png";

const revealProps = (delay = 0) => ({
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.1 },
  transition: { duration: 0.6, delay, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] },
});

function MetaTag({ children }: { children: React.ReactNode }) {
  return (
    <span
      style={{
        fontFamily: "var(--font-dm-sans)",
        fontWeight: 500,
        fontSize: "14px",
        lineHeight: "20px",
        color: "#888",
        whiteSpace: "nowrap",
      }}
    >
      {children}
    </span>
  );
}

function Dot() {
  return (
    <span
      style={{
        display: "inline-block",
        width: "4px",
        height: "4px",
        borderRadius: "50%",
        background: "#888",
        flexShrink: 0,
      }}
    />
  );
}

function CardTitle({ children }: { children: React.ReactNode }) {
  return (
    <p
      style={{
        fontFamily: "var(--font-averia)",
        fontWeight: 400,
        fontSize: "28px",
        lineHeight: "36px",
        letterSpacing: "-0.56px",
        color: "#000",
      }}
    >
      {children}
    </p>
  );
}

function CardBody({ children }: { children: React.ReactNode }) {
  return (
    <p
      style={{
        fontFamily: "var(--font-dm-sans)",
        fontWeight: 400,
        fontSize: "19px",
        lineHeight: "28px",
        letterSpacing: "-0.19px",
        color: "#757575",
      }}
    >
      {children}
    </p>
  );
}

export default function AIExperimentsContent() {
  return (
    <div className="flex flex-col" style={{ gap: "87px" }}>
      {/* Card 1: Name My Frame — text top, image bottom (full width) */}
      <motion.div
        {...revealProps(0)}
        className="flex flex-col overflow-hidden"
        style={{ background: "#fff" }}
      >
        {/* Text header */}
        <div
          style={{
            padding: "32px 40px",
            border: "1px solid #e6e6e6",
            borderBottom: "none",
          }}
        >
          <div className="flex flex-col gap-6">
            <div className="flex items-center gap-2">
              <MetaTag>Claude Code</MetaTag>
              <Dot />
              <MetaTag>Figma Plugin</MetaTag>
            </div>
            <div className="flex flex-col gap-2">
              <CardTitle>Name My Frame - Made a Figma Plugin using AI</CardTitle>
              <CardBody>
                Personally, I name my frames in the hand-off file in a certain
                way. It&apos;s been time-consuming to name each and every frame,
                specially where there are more than 100 screens in each
                hand-off. Hence, I built this plugin using Claude Code, where I
                could select a batch of frames and with a click of a button it
                renames all the frame names in a sequential format.
              </CardBody>
            </div>
          </div>
        </div>

        {/* Image */}
        <div
          className="relative overflow-hidden"
          style={{ height: "510px", background: "#f2f2f2" }}
        >
          <div
            className="absolute"
            style={{
              left: "50%",
              top: "50%",
              width: "1069px",
              height: "639px",
              transform: "translate(-50%, -50%)",
            }}
          >
            <Image
              src={nameMyFrameImg}
              alt="Name My Frame Figma plugin"
              fill
              className="object-cover"
            />
          </div>
        </div>
      </motion.div>

      {/* Card 2: Mylo's Adventures — text top, image bottom (full width) */}
      <motion.div
        {...revealProps(0)}
        className="flex flex-col overflow-hidden"
        style={{ background: "#fff" }}
      >
        {/* Text header */}
        <div
          style={{
            padding: "32px 40px",
            border: "1px solid #e6e6e6",
            borderBottom: "none",
          }}
        >
          <div className="flex flex-col gap-6">
            <div className="flex items-center gap-2">
              <MetaTag>Luma Labs</MetaTag>
              <Dot />
              <MetaTag>ChatGPT</MetaTag>
            </div>
            <div className="flex flex-col gap-2">
              <CardTitle>
                {"Mylo's Adventures - A Tiny Story Brought to Life with AI"}
              </CardTitle>
              <CardBody>
                I generated a short children&apos;s story with ChatGPT and used
                Luma Labs AI to turn it into a fully visualized video
                experience. Watching simple ideas evolve into animated scenes,
                characters, and motion felt surprisingly magical. The audio and
                video sync still has a few rough edges, but that&apos;s part of
                the fun of experimenting with emerging tools like this.
                I&apos;m genuinely excited by how accessible creative
                storytelling is becoming.
              </CardBody>
            </div>
          </div>
        </div>

        {/* Image */}
        <div
          className="relative overflow-hidden"
          style={{ height: "510px", background: "#f2f2f2" }}
        >
          <div
            className="absolute"
            style={{
              left: "50%",
              top: "50%",
              width: "1059px",
              height: "633px",
              transform: "translate(-50%, -50%)",
            }}
          >
            <Image
              src={mylosImg}
              alt="Mylo's Adventures AI video"
              fill
              className="object-cover"
            />
          </div>
        </div>
      </motion.div>

      {/* Card 3: Grok Imagine — image left, text right */}
      <motion.div
        {...revealProps(0)}
        className="flex overflow-hidden"
        style={{ background: "#fff", height: "775px" }}
      >
        {/* Image */}
        <div
          className="relative overflow-hidden flex-1"
          style={{ background: "#f2f2f2" }}
        >
          <div
            className="absolute"
            style={{
              left: "calc(50% - 43.5px)",
              top: "-9px",
              width: "646px",
              height: "802px",
              transform: "translateX(-50%)",
            }}
          >
            <Image
              src={grokImg}
              alt="Grok product ad"
              fill
              className="object-cover"
            />
          </div>
        </div>

        {/* Text panel */}
        <div
          style={{
            width: "530px",
            flexShrink: 0,
            padding: "32px 40px",
            border: "1px solid #e6e6e6",
            borderLeft: "none",
          }}
        >
          <div className="flex flex-col gap-6">
            <MetaTag>Grok Imagine</MetaTag>
            <div className="flex flex-col gap-2">
              <CardTitle>Turning a One-Line Prompt into a Product Ad</CardTitle>
              <CardBody>
                I created a quick 10-second concept ad using Grok Imagine,
                built around a snapshot of Fusepay&apos;s CTO, Francesco. What
                surprised me most was how little input it actually took. The
                entire script started as a simple one-line prompt that got
                straight to the point.
              </CardBody>
              <br />
              <CardBody>
                Tools like this make it much easier to experiment with
                storytelling, product marketing, and visual concepts without
                needing a full creative production workflow.
              </CardBody>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

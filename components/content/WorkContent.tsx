"use client";

import Image from "next/image";
import { useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import fusepayImg from "@/assets/work/fusepay-card-image.png";
import connectImg from "@/assets/work/connectandsell-card-image.png";
import coditasBg from "@/assets/work/coditas-bg-gradient.png";
import coditasUi from "@/assets/work/coditas-ui.png";
import weekdayBg from "@/assets/work/weekday-bg-texture.png";
import weekdayUi from "@/assets/work/weekday-ui.png";

const META_STYLE: React.CSSProperties = {
  fontFamily: "var(--font-dm-sans)",
  fontWeight: 500,
  fontSize: "14px",
  lineHeight: "20px",
  color: "#888",
  whiteSpace: "nowrap",
};

const DOT = () => (
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

const DIVIDER = () => (
  <span
    style={{
      display: "inline-block",
      width: "1px",
      height: "16px",
      background: "#d9d9d9",
      borderRadius: "1px",
      flexShrink: 0,
    }}
  />
);

function MetaRow({
  tags,
  date,
}: {
  tags: string[];
  date: string;
}) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center gap-2">
        {tags.map((tag, i) => (
          <span key={tag} className="flex items-center gap-2">
            {i > 0 && <DOT />}
            <span style={META_STYLE}>{tag}</span>
          </span>
        ))}
      </div>
      <DIVIDER />
      <span style={META_STYLE}>{date}</span>
    </div>
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

function CardSubtitle({ children }: { children: React.ReactNode }) {
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

function ViewCaseStudy({ hovered }: { hovered: boolean }) {
  return (
    <div
      style={{ display: "flex", alignItems: "center", gap: "6px", cursor: "pointer", width: "fit-content" }}
    >
      <p
        style={{
          fontFamily: "var(--font-dm-sans)",
          fontWeight: 500,
          fontSize: "19px",
          lineHeight: "28px",
          letterSpacing: "-0.19px",
          color: "#b48a42",
          whiteSpace: "nowrap",
        }}
      >
        View Case Study
      </p>

      <div
        style={{
          position: "relative",
          width: hovered ? "184px" : "28px",
          height: "28px",
          flexShrink: 0,
          transition: "width 0.45s cubic-bezier(0.22, 1, 0.36, 1)",
        }}
      >
        {/* Line — elongates/shrinks; ends just before the chevron */}
        <span
          style={{
            position: "absolute",
            left: 0,
            top: "13.1px",
            right: "6px",
            height: "1.75px",
            borderRadius: "1px",
            background: "#b48a42",
          }}
        />
        {/* Chevron — fixed size, pinned to the line's end */}
        <svg
          width="28"
          height="28"
          viewBox="0 0 28 28"
          fill="none"
          style={{ position: "absolute", right: 0, top: 0 }}
        >
          <path
            d="M17.0013 9.00006C17.0013 9.00006 22.1654 12.1555 22.1654 14.0001C22.1654 15.8447 17.0013 19.5001 17.0013 19.5001"
            stroke="#b48a42"
            strokeWidth="1.75"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
    </div>
  );
}

const CASE_STUDY_LINKS = {
  fusepay: "/designing-trust",
  connectAndSell:
    "https://smoggy-oil-957.notion.site/Creating-an-AI-agent-to-handle-objections-in-a-Sales-tech-software-04b5af75b6a5495a9eb1dc0c5f42a715",
  coditas:
    "https://smoggy-oil-957.notion.site/Creating-Coditas-Internal-L-D-department-product-0609fb2f05ee45eab4a4c867ff5df066",
  weekday:
    "https://smoggy-oil-957.notion.site/Revamping-Interface-for-a-niche-job-recruitment-platform-4807e014f5aa49ce8c39dc004a6e361b",
};

const revealProps = (delay = 0) => ({
  initial: { opacity: 0, y: 56 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.05 },
  transition: { duration: 0.9, delay, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] },
});

// Horizontal reveal — cards slide in from their side (left/right).
const revealX = (dir: "left" | "right", delay = 0, reduce = false) => ({
  initial: reduce ? { opacity: 0 } : { opacity: 0, x: dir === "left" ? -56 : 56 },
  whileInView: { opacity: 1, x: 0 },
  viewport: { once: true, amount: 0.05 },
  transition: { duration: 0.9, delay, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] },
});

const CARD_BORDER = "1px solid #e6e6e6";

export default function WorkContent() {
  const [hovered1, setHovered1] = useState(false);
  const [hovered2, setHovered2] = useState(false);
  const [hovered3, setHovered3] = useState(false);
  const [hovered4, setHovered4] = useState(false);
  const reduce = useReducedMotion() ?? false;

  return (
    <div className="flex flex-col gap-5">
      {/* Card 1: Fusepay — image left, text right */}
      <motion.a
        {...revealProps(0)}
        href={CASE_STUDY_LINKS.fusepay}
        target="_blank"
        rel="noopener noreferrer"
        className="flex overflow-hidden"
        style={{ background: "#fff", /* borderRadius: "12px", */ border: CARD_BORDER, textDecoration: "none", color: "inherit" }}
        onMouseEnter={() => setHovered1(true)}
        onMouseLeave={() => setHovered1(false)}
      >
        {/* Image */}
        <div
          className="relative overflow-hidden flex-1"
          style={{ height: "510px", background: "#f2f2f2" }}
        >
          <Image
            src={fusepayImg}
            alt="Fusepay product"
            fill
            className="object-cover"
          />
        </div>

        {/* Text panel */}
        <div
          className="relative flex flex-col justify-between overflow-hidden"
          style={{
            width: "530px",
            flexShrink: 0,
            padding: "40px 40px 32px 40px",
            borderLeft: "1px solid #e6e6e6",
          }}
        >
          <div className="flex flex-col gap-6">
            <MetaRow tags={["B2B", "FinTech"]} date="Jan 2025 - Present" />
            <div className="flex flex-col gap-2">
              <CardTitle>Designing Trust at Fusepay</CardTitle>
              <CardSubtitle>
                Digitizing a decades-Old B2B Payment Workflow in Seychelles
              </CardSubtitle>
            </div>
          </div>
          <ViewCaseStudy hovered={hovered1} />

          {/* Latest badge */}
          <div
            className="absolute"
            style={{
              top: 0,
              right: 0,
              background: "#f5e7ce",
              padding: "6px 16px",
            }}
          >
            <span
              style={{
                fontFamily: "var(--font-dm-sans)",
                fontWeight: 500,
                fontSize: "14px",
                lineHeight: "20px",
                letterSpacing: "-0.28px",
                color: "#000",
              }}
            >
              Latest
            </span>
          </div>
        </div>
      </motion.a>

      {/* Card 2: ConnectAndSell — text left, image right */}
      <motion.a
        {...revealProps(0.1)}
        href={CASE_STUDY_LINKS.connectAndSell}
        target="_blank"
        rel="noopener noreferrer"
        className="flex overflow-hidden"
        style={{ background: "#fff", /* borderRadius: "12px", */ border: CARD_BORDER, textDecoration: "none", color: "inherit" }}
        onMouseEnter={() => setHovered2(true)}
        onMouseLeave={() => setHovered2(false)}
      >
        {/* Text panel */}
        <div
          className="flex flex-col justify-between overflow-hidden"
          style={{
            width: "530px",
            flexShrink: 0,
            height: "510px",
            padding: "40px 40px 32px 40px",
            borderRight: "1px solid #e6e6e6",
          }}
        >
          <div className="flex flex-col gap-6">
            <MetaRow
              tags={["B2B", "SalesTech", "AI"]}
              date="Mar 2024 - May 2024"
            />
            <div className="flex flex-col gap-2">
              <CardTitle>AI-powered Dialing for ConnectAndSell</CardTitle>
              <CardSubtitle>
                A.I. that listens to the entire conversation, detects
                objections, and suggests responses that a Rep can use to
                possibly convert it into a potential Lead.
              </CardSubtitle>
            </div>
          </div>
          <ViewCaseStudy hovered={hovered2} />
        </div>

        {/* Image */}
        <div
          className="relative overflow-hidden flex-1"
          style={{ height: "510px", background: "#f2f2f2" }}
        >
          <Image
            src={connectImg}
            alt="ConnectAndSell AI dialing"
            fill
            className="object-cover"
          />
        </div>
      </motion.a>

      {/* Cards 3 + 4: equal 2-col grid */}
      <div className="flex gap-5" style={{ overflow: "hidden" }}>
        {/* Card 3: Coditas OneView — slides in from left */}
        <motion.a
          {...revealX("left", 0.15, reduce)}
          href={CASE_STUDY_LINKS.coditas}
          target="_blank"
          rel="noopener noreferrer"
          className="flex flex-col flex-1 overflow-hidden"
          style={{ background: "#fff", /* borderRadius: "12px", */ border: CARD_BORDER, textDecoration: "none", color: "inherit" }}
          onMouseEnter={() => setHovered3(true)}
          onMouseLeave={() => setHovered3(false)}
        >
          {/* Image area */}
          <div
            className="relative overflow-hidden"
            style={{ height: "415px", background: "#f2f2f2", flexShrink: 0 }}
          >
            {/* Gradient bg */}
            <div
              className="absolute"
              style={{
                bottom: 0,
                right: "-1.5px",
                width: "622px",
                height: "415px",
                transform: "rotate(180deg)",
              }}
            >
              <Image
                src={coditasBg}
                alt=""
                fill
                className="object-cover"
              />
            </div>
            {/* UI screenshot */}
            <div
              className="absolute"
              style={{ left: "60px", top: "60px", width: "600px", height: "426px" }}
            >
              <Image src={coditasUi} alt="Coditas OneView UI" fill className="object-cover" />
            </div>
          </div>

          {/* Text panel */}
          <div
            className="flex flex-col flex-1 overflow-hidden"
            style={{
              padding: "40px 40px 32px 40px",
              borderTop: "1px solid #e6e6e6",
              height: "360px",
            }}
          >
            <div className="flex flex-col gap-6">
              <MetaRow tags={["Internal", "EdTech"]} date="Jun 2022 - Apr 2023" />
              <div className="flex flex-col gap-2">
                <CardTitle>{"Coditas' Candidate Tracker"}</CardTitle>
                <CardSubtitle>
                  {"OneView provides the L&D team an overview of the entire candidate tracking process."}
                </CardSubtitle>
              </div>
            </div>
            <div style={{ marginTop: "120px" }}>
              <ViewCaseStudy hovered={hovered3} />
            </div>
          </div>
        </motion.a>

        {/* Card 4: Weekday — slides in from right */}
        <motion.a
          {...revealX("right", 0.2, reduce)}
          href={CASE_STUDY_LINKS.weekday}
          target="_blank"
          rel="noopener noreferrer"
          className="flex flex-col flex-1 overflow-hidden"
          style={{ background: "#fff", /* borderRadius: "12px", */ border: CARD_BORDER, textDecoration: "none", color: "inherit" }}
          onMouseEnter={() => setHovered4(true)}
          onMouseLeave={() => setHovered4(false)}
        >
          {/* Image area */}
          <div
            className="relative overflow-hidden"
            style={{ height: "415px", background: "#f2f2f2", flexShrink: 0 }}
          >
            {/* Texture bg (blurred) */}
            <div
              className="absolute"
              style={{
                left: "-260px",
                top: "-1073px",
                width: "1011px",
                height: "1797px",
                filter: "blur(25px)",
              }}
            >
              <Image src={weekdayBg} alt="" fill className="object-cover" />
            </div>
            {/* UI screenshot */}
            <div
              className="absolute"
              style={{ left: "60px", top: "60px", width: "722px", height: "514px" }}
            >
              <Image src={weekdayUi} alt="Weekday UI" fill className="object-cover" />
            </div>
          </div>

          {/* Text panel */}
          <div
            className="flex flex-col flex-1 overflow-hidden"
            style={{
              padding: "40px 40px 32px 40px",
              borderTop: "1px solid #e6e6e6",
              height: "360px",
            }}
          >
            <div className="flex flex-col gap-6">
              <MetaRow tags={["B2B", "HRTech"]} date="Dec 2022" />
              <div className="flex flex-col gap-2">
                <CardTitle>{"Revamping Weekday's UI"}</CardTitle>
                <CardSubtitle>
                  Revamping Interface for a niche job recruitment platform.
                </CardSubtitle>
              </div>
            </div>
            <div style={{ marginTop: "120px" }}>
              <ViewCaseStudy hovered={hovered4} />
            </div>
          </div>
        </motion.a>
      </div>
    </div>
  );
}

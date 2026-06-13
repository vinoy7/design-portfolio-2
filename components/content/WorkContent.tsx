"use client";

import Image from "next/image";
import { motion } from "motion/react";
import fusepayImg from "@/assets/work/fusepay-card-image.png";
import connectImg from "@/assets/work/connectandsell-card-image.png";
import coditasBg from "@/assets/work/coditas-bg-gradient.png";
import coditasUi from "@/assets/work/coditas-ui.png";
import weekdayBg from "@/assets/work/weekday-bg-texture.png";
import weekdayUi from "@/assets/work/weekday-ui.png";

const CARD_STYLE = {
  fontFamily: "var(--font-dm-sans)",
};

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

function ViewCaseStudy() {
  return (
    <p
      style={{
        fontFamily: "var(--font-dm-sans)",
        fontWeight: 500,
        fontSize: "19px",
        lineHeight: "28px",
        letterSpacing: "-0.19px",
        color: "#b48a42",
        whiteSpace: "nowrap",
        cursor: "pointer",
      }}
    >
      View Case Study →
    </p>
  );
}

const revealProps = (delay = 0) => ({
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.1 },
  transition: { duration: 0.6, delay, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] },
});

export default function WorkContent() {
  return (
    <div className="flex flex-col gap-5">
      {/* Card 1: Fusepay — image left, text right */}
      <motion.div
        {...revealProps(0)}
        className="flex overflow-hidden"
        style={{ background: "#fff" }}
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
            border: "1px solid #e6e6e6",
            borderLeft: "none",
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
          <ViewCaseStudy />

          {/* Latest badge */}
          <div
            className="absolute"
            style={{
              top: "-1px",
              right: "-1px",
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
      </motion.div>

      {/* Card 2: ConnectAndSell — text left, image right */}
      <motion.div
        {...revealProps(0.1)}
        className="flex overflow-hidden"
        style={{ background: "#fff" }}
      >
        {/* Text panel */}
        <div
          className="flex flex-col justify-between overflow-hidden"
          style={{
            width: "530px",
            flexShrink: 0,
            height: "510px",
            padding: "40px 40px 32px 40px",
            border: "1px solid #e6e6e6",
            borderRight: "none",
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
          <ViewCaseStudy />
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
      </motion.div>

      {/* Cards 3 + 4: equal 2-col grid */}
      <div className="flex gap-5">
        {/* Card 3: Coditas OneView */}
        <motion.div
          {...revealProps(0.15)}
          className="flex flex-col overflow-hidden flex-1"
          style={{ background: "#fff", border: "1px solid #e6e6e6" }}
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
            className="flex flex-col justify-between flex-1 overflow-hidden"
            style={{
              padding: "40px 40px 32px 40px",
              borderTop: "1px solid #e6e6e6",
              height: "360px",
            }}
          >
            <div className="flex flex-col gap-6">
              <MetaRow tags={["Internal", "EdTech"]} date="Jun 2022 - Apr 2023" />
              <div className="flex flex-col gap-2">
                <CardTitle>{"Coditas' Internal Candidate Tracker"}</CardTitle>
                <CardSubtitle>
                  {"OneView provides the L&D team an overview of the entire candidate tracking process."}
                </CardSubtitle>
              </div>
            </div>
            <ViewCaseStudy />
          </div>
        </motion.div>

        {/* Card 4: Weekday */}
        <motion.div
          {...revealProps(0.2)}
          className="flex flex-col overflow-hidden flex-1"
          style={{ background: "#fff", border: "1px solid #e6e6e6" }}
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
            className="flex flex-col justify-between flex-1 overflow-hidden"
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
            <ViewCaseStudy />
          </div>
        </motion.div>
      </div>
    </div>
  );
}

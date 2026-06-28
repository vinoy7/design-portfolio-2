"use client";

import Image from "next/image";
import { motion, useReducedMotion } from "motion/react";
import fusepayImg from "@/assets/work/fusepay-card-image.png";
import connectImg from "@/assets/work/connectandsell-card-image.png";
import coditasBg from "@/assets/work/coditas-bg-gradient.png";
import coditasUi from "@/assets/work/coditas-ui.png";
import weekdayBg from "@/assets/work/weekday-bg-texture.png";
import weekdayUi from "@/assets/work/weekday-ui.png";

const CARD_BORDER = "1px solid #e6e6e6";

const META_STYLE: React.CSSProperties = {
  fontFamily: "var(--font-dm-sans)",
  fontWeight: 500,
  fontSize: "13px",
  lineHeight: "20px",
  color: "#888",
  whiteSpace: "nowrap",
};

const DOT = () => (
  <span style={{ display: "inline-block", width: "4px", height: "4px", borderRadius: "50%", background: "#888", flexShrink: 0 }} />
);
const DIVIDER = () => (
  <span style={{ display: "inline-block", width: "1px", height: "16px", background: "#d9d9d9", borderRadius: "1px", flexShrink: 0 }} />
);

function MetaRow({ tags, date }: { tags: string[]; date: string }) {
  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-1.5">
        {tags.map((tag, i) => (
          <span key={tag} className="flex items-center gap-1.5">
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
    <p style={{ fontFamily: "var(--font-averia)", fontWeight: 400, fontSize: "20px", lineHeight: "28px", letterSpacing: "-0.4px", color: "#000" }}>
      {children}
    </p>
  );
}
function CardSubtitle({ children }: { children: React.ReactNode }) {
  return (
    <p style={{ fontFamily: "var(--font-dm-sans)", fontWeight: 400, fontSize: "16px", lineHeight: "24px", letterSpacing: "-0.16px", color: "#757575" }}>
      {children}
    </p>
  );
}

// Static — no hover line extension on tablet (per touch profile).
function ViewCaseStudy() {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "6px", width: "fit-content" }}>
      <p style={{ fontFamily: "var(--font-dm-sans)", fontWeight: 500, fontSize: "16px", lineHeight: "24px", letterSpacing: "-0.16px", color: "#b48a42", whiteSpace: "nowrap" }}>
        View Case Study
      </p>
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none" style={{ flexShrink: 0 }}>
        <path
          d="M21.5807 13.9954L5.83073 13.9954M17 9C17 9 22.1641 12.1554 22.1641 14.0001C22.1641 15.8447 17 19.5 17 19.5"
          stroke="#b48a42"
          strokeWidth="1.75"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
}

function LatestBadge() {
  return (
    <div
      className="absolute"
      style={{
        top: 0,
        right: 0,
        background: "#f5e7ce",
        height: "24px",
        padding: "0 8px",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <span style={{ fontFamily: "var(--font-dm-sans)", fontWeight: 500, fontSize: "12px", lineHeight: "16px", letterSpacing: "-0.24px", color: "#000" }}>
        Latest
      </span>
    </div>
  );
}

const LINKS = {
  fusepay: "/designing-trust",
  connectAndSell:
    "https://smoggy-oil-957.notion.site/Creating-an-AI-agent-to-handle-objections-in-a-Sales-tech-software-04b5af75b6a5495a9eb1dc0c5f42a715",
  coditas:
    "https://smoggy-oil-957.notion.site/Creating-Coditas-Internal-L-D-department-product-0609fb2f05ee45eab4a4c867ff5df066",
  weekday:
    "https://smoggy-oil-957.notion.site/Revamping-Interface-for-a-niche-job-recruitment-platform-4807e014f5aa49ce8c39dc004a6e361b",
};

const reveal = (delay = 0) => ({
  initial: { opacity: 0, y: 56 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.05 },
  transition: { duration: 0.9, delay, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] },
});
const revealX = (dir: "left" | "right", delay = 0, reduce = false) => ({
  initial: reduce ? { opacity: 0 } : { opacity: 0, x: dir === "left" ? -56 : 56 },
  whileInView: { opacity: 1, x: 0 },
  viewport: { once: true, amount: 0.05 },
  transition: { duration: 0.9, delay, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] },
});

// Text panel shared by the full-width rows (cards 1 & 2).
function RowText({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="relative flex flex-col justify-between overflow-hidden"
      style={{ flex: "1 1 0", minWidth: 0, padding: "20px" }}
    >
      {children}
    </div>
  );
}

export default function TabletWorkContent() {
  const reduce = useReducedMotion() ?? false;

  return (
    <div className="flex flex-col gap-5">
      {/* Card 1: Fusepay — image left, text right */}
      <motion.a
        {...reveal(0)}
        href={LINKS.fusepay}
        className="flex overflow-hidden"
        style={{ background: "#fff", border: CARD_BORDER, textDecoration: "none", color: "inherit", height: "284px" }}
      >
        <div className="relative overflow-hidden" style={{ width: "283px", flexShrink: 0, background: "#f2f2f2" }}>
          <Image src={fusepayImg} alt="Fusepay product" fill className="object-cover" />
        </div>
        <RowText>
          <div className="flex flex-col gap-6">
            <MetaRow tags={["B2B", "FinTech"]} date="Jan ’25 - May ’26" />
            <div className="flex flex-col gap-2">
              <CardTitle>Designing Trust at Fusepay</CardTitle>
              <CardSubtitle>Digitizing a decades-Old B2B Payment Workflow in Seychelles</CardSubtitle>
            </div>
          </div>
          <ViewCaseStudy />
          <LatestBadge />
        </RowText>
      </motion.a>

      {/* Card 2: ConnectAndSell — text left, image right */}
      <motion.a
        {...reveal(0.1)}
        href={LINKS.connectAndSell}
        target="_blank"
        rel="noopener noreferrer"
        className="flex overflow-hidden"
        style={{ background: "#fff", border: CARD_BORDER, textDecoration: "none", color: "inherit", height: "284px" }}
      >
        <RowText>
          <div className="flex flex-col gap-6">
            <MetaRow tags={["B2B", "SalesTech", "AI"]} date="Mar ’24 - May ’24" />
            <div className="flex flex-col gap-2">
              <CardTitle>AI-powered Dialing for ConnectAndSell</CardTitle>
              <CardSubtitle>
                A.I. that listens to the entire conversation, detects objections, and suggests responses.
              </CardSubtitle>
            </div>
          </div>
          <ViewCaseStudy />
        </RowText>
        <div className="relative overflow-hidden" style={{ width: "283px", flexShrink: 0, background: "#f2f2f2" }}>
          <Image src={connectImg} alt="ConnectAndSell AI dialing" fill className="object-cover" />
        </div>
      </motion.a>

      {/* Cards 3 + 4: 2-col grid */}
      <div className="flex gap-5" style={{ overflow: "hidden" }}>
        {/* Card 3: Coditas */}
        <motion.a
          {...revealX("left", 0.15, reduce)}
          href={LINKS.coditas}
          target="_blank"
          rel="noopener noreferrer"
          className="flex flex-col flex-1 overflow-hidden"
          style={{ background: "#fff", border: CARD_BORDER, textDecoration: "none", color: "inherit" }}
        >
          <div className="relative overflow-hidden" style={{ height: "230px", background: "#f2f2f2", flexShrink: 0 }}>
            <Image src={coditasBg} alt="" fill className="object-cover" />
            <div className="absolute" style={{ left: "11%", top: "13%", width: "210%", height: "auto" }}>
              <Image src={coditasUi} alt="Coditas OneView UI" className="block w-full h-auto" />
            </div>
          </div>
          <div className="flex flex-col justify-between flex-1" style={{ padding: "20px", minHeight: "284px" }}>
            <div className="flex flex-col gap-6">
              <MetaRow tags={["Internal", "EdTech"]} date="Jun ’22 - Apr ’23" />
              <div className="flex flex-col gap-2">
                <CardTitle>{"Coditas' Candidate Tracker"}</CardTitle>
                <CardSubtitle>{"OneView provides the L&D team an overview of the entire candidate tracking process."}</CardSubtitle>
              </div>
            </div>
            <ViewCaseStudy />
          </div>
        </motion.a>

        {/* Card 4: Weekday */}
        <motion.a
          {...revealX("right", 0.2, reduce)}
          href={LINKS.weekday}
          target="_blank"
          rel="noopener noreferrer"
          className="flex flex-col flex-1 overflow-hidden"
          style={{ background: "#fff", border: CARD_BORDER, textDecoration: "none", color: "inherit" }}
        >
          <div className="relative overflow-hidden" style={{ height: "230px", background: "#f2f2f2", flexShrink: 0 }}>
            <div className="absolute" style={{ inset: 0, filter: "blur(18px)" }}>
              <Image src={weekdayBg} alt="" fill className="object-cover" />
            </div>
            <div className="absolute" style={{ left: "11%", top: "13%", width: "255%", height: "auto" }}>
              <Image src={weekdayUi} alt="Weekday UI" className="block w-full h-auto" />
            </div>
          </div>
          <div className="flex flex-col justify-between flex-1" style={{ padding: "20px", minHeight: "284px" }}>
            <div className="flex flex-col gap-6">
              <MetaRow tags={["B2B", "HRTech"]} date="Dec ’22" />
              <div className="flex flex-col gap-2">
                <CardTitle>{"Revamping Weekday's UI"}</CardTitle>
                <CardSubtitle>Revamping Interface for a niche job recruitment platform.</CardSubtitle>
              </div>
            </div>
            <ViewCaseStudy />
          </div>
        </motion.a>
      </div>
    </div>
  );
}

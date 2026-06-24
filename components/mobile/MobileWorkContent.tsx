"use client";

import Image from "next/image";
import { motion, useReducedMotion } from "motion/react";
import fusepayImg  from "@/assets/work/fusepay-card-image.png";
import connectImg  from "@/assets/work/connectandsell-card-image.png";
import coditasBg   from "@/assets/work/coditas-bg-gradient.png";
import coditasUi   from "@/assets/work/coditas-ui.png";
import weekdayBg   from "@/assets/work/weekday-bg-texture.png";
import weekdayUi   from "@/assets/work/weekday-ui.png";

const CASE_STUDY_LINKS = {
  fusepay:       "/designing-trust",
  connectAndSell:"https://smoggy-oil-957.notion.site/Creating-an-AI-agent-to-handle-objections-in-a-Sales-tech-software-04b5af75b6a5495a9eb1dc0c5f42a715",
  coditas:       "https://smoggy-oil-957.notion.site/Creating-Coditas-Internal-L-D-department-product-0609fb2f05ee45eab4a4c867ff5df066",
  weekday:       "https://smoggy-oil-957.notion.site/Revamping-Interface-for-a-niche-job-recruitment-platform-4807e014f5aa49ce8c39dc004a6e361b",
};

const CARD_BORDER = "1px solid #e6e6e6";

const META: React.CSSProperties = {
  fontFamily: "var(--font-dm-sans)",
  fontWeight: 500,
  fontSize:   "12px",
  lineHeight: "20px",
  color:      "#888",
};

function Dot() {
  return (
    <span style={{ display:"inline-block", width:"4px", height:"4px", borderRadius:"50%", background:"#888", flexShrink:0 }} />
  );
}
function Divider() {
  return (
    <span style={{ display:"inline-block", width:"1px", height:"16px", background:"#d9d9d9", borderRadius:"1px", flexShrink:0 }} />
  );
}

function MetaRow({ tags, date }: { tags: string[]; date: string }) {
  return (
    <div style={{ display:"flex", alignItems:"center", gap:"12px", flexWrap:"wrap" }}>
      <div style={{ display:"flex", alignItems:"center", gap:"8px" }}>
        {tags.map((tag, i) => (
          <span key={tag} style={{ display:"flex", alignItems:"center", gap:"8px" }}>
            {i > 0 && <Dot />}
            <span style={META}>{tag}</span>
          </span>
        ))}
      </div>
      <Divider />
      <span style={META}>{date}</span>
    </div>
  );
}

function CardTitle({ children }: { children: React.ReactNode }) {
  return (
    <p style={{
      fontFamily:    "var(--font-averia)",
      fontWeight:    400,
      fontSize:      "24px",
      lineHeight:    "28px",
      letterSpacing: "-0.44px",
      color:         "#000",
    }}>
      {children}
    </p>
  );
}

function CardSubtitle({ children }: { children: React.ReactNode }) {
  return (
    <p style={{
      fontFamily:    "var(--font-dm-sans)",
      fontWeight:    400,
      fontSize:      "16px",
      lineHeight:    "24px",
      letterSpacing: "-0.16px",
      color:         "#757575",
    }}>
      {children}
    </p>
  );
}

function ViewCaseStudy() {
  return (
    <div style={{ display:"flex", alignItems:"center", gap:"8px" }}>
      <span style={{
        fontFamily:    "var(--font-dm-sans)",
        fontWeight:    500,
        fontSize:      "16px",
        lineHeight:    "24px",
        color:         "#b48a42",
        whiteSpace:    "nowrap",
      }}>
        View Case Study
      </span>
      <svg width="20" height="20" viewBox="0 0 28 28" fill="none">
        <path d="M17 9C17 9 22.165 12.155 22.165 14C22.165 15.845 17 19.5 17 19.5"
          stroke="#b48a42" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
        <line x1="6" y1="14" x2="21" y2="14"
          stroke="#b48a42" strokeWidth="1.75" strokeLinecap="round" />
      </svg>
    </div>
  );
}

const revealProps = (delay = 0, reduce = false) => ({
  initial:     reduce ? { opacity: 0 } : { opacity: 0, y: 40 },
  whileInView: { opacity: 1, y: 0 },
  viewport:    { once: true, amount: 0.05 },
  transition:  { duration: 0.85, delay, ease: [0.22, 1, 0.36, 1] as [number,number,number,number] },
});

interface CardProps {
  href:     string;
  meta:     { tags: string[]; date: string };
  title:    React.ReactNode;
  subtitle: React.ReactNode;
  image:    React.ReactNode;
  badge?:   string;
  delay?:   number;
  reduce?:  boolean;
}

function Card({ href, meta, title, subtitle, image, badge, delay=0, reduce=false }: CardProps) {
  return (
    <motion.a
      {...revealProps(delay, reduce)}
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      style={{
        display:        "flex",
        flexDirection:  "column",
        border:         CARD_BORDER,
        background:     "#fff",
        textDecoration: "none",
        color:          "inherit",
        overflow:       "hidden",
        position:       "relative",
      }}
    >
      {/* Image area */}
      <div style={{ position:"relative", width:"100%", height:"220px", background:"#f2f2f2", flexShrink:0, overflow:"hidden" }}>
        {image}
      </div>

      {/* Text panel */}
      <div style={{ padding:"24px 20px 20px", display:"flex", flexDirection:"column", gap:"12px" }}>
        <MetaRow tags={meta.tags} date={meta.date} />
        <div style={{ display:"flex", flexDirection:"column", gap:"8px" }}>
          <CardTitle>{title}</CardTitle>
          <CardSubtitle>{subtitle}</CardSubtitle>
        </div>
        <div style={{ marginTop:"4px" }}>
          <ViewCaseStudy />
        </div>
      </div>

      {badge && (
        <div style={{ position:"absolute", top:0, right:0, background:"#f5e7ce", padding:"4px 12px", textAlign:"center" }}>
          <span style={{ fontFamily:"var(--font-dm-sans)", fontWeight:500, fontSize:"12px", lineHeight:"20px", color:"#000" }}>
            {badge}
          </span>
        </div>
      )}
    </motion.a>
  );
}

export default function MobileWorkContent() {
  const reduce = useReducedMotion() ?? false;

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:"16px" }}>
      {/* Card 1: Fusepay */}
      <Card
        href={CASE_STUDY_LINKS.fusepay}
        meta={{ tags:["B2B","FinTech"], date:"Jan 2025 - Present" }}
        title="Designing Trust at Fusepay"
        subtitle="Digitizing a decades-Old B2B Payment Workflow in Seychelles"
        badge="Latest"
        delay={0}
        reduce={reduce}
        image={
          <Image src={fusepayImg} alt="Fusepay product" fill className="object-cover" sizes="(max-width:768px) 100vw, 343px" />
        }
      />

      {/* Card 2: ConnectAndSell */}
      <Card
        href={CASE_STUDY_LINKS.connectAndSell}
        meta={{ tags:["B2B","SalesTech","AI"], date:"Mar 2024 - May 2024" }}
        title="AI-powered Dialing for ConnectAndSell"
        subtitle="A.I. that listens to the entire conversation, detects objections, and suggests responses"
        delay={0.05}
        reduce={reduce}
        image={
          <Image src={connectImg} alt="ConnectAndSell" fill className="object-cover" sizes="(max-width:768px) 100vw, 343px" />
        }
      />

      {/* Card 3: Coditas */}
      <Card
        href={CASE_STUDY_LINKS.coditas}
        meta={{ tags:["Internal","EdTech"], date:"Jun 2022 - Apr 2023" }}
        title={"Coditas' Candidate Tracker"}
        subtitle={"OneView provides the L&D team an overview of the entire candidate tracking process."}
        delay={0.1}
        reduce={reduce}
        image={
          <>
            <div style={{ position:"absolute", inset:0 }}>
              <Image src={coditasBg} alt="" fill className="object-cover" sizes="(max-width:768px) 100vw, 343px" />
            </div>
            <div style={{ position:"absolute", left:"30px", top:"20px", width:"400px", height:"285px" }}>
              <Image src={coditasUi} alt="Coditas OneView" fill className="object-cover" sizes="400px" />
            </div>
          </>
        }
      />

      {/* Card 4: Weekday */}
      <Card
        href={CASE_STUDY_LINKS.weekday}
        meta={{ tags:["B2B","HRTech"], date:"Dec 2022" }}
        title={"Revamping Weekday's UI"}
        subtitle="Revamping Interface for a niche job recruitment platform."
        delay={0.15}
        reduce={reduce}
        image={
          <>
            <div style={{ position:"absolute", inset:0, filter:"blur(20px)", transform:"scale(1.1)" }}>
              <Image src={weekdayBg} alt="" fill className="object-cover" sizes="(max-width:768px) 100vw, 343px" />
            </div>
            <div style={{ position:"absolute", left:"20px", top:"20px", width:"460px", height:"328px" }}>
              <Image src={weekdayUi} alt="Weekday UI" fill className="object-cover" sizes="460px" />
            </div>
          </>
        }
      />
    </div>
  );
}

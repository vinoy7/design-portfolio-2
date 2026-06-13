"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { motion } from "motion/react";
import { Play } from "@phosphor-icons/react";
import Matter from "matter-js";
import nameMyFrameImg from "@/assets/ai-experiments/name-my-frame-screenshot.png";
import mylosImg from "@/assets/ai-experiments/mylos-adventures-screenshot.png";
import grokImg from "@/assets/ai-experiments/grok-ad-screenshot.png";

const revealProps = (delay = 0) => ({
  initial: { opacity: 0, y: 56 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.05 },
  transition: { duration: 0.9, delay, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] },
});

function PlayOverlayButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="Play video"
      className="absolute inset-0 flex items-center justify-center group cursor-pointer"
    >
      {/* Contrast scrim — keeps the glass disc legible over any poster, lifts on hover */}
      <span
        aria-hidden
        className="absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100 motion-reduce:transition-none"
        style={{
          background:
            "radial-gradient(120% 120% at 50% 50%, rgba(0,0,0,0.32) 0%, rgba(0,0,0,0.12) 45%, rgba(0,0,0,0) 75%)",
        }}
      />

      {/* Glass disc */}
      <span
        className="relative flex items-center justify-center rounded-full transition-transform duration-300 ease-out group-hover:scale-[1.08] group-active:scale-95 motion-reduce:transition-none motion-reduce:group-hover:scale-100"
        style={{
          width: "86px",
          height: "86px",
          background:
            "linear-gradient(135deg, rgba(255,255,255,0.30), rgba(255,255,255,0.06)), rgba(16,16,18,0.28)",
          backdropFilter: "blur(16px) saturate(160%)",
          WebkitBackdropFilter: "blur(16px) saturate(160%)",
          border: "1px solid rgba(255,255,255,0.38)",
          boxShadow:
            "inset 0 1px 0 rgba(255,255,255,0.55), inset 0 -1px 0 rgba(0,0,0,0.18), 0 16px 48px rgba(0,0,0,0.32)",
        }}
      >
        {/* Expanding ring — one-shot hover cue inviting the click */}
        <span
          aria-hidden
          className="absolute inset-0 rounded-full opacity-70 transition-all duration-500 ease-out group-hover:scale-[1.45] group-hover:opacity-0 motion-reduce:hidden"
          style={{ border: "1px solid rgba(255,255,255,0.6)" }}
        />
        <Play size={32} weight="fill" color="#ffffff" style={{ marginLeft: "-2px" }} />
      </span>
    </button>
  );
}

type Experiment = {
  src: string;
  poster: string;
  alt: string;
  /** intrinsic width / height of the encoded video — drives overlay fit */
  aspect: number;
  rate?: number;
};

/**
 * Matter.js drives the open/close transition. A single body is sprung toward a
 * world anchor (target = 1 open, 0 closed) via a Constraint; we read its
 * position each frame as progress `t` and apply a FLIP transform that morphs
 * the video box from the thumbnail rect to the centered 85vw×85vh overlay.
 * Slightly underdamped → a soft "pop" on open and a smooth recoil on exit.
 */
function ExperimentMedia({ exp }: { exp: Experiment }) {
  const [open, setOpen] = useState(false);

  const imgRef = useRef<HTMLImageElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const backdropRef = useRef<HTMLDivElement | null>(null);
  const thumbRectRef = useRef<DOMRect | null>(null);
  const boxRef = useRef<{ w: number; h: number; left: number; top: number } | null>(null);

  const engineRef = useRef<Matter.Engine | null>(null);
  const bodyRef = useRef<Matter.Body | null>(null);
  const constraintRef = useRef<Matter.Constraint | null>(null);
  const rafRef = useRef<number>(0);
  const targetRef = useRef<number>(0);

  const applyRate = useCallback(() => {
    if (videoRef.current && exp.rate) videoRef.current.playbackRate = exp.rate;
  }, [exp.rate]);

  // Largest box that fits the video's aspect inside 85% of the viewport, centered.
  // The box hugs the video exactly → no letterbox, fills the available space.
  const computeBox = useCallback(() => {
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const maxW = 0.85 * vw;
    const maxH = 0.85 * vh;
    const w = Math.min(maxW, maxH * exp.aspect);
    const h = w / exp.aspect;
    return { w, h, left: (vw - w) / 2, top: (vh - h) / 2 };
  }, [exp.aspect]);

  const applyTransform = useCallback((t: number) => {
    const rect = thumbRectRef.current;
    const box = boxRef.current;
    const vid = videoRef.current;
    if (!rect || !box || !vid) return;
    const boxCenterX = box.left + box.w / 2;
    const boxCenterY = box.top + box.h / 2;
    const thumbCenterX = rect.left + rect.width / 2;
    const thumbCenterY = rect.top + rect.height / 2;
    const sx = rect.width / box.w;
    const sy = rect.height / box.h;
    const scaleX = sx + (1 - sx) * t;
    const scaleY = sy + (1 - sy) * t;
    const tx = (thumbCenterX - boxCenterX) * (1 - t);
    const ty = (thumbCenterY - boxCenterY) * (1 - t);
    vid.style.transform = `translate(${tx}px, ${ty}px) scale(${scaleX}, ${scaleY})`;
    vid.style.opacity = String(Math.min(1, 0.25 + 0.75 * t));
    if (backdropRef.current) backdropRef.current.style.opacity = String(Math.min(1, t));
  }, []);

  const tick = useCallback(() => {
    const engine = engineRef.current;
    const body = bodyRef.current;
    if (!engine || !body) return;
    Matter.Engine.update(engine, 1000 / 60);
    const t = Math.max(0, body.position.x);
    applyTransform(t);
    const settled =
      Math.abs(t - targetRef.current) < 0.003 && Math.abs(body.velocity.x) < 0.003;
    if (settled) {
      applyTransform(targetRef.current);
      rafRef.current = 0;
      if (targetRef.current === 0) setOpen(false);
    } else {
      rafRef.current = requestAnimationFrame(tick);
    }
  }, [applyTransform]);

  const retarget = useCallback(
    (to: number) => {
      targetRef.current = to;
      if (constraintRef.current) constraintRef.current.pointA = { x: to, y: 0 };
      if (!rafRef.current) rafRef.current = requestAnimationFrame(tick);
    },
    [tick]
  );

  const openModal = () => {
    if (imgRef.current) thumbRectRef.current = imgRef.current.getBoundingClientRect();
    setOpen(true);
  };

  const closeModal = useCallback(() => retarget(0), [retarget]);

  // Spin up the physics world + listeners once the overlay mounts.
  useEffect(() => {
    if (!open) return;

    const engine = Matter.Engine.create();
    engine.gravity.x = 0;
    engine.gravity.y = 0;
    const body = Matter.Bodies.circle(0, 0, 10, { frictionAir: 0.16 });
    const constraint = Matter.Constraint.create({
      pointA: { x: 0, y: 0 },
      bodyB: body,
      stiffness: 0.038,
      damping: 0.072,
      length: 0,
    });
    Matter.Composite.add(engine.world, [body, constraint]);
    engineRef.current = engine;
    bodyRef.current = body;
    constraintRef.current = constraint;

    // Size + position the video box to the video's own aspect (no letterbox).
    const box = computeBox();
    boxRef.current = box;
    const vid = videoRef.current;
    if (vid) {
      vid.style.left = `${box.left}px`;
      vid.style.top = `${box.top}px`;
      vid.style.width = `${box.w}px`;
      vid.style.height = `${box.h}px`;
    }

    applyTransform(0);
    retarget(1);

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeModal();
    };
    window.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = 0;
      Matter.World.clear(engine.world, false);
      Matter.Engine.clear(engine);
      engineRef.current = null;
      bodyRef.current = null;
      constraintRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  return (
    <>
      {/* Inline thumbnail (poster + play button, no autoplay) */}
      <img
        ref={imgRef}
        src={exp.poster}
        alt={exp.alt}
        className="absolute inset-0 object-cover"
        style={{ width: "100%", height: "100%" }}
        draggable={false}
        onContextMenu={(e) => e.preventDefault()}
      />
      <PlayOverlayButton onClick={openModal} />

      {/* Magnified overlay — transition driven by Matter.js.
          Portaled to <body> so position:fixed escapes the card's transformed
          ancestor (a transform on any ancestor would otherwise make `fixed`
          relative to the card, not the viewport). */}
      {open &&
        createPortal(
          <div
            ref={backdropRef}
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{
            opacity: 0,
            background: "rgba(0,0,0,0.55)",
            backdropFilter: "blur(18px) saturate(120%)",
            WebkitBackdropFilter: "blur(18px) saturate(120%)",
          }}
          onClick={closeModal}
        >
          {/* Close */}
          <button
            type="button"
            aria-label="Close video"
            onClick={closeModal}
            className="absolute flex items-center justify-center"
            style={{
              top: "28px",
              right: "28px",
              width: "44px",
              height: "44px",
              borderRadius: "50%",
              background: "rgba(255,255,255,0.12)",
              border: "1px solid rgba(255,255,255,0.25)",
              cursor: "pointer",
              zIndex: 1,
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
              <path d="M6 6l12 12M18 6L6 18" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>

          <video
            ref={videoRef}
            src={exp.src}
            poster={exp.poster}
            autoPlay
            controls
            playsInline
            controlsList="nodownload noremoteplayback"
            disablePictureInPicture
            onContextMenu={(e) => e.preventDefault()}
            onLoadedMetadata={applyRate}
            onPlay={applyRate}
            onClick={(e) => e.stopPropagation()}
            style={{
              position: "fixed",
              objectFit: "cover",
              transformOrigin: "50% 50%",
              willChange: "transform, opacity",
              opacity: 0,
              borderRadius: "12px",
              background: "#000",
              outline: "none",
            }}
          />
          </div>,
          document.body
        )}
    </>
  );
}

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
      {/* Card 1: Name My Frame — text top, video bottom (full width) */}
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

        {/* Video */}
        <div
          className="relative overflow-hidden"
          style={{ height: "510px", background: "#f2f2f2" }}
        >
          <ExperimentMedia
            exp={{
              src: "/videos/name-my-frame.mp4",
              poster: nameMyFrameImg.src,
              alt: "Name My Frame Figma plugin",
              aspect: 1280 / 760,
              rate: 1.5,
            }}
          />
        </div>
      </motion.div>

      {/* Card 2: Mylo's Adventures — text top, video bottom (full width) */}
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

        {/* Video */}
        <div
          className="relative overflow-hidden"
          style={{ height: "510px", background: "#f2f2f2" }}
        >
          <ExperimentMedia
            exp={{
              src: "/videos/mylos-adventures.mp4",
              poster: mylosImg.src,
              alt: "Mylo's Adventures AI video",
              aspect: 1280 / 720,
            }}
          />
        </div>
      </motion.div>

      {/* Card 3: Grok Imagine — video left, text right */}
      <motion.div
        {...revealProps(0)}
        className="flex overflow-hidden"
        style={{ background: "#fff", height: "775px" }}
      >
        {/* Video */}
        <div
          className="relative overflow-hidden flex-1"
          style={{ background: "#f2f2f2" }}
        >
          <ExperimentMedia
            exp={{
              src: "/videos/grok-ad.mp4",
              poster: grokImg.src,
              alt: "Grok product ad",
              aspect: 704 / 1280,
            }}
          />
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

"use client";

import { useCallback, useEffect, useRef } from "react";
import { useReducedMotion, useScroll, useMotionValueEvent } from "motion/react";
import parasAryaPhoto    from "@/assets/about-me/testimonials/paras-arya.png";
import kenRodriguesPhoto from "@/assets/about-me/testimonials/ken-rodrigues.png";
import shivamDewanPhoto  from "@/assets/about-me/testimonials/shivam-dewan.png";
import francescoRocchiPhoto from "@/assets/about-me/testimonials/francesco-rocchi.png";

interface PhotoCrop {
  src: { src: string };
  inner: React.CSSProperties;
  img:   React.CSSProperties;
}

interface Testimonial {
  id:    string;
  quote: string;
  name:  string;
  role:  string;
  photo?: PhotoCrop;
}

const TESTIMONIALS: Testimonial[] = [
  {
    id:    "paras",
    quote: "Vinoy is a great team player, very proactive and full of good ideas. We hired him for framer implementation, which he did eloquently well and also contributed a lot to design of the product as well. Highly recommended.",
    name:  "Paras Arya",
    role:  "(Co-Founder, Design Originals Club)",
    photo: {
      src: parasAryaPhoto,
      inner: { position: "absolute", bottom: "-95px", right: 0, width: "291px", height: "300px" },
      img:   { position: "absolute", width: "103.09%", height: "100%", left: 0, top: 0, maxWidth: "none" },
    },
  },
  {
    id:    "ken",
    quote: "Vinoy has been a key part of multiple projects I've led, always contributes greatly to the success of each. He follows instructions carefully and delivers all his work on time. His attention to detail and dedication makes him a reliable team member who is always willing to go the extra mile. Vinoy is an asset to any team that he is a part of, and I've enjoyed working with him.",
    name:  "Ken Rodrigues",
    role:  "(Ex-Senior UX Designer, Coditas)",
    photo: {
      src: kenRodriguesPhoto,
      inner: { position: "absolute", bottom: 0, right: 0, width: "199px", height: "199px" },
      img:   { position: "absolute", width: "104.49%", height: "104.49%", left: 0, top: "-4.49%", maxWidth: "none" },
    },
  },
  {
    id:    "shivam",
    quote: "Vinoy is a quick learner and always up to new challenges. He first tries to understand the problem from the ground then only gets to the pixel. He's good at insight gathering, talking to users, rapid wireframing, which is excellent for a designer. He's always open to feedback takes constructive criticism. I wish him all the best :)",
    name:  "Shivam Dewan",
    role:  "(Ex-Lead Designer, Being)",
    photo: {
      src: shivamDewanPhoto,
      inner: { position: "absolute", bottom: 0, right: 0, width: "199px", height: "199px" },
      img:   { position: "absolute", width: "245.85%", height: "327.6%", left: "-65.01%", top: "-87.1%", maxWidth: "none" },
    },
  },
  {
    id:    "francesco",
    quote: "Across all our products, Vinoy made sure what got built actually matched what was designed. Vinoy would bring a perspective that's not just 'how does this look' but 'why are we doing it this way'. Apart from the work, he genuinely lifts the energy of a team. He's one of those people you actually look forward to jumping on a call with. That especially matters in a team that works remotely. If you get the chance to work with him, take it.",
    name:  "Francesco Rocchi",
    role:  "(Co-founder & CTO, Fusepay)",
    photo: {
      src: francescoRocchiPhoto,
      inner: { position: "absolute", bottom: 0, right: 0, width: "199px", height: "199px" },
      img:   { position: "absolute", width: "139.13%", height: "139.13%", left: "-15.48%", top: "-39.13%", maxWidth: "none" },
    },
  },
];

// Stack positions front → back
const POSITIONS = [
  { r: 0,    s: 1,    z: 4 },
  { r: -7.5, s: 0.97, z: 3 },
  { r: 6.4,  s: 0.94, z: 2 },
  { r: -4.3, s: 0.91, z: 1 },
];

const EASE = "cubic-bezier(0.23, 1, 0.32, 1)";

// Entrance ("perpendicular drop") — now scroll-scrubbed inside a pinned section.
// Cards fall along the view axis: start oversized + blurred + transparent (high
// above the surface, out of focus) and settle to their resting fan as the scroll
// wheel drives progress 0→1. Plays once per page load (survives tab remounts).
let hasPlayed = false;                              // module-scoped: persists across remounts
const CARD_W           = 600;                       // px, card width (matches markup)
const START_BLUR_SCRUB = 24;                        // px, start blur (lower than one-shot for per-frame cost)
const DROP_VH          = 100;                        // extra track height beyond 100vh → ~1 screen of scrub
const LAND_END         = 0.85;                       // front card fully landed at 85% progress; tail to settle
const WINDOW           = 0.5;                        // each card's drop spans 50% of progress
const STAGGER_P        = 0.08;                       // progress gap between cards (back leads)
const FAR_SHADOW   = "0px 40px 80px 0px rgba(0,0,0,0.04)";       // diffuse, mid-fall
const REST_SHADOW  = "0px 1.652px 33.037px 0px rgba(0,0,0,0.1)"; // matches card boxShadow

const lerp    = (a: number, b: number, t: number) => a + (b - a) * t;
const easeOut = (t: number) => 1 - (1 - t) ** 3;
const clamp01 = (t: number) => Math.min(1, Math.max(0, t));

export default function Testimonials() {
  const stackRef     = useRef<HTMLDivElement>(null);
  const trackRef     = useRef<HTMLDivElement>(null);
  const headingRef   = useRef<HTMLParagraphElement>(null);
  const cardRefs     = useRef<(HTMLDivElement | null)[]>([null, null, null, null]);
  // testimonial indices, front-first: Shivam, Ken, Paras, Francesco
  const orderRef     = useRef([2, 1, 0, 3]);
  const lockedRef    = useRef(false);
  const committedRef = useRef(false);
  const reduce       = useReducedMotion();

  // Apply the resting fan to every card (front-first).
  const applyStack = useCallback((withTransition: boolean) => {
    orderRef.current.forEach((tIdx, stackPos) => {
      const card = cardRefs.current[tIdx];
      if (!card) return;
      const pos = POSITIONS[stackPos];
      card.style.transition    = withTransition
        ? `transform 320ms ${EASE}, box-shadow 320ms ease`
        : "none";
      card.style.transform     = [
        "translateX(-50%)",
        "translateY(-50%)",
        `rotate(${pos.r}deg)`,
        `scale(${pos.s})`,
      ].join(" ");
      card.style.zIndex        = String(pos.z);
      card.style.pointerEvents = stackPos === 0 ? "auto" : "none";
      card.style.cursor        = stackPos === 0 ? "grab" : "default";
    });
  }, []);

  // Snap fully visible: resting fan, heading sharp, drag-ready.
  const settle = useCallback(() => {
    applyStack(false);
    const h = headingRef.current;
    if (h) { h.style.transition = "none"; h.style.opacity = "1"; h.style.filter = "blur(0px)"; }
    orderRef.current.forEach((tIdx) => {
      const card = cardRefs.current[tIdx];
      if (!card) return;
      card.style.filter    = "blur(0px)";
      card.style.opacity   = "1";
      card.style.boxShadow = REST_SHADOW;
    });
  }, [applyStack]);

  // Hand control to the drag system once the cards have landed.
  const commit = useCallback(() => {
    if (committedRef.current) return;
    committedRef.current = true;
    hasPlayed = true;            // no re-scrub on later Work-tab visits
    lockedRef.current = false;   // release drag / keyboard
    settle();
  }, [settle]);

  // Pre-scrub pose: cards held high above the surface, out of focus, transparent.
  const applyStart = useCallback(() => {
    const startScale = (window.innerWidth * 2) / CARD_W;
    const h = headingRef.current;
    if (h) { h.style.transition = "none"; h.style.opacity = "0"; h.style.filter = "blur(6px)"; }
    orderRef.current.forEach((tIdx, stackPos) => {
      const card = cardRefs.current[tIdx];
      if (!card) return;
      const pos = POSITIONS[stackPos];
      card.style.transition    = "none";
      card.style.transform     = [
        "translateX(-50%)",
        "translateY(-50%)",
        `rotate(${pos.r}deg)`,
        `scale(${startScale})`,
      ].join(" ");
      card.style.filter        = `blur(${START_BLUR_SCRUB}px)`;
      card.style.opacity       = "0";
      card.style.boxShadow     = FAR_SHADOW;
      card.style.zIndex        = String(pos.z);
      card.style.pointerEvents = "none";
      card.style.cursor        = "default";
      card.style.willChange    = "transform, filter, opacity";
    });
  }, []);

  // Drive the fall from scroll progress (0 = pin begins, 1 = pin ends).
  // No CSS transition while scrubbing, so scroll-up reverses 1:1 with the wheel.
  const renderScrub = useCallback((p: number) => {
    if (committedRef.current || reduce || hasPlayed) return;
    const startScale = (window.innerWidth * 2) / CARD_W;

    // Heading is decoupled from the scrub — it fades in on viewport entry
    // (IntersectionObserver in the effect below), not on scroll progress.

    orderRef.current.forEach((tIdx, stackPos) => {
      const card = cardRefs.current[tIdx];
      if (!card) return;
      const pos    = POSITIONS[stackPos];
      const endP   = LAND_END - stackPos * STAGGER_P;  // front (stackPos 0) lands last
      const startP = endP - WINDOW;
      const lp     = easeOut(clamp01((p - startP) / (endP - startP)));
      card.style.transition    = "none";
      card.style.transform     = [
        "translateX(-50%)",
        "translateY(-50%)",
        `rotate(${pos.r}deg)`,
        `scale(${lerp(startScale, pos.s, lp)})`,
      ].join(" ");
      card.style.filter        = `blur(${lerp(START_BLUR_SCRUB, 0, lp)}px)`;
      card.style.opacity       = String(lp);
      card.style.boxShadow     = lp > 0.85 ? REST_SHADOW : FAR_SHADOW;
      card.style.zIndex        = String(pos.z);
      card.style.pointerEvents = "none";
    });

    if (p >= 0.999) commit();
  }, [reduce, commit]);

  const animateScrub = !reduce && !hasPlayed;

  // Only bind the target ref when the tracked element (the tall track div)
  // actually renders. On the reduced-motion / already-played path the track is
  // absent, so passing trackRef would leave it unhydrated → motion throws
  // "Target ref is defined but not hydrated". Empty opts → harmless page scroll
  // (renderScrub is a no-op via committedRef on that path).
  const { scrollYProgress } = useScroll(
    animateScrub
      ? { target: trackRef, offset: ["start start", "end end"] }
      : {}
  );
  useMotionValueEvent(scrollYProgress, "change", renderScrub);

  useEffect(() => {
    // --- Entrance state -----------------------------------------------------
    if (reduce || hasPlayed) {
      committedRef.current = true;   // renderScrub becomes a no-op
      lockedRef.current    = false;  // drag enabled immediately
      settle();
    } else {
      committedRef.current = false;
      lockedRef.current    = true;   // block drag/keyboard advance until landed
      applyStart();
      renderScrub(scrollYProgress.get()); // catch up to current scroll position
    }

    // --- Heading: fade in on viewport entry (decoupled from the scrub) -------
    // Appears as soon as the title scrolls into view from the bottom — well
    // before the section pins — so it's up much quicker than the old 0→0.22
    // scroll-progress gate. One-way: observer disconnects after firing.
    let headingObserver: IntersectionObserver | null = null;
    if (!reduce && !hasPlayed) {
      const h = headingRef.current;
      if (h) {
        headingObserver = new IntersectionObserver(
          (entries) => {
            if (entries[0].isIntersecting) {
              h.style.transition = "opacity 600ms ease-out, filter 600ms ease-out";
              h.style.opacity    = "1";
              h.style.filter     = "blur(0px)";
              headingObserver?.disconnect();
              headingObserver = null;
            }
          },
          { threshold: 0.01 }
        );
        headingObserver.observe(h);
      }
    }

    const stackEl = stackRef.current;
    if (!stackEl) { headingObserver?.disconnect(); return; }

    // --- Drag: throw the front card to the back ------------------------------
    function sendToBack() {
      if (lockedRef.current) return;
      lockedRef.current = true;

      const frontIdx = orderRef.current[0];
      const front    = cardRefs.current[frontIdx];
      if (!front) { lockedRef.current = false; return; }

      const backPos = POSITIONS[POSITIONS.length - 1];
      front.style.zIndex     = "0";
      front.style.transition = `transform 340ms ${EASE}`;
      front.style.transform  = [
        "translateX(-50%)",
        "translateY(-50%)",
        `rotate(${backPos.r}deg)`,
        `scale(${backPos.s})`,
      ].join(" ");

      setTimeout(() => {
        orderRef.current.push(orderRef.current.shift()!);
        applyStack(true);
        setTimeout(() => { lockedRef.current = false; }, 340);
      }, 340);
    }

    const drag = { active: false, startX: 0, startY: 0, startTime: 0, dx: 0, dy: 0 };

    function onMove(e: MouseEvent | TouchEvent) {
      if (!drag.active) return;
      if (e.cancelable) e.preventDefault();
      const pt = "touches" in e ? (e as TouchEvent).touches[0] : (e as MouseEvent);
      drag.dx  = pt.clientX - drag.startX;
      drag.dy  = pt.clientY - drag.startY;
      // Tilt relative to the front card's resting rotation so grabbing it
      // doesn't snap from POSITIONS[0].r to 0.
      const rot   = POSITIONS[0].r + Math.max(-18, Math.min(18, drag.dx * 0.07));
      const front = cardRefs.current[orderRef.current[0]];
      if (front) {
        front.style.transform = [
          `translateX(calc(-50% + ${drag.dx}px))`,
          `translateY(calc(-50% + ${drag.dy}px))`,
          `rotate(${rot}deg)`,
        ].join(" ");
      }
    }

    function onUp() {
      if (!drag.active) return;
      drag.active = false;
      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseup",   onUp);
      document.removeEventListener("touchmove", onMove);
      document.removeEventListener("touchend",  onUp);
      document.body.style.userSelect = "";

      const elapsed  = Math.max(1, Date.now() - drag.startTime);
      const dist     = Math.sqrt(drag.dx ** 2 + drag.dy ** 2);
      const velocity = dist / elapsed;
      const front    = cardRefs.current[orderRef.current[0]];

      if (dist < 28 && velocity < 0.3) {
        if (front) {
          front.style.transition = `transform 380ms ${EASE}`;
          front.style.transform  = `translateX(-50%) translateY(-50%) rotate(${POSITIONS[0].r}deg) scale(1)`;
          front.style.cursor     = "grab";
        }
      } else {
        sendToBack();
      }
    }

    function onDown(e: MouseEvent | TouchEvent) {
      if (lockedRef.current) return;
      if (e instanceof MouseEvent && e.button !== 0) return;
      const pt = "touches" in e ? (e as TouchEvent).touches[0] : (e as MouseEvent);
      drag.active    = true;
      drag.startX    = pt.clientX;
      drag.startY    = pt.clientY;
      drag.startTime = Date.now();
      drag.dx = drag.dy = 0;

      const front = cardRefs.current[orderRef.current[0]];
      if (front) {
        front.style.transition = "none";
        front.style.cursor     = "grabbing";
      }
      document.body.style.userSelect = "none";

      document.addEventListener("mousemove", onMove);
      document.addEventListener("mouseup",   onUp);
      document.addEventListener("touchmove", onMove, { passive: false });
      document.addEventListener("touchend",  onUp);
    }

    function onKeyDown(e: KeyboardEvent) {
      if (e.key !== " " && e.key !== "Enter" && e.key !== "ArrowRight") return;
      e.preventDefault();
      drag.dx = 200; drag.dy = 0;
      sendToBack();
    }

    stackEl.addEventListener("mousedown",  onDown as EventListener);
    stackEl.addEventListener("touchstart", onDown as EventListener, { passive: false });
    stackEl.addEventListener("keydown",    onKeyDown);

    return () => {
      headingObserver?.disconnect();
      stackEl.removeEventListener("mousedown",  onDown as EventListener);
      stackEl.removeEventListener("touchstart", onDown as EventListener);
      stackEl.removeEventListener("keydown",    onKeyDown);
    };
  }, [reduce, applyStart, settle, renderScrub, applyStack, scrollYProgress]);

  // Heading + card stack — shared by both layouts.
  const inner = (
    <>
      {/* Heading */}
      <p
        ref={headingRef}
        style={{
          fontFamily:    "var(--font-averia)",
          fontWeight:    400,
          fontSize:      "40px",
          lineHeight:    "48px",
          letterSpacing: "-0.8px",
          color:         "#000",
          textAlign:     "center",
          whiteSpace:    "nowrap",
        }}
      >
        What&apos;s it like working with me?
      </p>

      {/* Card stack */}
      <div
        ref={stackRef}
        style={{ position: "relative", width: "600px", height: "446px" }}
        role="region"
        aria-label="Testimonials"
        tabIndex={0}
      >
        {TESTIMONIALS.map((t, i) => {
          // Compute initial stack position so cards are correctly placed from
          // first paint — before the useEffect runs. Without this, all cards
          // sit at raw left:50%/top:50% (no centering translate) and pile up
          // in the bottom-right of the stack div (Francesco visible on top via
          // DOM order).
          const initStackPos = orderRef.current.indexOf(i);
          const initPos      = POSITIONS[initStackPos];
          return (
          <div
            key={t.id}
            ref={(el) => { cardRefs.current[i] = el; }}
            style={{
              position:       "absolute",
              top:            "50%",
              left:           "50%",
              width:          "600px",
              minHeight:      t.id === "ken" ? "348px" : t.id === "shivam" ? "348px" : t.id === "francesco" ? "400px" : "336px",
              background:     "#fff",
              boxShadow:      "0px 1.652px 33.037px 0px rgba(0,0,0,0.1)",
              overflow:       "hidden",
              padding:        "33px",
              userSelect:     "none",
              WebkitUserSelect: "none",
              display:        "flex",
              flexDirection:  "column",
              justifyContent: "space-between",
              gap:            "24px",
              willChange:     "transform",
              transform:      `translateX(-50%) translateY(-50%) rotate(${initPos.r}deg) scale(${initPos.s})`,
              zIndex:         String(initPos.z),
              opacity:        animateScrub ? 0 : 1,
              pointerEvents:  initStackPos === 0 ? "auto" : "none",
              cursor:         initStackPos === 0 ? "grab" : "default",
            }}
          >
            {/* Quote */}
            <p
              style={{
                fontFamily: "var(--font-dm-sans)",
                fontWeight: 400,
                fontSize:   "18px",
                lineHeight: "26px",
                color:      "#797979",
                flex:       1,
              }}
            >
              &ldquo;{t.quote}&rdquo;
            </p>

            {/* Attribution */}
            <div className="flex flex-col gap-1">
              <p
                style={{
                  fontFamily:    "var(--font-dm-sans)",
                  fontWeight:    500,
                  fontSize:      "20px",
                  lineHeight:    "26px",
                  letterSpacing: "-0.2px",
                  color:         "#000",
                }}
              >
                {t.name}
              </p>
              <p
                style={{
                  fontFamily: "var(--font-dm-sans)",
                  fontWeight: 400,
                  fontSize:   "16px",
                  lineHeight: "23px",
                  color:      "#797979",
                }}
              >
                {t.role}
              </p>
            </div>

            {/* Person photo — cropped bottom-right per Figma specs */}
            {t.photo && (
              <div
                style={{
                  position:      "absolute",
                  right:         0,
                  bottom:        0,
                  width:         "199px",
                  height:        "205px",
                  overflow:      "hidden",
                  pointerEvents: "none",
                }}
              >
                <div style={t.photo.inner}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={t.photo.src.src} alt="" style={t.photo.img} />
                </div>
              </div>
            )}
          </div>
          );
        })}
      </div>
    </>
  );

  // Scrub path: tall track + sticky stage pins the section while the wheel
  // drives the fall. Reduced-motion / already-played: plain centered layout,
  // no track, no dead scroll.
  return animateScrub ? (
    <div ref={trackRef} style={{ position: "relative", height: `calc(100vh + ${DROP_VH}vh)` }}>
      <div
        style={{
          position:       "sticky",
          top:            0,
          height:         "100vh",
          // Full-bleed: span the viewport width so the oversized falling cards
          // clip at the screen edges (invisible) instead of the 1041px container.
          width:          "100vw",
          marginLeft:     "calc(50% - 50vw)",
          overflow:       "hidden",
          display:        "flex",
          flexDirection:  "column",
          alignItems:     "center",
          justifyContent: "center",
          gap:            "64px",
        }}
      >
        {inner}
      </div>
    </div>
  ) : (
    <div className="flex flex-col items-center gap-16">
      {inner}
    </div>
  );
}

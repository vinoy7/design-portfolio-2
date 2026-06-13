"use client";

import { useEffect, useRef } from "react";
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
    quote: "Across all our products, Vinoy made sure what got built actually matched what was designed. Vinoy would bring a perspective that's not just 'how does this look' but 'why are we doing it this way'. He helped plan and assign tasks to developers; helped them through the smallest of doubts. Apart from the work, he genuinely lifts the energy of a team. He's one of those people you actually look forward to jumping on a call with. That especially matters in a team that works remotely. If you get the chance to work with him, take it.",
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
  { r: -5.5, s: 0.97, z: 3 },
  { r: 4.4,  s: 0.94, z: 2 },
  { r: -2.3, s: 0.91, z: 1 },
];

const EASE = "cubic-bezier(0.23, 1, 0.32, 1)";

export default function Testimonials() {
  const stackRef  = useRef<HTMLDivElement>(null);
  const cardRefs  = useRef<(HTMLDivElement | null)[]>([null, null, null, null]);
  const orderRef  = useRef([0, 1, 2, 3]); // testimonial indices, front-first
  const lockedRef = useRef(false);

  useEffect(() => {
    function applyStack(withTransition: boolean) {
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
        card.style.pointerEvents = stackPos === 0 ? "auto"    : "none";
        card.style.cursor        = stackPos === 0 ? "grab"    : "default";
      });
    }

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

    applyStack(false);

    const stackEl = stackRef.current;
    if (!stackEl) return;

    const drag = { active: false, startX: 0, startY: 0, startTime: 0, dx: 0, dy: 0 };

    function onMove(e: MouseEvent | TouchEvent) {
      if (!drag.active) return;
      if (e.cancelable) e.preventDefault();
      const pt = "touches" in e ? (e as TouchEvent).touches[0] : (e as MouseEvent);
      drag.dx  = pt.clientX - drag.startX;
      drag.dy  = pt.clientY - drag.startY;
      const rot   = Math.max(-18, Math.min(18, drag.dx * 0.07));
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
          front.style.transform  = "translateX(-50%) translateY(-50%) rotate(0deg) scale(1)";
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
      stackEl.removeEventListener("mousedown",  onDown as EventListener);
      stackEl.removeEventListener("touchstart", onDown as EventListener);
      stackEl.removeEventListener("keydown",    onKeyDown);
    };
  }, []);

  return (
    <div className="flex flex-col items-center gap-16">
      {/* Heading */}
      <p
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
        {TESTIMONIALS.map((t, i) => (
          <div
            key={t.id}
            ref={(el) => { cardRefs.current[i] = el; }}
            style={{
              position:       "absolute",
              top:            "50%",
              left:           "50%",
              width:          "600px",
              minHeight:      "336px",
              background:     "#fff",
              boxShadow:      "0px 1.652px 33.037px 0px rgba(0,0,0,0.1)",
              overflow:       "hidden",
              padding:        "33px",
              display:        "flex",
              flexDirection:  "column",
              justifyContent: "space-between",
              gap:            "24px",
              willChange:     "transform",
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
        ))}
      </div>
    </div>
  );
}

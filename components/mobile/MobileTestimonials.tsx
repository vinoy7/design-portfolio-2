"use client";

import { useCallback, useEffect, useRef } from "react";
import { useReducedMotion } from "motion/react";
import parasAryaPhoto     from "@/assets/about-me/testimonials/paras-arya.png";
import kenRodriguesPhoto  from "@/assets/about-me/testimonials/ken-rodrigues.png";
import shivamDewanPhoto   from "@/assets/about-me/testimonials/shivam-dewan.png";
import francescoRocchiPhoto from "@/assets/about-me/testimonials/francesco-rocchi.png";

const TESTIMONIALS = [
  {
    id:    "paras",
    quote: "Vinoy is a great team player, very proactive and full of good ideas. We hired him for framer implementation, which he did eloquently well and also contributed a lot to design of the product as well. Highly recommended.",
    name:  "Paras Arya",
    role:  "Co-Founder, Design Originals Club",
    photo: parasAryaPhoto,
  },
  {
    id:    "ken",
    quote: "Vinoy has been a key part of multiple projects I've led, always contributes greatly to the success of each. His attention to detail and dedication makes him a reliable team member who is always willing to go the extra mile. Vinoy is an asset to any team that he is a part of.",
    name:  "Ken Rodrigues",
    role:  "Ex-Senior UX Designer, Coditas",
    photo: kenRodriguesPhoto,
  },
  {
    id:    "shivam",
    quote: "Vinoy is a quick learner and always up to new challenges. He first tries to understand the problem from the ground then only gets to the pixel. He's good at insight gathering, talking to users, rapid wireframing. He's always open to feedback.",
    name:  "Shivam Dewan",
    role:  "Ex-Lead Designer, Being",
    photo: shivamDewanPhoto,
  },
  {
    id:    "francesco",
    quote: "Across all our products, Vinoy made sure what got built actually matched what was designed. He genuinely lifts the energy of a team. He's one of those people you actually look forward to jumping on a call with. If you get the chance to work with him, take it.",
    name:  "Francesco Rocchi",
    role:  "Co-founder & CTO, Fusepay",
    photo: francescoRocchiPhoto,
  },
];

// Stack angles + scales for the fanned deck
const POSITIONS = [
  { r:  0,    s: 1    },
  { r: -6,    s: 0.97 },
  { r:  5,    s: 0.94 },
  { r: -3.5,  s: 0.91 },
];

const EASE = "cubic-bezier(0.23, 1, 0.32, 1)";

/**
 * Mobile swipeable testimonial card stack.
 * - Always starts in settled/committed state (no scroll-scrub entrance)
 * - Drag/swipe left (or flick) advances to the next card
 * - Reduced-motion: plain vertical list
 */
export default function MobileTestimonials() {
  const reduce    = useReducedMotion();
  const stackRef  = useRef<HTMLDivElement>(null);
  const cardRefs  = useRef<(HTMLDivElement | null)[]>([null, null, null, null]);
  const orderRef  = useRef([0, 1, 2, 3]);
  const lockedRef = useRef(false);

  const applyStack = useCallback((withTransition: boolean) => {
    orderRef.current.forEach((tIdx, stackPos) => {
      const card = cardRefs.current[tIdx];
      if (!card) return;
      const pos = POSITIONS[stackPos] ?? POSITIONS[POSITIONS.length - 1];
      card.style.transition    = withTransition ? `transform 320ms ${EASE}` : "none";
      card.style.transform     = `translateX(-50%) translateY(-50%) rotate(${pos.r}deg) scale(${pos.s})`;
      card.style.zIndex        = String(POSITIONS.length - stackPos);
      card.style.pointerEvents = stackPos === 0 ? "auto" : "none";
      card.style.cursor        = stackPos === 0 ? "grab" : "default";
    });
  }, []);

  useEffect(() => {
    if (reduce) return;

    // Settle immediately — no scrub entrance on mobile
    applyStack(false);

    const stackEl = stackRef.current;
    if (!stackEl) return;

    function sendToBack() {
      if (lockedRef.current) return;
      lockedRef.current = true;
      const frontIdx = orderRef.current[0];
      const front    = cardRefs.current[frontIdx];
      if (!front) { lockedRef.current = false; return; }

      const backPos = POSITIONS[POSITIONS.length - 1];
      front.style.zIndex     = "0";
      front.style.transition = `transform 320ms ${EASE}`;
      front.style.transform  = `translateX(-50%) translateY(-50%) rotate(${backPos.r}deg) scale(${backPos.s})`;

      setTimeout(() => {
        orderRef.current.push(orderRef.current.shift()!);
        applyStack(true);
        setTimeout(() => { lockedRef.current = false; }, 320);
      }, 320);
    }

    const drag = { active: false, startX: 0, startY: 0, startTime: 0, dx: 0, dy: 0 };

    function onMove(e: MouseEvent | TouchEvent) {
      if (!drag.active) return;
      if (e.cancelable) e.preventDefault();
      const pt = "touches" in e ? (e as TouchEvent).touches[0] : (e as MouseEvent);
      drag.dx = pt.clientX - drag.startX;
      drag.dy = pt.clientY - drag.startY;
      const rot   = POSITIONS[0].r + Math.max(-18, Math.min(18, drag.dx * 0.07));
      const front = cardRefs.current[orderRef.current[0]];
      if (front) {
        front.style.transition = "none";
        front.style.transform  = `translateX(calc(-50% + ${drag.dx}px)) translateY(calc(-50% + ${drag.dy}px)) rotate(${rot}deg)`;
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
        // snap back
        if (front) {
          front.style.transition = `transform 360ms ${EASE}`;
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
      const pt   = "touches" in e ? (e as TouchEvent).touches[0] : (e as MouseEvent);
      drag.active    = true;
      drag.startX    = pt.clientX;
      drag.startY    = pt.clientY;
      drag.startTime = Date.now();
      drag.dx = drag.dy = 0;
      const front = cardRefs.current[orderRef.current[0]];
      if (front) { front.style.transition = "none"; front.style.cursor = "grabbing"; }
      document.body.style.userSelect = "none";
      document.addEventListener("mousemove", onMove);
      document.addEventListener("mouseup",   onUp);
      document.addEventListener("touchmove", onMove, { passive: false });
      document.addEventListener("touchend",  onUp);
    }

    stackEl.addEventListener("mousedown",  onDown as EventListener);
    stackEl.addEventListener("touchstart", onDown as EventListener, { passive: false });

    return () => {
      stackEl.removeEventListener("mousedown",  onDown as EventListener);
      stackEl.removeEventListener("touchstart", onDown as EventListener);
    };
  }, [reduce, applyStack]);

  if (reduce) {
    // Plain vertical list for reduced-motion
    return (
      <div style={{ display:"flex", flexDirection:"column", gap:"16px" }}>
        <p style={{
          fontFamily:"var(--font-averia)", fontWeight:400,
          fontSize:"28px", lineHeight:"36px", letterSpacing:"-0.56px", color:"#000",
          marginBottom:"8px",
        }}>
          What it&apos;s like working with me?
        </p>
        {TESTIMONIALS.map((t) => (
          <div
            key={t.id}
            style={{
              background:"#fff", boxShadow:"0px 1.6px 33px rgba(0,0,0,0.1)",
              padding:"24px 20px", display:"flex", flexDirection:"column", gap:"16px",
            }}
          >
            <p style={{ fontFamily:"var(--font-dm-sans)", fontWeight:400, fontSize:"15px", lineHeight:"22px", color:"#797979" }}>
              &ldquo;{t.quote}&rdquo;
            </p>
            <div>
              <p style={{ fontFamily:"var(--font-dm-sans)", fontWeight:500, fontSize:"16px", lineHeight:"22px", color:"#000" }}>{t.name}</p>
              <p style={{ fontFamily:"var(--font-dm-sans)", fontWeight:400, fontSize:"13px", lineHeight:"18px", color:"#797979" }}>({t.role})</p>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div>
      <p style={{
        fontFamily:    "var(--font-averia)",
        fontWeight:    400,
        fontSize:      "28px",
        lineHeight:    "36px",
        letterSpacing: "-0.56px",
        color:         "#000",
        marginBottom:  "32px",
      }}>
        What it&apos;s like working with me?
      </p>

      {/* Card stack */}
      <div
        ref={stackRef}
        style={{
          position:   "relative",
          width:      "100%",
          height:     "340px",
          userSelect: "none",
          WebkitUserSelect: "none",
        }}
        role="region"
        aria-label="Testimonials — swipe to see more"
      >
        {TESTIMONIALS.map((t, i) => {
          const initPos = POSITIONS[orderRef.current.indexOf(i)] ?? POSITIONS[POSITIONS.length - 1];
          return (
            <div
              key={t.id}
              ref={(el) => { cardRefs.current[i] = el; }}
              style={{
                position:       "absolute",
                top:            "50%",
                left:           "50%",
                width:          "calc(100% - 24px)",
                maxWidth:       "340px",
                minHeight:      "280px",
                background:     "#fff",
                boxShadow:      "0px 1.6px 33px rgba(0,0,0,0.1)",
                padding:        "24px 20px",
                display:        "flex",
                flexDirection:  "column",
                justifyContent: "space-between",
                gap:            "16px",
                willChange:     "transform",
                transform:      `translateX(-50%) translateY(-50%) rotate(${initPos.r}deg) scale(${initPos.s})`,
                zIndex:         String(POSITIONS.length - orderRef.current.indexOf(i)),
                pointerEvents:  orderRef.current.indexOf(i) === 0 ? "auto" : "none",
                cursor:         orderRef.current.indexOf(i) === 0 ? "grab" : "default",
                overflow:       "hidden",
              }}
            >
              {/* Quote */}
              <p style={{
                fontFamily: "var(--font-dm-sans)",
                fontWeight: 400,
                fontSize:   "15px",
                lineHeight: "22px",
                color:      "#797979",
                flex:       1,
              }}>
                &ldquo;{t.quote}&rdquo;
              </p>

              {/* Attribution */}
              <div style={{ display:"flex", alignItems:"flex-end", justifyContent:"space-between" }}>
                <div>
                  <p style={{ fontFamily:"var(--font-dm-sans)", fontWeight:500, fontSize:"16px", lineHeight:"22px", letterSpacing:"-0.16px", color:"#000" }}>
                    {t.name}
                  </p>
                  <p style={{ fontFamily:"var(--font-dm-sans)", fontWeight:400, fontSize:"13px", lineHeight:"18px", color:"#797979" }}>
                    ({t.role})
                  </p>
                </div>
                {/* Small photo thumbnail */}
                <div style={{
                  width:"52px", height:"52px", borderRadius:"50%",
                  overflow:"hidden", flexShrink:0, background:"#f2f2f2",
                }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={t.photo.src}
                    alt={t.name}
                    style={{ width:"100%", height:"100%", objectFit:"cover", objectPosition:"center top" }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <p style={{
        textAlign:   "center",
        fontFamily:  "var(--font-dm-sans)",
        fontWeight:  400,
        fontSize:    "13px",
        lineHeight:  "18px",
        color:       "#b0b0b0",
        marginTop:   "16px",
      }}>
        Swipe to read more
      </p>
    </div>
  );
}

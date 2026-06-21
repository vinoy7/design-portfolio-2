"use client";

import Image from "next/image";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useReducedMotion, useScroll, useMotionValueEvent } from "motion/react";
import { PHOTOS, type Photo } from "./photoStackManifest";

// Scroll-scrub photo stack. Pinned sticky stage in a tall track (same scaffold as
// Testimonials). As you scroll, photos advance back→front: the focused front photo
// slides DOWN + blurs + fades out, the card behind promotes into focus, a new blurred
// card enters at the back. 5 layers visible. Caption crossfades with blur, synced.

const N = PHOTOS.length;
const PER_VH = 30;                 // scroll per advance — tunable
const DEPTH = 5;                   // visible layers (front + 4 behind)

// Slot table by depth. dy = vertical centre offset (px) from the front card centre;
// negative = receding upward. -1 = exit (slides down, gone). 5 = far/hidden spawn.
type Slot = { w: number; h: number; dy: number; blur: number; op: number };
const SLOTS: Record<number, Slot> = {
  [-1]: { w: 460, h: 580, dy: 70, blur: 8, op: 0 },
  0: { w: 460, h: 580, dy: 0, blur: 0, op: 1 },
  1: { w: 420, h: 524, dy: -52, blur: 5, op: 1 },
  2: { w: 390, h: 486, dy: -92, blur: 5, op: 0.95 },
  3: { w: 365, h: 455, dy: -126, blur: 8, op: 0.7 },
  4: { w: 345, h: 430, dy: -156, blur: 11, op: 0.4 },
  5: { w: 330, h: 410, dy: -180, blur: 13, op: 0 },
};

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const clamp01 = (v: number) => Math.max(0, Math.min(1, v));

// Interpolated slot for a continuous depth d (∈ [-1, 5], clamped outside).
function slotAt(d: number): Slot & { z: number } {
  const z = Math.round(100 - d * 10); // exiting (d<0) sits above the new front
  if (d <= -1) return { ...SLOTS[-1], op: 0, z };
  if (d >= 5) return { ...SLOTS[5], z };
  const lo = Math.floor(d), hi = lo + 1, t = d - lo;
  const A = SLOTS[lo], B = SLOTS[hi];
  return {
    w: lerp(A.w, B.w, t), h: lerp(A.h, B.h, t), dy: lerp(A.dy, B.dy, t),
    blur: lerp(A.blur, B.blur, t), op: lerp(A.op, B.op, t), z,
  };
}

function CardImage({ photo }: { photo: Photo }) {
  return (
    <Image
      src={photo.src}
      alt={photo.title}
      fill
      sizes="460px"
      priority={photo === PHOTOS[0]}
      style={{ objectFit: photo.aspect === "portrait" ? "cover" : "contain" }}
    />
  );
}

export default function PhotoStack() {
  const reduce = useReducedMotion();
  const trackRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<Map<number, HTMLDivElement>>(new Map());
  const capCurRef = useRef<HTMLDivElement>(null);
  const capNextRef = useRef<HTMLDivElement>(null);
  // Integer front index — drives the windowed mount. Updated only when it changes,
  // so React re-renders ~N times over the whole scroll, never per frame.
  const [c, setC] = useState(0);

  const { scrollYProgress } = useScroll(
    reduce ? {} : { target: trackRef, offset: ["start start", "end end"] }
  );

  const renderScrub = useCallback((p: number) => {
    const pos = clamp01(p) * (N - 1);
    const ci = Math.min(N - 1, Math.floor(pos));
    const f = pos - ci;
    if (ci !== c) setC(ci);

    cardRefs.current.forEach((el, i) => {
      const d = i - ci - f;                 // continuous depth of photo i
      const s = slotAt(d);
      el.style.transition = "none";
      el.style.width = `${s.w}px`;
      el.style.height = `${s.h}px`;
      el.style.opacity = String(s.op);
      el.style.filter = `blur(${s.blur}px)`;
      el.style.zIndex = String(s.z);
      el.style.transform = `translate(-50%, -50%) translateY(${s.dy}px)`;
    });

    // Caption crossfade: current (photo ci) fades/blurs out as f→1, next (ci+1) in.
    const cur = capCurRef.current, nxt = capNextRef.current;
    if (cur) { cur.style.opacity = String(1 - f); cur.style.filter = `blur(${f * 6}px)`; }
    if (nxt) { nxt.style.opacity = String(f); nxt.style.filter = `blur(${(1 - f) * 6}px)`; }
  }, [c]);

  useMotionValueEvent(scrollYProgress, "change", renderScrub);

  // Apply the current pose after every render so freshly-mounted cards get sized
  // immediately (sizes live only in renderScrub) instead of waiting for a scroll frame.
  useEffect(() => { renderScrub(scrollYProgress.get()); });

  // Mounted window: exiting card + 5 visible + 1 entering at the back.
  const mounted = useMemo(() => {
    const out: number[] = [];
    for (let i = c - 1; i <= c + DEPTH; i++) if (i >= 0 && i < N) out.push(i);
    return out;
  }, [c]);

  const Caption = ({ photo, refEl, initialOpacity }: { photo: Photo; refEl: React.Ref<HTMLDivElement>; initialOpacity: number }) => (
    <div
      ref={refEl}
      style={{
        position: "absolute", left: "50%", top: 0, transform: "translateX(-50%)",
        width: 463, textAlign: "center", opacity: initialOpacity,
        fontFamily: "var(--font-dm-sans)", fontSize: 18, lineHeight: "22px", letterSpacing: "-0.36px", color: "#000",
      }}
    >
      <p style={{ fontWeight: 600, whiteSpace: "pre-line" }}>{photo.title}</p>
      <p style={{ fontWeight: 400, marginTop: 4 }}>{photo.location}</p>
    </div>
  );

  if (reduce) {
    const p0 = PHOTOS[0];
    return (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 37 }}>
        <div style={{ position: "relative", width: 460, height: 580, background: p0.aspect === "landscape" ? "#000" : "#eaeaea", overflow: "hidden" }}>
          <CardImage photo={p0} />
        </div>
        <div style={{ width: 463, textAlign: "center", fontFamily: "var(--font-dm-sans)", fontSize: 18, lineHeight: "22px", letterSpacing: "-0.36px" }}>
          <p style={{ fontWeight: 600 }}>{p0.title}</p>
          <p style={{ fontWeight: 400, marginTop: 4 }}>{p0.location}</p>
        </div>
      </div>
    );
  }

  return (
    <div ref={trackRef} style={{ position: "relative", height: `calc(100vh + ${N * PER_VH}vh)` }}>
      <div
        style={{
          position: "sticky", top: 0, height: "100vh",
          width: "100vw", marginLeft: "calc(50% - 50vw)",
          overflow: "hidden", display: "flex", flexDirection: "column",
          alignItems: "center", justifyContent: "center",
        }}
      >
        {/* stack box — front card fills it; recessed cards overflow upward (clipped at viewport) */}
        <div style={{ position: "relative", width: 460, height: 580 }}>
          {mounted.map((i) => (
            <div
              key={i}
              ref={(el) => { if (el) cardRefs.current.set(i, el); else cardRefs.current.delete(i); }}
              style={{
                position: "absolute", left: "50%", top: "50%",
                transform: "translate(-50%, -50%)",
                background: PHOTOS[i].aspect === "landscape" ? "#000" : "#eaeaea", overflow: "hidden",
                willChange: "transform, filter, opacity",
              }}
            >
              <CardImage photo={PHOTOS[i]} />
            </div>
          ))}
        </div>
        {/* caption crossfade — two stacked layers (current + next) */}
        <div style={{ position: "relative", width: 463, height: 74, marginTop: 37 }}>
          <Caption photo={PHOTOS[c]} refEl={capCurRef} initialOpacity={1} />
          {c + 1 < N && <Caption photo={PHOTOS[c + 1]} refEl={capNextRef} initialOpacity={0} />}
        </div>
      </div>
    </div>
  );
}

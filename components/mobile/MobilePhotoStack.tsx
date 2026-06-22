"use client";

import Image from "next/image";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useReducedMotion } from "motion/react";
import { PHOTOS, type Photo } from "@/components/content/photoStackManifest";

// Mobile photo stack — same depth/slot look as desktop PhotoStack but:
// - No tick-rails (removed for mobile). Advance by horizontal SWIPE instead.
// - Mobile-scaled slot sizes (front ~300px vs desktop 460px).
// - No hover audio (ticks were per-dash; dashes are gone).

const N = PHOTOS.length;
const DEPTH = 5;
const EASE = 0.16;            // roll speed toward target on release
const SWIPE_DIST = 110;       // px of horizontal drag == one photo

type Slot = { w: number; h: number; dy: number; blur: number; op: number };
// Desktop slots scaled ~0.65 (460→300 front width); dy/blur kept proportional.
const SLOTS: Record<number, Slot> = {
  [-1]: { w: 300, h: 378, dy: 46, blur: 8, op: 0 },
  0:    { w: 300, h: 378, dy: 0,   blur: 0,  op: 1 },
  1:    { w: 274, h: 342, dy: -34, blur: 5,  op: 1 },
  2:    { w: 254, h: 317, dy: -60, blur: 5,  op: 0.95 },
  3:    { w: 238, h: 297, dy: -82, blur: 8,  op: 0.7 },
  4:    { w: 225, h: 280, dy: -102,blur: 11, op: 0.4 },
  5:    { w: 215, h: 267, dy: -117,blur: 13, op: 0 },
};

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

function slotAt(d: number): Slot & { z: number } {
  const z = Math.round(100 - d * 10);
  if (d <= -1) return { ...SLOTS[-1], op: 0, z };
  if (d >= 5)  return { ...SLOTS[5], z };
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
      sizes="300px"
      priority={photo === PHOTOS[0]}
      draggable={false}
      style={{
        objectFit: photo.aspect === "portrait" ? "cover" : "contain",
        pointerEvents: "none", userSelect: "none", WebkitUserSelect: "none",
        WebkitTouchCallout: "none",
      }}
    />
  );
}

export default function MobilePhotoStack() {
  const reduce = useReducedMotion();
  const cardRefs  = useRef<Map<number, HTMLDivElement>>(new Map());
  const capCurRef = useRef<HTMLDivElement>(null);
  const capNextRef= useRef<HTMLDivElement>(null);

  const posRef    = useRef(0);     // continuous position [0, N-1]
  const targetRef = useRef(0);
  const rafRef    = useRef<number | null>(null);
  const lastCi    = useRef(0);
  const wrapRef   = useRef<HTMLDivElement>(null);

  const [c, setC] = useState(0);

  const renderScrub = useCallback((pos: number) => {
    const ci = Math.floor(pos);
    const f  = pos - ci;
    if (ci !== lastCi.current) { lastCi.current = ci; setC(ci); }

    cardRefs.current.forEach((el, i) => {
      const s = slotAt(i - ci - f);
      el.style.transition = "none";
      el.style.width   = `${s.w}px`;
      el.style.height  = `${s.h}px`;
      el.style.opacity = String(s.op);
      el.style.filter  = `blur(${s.blur}px)`;
      el.style.zIndex  = String(s.z);
      el.style.transform = `translate(-50%, -50%) translateY(${s.dy}px)`;
    });

    const cur = capCurRef.current, nxt = capNextRef.current;
    if (cur) { cur.style.opacity = String(1 - f); cur.style.filter = `blur(${f * 6}px)`; }
    if (nxt) { nxt.style.opacity = String(f);     nxt.style.filter = `blur(${(1 - f) * 6}px)`; }
  }, []);

  const startRoll = useCallback(() => {
    if (rafRef.current != null) return;
    const step = () => {
      const target = targetRef.current;
      let pos = posRef.current + (target - posRef.current) * EASE;
      if (Math.abs(target - pos) < 0.002) pos = target;
      posRef.current = pos;
      renderScrub(pos);
      if (pos !== target) rafRef.current = requestAnimationFrame(step);
      else rafRef.current = null;
    };
    rafRef.current = requestAnimationFrame(step);
  }, [renderScrub]);

  // Swipe handling — live preview during drag, snap-to-integer on release.
  useEffect(() => {
    if (reduce) return;

    const drag = { active: false, startX: 0, startY: 0, base: 0, horizontal: false };

    function onDown(e: MouseEvent | TouchEvent) {
      if (e instanceof MouseEvent && e.button !== 0) return;
      if (rafRef.current != null) { cancelAnimationFrame(rafRef.current); rafRef.current = null; }
      const pt = "touches" in e ? e.touches[0] : e;
      drag.active = true;
      drag.startX = pt.clientX;
      drag.startY = pt.clientY;
      drag.base   = Math.round(posRef.current);
      drag.horizontal = false;
      document.addEventListener("mousemove", onMove);
      document.addEventListener("mouseup",   onUp);
      document.addEventListener("touchmove", onMove, { passive: false });
      document.addEventListener("touchend",  onUp);
    }

    function onMove(e: MouseEvent | TouchEvent) {
      if (!drag.active) return;
      const pt = "touches" in e ? e.touches[0] : e;
      const dx = pt.clientX - drag.startX;
      const dy = pt.clientY - drag.startY;
      // lock axis once intent is clear; vertical → let the page scroll
      if (!drag.horizontal && Math.abs(dx) < 8 && Math.abs(dy) < 8) return;
      if (!drag.horizontal) {
        if (Math.abs(dx) <= Math.abs(dy)) { drag.active = false; cleanup(); return; }
        drag.horizontal = true;
      }
      if (e.cancelable) e.preventDefault();
      // swipe left (dx<0) → advance forward
      const pos = Math.max(0, Math.min(N - 1, drag.base - dx / SWIPE_DIST));
      posRef.current = pos;
      renderScrub(pos);
    }

    function cleanup() {
      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseup",   onUp);
      document.removeEventListener("touchmove", onMove);
      document.removeEventListener("touchend",  onUp);
    }

    function onUp() {
      if (!drag.active) { cleanup(); return; }
      drag.active = false;
      cleanup();
      // snap to nearest, but a decisive swipe always moves at least one
      const moved = posRef.current - drag.base;
      let tgt = Math.round(posRef.current);
      if (Math.abs(moved) > 0.18 && tgt === drag.base) tgt = drag.base + (moved > 0 ? 1 : -1);
      targetRef.current = Math.max(0, Math.min(N - 1, tgt));
      startRoll();
    }

    const el = wrapRef.current;
    if (!el) return;
    el.addEventListener("mousedown",  onDown as EventListener);
    el.addEventListener("touchstart", onDown as EventListener, { passive: true });
    return () => {
      el.removeEventListener("mousedown",  onDown as EventListener);
      el.removeEventListener("touchstart", onDown as EventListener);
      cleanup();
    };
  }, [reduce, renderScrub, startRoll]);

  useEffect(() => () => { if (rafRef.current != null) cancelAnimationFrame(rafRef.current); }, []);
  // re-pose after each render so newly-mounted cards size immediately
  useEffect(() => { renderScrub(posRef.current); });

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
        width: "100%", textAlign: "center", opacity: initialOpacity,
        fontFamily: "var(--font-dm-sans)", fontSize: 15, lineHeight: "20px", letterSpacing: "-0.3px", color: "#000",
      }}
    >
      <p style={{ fontSize: 16, fontWeight: 500, whiteSpace: "pre-line" }}>{photo.title}</p>
      <p style={{ fontWeight: 400, marginTop: 4, color: "#757575" }}>{photo.location}</p>
    </div>
  );

  if (reduce) {
    const p0 = PHOTOS[0];
    return (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 24 }}>
        <div style={{ position: "relative", width: 300, height: 378, background: p0.aspect === "landscape" ? "#000" : "#eaeaea", overflow: "hidden" }}>
          <CardImage photo={p0} />
        </div>
        <div style={{ width: "100%", textAlign: "center", fontFamily: "var(--font-dm-sans)", fontSize: 15, lineHeight: "20px" }}>
          <p style={{ fontSize: 16, fontWeight: 500 }}>{p0.title}</p>
          <p style={{ fontWeight: 400, marginTop: 4, color: "#757575" }}>{p0.location}</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
      <div
        ref={wrapRef}
        style={{
          position: "relative", width: "100%", height: 400,
          display: "flex", justifyContent: "center",
          touchAction: "pan-y", userSelect: "none", WebkitUserSelect: "none",
          cursor: "grab",
        }}
        role="region"
        aria-label="Travel photos — swipe to see more"
      >
        <div style={{ position: "relative", width: 300, height: 400 }}>
          {mounted.map((i) => (
            <div
              key={i}
              ref={(el) => { if (el) cardRefs.current.set(i, el); else cardRefs.current.delete(i); }}
              onContextMenu={(e) => e.preventDefault()}
              onDragStart={(e) => e.preventDefault()}
              style={{
                position: "absolute", left: "50%", top: "50%",
                transform: "translate(-50%, -50%)",
                background: PHOTOS[i].aspect === "landscape" ? "#000" : "#eaeaea", overflow: "hidden",
                willChange: "transform, filter, opacity",
                userSelect: "none", WebkitUserSelect: "none", WebkitTouchCallout: "none",
              }}
            >
              <CardImage photo={PHOTOS[i]} />
            </div>
          ))}
        </div>
      </div>

      {/* caption crossfade */}
      <div style={{ position: "relative", width: "100%", height: 64, marginTop: 24 }}>
        <Caption photo={PHOTOS[c]} refEl={capCurRef} initialOpacity={1} />
        {c + 1 < N && <Caption photo={PHOTOS[c + 1]} refEl={capNextRef} initialOpacity={0} />}
      </div>

      <p style={{
        textAlign: "center", fontFamily: "var(--font-dm-sans)", fontWeight: 400,
        fontSize: 13, lineHeight: "18px", color: "#b0b0b0", marginTop: 12,
      }}>
        Swipe to see more
      </p>
    </div>
  );
}

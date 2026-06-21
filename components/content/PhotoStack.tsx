"use client";

import Image from "next/image";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useReducedMotion } from "motion/react";
import { PHOTOS, type Photo } from "./photoStackManifest";

// Hover-scrub photo stack. Two vertical tick-rails flank a static stack; each dash
// maps 1:1 to a photo (left rail = photos 1-20, right = 21-40). Hovering a dash
// rolls the stack to that photo (slide-down/blur/promote), the dash goes black.
// No scroll/pin — the rails are the only way to advance. Mouse-leave holds last.

const N = PHOTOS.length;
const DEPTH = 5;                   // visible layers (front + 4 behind)
const EASE = 0.14;                 // roll speed toward the hovered target
const PER_RAIL = 20;               // dashes per side

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
      draggable={false}
      // pointer-events:none → drag/right-click land on the wrapper (which blocks
      // them), never the <img> itself; user-select/touch-callout kill long-press save
      style={{
        objectFit: photo.aspect === "portrait" ? "cover" : "contain",
        pointerEvents: "none", userSelect: "none", WebkitUserSelect: "none",
        WebkitTouchCallout: "none",
      }}
    />
  );
}

// Spread onto any element wrapping a protected image: blocks the right-click
// "Save image", drag-to-desktop, and the long-press save sheet on mobile.
const noSaveProps = {
  onContextMenu: (e: React.MouseEvent) => e.preventDefault(),
  onDragStart: (e: React.DragEvent) => e.preventDefault(),
  style: { userSelect: "none", WebkitUserSelect: "none", WebkitTouchCallout: "none" } as React.CSSProperties,
};

// One side of dashes. base = photo index of its first dash (0 left, 20 right).
function Rail({
  side, count, base, activeIdx, onHover,
}: {
  side: "left" | "right"; count: number; base: number;
  activeIdx: number; onHover: (i: number) => void;
}) {
  return (
    <div
      style={{
        position: "absolute", top: 0, height: 580,
        [side]: 0, width: 160, display: "flex", flexDirection: "column", justifyContent: "space-between",
      }}
    >
      {Array.from({ length: count }, (_, k) => {
        const idx = base + k;
        const active = idx === activeIdx;
        return (
          <div
            key={idx}
            onMouseEnter={() => onHover(idx)}
            style={{
              position: "relative", height: 28, display: "flex", alignItems: "center",
              justifyContent: side === "left" ? "flex-start" : "flex-end",
              paddingLeft: side === "left" ? 26 : 0,
              paddingRight: side === "right" ? 26 : 0,
              cursor: "pointer",
              background: active
                ? `linear-gradient(to ${side === "left" ? "right" : "left"}, #f0f0f0, rgba(240,240,240,0))`
                : "transparent",
            }}
          >
            <div
              style={{
                width: active ? 28 : 20, height: 2, borderRadius: 5,
                background: active ? "#808080" : "#d9d9d9",
                transition: "background 180ms cubic-bezier(0.23,1,0.32,1), width 180ms cubic-bezier(0.23,1,0.32,1)",
              }}
            />
          </div>
        );
      })}
    </div>
  );
}

export default function PhotoStack() {
  const reduce = useReducedMotion();
  const cardRefs = useRef<Map<number, HTMLDivElement>>(new Map());
  const capCurRef = useRef<HTMLDivElement>(null);
  const capNextRef = useRef<HTMLDivElement>(null);

  const posRef = useRef(0);          // continuous position in [0, N-1]
  const targetRef = useRef(0);       // hovered target index
  const rafRef = useRef<number | null>(null);
  const lastCi = useRef(0);
  const lastActive = useRef(0);
  // WebAudio: clip peaks at ~-24dBFS, so route through a gain node (an <audio>
  // element can't amplify past 1.0). A fresh buffer source per tick lets rapid
  // scrub ticks overlap instead of cutting each other off.
  const audioCtxRef = useRef<AudioContext | null>(null);
  const audioBufRef = useRef<AudioBuffer | null>(null);
  const audioMasterRef = useRef<DynamicsCompressorNode | null>(null);
  // voices keep their gain node so we can fade them out (not hard-stop) → no pop
  const audioVoicesRef = useRef<{ src: AudioBufferSourceNode; gain: GainNode }[]>([]);

  useEffect(() => {
    const Ctx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!Ctx) return;
    const ctx = new Ctx();
    audioCtxRef.current = ctx;
    // master limiter: catches any summed peak before it clips → no fuzzy rattle
    const limiter = ctx.createDynamicsCompressor();
    limiter.threshold.value = -3; limiter.knee.value = 0; limiter.ratio.value = 20;
    limiter.attack.value = 0.002; limiter.release.value = 0.1;
    limiter.connect(ctx.destination);
    audioMasterRef.current = limiter;
    fetch("/assets/photo-nav-sound.m4a")
      .then((r) => r.arrayBuffer())
      .then((b) => ctx.decodeAudioData(b))
      .then((buf) => { audioBufRef.current = buf; })
      .catch(() => {});
    return () => { ctx.close().catch(() => {}); };
  }, []);

  // Integer front index drives the windowed mount; activeIdx drives the dashes.
  // Both update only on integer crossings, so React re-renders ~N times max.
  const [c, setC] = useState(0);
  const [activeIdx, setActiveIdx] = useState(0);

  // Pose every mounted card + the caption crossfade from a continuous position.
  // Imperative (no per-frame React state) — mirrors the prior scroll renderer.
  const renderScrub = useCallback((pos: number) => {
    const ci = Math.floor(pos);
    const f = pos - ci;
    if (ci !== lastCi.current) { lastCi.current = ci; setC(ci); }
    const a = Math.round(pos);
    if (a !== lastActive.current) { lastActive.current = a; setActiveIdx(a); }

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

    const cur = capCurRef.current, nxt = capNextRef.current;
    if (cur) { cur.style.opacity = String(1 - f); cur.style.filter = `blur(${f * 6}px)`; }
    if (nxt) { nxt.style.opacity = String(f); nxt.style.filter = `blur(${(1 - f) * 6}px)`; }
  }, []);

  // rAF roll: ease the current position toward the hovered target.
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

  const onHover = useCallback((i: number) => {
    targetRef.current = i;
    startRoll();
    // one tick per dash the cursor lands on (not per photo the roll passes)
    const ctx = audioCtxRef.current, buf = audioBufRef.current, master = audioMasterRef.current;
    if (ctx && buf && master) {
      if (ctx.state === "suspended") ctx.resume();
      const now = ctx.currentTime;
      const PEAK = 2.8;                 // per-voice gain (quiet clip ~-24dBFS)
      // cap polyphony at 2: fade old voices out (15ms) instead of hard-stopping,
      // so cutting mid-waveform never pops the cone.
      const voices = audioVoicesRef.current;
      while (voices.length >= 2) {
        const old = voices.shift();
        if (old) {
          try {
            old.gain.gain.cancelScheduledValues(now);
            old.gain.gain.setValueAtTime(old.gain.gain.value, now);
            old.gain.gain.linearRampToValueAtTime(0, now + 0.015);
            old.src.stop(now + 0.02);
          } catch {}
        }
      }
      const src = ctx.createBufferSource();
      src.buffer = buf;
      const g = ctx.createGain();
      g.gain.setValueAtTime(0, now);          // 8ms fade-in → no start-click
      g.gain.linearRampToValueAtTime(PEAK, now + 0.008);
      src.connect(g).connect(master);
      src.onended = () => { audioVoicesRef.current = audioVoicesRef.current.filter((v) => v.src !== src); };
      src.start(0, 0.18);              // skip the quiet lead-in; land on the loud body (~0.24s peak)
      voices.push({ src, gain: g });
    }
  }, [startRoll]);

  useEffect(() => () => { if (rafRef.current != null) cancelAnimationFrame(rafRef.current); }, []);

  // Apply the current pose after every render so freshly-mounted cards get sized
  // immediately instead of waiting for the next roll frame.
  useEffect(() => { renderScrub(posRef.current); });

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
      <p style={{ fontSize: 20, fontWeight: 500, whiteSpace: "pre-line" }}>{photo.title}</p>
      <p style={{ fontWeight: 400, marginTop: 4, color: "#757575" }}>{photo.location}</p>
    </div>
  );

  if (reduce) {
    const p0 = PHOTOS[0];
    return (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 37 }}>
        <div {...noSaveProps} style={{ ...noSaveProps.style, position: "relative", width: 460, height: 580, background: p0.aspect === "landscape" ? "#000" : "#eaeaea", overflow: "hidden" }}>
          <CardImage photo={p0} />
        </div>
        <div style={{ width: 463, textAlign: "center", fontFamily: "var(--font-dm-sans)", fontSize: 18, lineHeight: "22px", letterSpacing: "-0.36px" }}>
          <p style={{ fontSize: 20, fontWeight: 500 }}>{p0.title}</p>
          <p style={{ fontWeight: 400, marginTop: 4, color: "#757575" }}>{p0.location}</p>
        </div>
      </div>
    );
  }

  const leftCount = Math.min(PER_RAIL, N);
  const rightCount = Math.max(0, Math.min(PER_RAIL, N - PER_RAIL));

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
      {/* stack row — rails pinned to the column edges, stack centered, cards overflow upward */}
      <div style={{ position: "relative", width: "100%", height: 580, display: "flex", justifyContent: "center" }}>
        <Rail side="left" count={leftCount} base={0} activeIdx={activeIdx} onHover={onHover} />
        <Rail side="right" count={rightCount} base={PER_RAIL} activeIdx={activeIdx} onHover={onHover} />
        <div style={{ position: "relative", width: 460, height: 580 }}>
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
      {/* caption crossfade — two stacked layers (current + next) */}
      <div style={{ position: "relative", width: 463, height: 74, marginTop: 37 }}>
        <Caption photo={PHOTOS[c]} refEl={capCurRef} initialOpacity={1} />
        {c + 1 < N && <Caption photo={PHOTOS[c + 1]} refEl={capNextRef} initialOpacity={0} />}
      </div>
    </div>
  );
}

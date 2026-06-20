"use client";

import { useState } from "react";
import { useReducedMotion } from "motion/react";

import { FACES, type Face } from "./howDesignSlides";
import PhotographyCarousel from "./PhotographyCarousel";

/* ------------------------------------------------------------------ *
 * Sketchbook — hybrid DOM + (soon) WebGL.
 *
 * PHASE 1 (this file): static pages are plain DOM (real <img> + CSS), so
 * corners, shadows, spine and pile-up are trivial CSS and photos stay crisp.
 * Click pages through instantly — no curl yet. The WebGL leaf that does the
 * actual page-turn curl lands in phase 2 as a canvas overlay.
 *
 * Pagination: spread s shows FACES[2s] (left) and FACES[2s+1] (right).
 * spread = -1 is the closed cover.
 * ------------------------------------------------------------------ */

const LAST_SPREAD = FACES.length / 2 - 1;
const RADIUS = 12; // page corner radius (px) — the whole point of going DOM

function faceAt(i: number): Face {
  return i >= 0 && i < FACES.length ? FACES[i] : { kind: "blank" };
}

// One page face → DOM. Photos cover-crop; doubles show one half of a
// spread-spanning image; blanks are beige.
function PageFace({ face }: { face: Face }) {
  if (face.kind === "blank") return null;
  if (face.kind === "full") {
    return (
      <img
        src={face.src}
        alt=""
        draggable={false}
        className="absolute object-cover select-none"
        // ~10px beige frame around single photos (matches the old GL margin)
        style={{ inset: "2.5%", width: "95%", height: "95%", borderRadius: 4 }}
      />
    );
  }
  // half of a double: image is sized to cover the full 2-page spread, then
  // shifted so this page shows its left (side 0) or right (side 1) half.
  return (
    <img
      src={face.src}
      alt=""
      draggable={false}
      className="absolute top-0 h-full max-w-none object-cover select-none"
      style={{ width: "200%", left: face.side === 0 ? "0%" : "-100%" }}
    />
  );
}

export default function PageFlipBook() {
  const reduce = useReducedMotion();
  const [spread, setSpread] = useState(-1); // -1 = closed cover

  if (reduce) return <PhotographyCarousel />;

  const closed = spread === -1;
  const left = faceAt(2 * spread);
  const right = faceAt(2 * spread + 1);

  // click left half = prev / close; right half = next; closed = open
  function onClick(e: React.MouseEvent<HTMLDivElement>) {
    if (closed) { setSpread(0); return; }
    const r = e.currentTarget.getBoundingClientRect();
    const onRight = (e.clientX - r.left) / r.width > 0.5;
    if (onRight) setSpread((s) => Math.min(LAST_SPREAD, s + 1));
    else setSpread((s) => Math.max(-1, s - 1));
  }

  // shared page-shell styling
  const pageBase =
    "relative h-full overflow-hidden bg-[#f5f3ee] shadow-[0_10px_40px_rgba(40,30,20,0.18)]";

  return (
    <div className="relative w-full" style={{ aspectRatio: "1.5 / 1" }}>
      <div
        onClick={onClick}
        className="absolute inset-0 flex items-center justify-center"
        style={{ cursor: "pointer" }}
      >
        {closed ? (
          // closed cover: centred red board with embossed title
          <div
            className="relative grid place-items-center"
            style={{
              height: "100%",
              aspectRatio: "1 / 1.3",
              background: "linear-gradient(135deg,#c4221f,#9e1714)",
              borderRadius: RADIUS,
              boxShadow:
                "0 18px 50px rgba(60,10,10,0.4), inset 0 1px 0 rgba(255,255,255,0.15)",
            }}
          >
            <div
              className="text-center font-black leading-tight tracking-[0.18em] text-white/85"
              style={{ textShadow: "0 1px 1px rgba(0,0,0,0.35)" }}
            >
              MY
              <br />
              PHOTOBOOK
            </div>
          </div>
        ) : (
          // open spread: two pages with a centre gutter
          <div className="flex h-full" style={{ aspectRatio: "1.538 / 1" }}>
            <div
              className={pageBase}
              style={{
                width: "50%",
                borderRadius: `${RADIUS}px 0 0 ${RADIUS}px`,
              }}
            >
              <PageFace face={left} />
              {/* gutter shadow on the inner (spine) edge */}
              <div
                className="pointer-events-none absolute inset-y-0 right-0 w-[14%]"
                style={{
                  background:
                    "linear-gradient(to right, transparent, rgba(40,30,20,0.16))",
                }}
              />
            </div>
            <div
              className={pageBase}
              style={{
                width: "50%",
                borderRadius: `0 ${RADIUS}px ${RADIUS}px 0`,
              }}
            >
              <PageFace face={right} />
              <div
                className="pointer-events-none absolute inset-y-0 left-0 w-[14%]"
                style={{
                  background:
                    "linear-gradient(to left, transparent, rgba(40,30,20,0.16))",
                }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

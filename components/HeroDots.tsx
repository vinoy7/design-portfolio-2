"use client";

import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { pill } from "./pillTracker";

/**
 * Dot-portrait hero effect on a full-viewport, click-through canvas.
 * - load: dots fly in from scatter and assemble into the image
 * - hover: cursor repels nearby dots (300px), they spring home
 * - tab pill thrown through the picture repels dots in its wake
 * - clicks 1-4: escalating shove that destabilizes the image
 * - click 5: BURST outward -> stay scattered 10s -> 3D funnel VORTEX
 *   (gather -> spin -> resolve) that flattens forward into the picture.
 */

// CSS geometry of the hero photo (mirrors Hero.tsx)
const WIN_W = 510;
const WIN_H = 245;
const DIV_W = 669;

const STEP = 2; // sample grid -> dot spacing (CSS px)
const DOT = 3; // dot diameter in CSS px (overlaps the 2px grid -> no gaps)
const SAT = 1.45; // saturation boost for vivid, true-to-original color

// interaction
const HOVER_R = 200;
const HOVER_FORCE = 4000;
const PILL_PAD = 100;
const PILL_FORCE = 6000;

// spring / physics (per second)
const IDLE_STIFF = 130;
const IDLE_DAMP = 14;
const INTRO_STIFF = 38; // low -> dots drift slowly into place
const GRAVITY = 40; // gentle drift during the hold
const BURST_HOLD = 10; // seconds dots stay scattered after the blast

// vortex (3D globe, viewed down the z-axis)
const GATHER_DUR = 1.0; // scattered dots gather onto the globe
const RESOLVE_DUR = 1.0; // globe flattens forward into the image
const ROTATIONS = 2; // exactly two full turns before settling
const TURN_TOTAL = ROTATIONS * Math.PI * 2;
const OMEGA0 = 2.5; // spin speed at first rotation (slow)
const OMEGA1 = 12.0; // spin speed by the second rotation (fast)
const SWIRL_DIR = 1; // 1 = clockwise
const GLOBE_R = 210; // world radius of the globe
const GLOBE_BUMP = 0.5; // per-dot radial jitter -> uneven (lumpy) surface
const GLOBE_JIT = 42; // screen-space scatter so some dots float near (not on) the surface
const FOCAL = 600; // perspective focal length
const TILT = 0.35; // slight tilt so the globe reads as 3D, not a flat disc
const TAIL_GAIN = 3.5; // comet-streak length vs per-frame motion
const TAU = Math.PI * 2;

type Phase = "intro" | "idle" | "burst" | "gather" | "spin" | "resolve";

const clamp255 = (v: number) => (v < 0 ? 0 : v > 255 ? 255 : v) | 0;
const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);

export default function HeroDots({
  anchorRef,
  src,
  startDelay = 0,
}: {
  anchorRef: React.RefObject<HTMLDivElement | null>;
  src: string;
  startDelay?: number;
}) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const anchor = anchorRef.current;
    if (!canvas || !anchor) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    // ---- viewport buffer ----
    let vw = 0;
    let vh = 0;
    let bw = 0;
    let bh = 0;
    let imageData: ImageData;
    let buf32: Uint32Array;

    function resizeCanvas() {
      vw = window.innerWidth;
      vh = window.innerHeight;
      bw = Math.floor(vw * dpr);
      bh = Math.floor(vh * dpr);
      canvas!.width = bw;
      canvas!.height = bh;
      canvas!.style.width = vw + "px";
      canvas!.style.height = vh + "px";
      imageData = ctx!.createImageData(bw, bh);
      buf32 = new Uint32Array(imageData.data.buffer);
    }
    resizeCanvas();

    // ---- particle arrays (filled after image loads) ----
    let N = 0;
    let dx: Float32Array; // home offset from anchor top-left (CSS px)
    let dy: Float32Array;
    let px: Float32Array; // current pos (CSS px, viewport space)
    let py: Float32Array;
    let vx: Float32Array;
    let vy: Float32Array;
    let prevX: Float32Array; // previous-frame pos (for streak direction)
    let prevY: Float32Array;
    let gx0: Float32Array; // pos captured at gather start
    let gy0: Float32Array;
    let fu: Float32Array; // per-dot radius factor (uneven globe surface)
    let fphi: Float32Array; // azimuth angle (spins about the vertical axis)
    let sth: Float32Array; // polar angle [0..PI]
    let jmag: Float32Array; // per-dot scatter off the surface (most small, few large)
    let jang: Float32Array; // scatter direction (screen space)
    let col: Uint32Array; // packed RGBA (little-endian)
    const DOT_DPR = Math.max(1, Math.round(DOT * dpr));

    // precomputed round-dot stamp: integer offsets inside a circle
    const stampX: number[] = [];
    const stampY: number[] = [];
    {
      const rad = DOT_DPR / 2;
      const r2 = rad * rad;
      const lim = Math.ceil(rad);
      for (let oy = -lim; oy <= lim; oy++) {
        for (let ox = -lim; ox <= lim; ox++) {
          if (ox * ox + oy * oy <= r2) {
            stampX.push(ox);
            stampY.push(oy);
          }
        }
      }
    }
    const stampN = stampX.length;

    // anchor box, viewport space
    let ax = 0;
    let ay = 0;
    let prevAx = 0;
    let prevAy = 0;
    function measure() {
      const r = anchor!.getBoundingClientRect();
      ax = r.left;
      ay = r.top;
    }
    measure();
    prevAx = ax;
    prevAy = ay;

    // ---- state ----
    let phase: Phase = "intro";
    let stiff = INTRO_STIFF;
    let damp = IDLE_DAMP;
    let burstT = 0;
    let phaseT = 0; // time within the current vortex phase
    let spun = 0; // angle accumulated during spin (drives the 2-rotation count)
    let spinAngle = 0;
    let clicks = 0;
    let mx = -9999;
    let my = -9999;
    let mouseInside = false;
    let raf = 0;
    let last = 0;
    let ready = false;
    let disposed = false;
    let introStartAt = 0; // wall-clock time the assemble intro may begin

    // ---- sample the image ----
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = src;
    img.onload = () => {
      if (disposed) return;
      const scale = DIV_W / img.naturalWidth;
      const sx = 79.5 / scale;
      const sy = 65 / scale;
      const sw = WIN_W / scale;
      const sh = WIN_H / scale;

      const off = document.createElement("canvas");
      off.width = WIN_W;
      off.height = WIN_H;
      const octx = off.getContext("2d")!;
      octx.drawImage(img, sx, sy, sw, sh, 0, 0, WIN_W, WIN_H);
      const data = octx.getImageData(0, 0, WIN_W, WIN_H).data;

      const cols = Math.floor(WIN_W / STEP);
      const rows = Math.floor(WIN_H / STEP);
      N = cols * rows;
      dx = new Float32Array(N);
      dy = new Float32Array(N);
      px = new Float32Array(N);
      py = new Float32Array(N);
      vx = new Float32Array(N);
      vy = new Float32Array(N);
      prevX = new Float32Array(N);
      prevY = new Float32Array(N);
      gx0 = new Float32Array(N);
      gy0 = new Float32Array(N);
      fu = new Float32Array(N);
      fphi = new Float32Array(N);
      sth = new Float32Array(N);
      jmag = new Float32Array(N);
      jang = new Float32Array(N);
      col = new Uint32Array(N);

      let i = 0;
      for (let ry = 0; ry < rows; ry++) {
        for (let cx = 0; cx < cols; cx++) {
          dx[i] = cx * STEP + STEP / 2;
          dy[i] = ry * STEP + STEP / 2;
          // globe coords: random point on a lumpy sphere (image not readable mid-spin)
          fphi[i] = Math.random() * TAU; // azimuth
          sth[i] = Math.acos(1 - 2 * Math.random()); // uniform polar
          fu[i] = 1 + (Math.random() - 0.5) * GLOBE_BUMP; // uneven radius
          jmag[i] = Math.random() * Math.random(); // biased small -> most dots near surface
          jang[i] = Math.random() * TAU;
          // average the cell -> smoother color
          let r = 0;
          let g = 0;
          let b = 0;
          let n = 0;
          for (let yy2 = 0; yy2 < STEP; yy2++) {
            const yy = ry * STEP + yy2;
            for (let xx2 = 0; xx2 < STEP; xx2++) {
              const xx = cx * STEP + xx2;
              const p = (yy * WIN_W + xx) * 4;
              r += data[p];
              g += data[p + 1];
              b += data[p + 2];
              n++;
            }
          }
          r /= n;
          g /= n;
          b /= n;
          const lum = 0.299 * r + 0.587 * g + 0.114 * b;
          r = clamp255((r - lum) * SAT + lum);
          g = clamp255((g - lum) * SAT + lum);
          b = clamp255((b - lum) * SAT + lum);
          col[i] = (255 << 24) | (b << 16) | (g << 8) | r;
          px[i] = Math.random() * vw;
          py[i] = Math.random() * vh;
          i++;
        }
      }
      ready = true;
      const t0 = performance.now();
      introStartAt = t0 + startDelay;
      last = t0;
      raf = requestAnimationFrame(tick);
    };

    // ---- impulses ----
    function clickImpulse(cx: number, cy: number) {
      clicks++;
      if (clicks >= 5) {
        triggerBurst();
        return;
      }
      const power = 380 * clicks;
      const R = 260;
      for (let i = 0; i < N; i++) {
        const ddx = px[i] - cx;
        const ddy = py[i] - cy;
        const d = Math.hypot(ddx, ddy) || 0.0001;
        const falloff = Math.max(0, 1 - d / R);
        const mag = power * falloff + 60;
        vx[i] += (ddx / d) * mag;
        vy[i] += (ddy / d) * mag;
      }
      stiff *= 0.68;
    }

    function triggerBurst() {
      phase = "burst";
      burstT = 0;
      stiff = 0;
      damp = 1.8;
      const cx = ax + WIN_W / 2;
      const cy = ay + WIN_H / 2;
      for (let i = 0; i < N; i++) {
        const ddx = px[i] - cx;
        const ddy = py[i] - cy;
        const d = Math.hypot(ddx, ddy) || 0.0001;
        const speed = 650 + Math.random() * 750;
        vx[i] = (ddx / d) * speed + (Math.random() - 0.5) * 500;
        vy[i] = (ddy / d) * speed + (Math.random() - 0.5) * 500 - 200;
      }
    }

    function enterGather() {
      phase = "gather";
      phaseT = 0;
      spun = 0;
      spinAngle = 0;
      for (let i = 0; i < N; i++) {
        gx0[i] = px[i];
        gy0[i] = py[i];
        prevX[i] = px[i];
        prevY[i] = py[i];
      }
    }

    // ---- main loop ----
    function tick(now: number) {
      if (disposed) return;
      raf = requestAnimationFrame(tick);
      if (!ready) return;
      // hold: keep the dot field blank until the title has faded in, then assemble
      if (now < introStartAt) {
        last = now;
        return;
      }
      let dt = (now - last) / 1000;
      last = now;
      if (dt > 0.05) dt = 0.05;

      measure();
      // page scrolled (or layout shifted): move every dot 1:1 with the anchor so
      // the field tracks the page instantly instead of spring-chasing it (no lag)
      const sdx = ax - prevAx;
      const sdy = ay - prevAy;
      if (sdx !== 0 || sdy !== 0) {
        for (let i = 0; i < N; i++) {
          px[i] += sdx;
          py[i] += sdy;
        }
        prevAx = ax;
        prevAy = ay;
      }
      const Cx = ax + WIN_W / 2;
      const Cy = ay + WIN_H / 2;

      if (phase === "burst") {
        burstT += dt;
        if (burstT >= BURST_HOLD) enterGather();
      }

      if (phase === "gather" || phase === "spin" || phase === "resolve") {
        phaseT += dt;
        // spin from the moment dots start gathering (no static pause), accelerating
        const prog = Math.min(1, spun / TURN_TOTAL);
        const omega = OMEGA0 + (OMEGA1 - OMEGA0) * prog;
        spinAngle += SWIRL_DIR * omega * dt;
        spun += omega * dt;

        // funnel depth/tilt scale: full during gather+spin, collapses on resolve
        let depthScale = 1;
        let blendHome = 0;
        if (phase === "resolve") {
          const e = easeOut(Math.min(1, phaseT / RESOLVE_DUR));
          depthScale = 1 - e;
          blendHome = e;
        }
        const T = TILT * depthScale;
        const cyT = Math.cos(T);
        const syT = Math.sin(T);
        const gE = easeOut(Math.min(1, phaseT / GATHER_DUR));

        for (let i = 0; i < N; i++) {
          // point on the lumpy globe -> spin about vertical -> tilt -> project
          const R = GLOBE_R * fu[i];
          const sinth = Math.sin(sth[i]);
          const ph = fphi[i] + spinAngle;
          const lx = R * sinth * Math.cos(ph);
          const ly = R * Math.cos(sth[i]);
          const lz = R * sinth * Math.sin(ph);
          // tilt about X so we peek slightly over the top
          const ly2 = ly * cyT - lz * syT;
          const z2 = ly * syT + lz * cyT; // +z = toward camera
          // front dots bigger, back dots smaller; depthScale->0 flattens it
          const sc = FOCAL / (FOCAL + (GLOBE_R - z2) * depthScale);
          // loose scatter near the surface, faded out as it resolves to the picture
          const jit = jmag[i] * GLOBE_JIT * depthScale;
          const fxp = Cx + lx * sc + Math.cos(jang[i]) * jit;
          const fyp = Cy + ly2 * sc + Math.sin(jang[i]) * jit;

          if (phase === "gather") {
            px[i] = gx0[i] + (fxp - gx0[i]) * gE;
            py[i] = gy0[i] + (fyp - gy0[i]) * gE;
          } else if (phase === "spin") {
            px[i] = fxp;
            py[i] = fyp;
          } else {
            // resolve: funnel flattens forward AND blends to home pixel
            const hx = ax + dx[i];
            const hy = ay + dy[i];
            px[i] = fxp + (hx - fxp) * blendHome;
            py[i] = fyp + (hy - fyp) * blendHome;
          }
        }

        if (phase === "gather" && phaseT >= GATHER_DUR) {
          phase = "spin";
          phaseT = 0;
        } else if (phase === "spin" && spun >= TURN_TOTAL) {
          phase = "resolve";
          phaseT = 0;
        } else if (phase === "resolve" && phaseT >= RESOLVE_DUR) {
          for (let i = 0; i < N; i++) {
            px[i] = ax + dx[i];
            py[i] = ay + dy[i];
          }
          phase = "idle";
          stiff = IDLE_STIFF;
          damp = IDLE_DAMP;
          clicks = 0;
        }
      } else {
        // spring physics (intro / idle / burst)
        const g = phase === "burst" ? GRAVITY : 0;
        const dampF = 1 - Math.min(1, damp * dt);
        const hoverActive =
          (phase === "idle" || phase === "intro") && mouseInside;
        const hr2 = HOVER_R * HOVER_R;
        const pillActive =
          pill.active && (phase === "idle" || phase === "intro");
        const pillX = pill.x;
        const pillY = pill.y;
        const pillR = pill.r + PILL_PAD;
        const pr2 = pillR * pillR;

        let s = 0;
        for (let i = 0; i < N; i++) {
          const tx = ax + dx[i];
          const ty = ay + dy[i];
          let fx = (tx - px[i]) * stiff;
          let fy = (ty - py[i]) * stiff + g;

          if (hoverActive) {
            const hx = px[i] - mx;
            const hy = py[i] - my;
            const d2 = hx * hx + hy * hy;
            if (d2 < hr2 && d2 > 0.0001) {
              const d = Math.sqrt(d2);
              const f = HOVER_FORCE * (1 - d / HOVER_R);
              fx += (hx / d) * f;
              fy += (hy / d) * f;
            }
          }

          if (pillActive) {
            const qx = px[i] - pillX;
            const qy = py[i] - pillY;
            const d2 = qx * qx + qy * qy;
            if (d2 < pr2 && d2 > 0.0001) {
              const d = Math.sqrt(d2);
              const f = PILL_FORCE * (1 - d / pillR);
              fx += (qx / d) * f;
              fy += (qy / d) * f;
            }
          }

          const nvx = (vx[i] + fx * dt) * dampF;
          const nvy = (vy[i] + fy * dt) * dampF;
          px[i] += nvx * dt;
          py[i] += nvy * dt;
          vx[i] = nvx;
          vy[i] = nvy;

          if (phase === "intro") {
            const ex = tx - px[i];
            const ey = ty - py[i];
            s += ex * ex + ey * ey;
          }
        }

        if (phase === "intro" && s / N < 1.5) {
          phase = "idle";
          stiff = IDLE_STIFF;
          damp = IDLE_DAMP;
        }
      }

      draw();
    }

    // single-pixel line into the buffer (DDA), device-px coords
    function line(x0: number, y0: number, x1: number, y1: number, c: number) {
      const ddx = x1 - x0;
      const ddy = y1 - y0;
      const steps = Math.max(Math.abs(ddx), Math.abs(ddy)) | 0;
      if (steps <= 0) return;
      const ix = ddx / steps;
      const iy = ddy / steps;
      let fx = x0;
      let fy = y0;
      for (let k = 0; k <= steps; k++) {
        const xx = fx | 0;
        const yy = fy | 0;
        if (xx >= 0 && xx < bw && yy >= 0 && yy < bh) buf32[yy * bw + xx] = c;
        fx += ix;
        fy += iy;
      }
    }

    function draw() {
      buf32.fill(0);
      const streaks =
        phase === "gather" || phase === "spin" || phase === "resolve";

      for (let i = 0; i < N; i++) {
        const cx = (px[i] * dpr) | 0;
        const cy = (py[i] * dpr) | 0;
        const c = col[i];

        if (streaks) {
          // comet tail trailing opposite to this frame's motion
          const tdx = (px[i] - prevX[i]) * dpr * TAIL_GAIN;
          const tdy = (py[i] - prevY[i]) * dpr * TAIL_GAIN;
          if (tdx * tdx + tdy * tdy > 4) {
            line(cx, cy, (cx - tdx) | 0, (cy - tdy) | 0, c);
          }
          prevX[i] = px[i];
          prevY[i] = py[i];
        }

        for (let k = 0; k < stampN; k++) {
          const xx = cx + stampX[k];
          const yy = cy + stampY[k];
          if (xx < 0 || xx >= bw || yy < 0 || yy >= bh) continue;
          buf32[yy * bw + xx] = c;
        }
      }
      ctx!.putImageData(imageData, 0, 0);
    }

    // ---- input ----
    function inAnchor(x: number, y: number) {
      const r = anchor!.getBoundingClientRect();
      return x >= r.left && x <= r.right && y >= r.top && y <= r.bottom;
    }
    function onMove(e: MouseEvent) {
      mx = e.clientX;
      my = e.clientY;
      mouseInside = inAnchor(mx, my);
    }
    function onClick(e: MouseEvent) {
      if (phase !== "idle" && phase !== "intro") return;
      if (!inAnchor(e.clientX, e.clientY)) return;
      clickImpulse(e.clientX, e.clientY);
    }
    function onResize() {
      resizeCanvas();
      measure();
      prevAx = ax; // resync so the scroll-track shift doesn't fire on a resize jump
      prevAy = ay;
    }

    window.addEventListener("mousemove", onMove);
    window.addEventListener("click", onClick);
    window.addEventListener("resize", onResize);

    return () => {
      disposed = true;
      cancelAnimationFrame(raf);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("click", onClick);
      window.removeEventListener("resize", onResize);
    };
  }, [anchorRef, src]);

  return createPortal(
    <canvas
      ref={canvasRef}
      style={{
        position: "fixed",
        left: 0,
        top: 0,
        pointerEvents: "none",
        zIndex: 50,
      }}
    />,
    document.body
  );
}

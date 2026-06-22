"use client";

import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";

/**
 * Mobile dot-portrait — same physics as desktop HeroDots but:
 * - Geometry: WIN 343×254, centered crop (sx=163/scale vs 79.5/scale)
 * - No pillTracker (no matter-js pill easter egg on mobile)
 * - pointermove instead of mousemove → covers touch drag repel
 * - Tap (click) sequence still triggers burst→globe→resolve
 */

const WIN_W = 343;
const WIN_H = 254;
const DIV_W = 669;

const STEP = 2;
const DOT  = 3;
const SAT  = 1.45;

const HOVER_R     = 160;
const HOVER_FORCE = 3500;

const IDLE_STIFF  = 130;
const IDLE_DAMP   = 14;
const INTRO_STIFF = 38;
const GRAVITY     = 40;
const BURST_HOLD  = 5;

const GATHER_DUR  = 1.0;
const RESOLVE_DUR = 1.0;
const ROTATIONS   = 2;
const TURN_TOTAL  = ROTATIONS * Math.PI * 2;
const OMEGA0      = 2.5;
const OMEGA1      = 12.0;
const SWIRL_DIR   = 1;
const GLOBE_R     = 170;
const GLOBE_BUMP  = 0.5;
const GLOBE_JIT   = 35;
const FOCAL       = 500;
const TILT        = 0.35;
const TAIL_GAIN   = 3.5;
const TAU         = Math.PI * 2;

type Phase = "intro" | "idle" | "burst" | "gather" | "spin" | "resolve";

const clamp255 = (v: number) => (v < 0 ? 0 : v > 255 ? 255 : v) | 0;
const easeOut  = (t: number) => 1 - Math.pow(1 - t, 3);

export default function MobileHeroDots({
  anchorRef,
  src,
}: {
  anchorRef: React.RefObject<HTMLDivElement | null>;
  src: string;
}) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const anchor = anchorRef.current;
    if (!canvas || !anchor) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    let vw = 0, vh = 0, bw = 0, bh = 0;
    let imageData: ImageData;
    let buf32: Uint32Array;

    function resizeCanvas() {
      vw = window.innerWidth;
      vh = window.innerHeight;
      bw = Math.floor(vw * dpr);
      bh = Math.floor(vh * dpr);
      canvas!.width  = bw;
      canvas!.height = bh;
      canvas!.style.width  = vw + "px";
      canvas!.style.height = vh + "px";
      imageData = ctx!.createImageData(bw, bh);
      buf32     = new Uint32Array(imageData.data.buffer);
    }
    resizeCanvas();

    let N = 0;
    let dx: Float32Array, dy: Float32Array;
    let px: Float32Array, py: Float32Array;
    let vx: Float32Array, vy: Float32Array;
    let prevX: Float32Array, prevY: Float32Array;
    let gx0: Float32Array, gy0: Float32Array;
    let fu: Float32Array, fphi: Float32Array;
    let sth: Float32Array, jmag: Float32Array, jang: Float32Array;
    let col: Uint32Array;
    const DOT_DPR = Math.max(1, Math.round(DOT * dpr));

    const stampX: number[] = [];
    const stampY: number[] = [];
    {
      const rad = DOT_DPR / 2;
      const r2  = rad * rad;
      const lim = Math.ceil(rad);
      for (let oy = -lim; oy <= lim; oy++) {
        for (let ox = -lim; ox <= lim; ox++) {
          if (ox * ox + oy * oy <= r2) { stampX.push(ox); stampY.push(oy); }
        }
      }
    }
    const stampN = stampX.length;

    let ax = 0, ay = 0, prevAx = 0, prevAy = 0;
    function measure() {
      const r = anchor!.getBoundingClientRect();
      ax = r.left; ay = r.top;
    }
    measure();
    prevAx = ax; prevAy = ay;

    let phase: Phase = "intro";
    let stiff  = INTRO_STIFF;
    let damp   = IDLE_DAMP;
    let burstT = 0, phaseT = 0, spun = 0, spinAngle = 0;
    let clicks = 0;
    let mx = -9999, my = -9999, pointerInside = false;
    let raf = 0, last = 0, ready = false, disposed = false;

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = src;
    img.onload = () => {
      if (disposed) return;
      // Centered-crop the portrait: same as desktop but narrower window
      const scale = DIV_W / img.naturalWidth;
      const sx    = 163 / scale;           // (669-343)/2 = 163px margin each side
      const sy    = 65  / scale;           // same vertical crop as desktop
      const sw    = WIN_W / scale;
      const sh    = WIN_H / scale;

      const off  = document.createElement("canvas");
      off.width  = WIN_W;
      off.height = WIN_H;
      const octx = off.getContext("2d")!;
      octx.drawImage(img, sx, sy, sw, sh, 0, 0, WIN_W, WIN_H);
      const data = octx.getImageData(0, 0, WIN_W, WIN_H).data;

      const cols = Math.floor(WIN_W / STEP);
      const rows = Math.floor(WIN_H / STEP);
      N = cols * rows;
      dx    = new Float32Array(N); dy    = new Float32Array(N);
      px    = new Float32Array(N); py    = new Float32Array(N);
      vx    = new Float32Array(N); vy    = new Float32Array(N);
      prevX = new Float32Array(N); prevY = new Float32Array(N);
      gx0   = new Float32Array(N); gy0   = new Float32Array(N);
      fu    = new Float32Array(N); fphi  = new Float32Array(N);
      sth   = new Float32Array(N); jmag  = new Float32Array(N);
      jang  = new Float32Array(N); col   = new Uint32Array(N);

      let i = 0;
      for (let ry = 0; ry < rows; ry++) {
        for (let cx = 0; cx < cols; cx++) {
          dx[i] = cx * STEP + STEP / 2;
          dy[i] = ry * STEP + STEP / 2;
          fphi[i] = Math.random() * TAU;
          sth[i]  = Math.acos(1 - 2 * Math.random());
          fu[i]   = 1 + (Math.random() - 0.5) * GLOBE_BUMP;
          jmag[i] = Math.random() * Math.random();
          jang[i] = Math.random() * TAU;
          let r = 0, g = 0, b = 0, n = 0;
          for (let yy2 = 0; yy2 < STEP; yy2++) {
            const yy = ry * STEP + yy2;
            for (let xx2 = 0; xx2 < STEP; xx2++) {
              const xx = cx * STEP + xx2;
              const p  = (yy * WIN_W + xx) * 4;
              r += data[p]; g += data[p + 1]; b += data[p + 2]; n++;
            }
          }
          r /= n; g /= n; b /= n;
          const lum = 0.299 * r + 0.587 * g + 0.114 * b;
          r = clamp255((r - lum) * SAT + lum);
          g = clamp255((g - lum) * SAT + lum);
          b = clamp255((b - lum) * SAT + lum);
          col[i] = (255 << 24) | (b << 16) | (g << 8) | r;
          px[i]  = Math.random() * vw;
          py[i]  = Math.random() * vh;
          i++;
        }
      }
      ready = true;
      last  = performance.now();
      raf   = requestAnimationFrame(tick);
    };

    function clickImpulse(cx: number, cy: number) {
      clicks++;
      if (clicks >= 5) { triggerBurst(); return; }
      const power = 380 * clicks;
      const R     = 220;
      for (let i = 0; i < N; i++) {
        const ddx = px[i] - cx, ddy = py[i] - cy;
        const d   = Math.hypot(ddx, ddy) || 0.0001;
        const f   = Math.max(0, 1 - d / R) * power + 60;
        vx[i] += (ddx / d) * f; vy[i] += (ddy / d) * f;
      }
      stiff *= 0.68;
    }

    function triggerBurst() {
      phase = "burst"; burstT = 0; stiff = 0; damp = 1.8;
      const cx = ax + WIN_W / 2, cy = ay + WIN_H / 2;
      for (let i = 0; i < N; i++) {
        const ddx = px[i] - cx, ddy = py[i] - cy;
        const d   = Math.hypot(ddx, ddy) || 0.0001;
        const sp  = 650 + Math.random() * 750;
        vx[i] = (ddx / d) * sp + (Math.random() - 0.5) * 500;
        vy[i] = (ddy / d) * sp + (Math.random() - 0.5) * 500 - 200;
      }
    }

    function enterGather() {
      phase = "gather"; phaseT = 0; spun = 0; spinAngle = 0;
      for (let i = 0; i < N; i++) {
        gx0[i] = px[i]; gy0[i] = py[i];
        prevX[i] = px[i]; prevY[i] = py[i];
      }
    }

    function tick(now: number) {
      if (disposed) return;
      raf = requestAnimationFrame(tick);
      if (!ready) return;
      let dt = (now - last) / 1000;
      last = now;
      if (dt > 0.05) dt = 0.05;

      measure();
      const sdx = ax - prevAx, sdy = ay - prevAy;
      if (sdx !== 0 || sdy !== 0) {
        for (let i = 0; i < N; i++) { px[i] += sdx; py[i] += sdy; }
        prevAx = ax; prevAy = ay;
      }
      const Cx = ax + WIN_W / 2, Cy = ay + WIN_H / 2;

      if (phase === "burst") { burstT += dt; if (burstT >= BURST_HOLD) enterGather(); }

      if (phase === "gather" || phase === "spin" || phase === "resolve") {
        phaseT += dt;
        const prog  = Math.min(1, spun / TURN_TOTAL);
        const omega = OMEGA0 + (OMEGA1 - OMEGA0) * prog;
        spinAngle  += SWIRL_DIR * omega * dt;
        spun       += omega * dt;

        let depthScale = 1, blendHome = 0;
        if (phase === "resolve") {
          const e = easeOut(Math.min(1, phaseT / RESOLVE_DUR));
          depthScale = 1 - e; blendHome = e;
        }
        const T = TILT * depthScale, cyT = Math.cos(T), syT = Math.sin(T);
        const gE = easeOut(Math.min(1, phaseT / GATHER_DUR));

        for (let i = 0; i < N; i++) {
          const R    = GLOBE_R * fu[i];
          const sinth= Math.sin(sth[i]);
          const ph   = fphi[i] + spinAngle;
          const lx   = R * sinth * Math.cos(ph);
          const ly   = R * Math.cos(sth[i]);
          const lz   = R * sinth * Math.sin(ph);
          const ly2  = ly * cyT - lz * syT;
          const z2   = ly * syT + lz * cyT;
          const sc   = FOCAL / (FOCAL + (GLOBE_R - z2) * depthScale);
          const jit  = jmag[i] * GLOBE_JIT * depthScale;
          const fxp  = Cx + lx * sc + Math.cos(jang[i]) * jit;
          const fyp  = Cy + ly2 * sc + Math.sin(jang[i]) * jit;

          if (phase === "gather") {
            px[i] = gx0[i] + (fxp - gx0[i]) * gE;
            py[i] = gy0[i] + (fyp - gy0[i]) * gE;
          } else if (phase === "spin") {
            px[i] = fxp; py[i] = fyp;
          } else {
            const hx = ax + dx[i], hy = ay + dy[i];
            px[i] = fxp + (hx - fxp) * blendHome;
            py[i] = fyp + (hy - fyp) * blendHome;
          }
        }

        if (phase === "gather" && phaseT >= GATHER_DUR) {
          phase = "spin"; phaseT = 0;
        } else if (phase === "spin" && spun >= TURN_TOTAL) {
          phase = "resolve"; phaseT = 0;
        } else if (phase === "resolve" && phaseT >= RESOLVE_DUR) {
          for (let i = 0; i < N; i++) { px[i] = ax + dx[i]; py[i] = ay + dy[i]; }
          phase = "idle"; stiff = IDLE_STIFF; damp = IDLE_DAMP; clicks = 0;
        }
      } else {
        const g      = phase === "burst" ? GRAVITY : 0;
        const dampF  = 1 - Math.min(1, damp * dt);
        const active = (phase === "idle" || phase === "intro") && pointerInside;
        const hr2    = HOVER_R * HOVER_R;
        let s = 0;
        for (let i = 0; i < N; i++) {
          const tx = ax + dx[i], ty = ay + dy[i];
          let fx = (tx - px[i]) * stiff;
          let fy = (ty - py[i]) * stiff + g;
          if (active) {
            const hx = px[i] - mx, hy = py[i] - my;
            const d2 = hx * hx + hy * hy;
            if (d2 < hr2 && d2 > 0.0001) {
              const d = Math.sqrt(d2);
              const f = HOVER_FORCE * (1 - d / HOVER_R);
              fx += (hx / d) * f; fy += (hy / d) * f;
            }
          }
          const nvx = (vx[i] + fx * dt) * dampF;
          const nvy = (vy[i] + fy * dt) * dampF;
          px[i] += nvx * dt; py[i] += nvy * dt;
          vx[i] = nvx; vy[i] = nvy;
          if (phase === "intro") { const ex = tx - px[i], ey = ty - py[i]; s += ex * ex + ey * ey; }
        }
        if (phase === "intro" && s / N < 1.5) { phase = "idle"; stiff = IDLE_STIFF; damp = IDLE_DAMP; }
      }

      draw();
    }

    function line(x0: number, y0: number, x1: number, y1: number, c: number) {
      const ddx = x1 - x0, ddy = y1 - y0;
      const steps = Math.max(Math.abs(ddx), Math.abs(ddy)) | 0;
      if (steps <= 0) return;
      const ix = ddx / steps, iy = ddy / steps;
      let fx = x0, fy = y0;
      for (let k = 0; k <= steps; k++) {
        const xx = fx | 0, yy = fy | 0;
        if (xx >= 0 && xx < bw && yy >= 0 && yy < bh) buf32[yy * bw + xx] = c;
        fx += ix; fy += iy;
      }
    }

    function draw() {
      buf32.fill(0);
      const streaks = phase === "gather" || phase === "spin" || phase === "resolve";
      for (let i = 0; i < N; i++) {
        const cx = (px[i] * dpr) | 0, cy = (py[i] * dpr) | 0;
        const c  = col[i];
        if (streaks) {
          const tdx = (px[i] - prevX[i]) * dpr * TAIL_GAIN;
          const tdy = (py[i] - prevY[i]) * dpr * TAIL_GAIN;
          if (tdx * tdx + tdy * tdy > 4) line(cx, cy, (cx - tdx) | 0, (cy - tdy) | 0, c);
          prevX[i] = px[i]; prevY[i] = py[i];
        }
        for (let k = 0; k < stampN; k++) {
          const xx = cx + stampX[k], yy = cy + stampY[k];
          if (xx < 0 || xx >= bw || yy < 0 || yy >= bh) continue;
          buf32[yy * bw + xx] = c;
        }
      }
      ctx!.putImageData(imageData, 0, 0);
    }

    function inAnchor(x: number, y: number) {
      const r = anchor!.getBoundingClientRect();
      return x >= r.left && x <= r.right && y >= r.top && y <= r.bottom;
    }

    // pointermove handles both mouse hover and touch drag
    function onPointerMove(e: PointerEvent) {
      mx = e.clientX; my = e.clientY;
      pointerInside = inAnchor(mx, my);
    }
    function onPointerUp() {
      mx = -9999; my = -9999; pointerInside = false;
    }
    function onClick(e: MouseEvent) {
      if (phase !== "idle" && phase !== "intro") return;
      if (!inAnchor(e.clientX, e.clientY)) return;
      clickImpulse(e.clientX, e.clientY);
    }
    function onResize() {
      resizeCanvas(); measure();
      prevAx = ax; prevAy = ay;
    }

    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup",   onPointerUp);
    window.addEventListener("click",       onClick);
    window.addEventListener("resize",      onResize);

    return () => {
      disposed = true;
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup",   onPointerUp);
      window.removeEventListener("click",       onClick);
      window.removeEventListener("resize",      onResize);
    };
  }, [anchorRef, src]);

  return createPortal(
    <canvas
      ref={canvasRef}
      style={{ position: "fixed", left: 0, top: 0, pointerEvents: "none", zIndex: 50 }}
    />,
    document.body
  );
}

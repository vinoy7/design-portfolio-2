"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { animate, motion, useMotionValue, useReducedMotion } from "motion/react";
import Matter from "matter-js";

export type Tab = "work" | "playground" | "ai" | "about";

const EASE = [0.22, 1, 0.36, 1] as [number, number, number, number];

const TABS: { id: Tab; label: string }[] = [
  { id: "work", label: "Work" },
  { id: "playground", label: "Playground" },
  { id: "ai", label: "AI Experiments" },
  { id: "about", label: "About Me" },
];

const PILL_BG = "#f5eee2";

// Easter-egg tuning.
const POP_AT = 10; // 10th rapid click pops the pill off
const FLOOR_MARGIN = 0; // rest flush against the very bottom of the window
const MAGNET_THRESHOLD = 130; // center-to-center px to dock home
const LAUNCH_VY = -14; // upward kick on pop-off (matter px/step)

interface TabNavProps {
  active: Tab;
  onChange: (tab: Tab) => void;
  /** First-load choreography: stagger the tabs in, then fade the active pill in. */
  intro?: boolean;
  /** When false (during intro, pre-pill), the active tab renders in default style. */
  showActiveStyle?: boolean;
}

export default function TabNav({
  active,
  onChange,
  intro = false,
  showActiveStyle = true,
}: TabNavProps) {
  const reduce = useReducedMotion();
  const [hoveredTab, setHoveredTab] = useState<Tab | null>(null);

  // Easter egg, two stages:
  // 1. Rapid-clicking the active pill makes a clone hop higher each click
  //    (`playing`), then settle back when the burst stops. Kept lightweight with
  //    Motion springs — it's a fast, repeated interaction.
  // 2. The 10th rapid click pops the pill OFF (`popped`): it portals to <body>
  //    and becomes a matter-js rigid body — it falls under gravity, bounces, and
  //    can be grabbed. Holding one side lets the other droop under its own
  //    weight (grab-point pin constraint). A magnet docks it back to its tab.
  const [playing, setPlaying] = useState(false);
  const [popped, setPopped] = useState(false);
  // Size of the docked pill, captured at pop time. State (not a ref) so it can be
  // read in JSX without an access-ref-during-render warning.
  const [pillBox, setPillBox] = useState<{ w: number; h: number }>({ w: 0, h: 0 });
  // Initial transform for the loose pill (its docked spot), so it doesn't flash
  // at (0,0) before the first physics frame. State, not a ref read in render.
  const [initialXform, setInitialXform] = useState<string | undefined>(undefined);

  const clickCountRef = useRef(0);
  const lastClickRef = useRef(0);
  const restoreRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Per-tab button refs. The active button is read as btnRefs[activeIdx] rather
  // than a dedicated ref — a conditional ref callback leaves a stale handle
  // through React's null→el ref cycle when the active tab changes.
  const btnRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const audioRef = useRef<AudioContext | null>(null);

  // Hopping clone motion values (stage 1).
  const fy = useMotionValue(0);
  const frot = useMotionValue(0);

  // --- matter-js refs (stage 2) ---
  const engineRef = useRef<Matter.Engine | null>(null);
  const bodyRef = useRef<Matter.Body | null>(null);
  const floorRef = useRef<Matter.Body | null>(null);
  const wallsRef = useRef<Matter.Body[]>([]);
  const dragRef = useRef<Matter.Constraint | null>(null);
  const rafRef = useRef(0);
  const pillElRef = useRef<HTMLDivElement | null>(null);
  const popHomeRef = useRef<{ left: number; top: number; w: number; h: number } | null>(null);
  // Live render size of the loose pill (matches the matter body during free
  // motion; lerps toward the destination tab's size while homing, so the pill
  // resizes as it flies from the floor to a newly-selected tab).
  const sizeRef = useRef<{ w: number; h: number }>({ w: 0, h: 0 });
  const homeSizeRef = useRef<{ w: number; h: number }>({ w: 0, h: 0 });
  // Magnet/homing state.
  const homingRef = useRef(false);
  const homeTargetRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const magnetEngagedRef = useRef(false);
  // The pill must leave the magnet radius before re-entry docks it, so a pill
  // resting inside the radius (short windows) stays grabbable.
  const wasOutsideRef = useRef(false);
  const draggingRef = useRef(false);
  const lastThudRef = useRef(0);

  // Magnetic pull: hovering an inactive tab tugs the active pill's facing edge
  // out by distance: 1 away = 4px, 2 away = 8px, 3 away = 10px.
  const PULL_BY_DIST = [0, 4, 8, 10];
  const activeIdx = TABS.findIndex((t) => t.id === active);
  const hoverIdx = hoveredTab ? TABS.findIndex((t) => t.id === hoveredTab) : -1;
  let stretchLeft = 0;
  let stretchRight = 0;
  if (!reduce && hoverIdx >= 0 && hoverIdx !== activeIdx) {
    const pull = PULL_BY_DIST[Math.abs(hoverIdx - activeIdx)];
    if (hoverIdx > activeIdx) stretchRight = pull;
    else stretchLeft = pull;
  }

  useEffect(
    () => () => {
      if (restoreRef.current) clearTimeout(restoreRef.current);
      audioRef.current?.close();
    },
    []
  );

  // ---- Audio (synthesized, no asset files) -------------------------------
  const getCtx = (): AudioContext | null => {
    type ACtor = typeof AudioContext;
    const Ctx: ACtor | undefined =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext?: ACtor }).webkitAudioContext;
    if (!Ctx) return null;
    const ctx = (audioRef.current ??= new Ctx());
    if (ctx.state === "suspended") ctx.resume();
    return ctx;
  };

  // Damped pitch wobble that rises with the jump count → "boi-oi-oing".
  const playBoing = (count: number) => {
    const ctx = getCtx();
    if (!ctx) return;
    const t = ctx.currentTime;
    const dur = 0.34;
    const base = 300 + count * 45;
    const N = 64;
    const curve = new Float32Array(N);
    for (let i = 0; i < N; i++) {
      const x = i / (N - 1);
      const env = Math.exp(-4 * x);
      curve[i] = base * (1 + 0.55 * env * Math.sin(2 * Math.PI * 6 * x));
    }
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "triangle";
    osc.frequency.setValueCurveAtTime(curve, t, dur);
    gain.gain.setValueAtTime(0.0001, t);
    gain.gain.exponentialRampToValueAtTime(0.18, t + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    osc.connect(gain).connect(ctx.destination);
    osc.start(t);
    osc.stop(t + dur);
  };

  // Bigger launch with an upward sweep then wobble — the pop-off.
  const playSproing = () => {
    const ctx = getCtx();
    if (!ctx) return;
    const t = ctx.currentTime;
    const dur = 0.5;
    const N = 80;
    const curve = new Float32Array(N);
    const f0 = 180;
    const f1 = 520;
    for (let i = 0; i < N; i++) {
      const x = i / (N - 1);
      const sweep = f0 + (f1 - f0) * x;
      const env = Math.exp(-3 * x);
      curve[i] = sweep * (1 + 0.5 * env * Math.sin(2 * Math.PI * 5 * x));
    }
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "triangle";
    osc.frequency.setValueCurveAtTime(curve, t, dur);
    gain.gain.setValueAtTime(0.0001, t);
    gain.gain.exponentialRampToValueAtTime(0.22, t + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    osc.connect(gain).connect(ctx.destination);
    osc.start(t);
    osc.stop(t + dur);
  };

  // Short low blip with a pitch drop — a floor contact.
  const playThud = () => {
    const ctx = getCtx();
    if (!ctx) return;
    const t = ctx.currentTime;
    const dur = 0.12;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(140, t);
    osc.frequency.exponentialRampToValueAtTime(60, t + dur);
    gain.gain.setValueAtTime(0.0001, t);
    gain.gain.exponentialRampToValueAtTime(0.25, t + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    osc.connect(gain).connect(ctx.destination);
    osc.start(t);
    osc.stop(t + dur);
  };

  // High click with a downward suck — the magnet dock.
  const playSnap = () => {
    const ctx = getCtx();
    if (!ctx) return;
    const t = ctx.currentTime;
    const dur = 0.18;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "triangle";
    osc.frequency.setValueAtTime(900, t);
    osc.frequency.exponentialRampToValueAtTime(420, t + dur);
    gain.gain.setValueAtTime(0.0001, t);
    gain.gain.exponentialRampToValueAtTime(0.16, t + 0.008);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    osc.connect(gain).connect(ctx.destination);
    osc.start(t);
    osc.stop(t + dur);
  };

  // ---- matter helpers -----------------------------------------------------
  const writeTransform = (body: Matter.Body) => {
    const el = pillElRef.current;
    if (!el) return;
    const { w, h } = sizeRef.current;
    el.style.width = `${w}px`;
    el.style.height = `${h}px`;
    const sc = draggingRef.current ? 1.05 : 1;
    // translate3d + rotate keep this on the GPU compositor (Emil: animate only
    // transform/opacity). Centering uses the live size so the pill stays pinned
    // to the body center while it resizes mid-flight.
    el.style.transform = `translate3d(${body.position.x - w / 2}px, ${
      body.position.y - h / 2
    }px, 0) rotate(${body.angle}rad) scale(${sc})`;
  };

  const buildBounds = (engine: Matter.Engine) => {
    const T = 80;
    const wInner = window.innerWidth;
    const hInner = window.innerHeight;
    const floor = Matter.Bodies.rectangle(
      wInner / 2,
      hInner - FLOOR_MARGIN + T / 2,
      wInner + 400,
      T,
      { isStatic: true, restitution: 0.35, friction: 0.6 }
    );
    const left = Matter.Bodies.rectangle(-T / 2, hInner / 2, T, hInner * 3, {
      isStatic: true,
      restitution: 0.35,
    });
    const right = Matter.Bodies.rectangle(wInner + T / 2, hInner / 2, T, hInner * 3, {
      isStatic: true,
      restitution: 0.35,
    });
    floorRef.current = floor;
    wallsRef.current = [left, right];
    Matter.Composite.add(engine.world, [floor, left, right]);
  };

  const repositionBounds = () => {
    const floor = floorRef.current;
    const [, right] = wallsRef.current;
    if (floor)
      Matter.Body.setPosition(floor, {
        x: window.innerWidth / 2,
        y: window.innerHeight - FLOOR_MARGIN + 40,
      });
    if (right)
      Matter.Body.setPosition(right, {
        x: window.innerWidth + 40,
        y: window.innerHeight / 2,
      });
  };

  const homeRect = () => btnRefs.current[activeIdx]?.getBoundingClientRect();

  const homeDist = () => {
    const body = bodyRef.current;
    const r = homeRect();
    if (!body || !r) return Infinity;
    return Math.hypot(
      body.position.x - (r.left + r.width / 2),
      body.position.y - (r.top + r.height / 2)
    );
  };

  const releaseDrag = () => {
    const engine = engineRef.current;
    if (engine && dragRef.current) Matter.Composite.remove(engine.world, dragRef.current);
    dragRef.current = null;
    draggingRef.current = false;
  };

  // Begin the spring-like homing glide toward a tab slot, then dock on arrival.
  const engageHomeTo = (r: DOMRect) => {
    magnetEngagedRef.current = true;
    releaseDrag();
    homeTargetRef.current = { x: r.left + r.width / 2, y: r.top + r.height / 2 };
    homeSizeRef.current = { w: r.width, h: r.height };
    homingRef.current = true;
  };

  const engageHome = () => {
    const r = homeRect();
    if (!r) {
      dock();
      return;
    }
    engageHomeTo(r);
  };

  // Tear the toy down: restore the docked pill at the current active tab. Setting
  // `popped` false runs the matter effect's cleanup (engine teardown).
  const dock = () => {
    playSnap();
    if (restoreRef.current) {
      clearTimeout(restoreRef.current);
      restoreRef.current = null;
    }
    homingRef.current = false;
    magnetEngagedRef.current = false;
    draggingRef.current = false;
    clickCountRef.current = 0;
    setPlaying(false);
    setPopped(false);
  };

  const popOff = () => {
    if (restoreRef.current) clearTimeout(restoreRef.current);
    const btn = btnRefs.current[activeIdx];
    if (!btn) return;
    const r = btn.getBoundingClientRect();
    popHomeRef.current = { left: r.left, top: r.top, w: r.width, h: r.height };
    sizeRef.current = { w: r.width, h: r.height };
    homeSizeRef.current = { w: r.width, h: r.height };
    setPillBox({ w: r.width, h: r.height });
    setInitialXform(`translate3d(${r.left}px, ${r.top}px, 0)`);
    magnetEngagedRef.current = false;
    homingRef.current = false;
    draggingRef.current = false;
    clickCountRef.current = 0;
    setPlaying(false);
    setPopped(true);
    playSproing();
  };

  const handleActiveClick = () => {
    if (reduce || popped) return;
    // eslint-disable-next-line react-hooks/purity -- event handler, not render
    const now = Date.now();
    clickCountRef.current =
      now - lastClickRef.current < 1000 ? clickCountRef.current + 1 : 1;
    lastClickRef.current = now;
    const count = clickCountRef.current;

    if (count >= POP_AT) {
      popOff();
      return;
    }

    playBoing(count);

    if (count === 1) {
      fy.set(0);
      frot.set(0);
      setPlaying(true);
    }
    if (restoreRef.current) clearTimeout(restoreRef.current);

    const btnTop = btnRefs.current[activeIdx]?.getBoundingClientRect().top ?? 9999;
    const h = Math.min(28 + count * 24, btnTop - 8);
    const amp = 5 + count * 4;
    animate(fy, [fy.get(), -h, 0], {
      duration: 0.5,
      times: [0, 0.4, 1],
      ease: [0.2, 0.9, 0.3, 1],
    });
    animate(frot, [frot.get(), amp, -amp, amp * 0.5, 0], { duration: 0.55 });

    restoreRef.current = setTimeout(() => {
      animate(fy, 0, { type: "spring", stiffness: 500, damping: 30 });
      animate(frot, 0, {
        type: "spring",
        stiffness: 500,
        damping: 30,
        onComplete: () => setPlaying(false),
      });
    }, 1000);
  };

  // ---- Pointer drag (loose pill) -----------------------------------------
  const onPillPointerDown = (e: React.PointerEvent) => {
    const body = bodyRef.current;
    const engine = engineRef.current;
    if (!body || !engine) return;
    try {
      (e.target as Element).setPointerCapture?.(e.pointerId);
    } catch {
      /* pointer may already be released */
    }
    homingRef.current = false;
    magnetEngagedRef.current = false;
    draggingRef.current = true;
    const pointer = { x: e.clientX, y: e.clientY };
    // Pin the GRABBED point of the body to the cursor. Gravity then torques the
    // rest of the pill around that point — hold the left edge, the right droops.
    const offset = Matter.Vector.rotate(
      Matter.Vector.sub(pointer, body.position),
      -body.angle
    );
    // Soft spring (matter's own drag default region) — a stiff pin injects
    // energy and spins the body out. Soft = a natural draggy lag, and gravity
    // still torques the unheld side down around the grab point.
    const c = Matter.Constraint.create({
      pointA: pointer,
      bodyB: body,
      pointB: offset,
      stiffness: 0.25,
      damping: 0.1,
      length: 0,
    });
    dragRef.current = c;
    Matter.Composite.add(engine.world, c);
    wasOutsideRef.current = homeDist() >= MAGNET_THRESHOLD;
  };

  const onPillPointerMove = (e: React.PointerEvent) => {
    const c = dragRef.current;
    if (!c) return;
    c.pointA = { x: e.clientX, y: e.clientY };
    // Only track having-left-the-radius here. The dock happens on RELEASE, not
    // mid-drag — the pill stays in hand until let go in close proximity.
    if (homeDist() >= MAGNET_THRESHOLD) wasOutsideRef.current = true;
  };

  const onPillPointerUp = (e: React.PointerEvent) => {
    try {
      (e.target as Element).releasePointerCapture?.(e.pointerId);
    } catch {
      /* pointer may already be released */
    }
    releaseDrag();
    if (magnetEngagedRef.current) return;
    if (homeDist() < MAGNET_THRESHOLD && wasOutsideRef.current) engageHome();
    // else: physics keeps the throw — it falls and bounces back to the floor.
  };

  // ---- matter lifecycle: runs while the pill is popped off ----------------
  useEffect(() => {
    if (!popped) return;
    const home = popHomeRef.current;
    if (!home) return;
    const { w, h } = home;
    const cx = home.left + w / 2;
    const cy = home.top + h / 2;

    const engine = Matter.Engine.create();
    engine.gravity.y = 1;
    engineRef.current = engine;

    const body = Matter.Bodies.rectangle(cx, cy, w, h, {
      restitution: 0.5,
      frictionAir: 0.012,
      friction: 0.4,
      chamfer: { radius: h / 2 },
    });
    bodyRef.current = body;
    /* eslint-disable react-hooks/purity -- runs in effect (post-render), and a
       little launch randomness is intentional */
    Matter.Body.setVelocity(body, { x: (Math.random() - 0.5) * 5, y: LAUNCH_VY });
    Matter.Body.setAngularVelocity(body, (Math.random() - 0.5) * 0.12);
    /* eslint-enable react-hooks/purity */
    Matter.Composite.add(engine.world, body);
    buildBounds(engine);

    const onCollide = (evt: Matter.IEventCollision<Matter.Engine>) => {
      for (const pair of evt.pairs) {
        if (pair.bodyA === floorRef.current || pair.bodyB === floorRef.current) {
          const now = performance.now();
          if (Math.abs(body.velocity.y) > 2.5 && now - lastThudRef.current > 90) {
            lastThudRef.current = now;
            playThud();
          }
        }
      }
    };
    Matter.Events.on(engine, "collisionStart", onCollide);

    let alive = true;
    const tick = () => {
      if (!alive) return;
      Matter.Engine.update(engine, 1000 / 60);
      // Stability clamps — guard against constraint blow-ups (fast cursor jumps).
      if (Math.abs(body.angularVelocity) > 0.6)
        Matter.Body.setAngularVelocity(body, Math.sign(body.angularVelocity) * 0.6);
      if (body.speed > 60)
        Matter.Body.setVelocity(
          body,
          Matter.Vector.mult(Matter.Vector.normalise(body.velocity), 60)
        );
      if (homingRef.current) {
        // Critically-damped glide home (spring feel without overshoot), resizing
        // the pill toward the destination tab's size as it goes, then dock.
        const t = homeTargetRef.current;
        const p = body.position;
        Matter.Body.setPosition(body, {
          x: p.x + (t.x - p.x) * 0.28,
          y: p.y + (t.y - p.y) * 0.28,
        });
        Matter.Body.setAngle(body, body.angle * 0.7);
        Matter.Body.setVelocity(body, { x: 0, y: 0 });
        Matter.Body.setAngularVelocity(body, 0);
        const s = sizeRef.current;
        const ts = homeSizeRef.current;
        sizeRef.current = {
          w: s.w + (ts.w - s.w) * 0.28,
          h: s.h + (ts.h - s.h) * 0.28,
        };
        if (
          Math.hypot(t.x - body.position.x, t.y - body.position.y) < 1.4 &&
          Math.abs(body.angle) < 0.02 &&
          Math.abs(ts.w - sizeRef.current.w) < 0.5
        ) {
          sizeRef.current = { ...ts }; // snap exact
          writeTransform(body);
          dock();
          return;
        }
      }
      writeTransform(body);
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);

    // On resize, move the floor/walls AND re-seat the body inside the new
    // viewport (with zeroed velocity), so shrinking the window can't teleport
    // the static floor into the body and eject it.
    const onResize = () => {
      repositionBounds();
      const b = bodyRef.current;
      if (!b) return;
      const nx = Math.min(Math.max(b.position.x, w / 2), window.innerWidth - w / 2);
      const ny = Math.min(b.position.y, window.innerHeight - h / 2);
      if (nx !== b.position.x || ny !== b.position.y) {
        Matter.Body.setPosition(b, { x: nx, y: ny });
        Matter.Body.setVelocity(b, { x: 0, y: 0 });
        Matter.Body.setAngularVelocity(b, 0);
      }
    };
    window.addEventListener("resize", onResize);

    return () => {
      alive = false;
      window.removeEventListener("resize", onResize);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = 0;
      Matter.Events.off(engine, "collisionStart", onCollide);
      if (dragRef.current) {
        Matter.Composite.remove(engine.world, dragRef.current);
        dragRef.current = null;
      }
      Matter.World.clear(engine.world, false);
      Matter.Engine.clear(engine);
      engineRef.current = null;
      bodyRef.current = null;
      floorRef.current = null;
      wallsRef.current = [];
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [popped]);

  return (
    <div className="flex items-center gap-4">
      {TABS.map((tab, i) => {
        const isActive = tab.id === active;
        const styledActive = isActive && showActiveStyle;
        const isHovered = hoveredTab === tab.id;
        return (
          <motion.button
            key={tab.id}
            ref={(el) => {
              btnRefs.current[i] = el;
            }}
            onClick={() => {
              if (isActive) {
                handleActiveClick();
              } else if (popped) {
                // Click another tab while detached → fly the pill there + switch.
                const r = btnRefs.current[i]?.getBoundingClientRect();
                onChange(tab.id);
                if (r) engageHomeTo(r);
                else dock();
              } else if (!playing) {
                onChange(tab.id);
              }
            }}
            onMouseEnter={() => setHoveredTab(tab.id)}
            onMouseLeave={() => setHoveredTab(null)}
            initial={intro ? (reduce ? { opacity: 0 } : { opacity: 0, y: 8 }) : false}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: intro ? 0.9 + i * 0.15 : 0, ease: EASE }}
            style={{
              position: "relative",
              fontFamily: "var(--font-dm-sans)",
              fontSize: "16px",
              lineHeight: "20px",
              letterSpacing: "-0.16px",
              background: "transparent",
              border: "none",
              borderRadius: "60px",
              padding: "12px 24px",
              cursor: "pointer",
              whiteSpace: "nowrap",
            }}
          >
            {isActive && (
              <motion.span
                layoutId="tab-pill"
                initial={intro ? { opacity: 0 } : false}
                animate={{
                  opacity: playing || popped ? 0 : 1,
                  left: -stretchLeft,
                  right: -stretchRight,
                }}
                transition={{
                  layout: { type: "spring", stiffness: 380, damping: 34 },
                  // Intro: fade in at 2.0s. While hopping or detached: hide instantly.
                  opacity:
                    playing || popped
                      ? { duration: 0 }
                      : intro
                      ? { duration: 0.8, delay: 2.0, ease: EASE }
                      : { duration: 0 },
                  left: { type: "spring", stiffness: 420, damping: 32 },
                  right: { type: "spring", stiffness: 420, damping: 32 },
                }}
                style={{
                  position: "absolute",
                  top: 0,
                  bottom: 0,
                  left: 0,
                  right: 0,
                  background: PILL_BG,
                  borderRadius: "60px",
                }}
              />
            )}
            {/* Hopping clone — sibling rendered before the label so it paints
                behind the word, just like the docked pill. pointer-events:none so
                repeat clicks still reach the button. */}
            {isActive && playing && (
              <motion.span
                style={{
                  position: "absolute",
                  top: 0,
                  bottom: 0,
                  left: 0,
                  right: 0,
                  background: PILL_BG,
                  borderRadius: "60px",
                  pointerEvents: "none",
                  y: fy,
                  rotate: frot,
                }}
              />
            )}
            {/* Dual-layer label: bold layer crossfades over regular so the
                weight + color change dissolves smoothly (font-weight can't tween).
                Both share one grid cell, so width is fixed to the bold width. */}
            <span
              style={{
                position: "relative",
                display: "inline-grid",
                placeItems: "center",
              }}
            >
              <span
                style={{
                  gridArea: "1 / 1",
                  fontWeight: 600,
                  color: "#000",
                  opacity: styledActive ? 1 : 0,
                  filter: styledActive ? "blur(0px)" : "blur(4px)",
                  transition: "opacity 300ms ease, filter 300ms ease",
                }}
              >
                {tab.label}
              </span>
              <span
                style={{
                  gridArea: "1 / 1",
                  fontWeight: 400,
                  color: isHovered ? "#000" : "#696969",
                  opacity: styledActive ? 0 : 1,
                  filter: styledActive ? "blur(4px)" : "blur(0px)",
                  transition: "opacity 300ms ease, filter 300ms ease, color 200ms ease",
                }}
              >
                {tab.label}
              </span>
            </span>
          </motion.button>
        );
      })}

      {/* Loose pill — portaled to <body>, fixed, matter-driven. `popped` only
          becomes true after a client interaction, so this never runs on the
          server. The transform is written every frame by the physics tick;
          the initial value avoids a flash at (0,0) before the first frame. */}
      {popped &&
        createPortal(
          <div
            ref={pillElRef}
            onPointerDown={onPillPointerDown}
            onPointerMove={onPillPointerMove}
            onPointerUp={onPillPointerUp}
            onPointerCancel={onPillPointerUp}
            style={{
              position: "fixed",
              left: 0,
              top: 0,
              width: pillBox.w,
              height: pillBox.h,
              background: PILL_BG,
              borderRadius: 60,
              zIndex: 9999,
              cursor: "grab",
              touchAction: "none",
              willChange: "transform",
              transform: initialXform,
            }}
          />,
          document.body
        )}
    </div>
  );
}

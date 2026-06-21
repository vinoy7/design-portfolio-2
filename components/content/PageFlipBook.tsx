"use client";

import { useEffect, useRef } from "react";
import { useReducedMotion } from "motion/react";

import { FACES, type Face } from "./howDesignSlides";
import PhotographyCarousel from "./PhotographyCarousel";
import { Renderer, Camera, Transform, Plane, Program, Mesh, Texture } from "ogl";

/* ------------------------------------------------------------------ *
 * Sketchbook. Closed red book w/ elastic strap -> cover swings open
 * around the centre spine -> landscape 2-page spread. First spread is
 * blank beige. "single" photos fill one page; "double" photos span a
 * spread (half on each page). Drag/click/hover to turn; reverse past the
 * first spread to close the book.
 *
 * Faces: spread s shows FACES[2s] (left) and FACES[2s+1] (right).
 * Leaf rig pair(a): leftStatic=FACES[2a], leaf front=FACES[2a+1],
 * leaf back=FACES[2a+2], rightStatic=FACES[2a+3]. a=-1 = cover stage.
 * ------------------------------------------------------------------ */

const W = 1.0;
const H = 1.3;
const SEG = 60;
const CURL = 0.34;
const SPRING = 0.16;
const SPRING_CLOSE = 0.36; // speed for auto-close page cascade
const COMMIT = 0.5;
const COVER_RED: [number, number, number] = [0.84, 0.12, 0.12];
const PAPER: [number, number, number] = [0.96, 0.95, 0.92];
const BEIGE: [number, number, number] = [0.96, 0.945, 0.91];
const LAST_SPREAD = FACES.length / 2 - 1;
const PAGE_ASPECT = W / H;
const SPREAD_ASPECT = (2 * W) / H;

const MARGIN = 0.025; // ~10px beige border on single-image pages
const SAMPLE = /* glsl */ `
  vec3 sampleFull(sampler2D tex, vec2 uv, float imgAspect, vec3 beige) {
    float m = ${MARGIN.toFixed(4)};
    if (uv.x < m || uv.x > 1.0 - m || uv.y < m || uv.y > 1.0 - m) return beige;
    vec2 innerUv = (uv - m) / (1.0 - 2.0 * m);
    float sx = 1.0, sy = 1.0;
    if (imgAspect > ${PAGE_ASPECT.toFixed(5)}) sx = ${PAGE_ASPECT.toFixed(5)} / imgAspect;
    else sy = imgAspect / ${PAGE_ASPECT.toFixed(5)};
    vec2 c = (innerUv - 0.5) * vec2(sx, sy) + 0.5;
    return texture2D(tex, c).rgb;
  }
  vec3 sampleHalf(sampler2D tex, vec2 uv, float side, float imgAspect) {
    float U = (uv.x + side) * 0.5;
    float sx = 1.0, sy = 1.0;
    if (imgAspect > ${SPREAD_ASPECT.toFixed(5)}) sx = ${SPREAD_ASPECT.toFixed(5)} / imgAspect;
    else sy = imgAspect / ${SPREAD_ASPECT.toFixed(5)};
    vec2 c = (vec2(U, uv.y) - 0.5) * vec2(sx, sy) + 0.5;
    return texture2D(tex, c).rgb;
  }
  vec3 faceColor(float mode, float hasTex, sampler2D tex, float side, float aspect, vec3 beige) {
    if (mode < 0.5 || hasTex < 0.5) return beige;
    if (mode < 1.5) return sampleFull(tex, uvForFace(), aspect, beige);
    return sampleHalf(tex, uvForFace(), side, aspect);
  }
`;

const flatVert = /* glsl */ `
  precision highp float;
  attribute vec3 position; attribute vec2 uv;
  uniform mat4 modelViewMatrix; uniform mat4 projectionMatrix;
  varying vec2 vUv;
  void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }
`;
const flatFrag = /* glsl */ `
  precision highp float;
  varying vec2 vUv;
  uniform sampler2D tTex; uniform float uMode; uniform float uHas; uniform float uSide;
  uniform float uAspect; uniform float uSpineSide; uniform vec3 uBeige;
  vec2 uvForFace(){ return vUv; }
  ${SAMPLE}
  void main(){
    vec3 col = faceColor(uMode, uHas, tTex, uSide, uAspect, uBeige);
    float edge = uSpineSide > 0.0 ? vUv.x : 1.0 - vUv.x;
    float sh = 1.0 - 0.22 * smoothstep(0.86, 1.0, edge);
    gl_FragColor = vec4(col * sh, 1.0);
  }
`;

const leafVert = /* glsl */ `
  precision highp float;
  attribute vec3 position; attribute vec2 uv;
  uniform mat4 modelViewMatrix; uniform mat4 projectionMatrix;
  uniform float uTurn; uniform float uCurl; uniform float uW;
  varying vec2 vUv; varying vec3 vN;
  const float PI = 3.14159265;
  void main(){
    vUv = uv;
    float rx = position.x + uW * 0.5;
    float ang = uTurn * PI;
    float curl = uCurl * sin(uTurn * PI);
    float bow = sin(PI * rx / uW) * curl;
    float wx = rx * cos(ang);
    float wz = rx * sin(ang) + bow;
    float dz = cos(PI * rx / uW) * curl * (PI / uW);
    vN = normalize(vec3(-sin(ang) - dz, 0.0, cos(ang)));
    gl_Position = projectionMatrix * modelViewMatrix * vec4(wx, position.y, wz, 1.0);
  }
`;
const EMBOSS_W = 512, EMBOSS_H = 666; // matches cover aspect 1:1.4
const leafFrag = /* glsl */ `
  precision highp float;
  varying vec2 vUv; varying vec3 vN;
  uniform sampler2D tFront; uniform float uFrontMode; uniform float uFrontHas; uniform float uFrontSide; uniform float uFrontAspect; uniform float uFrontCover;
  uniform sampler2D tBack; uniform float uBackMode; uniform float uBackHas; uniform float uBackSide; uniform float uBackAspect;
  uniform sampler2D tEmboss;
  uniform vec3 uPaper; uniform vec3 uCover; uniform vec3 uBeige;
  vec2 uvForFace(){ return vUv; }
  ${SAMPLE}
  void main(){
    vec3 light = normalize(vec3(-0.3, 0.4, 0.85));
    float lambert = clamp(dot(normalize(vN), light), 0.0, 1.0);
    if (gl_FrontFacing) {
      vec3 col = uFrontCover > 0.5 ? uCover : faceColor(uFrontMode, uFrontHas, tFront, uFrontSide, uFrontAspect, uBeige);
      if (uFrontCover > 0.5) {
        vec2 d = vec2(2.0 / ${EMBOSS_W}.0, 2.0 / ${EMBOSS_H}.0);
        float hi = texture2D(tEmboss, vUv - d).r;
        float lo = texture2D(tEmboss, vUv + d).r;
        col = clamp(col + vec3((hi - lo) * 0.32), 0.0, 1.0);
      }
      gl_FragColor = vec4(col * (0.6 + 0.4 * lambert), 1.0);
    } else {
      // Back face: render the next page's photo (mirror x) so it's visible
      // mid-turn instead of popping in at commit. Falls back to paper grain.
      vec2 buv = vec2(1.0 - vUv.x, vUv.y);
      vec3 back;
      if (uBackHas > 0.5 && uBackMode > 0.5) {
        back = uBackMode < 1.5 ? sampleFull(tBack, buv, uBackAspect, uBeige)
                               : sampleHalf(tBack, buv, uBackSide, uBackAspect);
      } else {
        float g = fract(sin(dot(vUv, vec2(91.7, 47.3))) * 4375.85);
        back = uPaper * (0.94 + 0.06 * g);
      }
      gl_FragColor = vec4(back * (0.82 + 0.18 * (1.0 - lambert)), 1.0);
    }
  }
`;

export default function PageFlipBook() {
  const reduce = useReducedMotion();
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (reduce) return;
    const mount = mountRef.current;
    if (!mount) return;
    let disposed = false;

    const renderer = new Renderer({ alpha: true, dpr: Math.min(2, window.devicePixelRatio) });
    const gl = renderer.gl;
    gl.clearColor(0, 0, 0, 0);
    mount.appendChild(gl.canvas);
    gl.canvas.style.width = "100%";
    gl.canvas.style.height = "100%";
    gl.canvas.style.display = "block";
    gl.canvas.style.cursor = "grab";

    const camera = new Camera(gl, { fov: 32, near: 0.1, far: 100 });
    // z back + matching vertical bleed (see mount inset): a page standing
    // vertical mid-flip swings ~1 unit toward camera (~1.4x magnified). Pulling
    // back shrinks the book's screen fraction; the larger canvas restores its
    // px size — net: same book, enough headroom that GL no longer clips the arc.
    camera.position.set(0, 0, 3.75);
    const book = new Transform();

    // textures keyed by src
    const texCache = new Map<string, Texture>();
    const texMeta = new Map<string, number>();
    const blankTex = new Texture(gl);
    function loadTexture(src?: string) {
      if (!src || texCache.has(src)) return;
      const tex = new Texture(gl);
      texCache.set(src, tex);
      const img = new Image();
      img.src = src;
      img.onload = () => { if (disposed) return; tex.image = img; texMeta.set(src, img.naturalWidth / img.naturalHeight); };
    }

    const flatGeo = new Plane(gl, { width: W, height: H });
    const leafGeo = new Plane(gl, { width: W, height: H, widthSegments: SEG, heightSegments: SEG });

    function flatProgram(spineSide: number) {
      return new Program(gl, {
        vertex: flatVert, fragment: flatFrag, cullFace: false,
        uniforms: {
          tTex: { value: blankTex }, uMode: { value: 0 }, uHas: { value: 0 }, uSide: { value: 0 },
          uAspect: { value: 1 }, uSpineSide: { value: spineSide }, uBeige: { value: BEIGE },
        },
      });
    }
    const leftStatic = new Mesh(gl, { geometry: flatGeo, program: flatProgram(1) });
    leftStatic.position.set(-W / 2, 0, -0.004); leftStatic.setParent(book);
    const rightStatic = new Mesh(gl, { geometry: flatGeo, program: flatProgram(-1) });
    rightStatic.position.set(W / 2, 0, -0.006); rightStatic.setParent(book);

    // emboss text texture — "MY" / "PHOTOBOOK" stamped on cover
    const embossCanvas = document.createElement("canvas");
    embossCanvas.width = EMBOSS_W; embossCanvas.height = EMBOSS_H;
    const ec = embossCanvas.getContext("2d")!;
    ec.fillStyle = "#000";
    ec.fillRect(0, 0, EMBOSS_W, EMBOSS_H);
    ec.fillStyle = "#fff";
    ec.textAlign = "center";
    ec.textBaseline = "middle";
    const cx = EMBOSS_W / 2, cy = EMBOSS_H / 2;
    ec.font = "900 40px 'Helvetica Neue', Arial, sans-serif";
    (ec as CanvasRenderingContext2D & { letterSpacing: string }).letterSpacing = "10px";
    ec.fillText("MY", cx, cy - 38);
    ec.font = "900 40px 'Helvetica Neue', Arial, sans-serif";
    (ec as CanvasRenderingContext2D & { letterSpacing: string }).letterSpacing = "8px";
    ec.fillText("PHOTOBOOK", cx, cy + 38);
    const embossTex = new Texture(gl, { image: embossCanvas });

    const leafProgram = new Program(gl, {
      vertex: leafVert, fragment: leafFrag, cullFace: false,
      uniforms: {
        uTurn: { value: 0 }, uCurl: { value: CURL }, uW: { value: W },
        tFront: { value: blankTex }, uFrontMode: { value: 0 }, uFrontHas: { value: 0 },
        uFrontSide: { value: 0 }, uFrontAspect: { value: 1 }, uFrontCover: { value: 0 },
        tBack: { value: blankTex }, uBackMode: { value: 0 }, uBackHas: { value: 0 },
        uBackSide: { value: 0 }, uBackAspect: { value: 1 },
        tEmboss: { value: embossTex },
        uPaper: { value: PAPER }, uCover: { value: COVER_RED }, uBeige: { value: BEIGE },
      },
    });
    const leaf = new Mesh(gl, { geometry: leafGeo, program: leafProgram });
    leaf.position.set(0, 0, 0); leaf.setParent(book);

    // ---- state ----
    let spread = -1;
    let turn = 0, target = 0;
    let mode: "idle" | "hover" | "drag" | "anim" = "idle";
    let dir: 1 | -1 = 1;
    let dragging = false;
    let autoClose = false;

    function faceAt(i: number): Face {
      return i >= 0 && i < FACES.length ? FACES[i] : { kind: "blank" };
    }
    function setFace(u: Record<string, { value: number }> & Record<string, { value: unknown }>, f: Face, modeKey: string, hasKey: string, sideKey: string, aspectKey: string, texKey: string) {
      if (f.kind === "blank") { (u[modeKey].value as number) = 0; (u[hasKey].value as number) = 0; return; }
      const src = f.src;
      loadTexture(src);
      const tex = texCache.get(src);
      const a = texMeta.get(src);
      (u[texKey].value as unknown) = tex ?? blankTex;
      (u[hasKey].value as number) = a ? 1 : 0;
      (u[aspectKey].value as number) = a ?? 1;
      (u[modeKey].value as number) = f.kind === "full" ? 1 : 2;
      (u[sideKey].value as number) = f.kind === "half" ? f.side : 0;
    }

    function configure(a: number) {
      const ls = leftStatic.program.uniforms as never;
      const rs = rightStatic.program.uniforms as never;
      const lf = leafProgram.uniforms as never;
      setFace(ls, faceAt(2 * a), "uMode", "uHas", "uSide", "uAspect", "tTex");
      setFace(rs, faceAt(2 * a + 3), "uMode", "uHas", "uSide", "uAspect", "tTex");
      if (a < 0) { (leafProgram.uniforms.uFrontCover.value as number) = 1; (leafProgram.uniforms.uFrontHas.value as number) = 0; }
      else { (leafProgram.uniforms.uFrontCover.value as number) = 0; setFace(lf, faceAt(2 * a + 1), "uFrontMode", "uFrontHas", "uFrontSide", "uFrontAspect", "tFront"); }
      // back face = next page (faceAt(2a+2)) — painted on the leaf's reverse so
      // it's visible during the turn instead of popping in at commit.
      setFace(lf, faceAt(2 * a + 2), "uBackMode", "uBackHas", "uBackSide", "uBackAspect", "tBack");
      // warm neighbours
      const nf = faceAt(2 * a + 2); if (nf.kind !== "blank") loadTexture(nf.src);
      const pf = faceAt(2 * a - 1); if (pf.kind !== "blank") loadTexture(pf.src);
    }

    function restConfigure() { configure(spread); turn = 0; target = 0; dir = 1; }
    configure(-1);

    function commit() {
      // The active leaf pair is `a`; a === -1 means the turning leaf IS the
      // cover (opening or shutting). Inner pages get the real page-flip
      // recording; the cover keeps the synth swish.
      const a = dir === 1 ? spread : spread - 1;
      const isCover = a === -1;
      spread = dir === 1 ? Math.min(LAST_SPREAD, spread + 1) : Math.max(-1, spread - 1);
      restConfigure(); mode = "idle";
      if (isCover) playFlip(); else playPageFlip();
    }

    // ---- pointer ----
    let downX = 0, downY = 0, moved = false;
    function rel(e: PointerEvent) { const r = gl.canvas.getBoundingClientRect(); return { x: (e.clientX - r.left) / r.width }; }
    function onMove(e: PointerEvent) {
      if (Math.hypot(e.clientX - downX, e.clientY - downY) > 6) moved = true;
      const { x } = rel(e);
      if (dragging) { const t = Math.max(0, Math.min(1, (1 - x) / 0.8)); target = dir === 1 ? t : 1 - t; }
    }
    function onDown(e: PointerEvent) {
      ensureAudio(); downX = e.clientX; downY = e.clientY; moved = false;
      const { x } = rel(e);
      // closed book: click anywhere opens cover
      if (spread === -1) { dir = 1; configure(spread); turn = 0; dragging = true; mode = "drag"; }
      else if (x > 0.5 && spread < LAST_SPREAD) { dir = 1; configure(spread); turn = 0; dragging = true; mode = "drag"; }
      else if (x <= 0.5 && spread > -1) { dir = -1; configure(spread - 1); turn = 1; dragging = true; mode = "drag"; }
      else if (x > 0.5 && spread === LAST_SPREAD) {
        // back cover click: cascade all pages left-to-right then close
        autoClose = true;
        dir = -1; configure(spread - 1); turn = 1; target = 0; mode = "anim";
      }
      else return;
      try { gl.canvas.setPointerCapture(e.pointerId); } catch {}
    }
    function onUp() {
      if (!dragging) return; dragging = false;
      if (!moved) { target = dir === 1 ? 1 : 0; mode = "anim"; return; }
      const past = dir === 1 ? turn > COMMIT : turn < 1 - COMMIT;
      target = past ? (dir === 1 ? 1 : 0) : (dir === 1 ? 0 : 1); mode = "anim";
    }
    gl.canvas.addEventListener("pointermove", onMove);
    gl.canvas.addEventListener("pointerdown", onDown);
    window.addEventListener("pointerup", onUp);

    // ---- audio ----
    let actx: AudioContext | null = null; let noiseBuf: AudioBuffer | null = null;
    let flipBuf: AudioBuffer | null = null;   // real page-flip recording (inner pages)
    function ensureAudio() {
      if (actx) return;
      try {
        const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        actx = new AC();
        const len = Math.floor(actx.sampleRate * 0.24); noiseBuf = actx.createBuffer(1, len, actx.sampleRate);
        const d = noiseBuf.getChannelData(0);
        for (let i = 0; i < len; i++) { const t = i / len; d[i] = (Math.random() * 2 - 1) * Math.pow(1 - t, 2.0) * Math.min(1, t * 10); }
        // decode the real page-flip mp3 once; inner-page turns use it (falls
        // back to the synth swish until decode finishes).
        fetch("/assets/sketchbook/page-flip.mp3")
          .then((r) => r.arrayBuffer())
          .then((b) => actx!.decodeAudioData(b))
          .then((buf) => { flipBuf = buf; })
          .catch(() => {});
      } catch { actx = null; }
    }
    function playFlip() {
      if (!actx || !noiseBuf) return;
      const s = actx.createBufferSource(); s.buffer = noiseBuf; s.playbackRate.value = 0.9 + Math.random() * 0.3;
      const bp = actx.createBiquadFilter(); bp.type = "bandpass"; bp.frequency.value = 2400; bp.Q.value = 0.7;
      const g = actx.createGain(); g.gain.value = 0.06;
      s.connect(bp).connect(g).connect(actx.destination); s.start();
    }
    function playPageFlip() {
      if (!actx || !flipBuf) { playFlip(); return; }   // not decoded yet → synth
      const s = actx.createBufferSource(); s.buffer = flipBuf;
      s.playbackRate.value = 1.94 + Math.random() * 0.12;   // 2x speed, ±3% jitter
      const g = actx.createGain(); g.gain.value = 0.6;
      s.connect(g).connect(actx.destination); s.start();
    }

    function resize() {
      const w = mount!.clientWidth, h = mount!.clientHeight;
      renderer.setSize(w, h); camera.perspective({ aspect: w / h });
    }
    const ro = new ResizeObserver(resize); ro.observe(mount); resize();

    let raf = 0;
    function tick() {
      if (disposed) return;
      raf = requestAnimationFrame(tick);
      turn += (target - turn) * (autoClose ? SPRING_CLOSE : SPRING);
      if (mode === "anim") {
        if (dir === 1 && target === 1 && turn > 0.985) commit();
        else if (dir === 1 && target === 0 && turn < 0.015) { restConfigure(); mode = "idle"; }
        else if (dir === -1 && target === 0 && turn < 0.015) commit();
        else if (dir === -1 && target === 1 && turn > 0.985) { restConfigure(); mode = "idle"; }
      }
      // auto-close cascade: after each commit, keep flipping back until cover is shut
      if (autoClose && mode === "idle") {
        if (spread > -1) { dir = -1; configure(spread - 1); turn = 1; target = 0; mode = "anim"; }
        else { autoClose = false; }
      }
      // the active pair includes the cover when a == -1 -> drive open/close centring
      const a = dir === 1 ? spread : spread - 1;
      const openAmt = a === -1 ? Math.min(1, turn) : 1;
      book.position.x = -(1 - openAmt) * (W / 2);
      // Hide the left page for the whole cover swing (a === -1): the cover leaf
      // itself sweeps over to the left as it opens, so the beige left page must
      // never peek out beside it. It reappears once committed to spread 0.
      leftStatic.visible = a !== -1;
      (leafProgram.uniforms.uTurn.value as number) = turn;
      // re-pull front texture once it finishes loading
      if (a >= 0 && (leafProgram.uniforms.uFrontCover.value as number) < 0.5 && (leafProgram.uniforms.uFrontHas.value as number) === 0) {
        setFace(leafProgram.uniforms as never, faceAt(2 * a + 1), "uFrontMode", "uFrontHas", "uFrontSide", "uFrontAspect", "tFront");
      }
      // re-pull back texture (next page) once it finishes loading
      if ((leafProgram.uniforms.uBackHas.value as number) === 0) {
        const bf = faceAt(2 * a + 2);
        if (bf.kind !== "blank") setFace(leafProgram.uniforms as never, bf, "uBackMode", "uBackHas", "uBackSide", "uBackAspect", "tBack");
      }
      renderer.render({ scene: book, camera });
    }
    tick();

    return () => {
      disposed = true; cancelAnimationFrame(raf); ro.disconnect();
      gl.canvas.removeEventListener("pointermove", onMove);
      gl.canvas.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointerup", onUp);
      if (actx) actx.close().catch(() => {});
      const ext = gl.getExtension("WEBGL_lose_context"); if (ext) ext.loseContext();
      if (gl.canvas.parentNode) gl.canvas.parentNode.removeChild(gl.canvas);
    };
  }, [reduce]);

  if (reduce) return <PhotographyCarousel />;
  return (
    <div className="relative w-full" style={{ aspectRatio: "1.5 / 1", overflow: "visible" }}>
      <div ref={mountRef} className="absolute" style={{ touchAction: "none", inset: "-26% -12%" }} />
    </div>
  );
}

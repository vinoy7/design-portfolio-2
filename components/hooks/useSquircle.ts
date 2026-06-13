"use client";

import { useCallback, useRef } from "react";
import { generateClipPath, observeResize } from "@lisse/core";

export interface SquircleOptions {
  radius?: number;
  smoothing?: number;
}

export function useSquircle(options: SquircleOptions = {}) {
  const cleanupRef = useRef<(() => void) | null>(null);
  const optionsRef = useRef(options);
  optionsRef.current = options;

  return useCallback((el: HTMLElement | null) => {
    cleanupRef.current?.();
    cleanupRef.current = null;
    if (!el) return;

    const { radius = 12, smoothing = 0.6 } = optionsRef.current;
    const opts = { radius, smoothing };

    function update() {
      const { width, height } = el!.getBoundingClientRect();
      el!.style.clipPath = generateClipPath(width, height, opts);
    }

    update();
    const unsub = observeResize(el, update);

    cleanupRef.current = () => {
      unsub();
      el.style.clipPath = "";
    };
  }, []);
}

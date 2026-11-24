"use client";
import {
  useCallback, useEffect, useRef,
  type CSSProperties, type PointerEvent as ReactPointerEvent, type ReactNode,
} from "react";
import {
  morph as runMorph, play, type BurstHandle,
} from "../grain/engine";
import { capture } from "../grain/kit";
import type { DissolveOptions } from "./types";

/** Entrance counterpart of `useDissolve`: mounts its child in with a preset. */
export interface DissolveInProps extends DissolveOptions {
  children: ReactNode;
  /** Flip from false to true to play later. Defaults to playing on mount. */
  play?: boolean;
  className?: string;
  style?: CSSProperties;
}

export function DissolveIn({
  children, play: active = true, preset = "gather", className, style, ...opts
}: DissolveInProps) {
  const ref = useRef<HTMLDivElement | null>(null);
  const last = useRef(false);

  useEffect(() => {
    if (!active || last.current) return;
    const node = ref.current;
    if (!node) return;
    last.current = true;
    let cancelled = false;
    void capture(node).then((shot) => {
      if (cancelled) return;
      void play({ ...shot, ...opts, preset, direction: "in" }).done;
    });
    return () => { cancelled = true; };
  }, [active, preset]);

  return (
    <div ref={ref} className={className} style={style}>
      {children}
    </div>
  );
}

export interface UseDissolveHoldOptions {
  holdMs?: number;
  grain?: number;
  duration?: number;
  onCommit?: () => void;
}

/** Hold-to-charge: the `charge` preset builds while pressed, fires on release. */
export function useDissolveHold({
  holdMs = 1200, grain = 3, duration = 900, onCommit,
}: UseDissolveHoldOptions = {}) {
  const ref = useRef<HTMLDivElement | null>(null);
  const handle = useRef<BurstHandle | null>(null);
  const started = useRef(0);

  const pressHandlers = {
    onPointerDown: () => {
      const node = ref.current;
      if (!node) return;
      void capture(node).then((shot) => {
        handle.current?.cancel();
        handle.current = play({ ...shot, preset: "charge", grain, duration, hold: true });
        started.current = performance.now();
      });
    },
    onPointerUp: () => {
      const h = handle.current;
      if (!h) return;
      const held = performance.now() - started.current;
      h.aux.a0 = Math.min(1, held / holdMs);
      h.aux.a1 = held;
      h.release();
      handle.current = null;
      if (held >= holdMs) onCommit?.();
    },
  };

  return {
    ref,
    pressHandlers,
    style: { touchAction: "none", userSelect: "none" } as CSSProperties,
  };
}

export interface UseDissolvePeelOptions {
  threshold?: number;
  grain?: number;
  duration?: number;
  onCommit?: () => void;
}

/** Drag-to-peel: pointer movement drives the fold, passing the threshold commits. */
export function useDissolvePeel({
  threshold = 0.4, grain = 3, duration = 700, onCommit,
}: UseDissolvePeelOptions = {}) {
  const ref = useRef<HTMLDivElement | null>(null);
  const handle = useRef<BurstHandle | null>(null);
  const origin = useRef({ x: 0, y: 0 });
  const size = useRef({ w: 1, h: 1 });

  const gesture = {
    onPointerDown: (e: ReactPointerEvent) => {
      const node = ref.current;
      if (!node) return;
      const r = node.getBoundingClientRect();
      origin.current = { x: r.left + r.width / 2, y: r.top + r.height / 2 };
      size.current = { w: r.width || 1, h: r.height || 1 };
      void capture(node).then((shot) => {
        handle.current?.cancel();
        handle.current = play({
          ...shot, preset: "peel", grain, duration, hold: true,
          n: [0, r.width / 2, r.height / 2],
        });
      });
    },
    onPointerMove: (e: ReactPointerEvent) => {
      const h = handle.current;
      if (!h) return;
      h.aux.a0 = e.clientX - origin.current.x;
      h.aux.a1 = e.clientY - origin.current.y;
    },
    onPointerUp: () => {
      const h = handle.current;
      if (!h) return;
      const distance = Math.hypot(h.aux.a0, h.aux.a1);
      const limit = Math.min(size.current.w, size.current.h) * threshold;
      if (distance >= limit) {
        h.release();
        onCommit?.();
      } else h.cancel();
      handle.current = null;
    },
  };

  return { ref, gesture, style: { touchAction: "none" } as CSSProperties };
}

/** Cross-fades two views by turning A into B with the `morph` variant. */
export function useDissolveMorph() {
  const refA = useRef<HTMLDivElement | null>(null);
  const refB = useRef<HTMLDivElement | null>(null);
  const styleA: CSSProperties = { position: "relative" };
  const styleB: CSSProperties = { position: "absolute", inset: 0 };

  const morph = useCallback(async ({
    grain = 4, duration = 1100, reverse = false,
  }: { grain?: number; duration?: number; reverse?: boolean } = {}) => {
    const a = refA.current, b = refB.current;
    if (!a || !b) return;
    const [shotA, shotB] = await Promise.all([capture(a), capture(b)]);
    await runMorph(reverse ? shotB : shotA, reverse ? shotA : shotB, { grain, duration }).done;
  }, []);

  return { refA, refB, styleA, styleB, morph };
}

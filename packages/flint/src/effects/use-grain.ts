"use client";
import { useCallback, useRef, useState } from "react";
import { play, type BurstHandle } from "../grain/engine";
import { capture } from "../grain/kit";
import type { DissolveOptions, UseDissolveResult } from "./types";

/**
 * Runs one of the 22 grain effects on any DOM element. Attach `ref` to the
 * view you want to take apart, hide it while `dissolving` is true, then remove
 * it from your state after the returned promise resolves.
 *
 * The effect itself lives in the framework-free grain engine; this
 * hook only snapshots the node and drives the burst. Nothing touches the DOM
 * until `dissolve()` is called, so it is safe to import during SSR.
 */
export function useDissolve<T extends HTMLElement = HTMLDivElement>(): UseDissolveResult<T> {
  const ref = useRef<T | null>(null);
  const [dissolving, setDissolving] = useState(false);
  const active = useRef<BurstHandle | null>(null);

  const dissolve = useCallback(async (options: DissolveOptions = {}) => {
    const node = ref.current;
    if (!node || typeof document === "undefined") return;

    // A second call supersedes the first instead of stacking two overlays.
    active.current?.cancel();
    active.current = null;

    const { onDone, onArrive, to, ...opts } = options;
    const target = opts.target ?? (() => {
      const box = to?.current;
      if (!box) return undefined;
      const r = box.getBoundingClientRect();
      return { x: r.left, y: r.top, width: r.width, height: r.height };
    })();
    const shot = await capture(node);
    setDissolving(true);
    const handle = play({
      ...shot,
      target,
      preset: opts.preset,
      grain: opts.grain,
      duration: opts.duration,
      direction: opts.direction,
      origin: opts.origin,
      velocity: opts.velocity,
      n: opts.n,
      field: opts.field,
      rows: opts.rows,
      hold: opts.hold,
      fixed: opts.fixed,
    });
    active.current = handle;
    try {
      await handle.done;
    } finally {
      if (active.current === handle) active.current = null;
      setDissolving(false);
      onArrive?.();
      onDone?.();
    }
  }, []);

  return { ref, dissolving, dissolve };
}

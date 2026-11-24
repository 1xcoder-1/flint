"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  useDissolve, useDissolveHold, useDissolveMorph, useDissolvePeel, type SwashPreset,
} from "react-flint";
import {
  FLINGS, FX_COPY, ORIGINS,
  caps, defaultsFor, durationDef, fxFullSnippet, fxSnippet, hintFor, type FxSettings,
} from "@/lib/fx-data";
import { BinIcon, Chip, FxCode, Group, NCard, RangeCtl, SwitchCtl } from "./fx-kit";

/**
 * The dissolve playground, ported to React: same control model, same hints,
 * code panes that regenerate on every change, gestures on the live card.
 */
export function FxPlayground({ id, title, plat }: { id: string; title: string; plat: "hook" | "full" }) {
  const [s, setS] = useState<FxSettings>(() => defaultsFor(id));
  const [busy, setBusy] = useState(false);
  const [gone, setGone] = useState(false);
  const [onB, setOnB] = useState(false);
  const [bin, setBin] = useState(0);
  const [drag, setDrag] = useState(0);
  const alive = useRef(true);
  useEffect(() => {
    // Re-arm on every id: navigating between effects (or a fast refresh) runs the cleanup
    // below, and the settled callbacks must not stay switched off afterwards.
    alive.current = true;
    return () => { alive.current = false; };
  }, [id]);
  useEffect(() => { setS(defaultsFor(id)); setOnB(false); setBin(0); setGone(false); setDrag(0); setBusy(false); }, [id]);

  const c = caps(id, s);
  const buzz = useCallback(() => { if (s.haptics) navigator.vibrate?.(12); }, [s.haptics]);

  /* engines */
  const gen = useDissolve<HTMLDivElement>();
  const hold = useDissolveHold({
    holdMs: (s.knob as number) ?? 1200, grain: s.grain, duration: s.duration,
    onCommit: () => { after(900); },
  });
  const peel = useDissolvePeel({
    threshold: (s.knob as number) ?? 0.4, grain: s.grain, duration: s.duration,
    onCommit: () => { after(900); },
  });
  const m = useDissolveMorph();
  const binRef = useRef<HTMLSpanElement | null>(null);
  const cardRef = useRef<HTMLDivElement | null>(null);

  const attach = useCallback((n: HTMLDivElement | null) => {
    cardRef.current = n;
    gen.ref.current = n;
    hold.ref.current = n;
    peel.ref.current = n;
    m.refA.current = n;
  }, []);
  const attachB = useCallback((n: HTMLDivElement | null) => { m.refB.current = n; }, []);

  const after = (ms: number) => { setTimeout(() => alive.current && setGone(false), ms); };

  /** Generic burst with the current settings; restores the card like upstream. */
  const playGeneric = async (dir: "out" | "in", extra: { touch?: { x: number; y: number }; velocity?: { x: number; y: number } } = {}) => {
    const opts: Parameters<typeof gen.dissolve>[0] = { preset: id as SwashPreset, duration: s.duration, direction: dir };
    if (c.grain) opts.grain = s.grain;
    if (c.origin && s.origin !== "auto") {
      opts.origin = s.origin === "touch" ? (extra.touch ?? { x: 0.5, y: 0.5 }) : s.origin as never;
    }
    if (id === "fling") opts.velocity = extra.velocity ?? FLINGS[s.fling].v;
    if (id === "stream" && dir === "out") opts.to = binRef;
    if (s.field) opts.field = "cascade";
    if (c.knob && c.knob.key === "n") opts.n = [s.knob as number];
    opts.onDone = () => {
      if (!alive.current) return;
      if (dir === "out") { setGone(true); after(Math.min(700, s.duration * 0.4)); }
    };
    if (id === "stream" && dir === "out") setTimeout(() => alive.current && setBin((n) => n + 1), s.duration * 0.62);
    await gen.dissolve(opts);
  };

  const run = async (dir?: "out" | "in", extra: { touch?: { x: number; y: number }; velocity?: { x: number; y: number } } = {}) => {
    if (busy) return;
    setBusy(true);
    buzz();
    try {
      if (id === "morph") {
        const rev = onB;
        setGone(true);
        await m.morph({ grain: s.grain, duration: s.duration, reverse: rev });
        if (!alive.current) return;
        setOnB(!rev);
        setGone(false);
        return;
      }
      await playGeneric(dir ?? s.direction, extra);
    } finally {
      if (alive.current) setBusy(false);
    }
  };

  /* tap / touch-origin handler for the card */
  const onCardClick = (e: React.MouseEvent) => {
    if (id === "charge" || (id === "peel" && s.mode === "hand") || s.mode === "scrub") return;
    const r = (e.currentTarget as HTMLElement).getBoundingClientRect();
    void run(undefined, { touch: { x: e.clientX - r.left, y: e.clientY - r.top } });
  };

  /* fling swipe gesture */
  const swipe = useRef<{ x: number; y: number; t: number } | null>(null);
  const swipeHandlers = id === "fling" ? {
    onPointerDown: (e: React.PointerEvent) => { swipe.current = { x: e.clientX, y: e.clientY, t: performance.now() }; },
    onPointerUp: (e: React.PointerEvent) => {
      const st = swipe.current;
      swipe.current = null;
      if (!st) return;
      const dt = Math.max(40, performance.now() - st.t);
      const dx = e.clientX - st.x, dy = e.clientY - st.y;
      if (Math.hypot(dx, dy) < 24) { void run(); return; }
      void run("out", { velocity: { x: (dx / dt) * 1000, y: (dy / dt) * 1000 } });
    },
  } : {};

  /* scrub drag (classic presets, scrub mode) */
  const scrub = useRef<{ x: number; w: number } | null>(null);
  const scrubHandlers = s.mode === "scrub" ? {
    onPointerDown: (e: React.PointerEvent) => {
      scrub.current = { x: e.clientX, w: (e.currentTarget as HTMLElement).offsetWidth || 1 };
      buzz();
    },
    onPointerMove: (e: React.PointerEvent) => {
      if (!scrub.current) return;
      setDrag(Math.max(0, e.clientX - scrub.current.x));
    },
    onPointerUp: () => {
      const st = scrub.current;
      scrub.current = null;
      if (!st) return;
      if (drag > st.w / 2) {
        setDrag(0);
        void playGeneric("out");
      } else {
        setDrag(0);
      }
    },
  } : {};

  /* panel */
  const set = (k: keyof FxSettings, v: unknown) => setS((p) => {
    const n = { ...p, [k]: v };
    if (k === "direction") n.haptics = v === "out";
    if (k === "mode") {
      n.duration = durationDef(id, n);
      if (v === "scrub" || v === "hand") n.direction = "out";
    }
    return n;
  });

  const knobSpec = c.knob;
  const hint = hintFor(id, s);
  const copyCard = FX_COPY[id];
  const cardB = FX_COPY.morphB;

  /* code: both panes regenerate on every change */
  const hookCode = fxSnippet(id, s);
  const fullCode = fxFullSnippet(id, s);

  return (
    <>
      <div className="pg" data-pg={id}>
        <div className="pg-stage">
          <p className="pg-hint" aria-live="polite">{busy ? "Running…" : hint}</p>
          <div className="pg-scene">
            {id === "morph"
              ? (
                  <div className="demo-pair" role="button" tabIndex={0} aria-label={`Play ${id}`}
                    style={{ opacity: gone || busy ? 0 : 1 }}
                    onClick={() => void run()}>
                    <div ref={attach} style={{ position: "relative" }}>
                      <NCard card={copyCard} style={{ pointerEvents: "none" }} />
                    </div>
                    <div ref={attachB} className="demo-card-b">
                      <NCard card={cardB} style={{ pointerEvents: "none" }} />
                    </div>
                  </div>
                )
              : (
                  <>
                    <div
                      ref={attach}
                      className={`demo-card${s.mode === "scrub" || (id === "peel" && s.mode === "hand") || id === "fling" ? " grab" : ""}`}
                      role="button"
                      tabIndex={0}
                      aria-label={`Play ${id}`}
                      style={{
                        opacity: gen.dissolving || gone ? 0 : 1,
                        transform: drag ? `translateX(${drag}px)` : undefined,
                        transition: scrub.current ? "none" : undefined,
                      }}
                      onClick={onCardClick}
                      onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); void run(); } }}
                      {...(id === "charge" ? hold.pressHandlers : {})}
                      {...(id === "peel" && s.mode === "hand" ? peel.gesture : {})}
                      {...swipeHandlers}
                      {...scrubHandlers}
                    >
                      <NCard card={copyCard} style={{ boxShadow: "none" }} />
                    </div>
                    {id === "stream"
                      ? (
                          <span ref={binRef} className={`demo-bin pg-bin${busy ? " bump" : ""}`} aria-hidden="true">
                            <BinIcon count={bin} />
                          </span>
                        )
                      : null}
                  </>
                )}
          </div>
          <div className="pg-actions">
            <Chip on={!busy} disabled={busy} onClick={() => void run()}>Play</Chip>
            <Chip on={false} disabled={!c.reverse} onClick={() => {
              if (id === "morph") { if (onB) void run(); }
              else if (id === "peel" && s.mode === "hand") { set("mode", "auto"); void playGeneric("in"); }
              else void run(s.direction === "in" ? "out" : "in");
            }}>Reverse</Chip>
            <Chip on={false} onClick={() => {
              setS(defaultsFor(id));
              setOnB(false);
              setGone(false);
              setDrag(0);
              setBin(0);
            }}>Reset</Chip>
          </div>
        </div>
        <aside className="panel" aria-label="Playground controls">
          {c.mode
            ? (
                <Group label={c.mode.title}>
                  {c.mode.opts.map(([v, l]) => <Chip key={v} on={s.mode === v} onClick={() => set("mode", v)}>{l}</Chip>)}
                </Group>
              )
            : null}
          {c.direction
            ? (
                <Group label="Direction">
                  {(["out", "in"] as const).map((d) => <Chip key={d} on={s.direction === d} onClick={() => set("direction", d)}>{d}</Chip>)}
                </Group>
              )
            : null}
          {c.origin
            ? (
                <Group label="Origin">
                  {ORIGINS.map((o) => <Chip key={o} on={s.origin === o} onClick={() => set("origin", o)}>{o}</Chip>)}
                </Group>
              )
            : null}
          {c.fling
            ? (
                <Group label="Velocity">
                  {FLINGS.map((f, i) => <Chip key={f.label} on={s.fling === i} onClick={() => set("fling", i)}>{f.label}</Chip>)}
                </Group>
              )
            : null}
          {c.field
            ? (
                <Group label="Delay field">
                  <Chip on={!s.field} onClick={() => set("field", false)}>native</Chip>
                  <Chip on={s.field} onClick={() => set("field", true)}>cascade</Chip>
                </Group>
              )
            : null}
          {knobSpec
            ? (
                <RangeCtl label={knobSpec.title} value={s.knob as number} min={knobSpec.min} max={knobSpec.max} step={knobSpec.step}
                  text={knobSpec.fmt(s.knob as number)} onChange={(n) => set("knob", n)} />
              )
            : null}
          {c.grain
            ? <RangeCtl label="Grain" value={s.grain} min={2} max={10} step={0.5} text={`${s.grain} px`} onChange={(n) => set("grain", n)} />
            : null}
          <RangeCtl label="Duration" value={s.duration} min={400} max={4000} step={100} text={`${s.duration} ms`} onChange={(n) => set("duration", n)} />
          <SwitchCtl label="Haptics" on={s.haptics} onChange={() => set("haptics", !s.haptics)} />
        </aside>
      </div>
      {plat === "hook"
        ? <FxCode code={hookCode} title={`${title} · Hook`} />
        : <FxCode code={fullCode} title={`${title} · Full component`} />}
    </>
  );
}

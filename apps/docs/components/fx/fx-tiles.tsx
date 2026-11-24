"use client";

import {
  forwardRef, useCallback, useEffect, useImperativeHandle, useRef, useState,
  type CSSProperties, type ReactNode,
} from "react";
import { useDissolve, useDissolveHold, useDissolveMorph, useDissolvePeel, type DissolveOptions, type SwashPreset } from "react-flint";
import { TILE_META, TILE_SPECS, type FxRow, type TileArt, type TileSpec } from "@/lib/fx-data";
import { BinIcon, ResetIcon, RowCard } from "./fx-kit";
import {
  BubbleArt, CandleArt, CoinArt, DeckCardArt, FolderTargetArt, FrameArt,
  IceCreamArt, InvaderArt, LockArt, NoteArt, PassArt, PhotoArt, PillArt, ProductCellArt, ReceiptArt, StickerArt, TabArt,
} from "./fx-art";

/* ---------- shared helpers ---------- */

/** rAF twice: the browser has painted the new layout. */
const frames = () => new Promise<void>((res) => requestAnimationFrame(() => requestAnimationFrame(() => res())));

/** Scene timeouts that must never fire after the scene unmounts. */
function useTimers() {
  const set = useRef(new Set<ReturnType<typeof setTimeout>>());
  useEffect(() => {
    const s = set.current;
    return () => { s.forEach(clearTimeout); s.clear(); };
  }, []);
  return useCallback((fn: () => void, ms: number) => {
    const t = setTimeout(() => { set.current.delete(t); fn(); }, ms);
    set.current.add(t);
  }, []);
}

const rectOf = (el: Element | null): DOMRectLike | undefined => {
  if (!el) return undefined;
  const r = el.getBoundingClientRect();
  return { x: r.left, y: r.top, width: r.width, height: r.height };
};
type DOMRectLike = { x: number; y: number; width: number; height: number };

export function ArtView({ art }: { art: TileArt }) {
  switch (art.k) {
    case "photo": return <PhotoArt name={art.name} trash={art.trash} />;
    case "note": return <NoteArt />;
    case "coin": return <CoinArt />;
    case "lock": return <LockArt />;
    case "icecream": return <IceCreamArt />;
    case "invader": return <InvaderArt color={art.color} />;
    case "frame": return <FrameArt name={art.name} />;
    case "tab": return <TabArt name={art.name} title={art.title} />;
    case "product": return <ProductCellArt name={art.name} title={art.title} price={art.price} />;
    case "candle": return <CandleArt col={art.col} />;
    case "receipt": return <ReceiptArt />;
    case "pass": return <PassArt />;
    case "bubble": return <BubbleArt text={art.text} me={art.me} />;
    case "deck": return <DeckCardArt name={art.name} title={art.title} sub={art.sub} />;
    case "sticker": return <StickerArt name={art.name} shape={art.shape} />;
    case "row": return <RowCard row={art.row} />;
    case "filerow": return <RowCard row={art.row} />;
  }
}

/* ---------- the dissolving leaf ---------- */

type ItemHandle = { play: (extra?: DissolveOptions) => void; busy: () => boolean };

/**
 * One scene item with its own useDissolve: tap plays the burst, the hook hides
 * the node while it dissolves, then the scene removes / restores it — the
 * upstream hide → play → cleanup order. `tap` makes the whole item clickable,
 * `touch` adds the click point as origin; scenes with custom gestures (swipe,
 * deck, peel) drive `play` through the ref instead.
 */
const FxItem = forwardRef<ItemHandle, {
  preset: string; opts?: DissolveOptions; tap?: boolean; touch?: boolean; onFinish?: () => void;
  className?: string; style?: CSSProperties; children: ReactNode;
}>(function FxItem({ preset, opts, tap, touch, onFinish, className = "", style, children }, ref) {
  const gen = useDissolve<HTMLDivElement>();
  const busy = useRef(false);
  const play = useCallback((extra?: DissolveOptions) => {
    if (busy.current) return;
    busy.current = true;
    void gen.dissolve({
      preset: preset as SwashPreset, ...opts, ...extra,
      onDone: () => { busy.current = false; onFinish?.(); },
    });
  }, [gen, preset, opts, onFinish]);
  useImperativeHandle(ref, () => ({ play, busy: () => busy.current }), [play]);
  const hidden = gen.dissolving || style?.opacity === 0 || style?.visibility === "hidden";
  return (
    <div
      ref={gen.ref}
      className={`tl-item${className ? ` ${className}` : ""}`}
      style={{ ...style, opacity: gen.dissolving ? 0 : style?.opacity }}
      onClick={tap && !hidden ? (e) => {
        // Upstream: tappable items answer to a click; `touch` adds the tap origin.
        const r = e.currentTarget.getBoundingClientRect();
        play(touch ? { origin: { x: e.clientX - r.left, y: e.clientY - r.top } } : undefined);
      } : undefined}
    >
      {children}
    </div>
  );
});

/** A list slot whose height collapses once the item is gone (upstream slot/collapse). */
function Slot({ gone, right, children }: { gone?: boolean; right?: boolean; children: ReactNode }) {
  const inner = useRef<HTMLDivElement | null>(null);
  const [h, setH] = useState<number>();
  useEffect(() => { if (!gone) setH(inner.current?.offsetHeight); }, [gone]);
  return (
    <div
      className={`tl-slot${right ? " tl-right" : ""}`}
      style={{ height: gone ? 0 : h, transition: "height 0.3s var(--ease), margin 0.3s var(--ease), opacity 0.2s" }}
    >
      <div ref={inner}>{children}</div>
    </div>
  );
}

/** Pointer swipe → velocity (upstream attachFling). */
function useFling(go: (v: { x: number; y: number }) => void, onTap?: () => void) {
  const st = useRef<{ x: number; y: number; t: number } | null>(null);
  return {
    onPointerDown: (e: React.PointerEvent) => { st.current = { x: e.clientX, y: e.clientY, t: performance.now() }; },
    onPointerUp: (e: React.PointerEvent) => {
      const s0 = st.current;
      st.current = null;
      if (!s0) return;
      const dt = Math.max(40, performance.now() - s0.t);
      const dx = e.clientX - s0.x, dy = e.clientY - s0.y;
      if (Math.hypot(dx, dy) < 24) { onTap?.(); return; }
      go({ x: (dx / dt) * 1000, y: (dy / dt) * 1000 });
    },
  };
}

type Later = ReturnType<typeof useTimers>;
type SetHint = (t: string | null) => void;
type SceneProps<S> = { spec: S; later: Later; setHint: SetHint };

/* ---------- list ---------- */

function ListScene({ spec, later }: SceneProps<Extract<TileSpec, { kind: "list" }>>) {
  const [gen, setGen] = useState(0);
  const [removed, setRemoved] = useState<number[]>([]);
  const [empty, setEmpty] = useState(false);
  const [bin, setBin] = useState(0);
  const binEl = useRef<HTMLDivElement | null>(null);
  const items = useRef<(ItemHandle | null)[]>([]);

  useEffect(() => { setRemoved([]); setEmpty(false); setBin(0); }, [gen]);

  const finish = (i: number) => {
    const next = [...removed, i];
    setRemoved(next);
    if (spec.to === "bin") {
      setBin((n) => n + 1);
      later(() => setBin(0), 400);
    }
    if (next.length >= spec.rows.length) {
      setEmpty(true);
      later(() => { setEmpty(false); setGen((g) => g + 1); }, 1300);
    }
  };

  const list = (
    <div className="tl-list" key={gen}>
      {empty
        ? <p className="tl-empty">{spec.empty}</p>
        : spec.rows.map((row, i) => (
            <Slot key={i} gone={removed.includes(i)}>
              <FxItem
                ref={(n) => { items.current[i] = n; }}
                preset={spec.preset}
                tap
                touch={spec.touch}
                opts={{
                  ...(spec.opts as DissolveOptions),
                  ...(spec.to ? { target: rectOf(binEl.current) } : {}),
                }}
                onFinish={() => finish(i)}
                style={{ height: 76 }}
              >
                <RowCard row={row} />
              </FxItem>
            </Slot>
          ))}
    </div>
  );

  if (!spec.to) return list;
  return (
    <div className="tl-side">
      <div className="tl-grow">{list}</div>
      <div ref={binEl} className={`tl-target tl-bin${bin ? " bump" : ""}`} aria-hidden="true">
        <BinIcon count={bin || undefined} />
      </div>
    </div>
  );
}

/* ---------- one object in the middle ---------- */

function OneScene({ spec, later }: SceneProps<Extract<TileSpec, { kind: "one" }>>) {
  const item = useRef<ItemHandle | null>(null);
  const [seen, setSeen] = useState(true);
  const box: CSSProperties = spec.art.k === "photo"
    ? { width: "78%", height: 180 }
    : spec.art.k === "note"
      ? { width: "90%", height: 150 }
      : spec.art.k === "lock"
        ? { width: "90%", height: 160 }
        : spec.art.k === "icecream"
          ? { width: 120, height: 160 }
          : { width: 120, height: 120 };
  return (
    <div className="tl-center">
      <FxItem
        ref={item}
        preset={spec.preset}
        touch={spec.touch}
        opts={spec.opts as DissolveOptions}
        style={{ ...box, visibility: seen ? undefined : "hidden" }}
        onFinish={() => later(() => setSeen(true), spec.back)}
      >
        <div
          onClick={() => { if (!item.current?.busy()) { setSeen(false); item.current?.play(); } }}
          style={{ height: "100%" }}
        >
          <ArtView art={spec.art} />
        </div>
      </FxItem>
    </div>
  );
}

/* ---------- grid (tap-to-delete, refill when all gone) ---------- */

function GridScene({ spec, later }: SceneProps<Extract<TileSpec, { kind: "grid" }>>) {
  if (spec.loadMore) return <RainProducts spec={spec} later={later} />;
  const [gen, setGen] = useState(0);
  const [goneN, setGoneN] = useState(0);
  const [vis, setVis] = useState<boolean[]>(() => spec.art.map(() => true));
  useEffect(() => { setVis(spec.art.map(() => true)); setGoneN(0); }, [gen, spec.art]);
  const items = useRef<(ItemHandle | null)[]>([]);

  return (
    <div className="tl-grid" style={{ gridTemplateColumns: `repeat(${spec.cols}, 1fr)` }} key={gen}>
      {spec.art.map((a, i) => (
        <FxItem
          key={i}
          ref={(n) => { items.current[i] = n; }}
          preset={spec.preset}
          opts={spec.opts as DissolveOptions}
          style={{ height: spec.cellH, visibility: vis[i] ? undefined : "hidden" }}
          onFinish={() => {
            if (goneN + 1 >= spec.art.length) later(() => setGen((g) => g + 1), spec.preset === "sand" ? 900 : 800);
            setGoneN((n) => n + 1);
          }}
        >
          <div
            onClick={() => { if (!items.current[i]?.busy()) { setVis((v) => v.map((b, k) => (k === i ? false : b))); items.current[i]?.play(); } }}
            style={{ height: "100%" }}
          >
            <ArtView art={a} />
          </div>
        </FxItem>
      ))}
    </div>
  );
}

/** Products: "Load more" re-rains the whole grid with a rotating shift. */
function RainProducts({ spec, later }: { spec: Extract<TileSpec, { kind: "grid" }>; later: Later }) {
  const [round, setRound] = useState(0);
  const [busy, setBusy] = useState(true);
  const cells = useRef<(ItemHandle | null)[]>([]);
  const shown = spec.art.map((_, k) => spec.art[(k + round) % spec.art.length]);

  useEffect(() => {
    let cancelled = false;
    void frames().then(() => {
      if (cancelled) return;
      shown.forEach((_, k) => later(() => cells.current[k]?.play(), k * 110));
    });
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [round]);

  const done = (k: number) => {
    if (k === shown.length - 1) setBusy(false);
  };

  return (
    <>
      <div className="tl-grid" style={{ gridTemplateColumns: `repeat(${spec.cols}, 1fr)` }}>
        {shown.map((a, k) => (
          <FxItem
            key={`${round}-${k}`}
            ref={(n) => { cells.current[k] = n; }}
            preset={spec.preset}
            opts={{ ...(spec.opts as DissolveOptions), direction: "in" }}
            style={{ height: spec.cellH }}
            onFinish={() => done(k)}
          >
            <ArtView art={a} />
          </FxItem>
        ))}
      </div>
      <div className="tl-foot">
        <button type="button" className="btn tl-btn" disabled={busy} onClick={() => { if (!busy) { setBusy(true); setRound((r) => r + 1); } }}>Load more</button>
      </div>
    </>
  );
}

/* ---------- frames / candles / arcade ---------- */

function TapRestoreItem({ preset, opts, touch, art, style, later, back }: {
  preset: string; opts?: DissolveOptions; touch?: boolean; art: TileArt;
  style: CSSProperties; later: Later; back: number;
}) {
  const item = useRef<ItemHandle | null>(null);
  const [seen, setSeen] = useState(true);
  return (
    <FxItem
      ref={item} preset={preset} touch={touch} opts={opts}
      style={{ ...style, visibility: seen ? undefined : "hidden" }}
      onFinish={() => later(() => setSeen(true), back)}
    >
      <div
        onClick={() => { if (!item.current?.busy()) { setSeen(false); item.current?.play(); } }}
        style={{ height: "100%" }}
      >
        <ArtView art={art} />
      </div>
    </FxItem>
  );
}

function FramesScene({ spec, later }: SceneProps<Extract<TileSpec, { kind: "frames" }>>) {
  return (
    <div className="tl-row">
      {spec.items.map((a, i) => (
        <TapRestoreItem
          key={i}
          art={a}
          preset={spec.preset}
          touch
          opts={{ n: [200], duration: 1500 }}
          style={{ flex: 1, height: 150 }}
          later={later}
          back={700}
        />
      ))}
    </div>
  );
}

function CandlesScene({ spec, later }: SceneProps<Extract<TileSpec, { kind: "candles" }>>) {
  return (
    <div className="tl-row">
      {spec.cols.map((col, i) => (
        <TapRestoreItem
          key={i}
          art={{ k: "candle", col }}
          preset={spec.preset}
          opts={{ duration: 2200 }}
          style={{ width: 70, height: 170 }}
          later={later}
          back={800}
        />
      ))}
    </div>
  );
}

function ArcadeScene({ spec, later }: SceneProps<Extract<TileSpec, { kind: "arcade" }>>) {
  const [gen, setGen] = useState(0);
  const [pts, setPts] = useState(0);
  const [goneN, setGoneN] = useState(0);
  const [vis, setVis] = useState<boolean[]>(() => spec.colors.map(() => true));
  useEffect(() => { setVis(spec.colors.map(() => true)); setGoneN(0); }, [gen, spec.colors]);
  const items = useRef<(ItemHandle | null)[]>([]);

  return (
    <>
      <p className="tl-score">SCORE {pts}</p>
      <div className="tl-row" key={gen}>
        {spec.colors.map((color, i) => (
          <FxItem
            key={i}
            ref={(n) => { items.current[i] = n; }}
            preset={spec.preset}
            opts={{ grain: 6, duration: 1000 }}
            style={{ width: 96, height: 96, visibility: vis[i] ? undefined : "hidden" }}
            onFinish={() => {
              if (goneN + 1 >= spec.colors.length) later(() => setGen((g) => g + 1), 700);
              setGoneN((n) => n + 1);
            }}
          >
            <div
              onClick={() => {
                if (items.current[i]?.busy()) return;
                setVis((v) => v.map((b, k) => (k === i ? false : b)));
                setPts((p) => p + 100);
                items.current[i]?.play();
              }}
              style={{ height: "100%" }}
            >
              <InvaderArt color={color} />
            </div>
          </FxItem>
        ))}
      </div>
    </>
  );
}

/* ---------- clear all ---------- */

function ClearScene({ spec, later }: SceneProps<Extract<TileSpec, { kind: "clear" }>>) {
  const [gen, setGen] = useState(0);
  const [empty, setEmpty] = useState(false);
  const [busy, setBusy] = useState(false);
  const items = useRef<(ItemHandle | null)[]>([]);

  const clear = () => {
    if (busy) return;
    setBusy(true);
    spec.rows.forEach((_, i) => later(() => items.current[i]?.play(), i * 140));
    const total = spec.rows.length * 140;
    later(() => { setEmpty(true); setBusy(false); }, total + 1100);
    later(() => { setEmpty(false); setGen((g) => g + 1); }, total + 2300);
  };

  return (
    <>
      <div className="tl-list" key={gen}>
        {empty
          ? <p className="tl-empty">{spec.empty}</p>
          : spec.rows.map((row, i) => (
              <FxItem key={i} tap ref={(n) => { items.current[i] = n; }} preset={spec.preset} opts={{ duration: 1100 }} style={{ height: 76 }}>
                <RowCard row={row} />
              </FxItem>
            ))}
      </div>
      <div className="tl-foot">
        <button type="button" className="btn tl-btn" disabled={busy || empty} onClick={clear}>{spec.label}</button>
      </div>
    </>
  );
}

/* ---------- stream to folder ---------- */

function StreamScene({ spec, later }: SceneProps<Extract<TileSpec, { kind: "stream" }>>) {
  const item = useRef<ItemHandle | null>(null);
  const folder = useRef<HTMLDivElement | null>(null);
  const [seen, setSeen] = useState(true);
  const [bump, setBump] = useState(false);
  const [count, setCount] = useState(0);

  const go = () => {
    if (item.current?.busy()) return;
    setSeen(false);
    item.current?.play({
      ...(spec as unknown as { opts?: DissolveOptions }).opts,
      target: rectOf(folder.current),
      duration: 1400,
    });
    later(() => { setBump(true); setCount((c) => c + 1); }, 900);
    later(() => setBump(false), 1300);
    later(() => setSeen(true), 2000);
  };

  return (
    <div className="tl-stream">
      <FxItem ref={item} preset={spec.preset} style={{ width: 200, height: 76, visibility: seen ? undefined : "hidden" }}>
        <div onClick={go} style={{ height: "100%" }}>
          <RowCard row={spec.row} />
        </div>
      </FxItem>
      <div ref={folder} className={`tl-target${bump ? " bump" : ""}`}>
        <FolderTargetArt label={spec.label} />
        <span className="bin-count" hidden={!count}>{count}</span>
      </div>
    </div>
  );
}

/* ---------- appear (entrance) + chat ---------- */

function AppearScene({ spec, later }: SceneProps<Extract<TileSpec, { kind: "appear" }>>) {
  const [uids, setUids] = useState<number[]>([]);
  const [revealed, setRevealed] = useState<number[]>([]);
  const [busy, setBusy] = useState(false);
  const seq = useRef(0);
  const items = useRef<Record<number, ItemHandle | null>>({});
  const max = spec.max ?? 3;
  const batch = spec.batch ?? 1;

  const add = useCallback(() => {
    if (busy) return;
    setBusy(true);
    const start = seq.current;
    seq.current += batch;
    const ids = Array.from({ length: batch }, (_, k) => start + k);
    setUids((u) => [...u, ...ids].slice(-max));
    void frames().then(() => {
      ids.forEach((id, k) => later(() => items.current[id]?.play(), k * (spec.stagger ?? 0)));
    });
  }, [busy, batch, later, max, spec.stagger]);

  /* autoplay the first entry, like upstream's delayed button click */
  useEffect(() => { const t = setTimeout(() => addRef.current(), 450); return () => clearTimeout(t); }, []); // eslint-disable-line react-hooks/exhaustive-deps
  const addRef = useRef(add);
  useEffect(() => { addRef.current = add; }, [add]);

  const art = (id: number): TileArt => (spec.art === "bubble"
    ? {
        k: "bubble",
        text: (spec.lines ?? [])[id % (spec.lines ?? []).length],
        me: spec.chat ? id % 2 === 0 : false,
      }
    : { k: "row", row: { ...(spec.rows ?? [])[id % (spec.rows ?? []).length], square: spec.square } });

  return (
    <>
      <div className="tl-list tl-list-end">
        {uids.map((id) => (
          <Slot key={id} right={spec.chat ? id % 2 === 0 : false}>
            <FxItem
              ref={(n) => { items.current[id] = n; }}
              preset={spec.preset}
              opts={{ ...(spec.opts as DissolveOptions), direction: "in" }}
              style={{
                width: spec.art === "bubble" ? 220 : "100%",
                height: spec.itemH ?? (spec.art === "bubble" ? 44 : 52),
                opacity: revealed.includes(id) ? undefined : 0,
              }}
              onFinish={() => {
                setRevealed((r) => (r.includes(id) ? r : [...r, id]));
                setBusy(false);
              }}
            >
              <ArtView art={art(id)} />
            </FxItem>
          </Slot>
        ))}
      </div>
      {spec.chat
        ? (
            <div className="tl-composer">
              <span>Message</span>
              <button type="button" className="btn tl-send" disabled={busy} onClick={add}>{spec.label}</button>
            </div>
          )
        : (
            <div className="tl-foot">
              <button type="button" className="btn tl-btn" disabled={busy} onClick={add}>{spec.label}</button>
            </div>
          )}
    </>
  );
}

/* ---------- tags ---------- */

function TagsScene({ spec, later }: SceneProps<Extract<TileSpec, { kind: "tags" }>>) {
  const [gen, setGen] = useState(0);
  const [goneN, setGoneN] = useState(0);
  const [vis, setVis] = useState<boolean[]>(() => spec.items.map(() => true));
  useEffect(() => { setVis(spec.items.map(() => true)); setGoneN(0); }, [gen, spec.items]);
  const items = useRef<(ItemHandle | null)[]>([]);

  return (
    <div className="tl-tags" key={gen}>
      {spec.items.map((t, i) => (
        <FxItem
          key={i}
          ref={(n) => { items.current[i] = n; }}
          preset={spec.preset}
          tap
          touch
          opts={{ n: [0.7], duration: 1100, ...spec.opts }}
          style={{ visibility: vis[i] ? undefined : "hidden" }}
          onFinish={() => {
            if (goneN + 1 >= spec.items.length) later(() => setGen((g) => g + 1), 600);
            setGoneN((n) => n + 1);
          }}
        >
          <PillArt label={t} fill="#232A3A" color="#9DB8FF" />
        </FxItem>
      ))}
    </div>
  );
}

/* ---------- fling: swipe + deck ---------- */

function SwipeScene({ spec, later }: SceneProps<Extract<TileSpec, { kind: "swipe" }>>) {
  const item = useRef<ItemHandle | null>(null);
  const [seen, setSeen] = useState(true);
  const row: FxRow = { painting: "lake", title: "Hugo Martin", sub: "Sent the new deck, page 4 is the one.", meta: "8:57" };

  const go = (velocity: { x: number; y: number }) => {
    if (item.current?.busy()) return;
    setSeen(false);
    item.current?.play({ velocity });
    later(() => setSeen(true), 500);
  };
  const gesture = useFling(go, () => go({ x: 1800, y: -200 }));

  return (
    <div className="tl-center">
      <FxItem
        ref={item}
        preset={spec.preset}
        className="grab"
        style={{ width: 260, height: 76, visibility: seen ? undefined : "hidden" }}
      >
        <div {...gesture} style={{ height: "100%", touchAction: "none" }}>
          <RowCard row={row} />
        </div>
      </FxItem>
    </div>
  );
}

function DeckCard({ art, preset, isTop, go, onGone, itemRef }: {
  art: TileArt; preset: string; isTop: boolean;
  go: (v: { x: number; y: number }) => void; onGone: () => void;
  itemRef: (h: ItemHandle | null, hide: () => void) => void;
}) {
  const item = useRef<ItemHandle | null>(null);
  const [seen, setSeen] = useState(true);
  const gesture = useFling((v) => { if (isTop && seen) { setSeen(false); go(v); } });
  useEffect(() => {
    if (!seen) { const t = setTimeout(onGone, 250); return () => clearTimeout(t); }
  }, [seen, onGone]);
  useEffect(() => {
    if (isTop) itemRef(item.current, () => setSeen(false));
  }, [isTop, itemRef]);
  return (
    <FxItem
      ref={(n) => { item.current = n; }}
      preset={preset}
      className={isTop ? "grab" : ""}
      style={{ width: 200, height: 210, visibility: seen ? undefined : "hidden", pointerEvents: isTop ? undefined : "none" }}
    >
      <div {...gesture} style={{ height: "100%", touchAction: "none" }}>
        <ArtView art={art} />
      </div>
    </FxItem>
  );
}

function DeckScene({ spec, later }: SceneProps<Extract<TileSpec, { kind: "deck" }>>) {
  const [left, setLeft] = useState<number[]>(() => spec.items.map((_, i) => i));
  const busy = useRef(false);
  const top = useRef<{ item: ItemHandle | null; hide: () => void }>({ item: null, hide: () => undefined });
  const topIdx = left.length ? left[left.length - 1] : -1;

  const playTop = (v: { x: number; y: number }) => {
    if (busy.current || topIdx < 0 || top.current.item?.busy()) return;
    busy.current = true;
    top.current.hide();
    top.current.item?.play({ velocity: v });
    later(() => { busy.current = false; }, 300);
  };

  const removeTop = () => {
    setLeft((l) => {
      const n = l.slice(0, -1);
      if (!n.length) later(() => setLeft(spec.items.map((_, i) => i)), 500);
      return n;
    });
    busy.current = false;
  };

  return (
    <>
      <div className="tl-deck">
        {left.map((i) => (
          <DeckCard
            key={i}
            art={spec.items[i]}
            preset={spec.preset}
            isTop={i === topIdx}
            go={playTop}
            onGone={removeTop}
            itemRef={i === topIdx
              ? (h, hide) => { top.current = { item: h, hide }; }
              : () => undefined}
          />
        ))}
      </div>
      <div className="tl-foot">
        <button type="button" className="btn tl-btn" onClick={() => playTop({ x: -1600, y: -100 })}>Pass</button>
        <button type="button" className="btn tl-btn" onClick={() => playTop({ x: 1600, y: -100 })}>Like</button>
      </div>
    </>
  );
}

/* ---------- charge (hold) ---------- */

function useHoldHint(holdMs: number, setHint: SetHint) {
  const raf = useRef(0);
  const start = useRef(0);
  const alive = useRef(true);
  useEffect(() => () => { alive.current = false; cancelAnimationFrame(raf.current); }, []);
  return {
    onPressDown() {
      start.current = performance.now();
      cancelAnimationFrame(raf.current);
      const tick = () => {
        if (!alive.current) return;
        const c = Math.min(1, (performance.now() - start.current) / holdMs);
        setHint(c > 0.02 && c < 1 ? `Keep holding, ${Math.round(c * 100)}%` : null);
        if (c < 1) raf.current = requestAnimationFrame(tick);
      };
      raf.current = requestAnimationFrame(tick);
    },
    onPressUp() {
      cancelAnimationFrame(raf.current);
      setHint(null);
    },
  };
}

function HoldPill({ label, holdMs, setHint }: {
  label: string; holdMs: number; setHint: SetHint;
}) {
  const h = useDissolveHold({ holdMs, duration: 900 });
  const drive = useHoldHint(holdMs, setHint);
  return (
    <div className="tl-center">
      <div
        ref={h.ref}
        className="tl-item"
        style={{ width: 220, height: 44, touchAction: "none", userSelect: "none" }}
        onPointerDown={() => { drive.onPressDown(); h.pressHandlers.onPointerDown(); }}
        onPointerUp={() => { drive.onPressUp(); h.pressHandlers.onPointerUp(); }}
        onPointerLeave={drive.onPressUp}
      >
        <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: "100%", height: "100%", borderRadius: 999, background: "#DC2626", color: "#fff", fontSize: 13, fontWeight: 600 }}>
          {label}
        </span>
      </div>
    </div>
  );
}

function HoldRow({ row, holdMs, drive, gone, onDone, later }: {
  row: FxRow; holdMs: number;
  drive: ReturnType<typeof useHoldHint>; gone: boolean; onDone: () => void; later: Later;
}) {
  const h = useDissolveHold({
    holdMs, duration: 900,
    onCommit: () => later(onDone, 900),
  });
  return (
    <Slot gone={gone}>
      <div
        ref={h.ref}
        className="tl-item"
        style={{ height: 76, touchAction: "none", userSelect: "none" }}
        onPointerDown={() => { drive.onPressDown(); h.pressHandlers.onPointerDown(); }}
        onPointerUp={() => { drive.onPressUp(); h.pressHandlers.onPointerUp(); }}
      >
        <RowCard row={row} />
      </div>
    </Slot>
  );
}

function HoldScene({ spec, later, setHint }: SceneProps<Extract<TileSpec, { kind: "hold" }>>) {
  const [gen, setGen] = useState(0);
  const [removed, setRemoved] = useState<number[]>([]);
  const [empty, setEmpty] = useState(false);
  const drive = useHoldHint(spec.holdMs, setHint);
  useEffect(() => { setRemoved([]); setEmpty(false); }, [gen]);

  if (!spec.rows) {
    return <HoldPill key={`p${gen}`} label={spec.label ?? "Hold to delete account"} holdMs={spec.holdMs} setHint={setHint} />;
  }
  if (empty) return <p className="tl-empty">{spec.empty}</p>;
  const rows = spec.rows;
  return (
    <div className="tl-list" key={`r${gen}`}>
      {rows.map((row, i) => (
        <HoldRow
          key={i}
          row={row}
          holdMs={spec.holdMs}
          drive={drive}
          gone={removed.includes(i)}
          later={later}
          onDone={() => {
            const next = [...removed, i];
            setRemoved(next);
            if (next.length >= rows.length) {
              setEmpty(true);
              later(() => { setEmpty(false); setGen((g) => g + 1); }, 1200);
            }
          }}
        />
      ))}
    </div>
  );
}

/* ---------- morph ---------- */

function MorphScene({ spec }: SceneProps<Extract<TileSpec, { kind: "morph" }>>) {
  const m = useDissolveMorph();
  const [onB, setOnB] = useState(false);
  const [busy, setBusy] = useState(false);

  const pillStyle = (tone: string): CSSProperties => (tone === "ink"
    ? { background: "#F2F4F7", color: "#12151A" }
    : tone === "ghost"
      ? { background: "var(--raised)", color: "var(--text)", boxShadow: "inset 0 0 0 1px var(--line-2)" }
      : tone === "me"
        ? { background: "#3A6FE6", color: "#fff" }
        : { background: "#173322", color: "#86EFAC" });
  const wA = spec.variant === "profile" ? 96 : 132;
  const hA = spec.variant === "profile" ? 34 : 38;
  const pill = (label: string, tone: string) => (
    <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", height: hA, width: wA, borderRadius: 999, fontSize: 13, fontWeight: 600, ...pillStyle(tone) }}>
      {label}
    </span>
  );

  const toggle = () => {
    if (busy) return;
    setBusy(true);
    void m.morph({ grain: 2, duration: 900, reverse: onB }).then(() => {
      setOnB(!onB);
      setBusy(false);
    });
  };

  const pair = (
    <div className="demo-pair tl-morph" role="button" tabIndex={0} aria-label="Morph" onClick={toggle} style={{ width: wA, height: hA }}>
      <div ref={m.refA} style={{ ...m.styleA, opacity: busy ? 0 : onB ? 0 : 1 }}>{pill(spec.pillA[0], spec.pillA[1])}</div>
      <div ref={m.refB} className="demo-card-b" style={{ ...m.styleB, opacity: busy ? 0 : onB ? 1 : 0 }}>{pill(spec.pillB[0], spec.pillB[1])}</div>
    </div>
  );

  if (spec.variant === "profile") {
    return (
      <div className="tl-center">
        <div className="tl-profile">
          <div className="tl-item tl-static" style={{ width: 44, height: 44, borderRadius: "50%", overflow: "hidden", cursor: "default" }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/paintings/temple.jpg" alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          </div>
          <div className="tl-info">
            <strong>{spec.a[0]}</strong>
            <span>{spec.a[1]}</span>
            {pair}
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className="tl-center">
      <div className="tl-product">
        <div className="tl-item tl-static" style={{ width: 84, height: 84, borderRadius: 12, overflow: "hidden", cursor: "default" }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={`/paintings/${spec.b[0]}.jpg`} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        </div>
        <div className="tl-info">
          <strong>{spec.a[0]}</strong>
          <span>{spec.a[1]}</span>
          {pair}
        </div>
      </div>
    </div>
  );
}

/* ---------- peel ---------- */

function PeelItem({ later, children, style }: {
  later: Later; children: ReactNode; style?: CSSProperties;
}) {
  const [seen, setSeen] = useState(true);
  const h = useDissolvePeel({ onCommit: () => { setSeen(false); later(() => setSeen(true), 700); } });
  return (
    <div
      ref={h.ref}
      className="tl-item grab"
      style={{ ...style, ...h.style, opacity: seen ? 1 : 0 }}
      {...h.gesture}
    >
      {children}
    </div>
  );
}

function PeelScene({ spec, later }: SceneProps<Extract<TileSpec, { kind: "peel" }>>) {
  if (spec.variant === "sticker" && spec.sticker) {
    const a = spec.sticker;
    return (
      <div className="tl-center">
        <PeelItem later={later} style={{ width: 130, height: 130 }}>
          <ArtView art={a} />
        </PeelItem>
      </div>
    );
  }
  const lid = spec.lid ?? [];
  const geo = [
    { w: 96, h: 96, l: 18, t: 22 },
    { w: 140, h: 52, l: 140, t: 40 },
    { w: 84, h: 84, l: 310, t: 60 },
  ];
  return (
    <div className="tl-lid" style={{ aspectRatio: "420 / 140" }}>
      {lid.map((a, i) => (
        <PeelItem
          key={i}
          later={later}
          style={{
            left: `${(geo[i].l / 420) * 100}%`,
            top: `${(geo[i].t / 140) * 100}%`,
            width: `${(geo[i].w / 420) * 100}%`,
            height: `${(geo[i].h / 140) * 100}%`,
          }}
        >
          <ArtView art={a} />
        </PeelItem>
      ))}
    </div>
  );
}

/* ---------- doc (print) ---------- */

function DocScene({ spec, later }: SceneProps<Extract<TileSpec, { kind: "doc" }>>) {
  const item = useRef<ItemHandle | null>(null);
  const [seen, setSeen] = useState(false);
  const [busy, setBusy] = useState(true);

  const pay = useCallback(() => {
    setBusy(true);
    setSeen(true);
    void frames().then(() => {
      item.current?.play({ direction: "in" });
    });
    later(() => setBusy(false), 1800);
  }, [later]);

  useEffect(() => { const t = setTimeout(() => pay(), 450); return () => clearTimeout(t); }, [pay]);

  return (
    <div className="tl-row tl-doc">
      <FxItem
        ref={item}
        preset={spec.preset}
        opts={{ ...(spec.opts as DissolveOptions), direction: "in" }}
        style={{ width: spec.w, height: spec.h, opacity: seen ? undefined : 0, borderRadius: spec.art.k === "receipt" ? 0 : undefined }}
      >
        <ArtView art={spec.art} />
      </FxItem>
      <button type="button" className="btn tl-btn" disabled={busy} onClick={pay}>{spec.label}</button>
    </div>
  );
}

/* ---------- dispatcher ---------- */

function Scene({ spec, setHint }: { spec: TileSpec; setHint: SetHint }) {
  const later = useTimers();
  switch (spec.kind) {
    case "list": return <ListScene spec={spec} later={later} setHint={setHint} />;
    case "one": return <OneScene spec={spec} later={later} setHint={setHint} />;
    case "grid": return <GridScene spec={spec} later={later} setHint={setHint} />;
    case "frames": return <FramesScene spec={spec} later={later} setHint={setHint} />;
    case "arcade": return <ArcadeScene spec={spec} later={later} setHint={setHint} />;
    case "candles": return <CandlesScene spec={spec} later={later} setHint={setHint} />;
    case "clear": return <ClearScene spec={spec} later={later} setHint={setHint} />;
    case "appear": return <AppearScene spec={spec} later={later} setHint={setHint} />;
    case "tags": return <TagsScene spec={spec} later={later} setHint={setHint} />;
    case "swipe": return <SwipeScene spec={spec} later={later} setHint={setHint} />;
    case "deck": return <DeckScene spec={spec} later={later} setHint={setHint} />;
    case "hold": return <HoldScene spec={spec} later={later} setHint={setHint} />;
    case "morph": return <MorphScene spec={spec} later={later} setHint={setHint} />;
    case "peel": return <PeelScene spec={spec} later={later} setHint={setHint} />;
    case "doc": return <DocScene spec={spec} later={later} setHint={setHint} />;
    case "stream": return <StreamScene spec={spec} later={later} setHint={setHint} />;
  }
}

function Tile({ meta, spec }: { meta: { title: string; hint: string }; spec: TileSpec }) {
  const [gen, setGen] = useState(0);
  const [hint, setHint] = useState<string | null>(null);
  return (
    <div className="tile">
      <div className="tile-head">
        <span className="tile-title">{meta.title}</span>
        <button type="button" className="icon-btn tile-reset" aria-label={`Reset ${meta.title}`} onClick={() => { setGen((g) => g + 1); setHint(null); }}>
          <ResetIcon />
        </button>
      </div>
      <div className="tile-body">
        <Scene key={gen} spec={spec} setHint={setHint} />
      </div>
      <p className="tile-hint">{hint ?? meta.hint}</p>
    </div>
  );
}

/** The two example tiles under the stage, exactly like upstream tilesHTML + mountTiles. */
export function FxTiles({ id }: { id: string }) {
  const specs = TILE_SPECS[id];
  const meta = TILE_META[id];
  if (!specs || !meta) return null;
  return (
    <div className="tiles">
      <Tile meta={meta[0]} spec={specs[0]} />
      <Tile meta={meta[1]} spec={specs[1]} />
    </div>
  );
}

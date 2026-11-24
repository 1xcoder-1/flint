/**
 * Facts and generators for the effect variant pages: the same control model,
 * demo copy and code-as-you-tune snippets as the upstream dissolve web docs
 * (MIT, © 2026 Rayan Selmi), retargeted at the react-flint API.
 */

export type FxSettings = {
  mode: string | null;
  origin: string;
  direction: "out" | "in";
  field: boolean;
  grain: number;
  fling: number;
  knob: number | null;
  haptics: boolean;
  duration: number;
};

/* ---------- variant facts (mirrors web/playground.js) ---------- */

export const GRAIN: Record<string, number> = {
  dust: 3, sand: 2.5, ember: 3, pixel: 7, vortex: 3, shatter: 3, stream: 3.5,
  gather: 3, rain: 3, print: 3, snap: 3, fling: 3, charge: 3, morph: 4, peel: 3, melt: 3,
  puff: 3.5, shred: 4, crush: 3, sparkle: 2.5, sink: 3, zap: 3, ripple: 3,
};
export const ATLAS = ["dust", "sand", "ember", "pixel", "vortex", "snap", "fling",
  "stream", "gather", "rain", "print", "charge", "peel",
  "puff", "shred", "crush", "sparkle", "sink", "zap", "ripple"];
export const ENTRANCES = ["gather", "rain", "print", "sparkle", "sink"];
export const CLASSIC = ["dust", "sand", "ember", "pixel", "vortex"];
export const ORIGINS = ["auto", "touch", "left", "right", "top", "bottom", "center"];
export const FLINGS = [
  { label: "slow right", v: { x: 600, y: 0 } },
  { label: "fast right", v: { x: 2600, y: -200 } },
  { label: "up left", v: { x: -900, y: -1400 } },
];

export type KnobSpec = {
  key: string; title: string; min: number; max: number; step: number; def: number;
  fmt: (v: number) => string; when?: (s: FxSettings) => boolean;
};

export const KNOB: Record<string, KnobSpec> = {
  snap: { key: "n", title: "Push", min: 0.4, max: 2, step: 0.1, def: 1, fmt: (v) => `${v}x` },
  shatter: { key: "n", title: "Shards", min: 60, max: 400, step: 10, def: 220, fmt: (v) => `${v}` },
  charge: { key: "holdMs", title: "Hold time", min: 400, max: 3000, step: 100, def: 1200, fmt: (v) => `${v} ms` },
  peel: {
    key: "threshold", title: "Threshold", min: 0.2, max: 0.8, step: 0.05, def: 0.4,
    fmt: (v) => `${Math.round(v * 100)}%`, when: (s) => s.mode === "hand",
  },
  ripple: { key: "n", title: "Crest", min: 0.4, max: 2.5, step: 0.1, def: 1, fmt: (v) => `${v}x` },
};

export const MODES: Record<string, { title: string; opts: [string, string][]; def: string }> = {
  peel: { title: "Trigger", opts: [["hand", "by hand"], ["auto", "dissolve()"]], def: "hand" },
  ...Object.fromEntries(CLASSIC.map((id) => [id, {
    title: "Trigger", opts: [["tap", "tap"], ["scrub", "scrub"]], def: "tap",
  }])),
};

export const naturalOf = (id: string) => (ENTRANCES.includes(id) ? "in" : "out");
export const r2 = (v: number) => Math.round(v * 100) / 100;

export function durationDef(id: string, s: FxSettings): number {
  if (ENTRANCES.includes(id)) return 1200;
  if (id === "charge") return 900;
  if (id === "morph") return 1100;
  if (id === "peel") return s.mode === "hand" ? 700 : 1900;
  if (id === "shred") return 1300;
  if (id === "zap") return 1100;
  if (id === "ripple") return 1400;
  return 1500;
}

/** Which controls a variant shows for the current state. */
export function caps(id: string, s: FxSettings) {
  const hook = id === "charge" || id === "morph" || (id === "peel" && s.mode === "hand") || s.mode === "scrub";
  return {
    origin: (ATLAS.includes(id) || id === "shatter") && !hook && id !== "peel",
    direction: !hook,
    field: ATLAS.includes(id) && !hook && id !== "peel",
    grain: id !== "shatter",
    fling: id === "fling",
    knob: KNOB[id] && (!KNOB[id].when || KNOB[id].when(s)) ? KNOB[id] : null,
    mode: MODES[id] ?? null,
    reverse: id !== "charge",
  };
}

export function defaultsFor(id: string): FxSettings {
  const s: FxSettings = {
    mode: MODES[id]?.def ?? null,
    origin: id === "snap" || id === "shatter" || id === "ripple" ? "touch" : "auto",
    direction: naturalOf(id) as "out" | "in",
    field: false,
    grain: GRAIN[id] ?? 3,
    fling: 1,
    knob: KNOB[id]?.def ?? null,
    haptics: !ENTRANCES.includes(id),
    duration: 1500,
  };
  s.duration = durationDef(id, s);
  return s;
}

export function hintFor(id: string, s: FxSettings): string {
  if (id === "charge") return "Press and hold the card, or press Play";
  if (id === "peel" && s.mode === "hand") return "Grab any edge or corner and pull, or press Play";
  if (s.mode === "scrub") return "Drag the card sideways, release past half to commit";
  if (id === "fling") return "Swipe the card, or press Play to use the velocity preset";
  if (id === "morph") return "Tap the card or press Play";
  if (id === "puff") return "Tap the card and watch it billow away";
  if (id === "shred") return "Tap the card to cut it into strips";
  if (id === "crush") return "Tap the card to press it flat";
  if (id === "zap") return "Tap the card to spark it out";
  if (id === "ripple") return "Tap the card where the stone should land";
  if (caps(id, s).origin && s.origin === "touch") return "Tap the card where it should break";
  return "Tap the card or press Play";
}

/* ---------- stage hints + demo card copy (mirrors web/demo.js) ---------- */

/** The little label under the main stage, per effect. */
export const STAGE_HINTS: Record<string, string> = {
  dust: "Tap", sand: "Tap", ember: "Tap", pixel: "Tap", vortex: "Tap",
  snap: "Tap anywhere", fling: "Swipe", stream: "Tap",
  gather: "Tap to replay", rain: "Tap to replay", print: "Tap to replay",
  charge: "Press and hold", peel: "Drag any edge", shatter: "Tap where it breaks",
  morph: "Tap to morph", melt: "Tap",
  puff: "Tap", shred: "Tap", crush: "Tap", zap: "Tap", ripple: "Tap a spot",
  sparkle: "Tap to replay", sink: "Tap to replay",
};

export type FxCard = { app: string; title: string; body: string; painting: string };

/** The notification card every demo shows: app glyph, title, body, painting thumb. */
export const FX_COPY: Record<string, FxCard> = {
  dust: { app: "Messages", title: "Lina", body: "Dinner at 8? I booked the terrace.", painting: "temple" },
  sand: { app: "Calendar", title: "Design review", body: "Moved to 4 pm, room two.", painting: "tuscany" },
  ember: { app: "Photos", title: "Memories", body: "Lisbon, three years ago today.", painting: "valley" },
  pixel: { app: "Arcade", title: "Level complete", body: "New high score, 12 480 points.", painting: "arch" },
  vortex: { app: "Reminders", title: "Water the plants", body: "Every Sunday at 10 am.", painting: "pines" },
  shatter: { app: "Wallet", title: "Payment declined", body: "Try another card for Studio Pro.", painting: "aqueduct" },
  stream: { app: "Files", title: "Old_invoice.pdf", body: "Tap to move it to the bin.", painting: "lake" },
  gather: { app: "Messages", title: "Sam", body: "Here are the refs for the hero.", painting: "cypress" },
  rain: { app: "Store", title: "Your order shipped", body: "Arrives Thursday before noon.", painting: "villa" },
  print: { app: "Receipts", title: "Order 2048", body: "Two prints, 48 €. Thank you!", painting: "arch" },
  snap: { app: "Mail", title: "Weekly digest", body: "This week in motion design.", painting: "lake" },
  fling: { app: "Messages", title: "Camille", body: "Sent you three photos from Rome.", painting: "pond" },
  charge: { app: "Settings", title: "Delete project", body: "Hold to confirm. This is final.", painting: "aqueduct" },
  morph: { app: "Updates", title: "Downloading", body: "Version 2.4, 68 MB left.", painting: "lake" },
  morphB: { app: "Updates", title: "Ready to install", body: "Restart to finish the update.", painting: "pines" },
  peel: { app: "Stickers", title: "New sticker pack", body: "Twelve paintings to stick anywhere.", painting: "arch" },
  melt: { app: "Weather", title: "Heat wave", body: "38° today, stay in the shade.", painting: "tuscany" },
  puff: { app: "Reminders", title: "Water the herbs", body: "Before the afternoon sun.", painting: "tuscany" },
  shred: { app: "Files", title: "Contract_v3.pdf", body: "Shred it once both parties sign.", painting: "aqueduct" },
  crush: { app: "Packages", title: "Box 42", body: "Folded flat for the recycling bin.", painting: "villa" },
  sparkle: { app: "Music", title: "New release", body: "Aurora, out today on every store.", painting: "pond" },
  sink: { app: "Fitness", title: "Session logged", body: "38 min, 420 kcal. Nice work.", painting: "valley" },
  zap: { app: "Deploys", title: "Build 2048", body: "Zapped onto the staging cluster.", painting: "arch" },
  ripple: { app: "Pond", title: "Stone skipped", body: "Three rings and it sank at the fourth.", painting: "pond" },
};

/** The two example tiles under the stage: exact upstream titles and hints. */
export const TILE_META: Record<string, [{ title: string; hint: string }, { title: string; hint: string }]> = {
  dust: [
    { title: "Clear a notification", hint: "Tap a notification" },
    { title: "Inbox", hint: "Tap a mail to archive it" },
  ],
  sand: [
    { title: "Delete a photo", hint: "Tap the photo" },
    { title: "Photo grid", hint: "Tap photos to delete them" },
  ],
  ember: [
    { title: "Burn after reading", hint: "Tap to burn the note" },
    { title: "Drafts", hint: "Tap a draft to discard it" },
  ],
  pixel: [
    { title: "Coin collected", hint: "Tap the coin" },
    { title: "Arcade", hint: "Tap the invaders" },
  ],
  vortex: [
    { title: "Clear all", hint: "Press Clear all" },
    { title: "Browser tabs", hint: "Tap a tab to close it" },
  ],
  shatter: [
    { title: "Wrong passcode", hint: "Tap where the glass breaks" },
    { title: "Framed paintings", hint: "Tap a frame where it should crack" },
  ],
  stream: [
    { title: "Move to folder", hint: "Tap the file" },
    { title: "Downloads", hint: "Tap a file, it flies to the bin" },
  ],
  gather: [
    { title: "New message", hint: "Press Receive" },
    { title: "Chat", hint: "Press Send" },
  ],
  rain: [
    { title: "Pull to refresh", hint: "Press Refresh" },
    { title: "Products", hint: "Press Load more" },
  ],
  print: [
    { title: "Receipt", hint: "Press Pay" },
    { title: "Boarding pass", hint: "Press Check in" },
  ],
  snap: [
    { title: "Filter tags", hint: "Tap a tag where you want it to pop" },
    { title: "Toasts", hint: "Tap a toast to dismiss it" },
  ],
  fling: [
    { title: "Swipe to triage", hint: "Swipe the mail away" },
    { title: "Match deck", hint: "Drag the top card left or right" },
  ],
  charge: [
    { title: "Delete account", hint: "Press and hold the button" },
    { title: "Projects", hint: "Hold a project to delete it" },
  ],
  morph: [
    { title: "Follow", hint: "Tap Follow" },
    { title: "Add to cart", hint: "Tap the button" },
  ],
  peel: [
    { title: "Sticker", hint: "Grab an edge and pull" },
    { title: "Laptop lid", hint: "Peel the stickers off by hand" },
  ],
  melt: [
    { title: "Ice cream", hint: "Tap the ice cream" },
    { title: "Candles", hint: "Tap a candle to melt it" },
  ],
  puff: [
    { title: "Clear a reminder", hint: "Tap a reminder" },
    { title: "Inbox", hint: "Tap a mail and watch it puff" },
  ],
  shred: [
    { title: "Shred a document", hint: "Tap the document" },
    { title: "Files", hint: "Tap a file to shred it" },
  ],
  crush: [
    { title: "Crush a parcel photo", hint: "Tap the photo" },
    { title: "Alerts", hint: "Tap an alert to crush it" },
  ],
  sparkle: [
    { title: "Tag cloud", hint: "Tap a tag to sparkle it" },
    { title: "Feed", hint: "Press Reveal more" },
  ],
  sink: [
    { title: "New message", hint: "Press Receive" },
    { title: "Shop", hint: "Press Load more" },
  ],
  zap: [
    { title: "Zap a tag", hint: "Tap a tag" },
    { title: "Toasts", hint: "Tap a toast to zap it" },
  ],
  ripple: [
    { title: "Drop a pebble", hint: "Tap the pond where it lands" },
    { title: "Tags", hint: "Tap a tag to ripple it away" },
  ],
};

/* ---------- head glyph (mirrors web/icons.js) ---------- */

type GlyphPoint = { x: number; y: number; o: number; sq?: boolean; rot?: boolean; warm?: boolean };
const N = 5;
const FX: Record<string, (c: number, r: number) => GlyphPoint> = {
  dust: (c, r) => ({ x: c + (c / N) ** 2 * 2.2, y: r - (c / N) ** 2 * 1.2, o: 1 - c / 6 }),
  sand: (c, r) => ({ x: c, y: r + (c / N) * 1.6 * (r / N), o: 1 - (c / N) * 0.5 }),
  ember: (c, r) => ({ x: c, y: r - (c / N) ** 2 * 2, o: 1 - c / 7, warm: c > 2 }),
  pixel: (c, r) => ({ x: c, y: r, o: (c * 7 + r * 3) % 5 > 1 ? 1 : 0.2, sq: true }),
  vortex: (c, r) => {
    const dx = c - 2, dy = r - 2, d = Math.hypot(dx, dy), a = Math.atan2(dy, dx) + d * 0.5;
    return { x: 2 + Math.cos(a) * d * 0.85, y: 2 + Math.sin(a) * d * 0.85, o: 1 - d / 4 };
  },
  shatter: (c, r) => ({ x: c + Math.sign(c - 2) * 0.6, y: r + Math.sign(r - 2) * 0.6, o: 1, sq: true, rot: true }),
  stream: (c, r) => ({ x: c * 0.6 + (c / N) * 2.2, y: r * (1 - c / 6) + (c / N) * 3, o: 1 - c / 8 }),
  gather: (c, r) => ({ x: 2 + (c - 2) * 1.35, y: 2 + (r - 2) * 1.35, o: 1 - Math.hypot(c - 2, r - 2) / 4 }),
  rain: (c, r) => ({ x: c, y: r - (c % 2) * 0.8, o: r > 2 ? 1 : 0.35 }),
  print: (c, r) => ({ x: c, y: r, o: r < 3 || (r === 3 && c < 3) ? 1 : 0.12 }),
  snap: (c, r) => {
    const dx = c - 2, dy = r - 2;
    return { x: 2 + dx * 1.3, y: 2 + dy * 1.3, o: dx || dy ? 1 - Math.hypot(dx, dy) / 4.5 : 0 };
  },
  fling: (c, r) => ({ x: c + (r / N) * 1.4 + (c / N) ** 2 * 1.5, y: r - (c / N) ** 2 * 1.5, o: 1 - c / 7 }),
  charge: (c, r) => ({ x: c, y: r, o: 1, warm: Math.hypot(c - 2, r - 2) < 1.6 }),
  peel: (c, r) => (c + r > 5 ? { x: 9 - r, y: 9 - c, o: 0.35 } : { x: c, y: r, o: 1 }),
  melt: (c, r) => ({ x: c, y: r + (c % 2 ? r * 0.35 : r * 0.12), o: 1 - r / 9 }),
  puff: (c, r) => { const dx = c - 2, dy = r - 2, d = Math.hypot(dx, dy), g = 1 + d * 0.3; return { x: 2 + dx * g, y: 2 + dy * g, o: 1 - d / 4.2 }; },
  shred: (c, r) => ({ x: c, y: r + (c % 2) * 0.7, o: 1 - (c / 6) * 0.45, sq: true }),
  crush: (c, r) => ({ x: 2 + (c - 2) * 1.25, y: 3.3 + (r - 2) * 0.45, o: 1 - r / 8 }),
  sparkle: (c, r) => { const k = (c * 5 + r * 3) % 4; return { x: c + (k - 1.5) * 0.22, y: r + (k % 2) * 0.2, o: k === 0 ? 1 : k === 1 ? 0.75 : 0.3 }; },
  sink: (c, r) => ({ x: c, y: r + (1 - r / 4) * 1.2, o: 1 - r / 8 }),
  zap: (c, r) => ({ x: c + (r % 2 ? 0.75 : -0.45), y: r - c * 0.16, o: (c + r) % 3 === 0 ? 1 : 0.5, sq: true }),
  ripple: (c, r) => {
    const dx = c - 2, dy = r - 2, d = Math.hypot(dx, dy), ring = Math.abs(Math.sin(d * 1.15 - 0.5));
    return { x: 2 + dx * (1 + d * 0.22), y: 2 + dy * (1 + d * 0.22), o: 0.2 + 0.8 * ring };
  },
  morph: (c, r) => ({ x: c, y: r, o: c < 2 ? 1 : c === 2 ? 0.5 : Math.hypot(c - 3.5, r - 2) < 1.8 ? 1 : 0.1 }),
};

export type GlyphCell =
  | { kind: "rect"; x: number; y: number; o: number; rot?: number; warm: boolean }
  | { kind: "dot"; cx: number; cy: number; o: number; warm: boolean };

/** The 5x5 generative grain grid for a variant, as data the component renders. */
export function glyphCells(id: string): GlyphCell[] {
  const fx = FX[id];
  if (!fx) return [];
  const out: GlyphCell[] = [];
  // Node and V8 disagree on the last bits of Math.hypot / Math.sin, so the server HTML and the
  // client render differed by 1e-16 and React reported a hydration mismatch. Round the geometry
  // once here: two decimals on an 18 unit viewBox is well below a device pixel.
  const rnd = (n: number) => Math.round(n * 100) / 100;
  for (let r = 0; r < N; r++) {
    for (let c = 0; c < N; c++) {
      const p = fx(c, r);
      if (p.o <= 0.05) continue;
      const x = rnd(2 + p.x * 3), y = rnd(2 + p.y * 3), o = rnd(Math.max(0.15, p.o));
      const warm = !!p.warm;
      out.push(p.sq
        ? { kind: "rect", x: rnd(x - 1.1), y: rnd(y - 1.1), o, rot: p.rot ? (c - r) * 9 : undefined, warm }
        : { kind: "dot", cx: x, cy: y, o, warm });
    }
  }
  return out;
}

/* ---------- snippets: the code pane mirrors the current settings ---------- */

const PKG = "react-flint";

/** `dissolve({...})` option lines for the generic presets, upstream order. */
function optionEntries(id: string, s: FxSettings): [string, string][] {
  const c = caps(id, s);
  const entries: [string, string][] = [["preset", `'${id}'`]];
  if (c.grain) entries.push(["grain", `${s.grain}`]);
  entries.push(["duration", `${s.duration}`]);
  const touch = c.origin && s.origin === "touch";
  if (touch) entries.push(["origin", "{ x: e.nativeEvent.offsetX, y: e.nativeEvent.offsetY }"]);
  else if (c.origin && s.origin !== "auto") entries.push(["origin", `'${s.origin}'`]);
  if (c.direction && s.direction !== naturalOf(id)) entries.push(["direction", `'${s.direction}'`]);
  if (id === "fling") entries.push(["velocity", `{ x: ${FLINGS[s.fling].v.x}, y: ${FLINGS[s.fling].v.y} }`]);
  if (id === "stream" && s.direction === "out") {
    entries.push(["to", "binRef"]);
    entries.push(["onArrive", "() => bumpBadge()"]);
  }
  if (s.field) entries.push(["field", "'cascade'"]);
  if (c.knob && c.knob.key === "n") entries.push(["n", `[${s.knob}]`]);
  return entries;
}

/** Hook snippet for the current settings, in the react-flint API. */
export function fxSnippet(id: string, s: FxSettings): string {
  if (id === "charge") {
    return `import { useDissolveHold } from '${PKG}';

const { ref, pressHandlers, style } = useDissolveHold({
  holdMs: ${s.knob},
  grain: ${s.grain},
  duration: ${s.duration},
  onCommit: () => remove(item.id),
});

<div ref={ref} {...pressHandlers} style={style}>
  <Card />
</div>`;
  }
  if (id === "peel" && s.mode === "hand") {
    return `import { useDissolvePeel } from '${PKG}';

const { ref, gesture, style } = useDissolvePeel({
  threshold: ${s.knob},
  grain: ${s.grain},
  duration: ${s.duration},
  onCommit: () => remove(sticker.id),
});

<div ref={ref} {...gesture} style={{ ...style, cursor: 'grab' }}>
  <Sticker />
</div>`;
  }
  if (id === "morph") {
    return `import { useDissolveMorph } from '${PKG}';

const { refA, refB, styleA, styleB, morph } = useDissolveMorph();

<div style={{ position: 'relative' }}>
  <div style={styleA}><div ref={refA}>{follow}</div></div>
  <div style={styleB}><div ref={refB}>{following}</div></div>
</div>

await morph({ grain: ${s.grain}, duration: ${s.duration} });                 // A becomes B
await morph({ grain: ${s.grain}, duration: ${s.duration}, reverse: true });  // and back`;
  }

  const entries = optionEntries(id, s);
  const touch = caps(id, s).origin && s.origin === "touch";

  if (s.direction === "in" && ENTRANCES.includes(id) && !touch) {
    // Entrances: the component plays on mount.
    const attr = ([k, v]: [string, string]) =>
      (v.startsWith("'") ? `${k}="${v.slice(1, -1)}"` : `${k}={${v}}`);
    return `import { DissolveIn } from '${PKG}';

<DissolveIn
  ${entries.map(attr).join("\n  ")}
>
  <Card />
</DissolveIn>`;
  }

  const lines = entries.map(([k, v]) => `  ${k}: ${v},`);
  const call = touch
    ? `const play = (e: React.MouseEvent) => dissolve({
${lines.join("\n")}
});`
    : `const play = () => dissolve({
${lines.join("\n")}
});`;
  return `import { useDissolve } from '${PKG}';

const { ref, dissolving, dissolve } = useDissolve();

<div ref={ref} style={{ opacity: dissolving ? 0 : 1 }} onClick={play}>
  <Card />
</div>

${call}`;
}

/** The same settings as one copy-paste component. */
export function fxFullSnippet(id: string, s: FxSettings): string {
  const c = caps(id, s);
  if (id === "charge") {
    return `import { useState } from 'react';
import { useDissolveHold } from '${PKG}';

export function HoldToDelete() {
  const [gone, setGone] = useState(false);
  const { ref, pressHandlers, style } = useDissolveHold({
    holdMs: ${s.knob},
    grain: ${s.grain},
    duration: ${s.duration},
    onCommit: () => setGone(true),
  });

  return gone ? (
    <button onClick={() => setGone(false)}>Restore the project</button>
  ) : (
    <div ref={ref} {...pressHandlers} style={{ ...style, touchAction: 'none' }}>
      <p>Delete project</p>
      <small>Hold to confirm. This is final.</small>
    </div>
  );
}`;
  }
  if (id === "peel" && s.mode === "hand") {
    return `import { useState } from 'react';
import { useDissolvePeel } from '${PKG}';

export function PeelableSticker() {
  const [gone, setGone] = useState(false);
  const { ref, gesture, style } = useDissolvePeel({
    threshold: ${s.knob},
    grain: ${s.grain},
    duration: ${s.duration},
    onCommit: () => setGone(true),
  });

  return gone ? (
    <button onClick={() => setGone(false)}>Put it back</button>
  ) : (
    <div ref={ref} {...gesture} style={{ ...style, cursor: 'grab', width: 120, height: 120 }}>
      <StickerArt />
    </div>
  );
}`;
  }
  if (id === "morph") {
    return `import { useDissolveMorph } from '${PKG}';

export function FollowButton() {
  const { refA, refB, styleA, styleB, morph } = useDissolveMorph();
  const [following, setFollowing] = useState(false);

  return (
    <div
      style={{ position: 'relative' }}
      onClick={() => void morph({ grain: ${s.grain}, duration: ${s.duration} }).then(() => setFollowing(!following))}
    >
      <div style={styleA}><div ref={refA} hidden={following}>Follow</div></div>
      <div style={styleB}><div ref={refB} hidden={!following}>Following</div></div>
    </div>
  );
}`;
  }

  const entries = optionEntries(id, s);
  const inEntrance = s.direction === "in" && ENTRANCES.includes(id);
  if (inEntrance) {
    const props = entries.map(([k, v]) =>
      (v.startsWith("'") ? `${k}="${v.slice(1, -1)}"` : `${k}={${v}}`));
    return `import { DissolveIn } from '${PKG}';

export function EntranceDemo() {
  return (
    <DissolveIn ${props.join(" ")}>
      <Card />
    </DissolveIn>
  );
}`;
  }
  const lines = entries.map(([k, v]) => `        ${k}: ${v},`);
  const touch = c.origin && s.origin === "touch";
  return `import { useDissolve } from '${PKG}';

export function ${id[0].toUpperCase()}${id.slice(1)}Demo() {
  const { ref, dissolving, dissolve } = useDissolve();

  const play${touch ? " = (e: React.MouseEvent)" : ""} = () =>
    void dissolve({
${entries.join("\n")}
    });

  return (
    <div
      ref={ref}
      style={{ opacity: dissolving ? 0 : 1 }}
      onClick={${touch ? "play" : "() => void play()"}}
      role="button"
      tabIndex={0}
    >
      <Card />
    </div>
  );
}`;
}

/** The "Copy prompt" text, like upstream promptFor(). */
export function fxPrompt(id: string, title: string, desc: string, code: string): string {
  return `Add the ${title} effect from ${PKG} to this React app. ${desc}
Install: pnpm add ${PKG}
Use these exact settings:

${code}

Hide the original view while it dissolves and update state after the promise resolves. Keep grains reasonable (6000 max per burst) and respect reduced motion.`;
}

/* ---------- tile scene data (mirrors the lists in web/demo.js) ---------- */

export type FxRow = {
  letter?: string; color?: string; painting?: string; square?: boolean;
  title: string; sub?: string; meta?: string;
};

export const FX_NOTIFS: FxRow[] = [
  { letter: "C", color: "#34A853", title: "Calendar", sub: "Design review in 10 minutes", meta: "now" },
  { painting: "pond", title: "Photos", sub: "New memory: Rome, 2023", meta: "2m" },
  { letter: "B", color: "#F59E0B", title: "Bank", sub: "Card ending 4402 was charged 12 €", meta: "5m" },
];
const FX_MAIL: FxRow[] = [
  { painting: "temple", title: "Lina Haddad", sub: "Dinner at 8? I booked the terrace.", meta: "9:41" },
  { letter: "S", color: "#3A6FE6", title: "Stripe", sub: "Your payout of 1 240 € is on its way.", meta: "9:12" },
  { painting: "lake", title: "Hugo Martin", sub: "Sent the new deck, page 4 is the one.", meta: "8:57" },
  { letter: "F", color: "#E4572E", title: "Figma", sub: "Camille commented on Onboarding v3.", meta: "Tue" },
];
const FX_DRAFTS: FxRow[] = [
  { letter: "D", color: "#B45309", title: "Re: Quarterly plan", sub: "I think we should cut the second launch…", meta: "Draft" },
  { letter: "D", color: "#B45309", title: "Offer letter, Sam", sub: "Hi Sam, we are thrilled to offer you…", meta: "Draft" },
  { letter: "D", color: "#B45309", title: "Angry reply to Kevin", sub: "With due respect, the build was…", meta: "Draft" },
];
const FX_FILES: FxRow[] = [
  { letter: "P", color: "#E4572E", title: "Invoice_0425.pdf", sub: "214 KB", meta: "PDF" },
  { letter: "K", color: "#3A6FE6", title: "Pitch deck v7.key", sub: "18.2 MB", meta: "Keynote" },
  { painting: "lake", square: true, title: "IMG_2048.heic", sub: "3.1 MB", meta: "Photo" },
];
const FX_TABS: [string, string][] = [
  ["temple", "Paestum, travel guide"], ["lake", "Lakes of Lombardy"], ["pines", "Pine forests, a field note"],
  ["arch", "Roman arches"], ["valley", "Val d’Orcia walks"], ["villa", "Villa rentals"],
];
const FX_TOASTS: FxRow[] = [
  { letter: "✓", color: "#16A34A", title: "Saved", sub: "Your changes are live on the site." },
  { letter: "!", color: "#D97706", title: "Storage almost full", sub: "9.6 GB of 10 GB used." },
  { letter: "i", color: "#2563EB", title: "New version", sub: "Version 2.4 is ready to install." },
];
const FX_PROJECTS: FxRow[] = [
  { painting: "pines", square: true, title: "Forest rebrand", sub: "24 files · edited 2 days ago", meta: "Hold" },
  { painting: "arch", square: true, title: "Museum app", sub: "112 files · edited today", meta: "Hold" },
  { painting: "pond", square: true, title: "Old prototypes", sub: "7 files · edited last year", meta: "Hold" },
];
const FX_FEED: FxRow[] = [
  { painting: "cypress", title: "Cypress alley at dawn", sub: "2.4k likes · Tuscany", meta: "1h" },
  { painting: "pond", title: "Water lilies, study", sub: "980 likes · Giverny", meta: "3h" },
  { painting: "aqueduct", title: "Old aqueduct", sub: "1.1k likes · Segovia", meta: "5h" },
];
const FX_TAGS = ["Design", "Motion", "iOS", "Android", "Web", "Skia", "Expo", "Rust"];
const FX_GATHER_LINES = ["Here are the refs for the hero.", "Can you look at it tonight?", "Love the second one!", "Shipping Friday."];
const FX_CHAT_LINES = ["Did the build pass?", "Yes, all green. Shipping now.", "Perfect, thanks!", "Drinks at 7 to celebrate?"];
const FX_PRODUCTS: [string, string, string][] = [
  ["villa", "Linen shirt", "79 €"], ["temple", "Clay vase", "45 €"],
  ["tuscany", "Olive oil", "24 €"], ["pines", "Pine candle", "32 €"],
];
const FX_DECK: [string, string, string][] = [
  ["temple", "Lina, 27", "Architect · 2 km"], ["lake", "Hugo, 31", "Chef · 5 km"], ["cypress", "Sam, 29", "Photographer · 1 km"],
];

export type TileArt =
  | { k: "photo"; name: string; trash?: boolean }
  | { k: "note" } | { k: "coin" } | { k: "lock" } | { k: "icecream" }
  | { k: "invader"; color: string }
  | { k: "frame"; name: string }
  | { k: "tab"; name: string; title: string }
  | { k: "product"; name: string; title: string; price: string }
  | { k: "candle"; col: string }
  | { k: "receipt" } | { k: "pass" }
  | { k: "filerow"; row: FxRow }
  | { k: "bubble"; text: string; me?: boolean }
  | { k: "row"; row: FxRow }
  | { k: "deck"; name: string; title: string; sub: string }
  | { k: "sticker"; name: string; shape: "circle" | "pill" | "round" };

/**
 * What each of the two example tiles under the stage holds. `kind` picks the
 * scene component; the rest is its data. Titles/hints live in TILE_META.
 */
export type TileSpec =
  | { kind: "list"; rows: FxRow[]; preset: string; opts?: Record<string, unknown>; empty: string; touch?: boolean; to?: "bin" }
  | { kind: "one"; art: TileArt; preset: string; opts?: Record<string, unknown>; back: number; touch?: boolean }
  | { kind: "grid"; art: TileArt[]; preset: string; opts?: Record<string, unknown>; cols: number; cellH: number; loadMore?: boolean }
  | { kind: "frames"; items: TileArt[]; preset: string }
  | { kind: "arcade"; colors: string[]; preset: string }
  | { kind: "candles"; cols: string[]; preset: string }
  | { kind: "clear"; rows: FxRow[]; preset: string; label: string; empty: string }
  | { kind: "appear"; rows?: FxRow[]; lines?: string[]; art: "bubble" | "row"; square?: boolean; preset: string; label: string; chat?: boolean; max?: number; batch?: number; stagger?: number; itemH?: number; opts?: Record<string, unknown> }
  | { kind: "tags"; items: string[]; preset: string; opts?: Record<string, unknown> }
  | { kind: "swipe"; preset: string }
  | { kind: "deck"; items: TileArt[]; preset: string }
  | { kind: "hold"; preset: string; label?: string; rows?: FxRow[]; empty?: string; holdMs: number }
  | { kind: "morph"; variant: "profile" | "product"; preset: string; a: [string, string]; b: [string, string]; pillA: [string, string]; pillB: [string, string] }
  | { kind: "peel"; variant: "sticker" | "lid"; preset: string; sticker?: TileArt; lid?: TileArt[] }
  | { kind: "doc"; art: TileArt; preset: string; label: string; w: number; h: number; opts?: Record<string, unknown> }
  | { kind: "stream"; row: FxRow; label: string; preset: string };

export const TILE_SPECS: Record<string, [TileSpec, TileSpec]> = {
  dust: [
    { kind: "list", rows: FX_NOTIFS, preset: "dust", empty: "No new notifications" },
    { kind: "list", rows: FX_MAIL.slice(0, 3), preset: "dust", opts: { grain: 2.5 }, empty: "Inbox zero" },
  ],
  sand: [
    { kind: "one", art: { k: "photo", name: "villa", trash: true }, preset: "sand", back: 900 },
    {
      kind: "grid", cols: 4, cellH: 100, preset: "sand", opts: { grain: 2.5, duration: 1300 },
      art: ["temple", "lake", "pines", "arch", "valley", "pond", "cypress", "tuscany"].map((n) => ({ k: "photo", name: n }) as TileArt),
    },
  ],
  ember: [
    { kind: "one", art: { k: "note" }, preset: "ember", back: 900 },
    { kind: "list", rows: FX_DRAFTS, preset: "ember", empty: "No drafts" },
  ],
  pixel: [
    { kind: "one", art: { k: "coin" }, preset: "pixel", back: 600 },
    { kind: "arcade", colors: ["#7CE38B", "#F472B6", "#60A5FA", "#FBBF24"], preset: "pixel" },
  ],
  vortex: [
    { kind: "clear", rows: FX_NOTIFS, preset: "vortex", label: "Clear all", empty: "No notifications" },
    {
      kind: "grid", cols: 3, cellH: 96, preset: "vortex", opts: { duration: 1200 },
      art: FX_TABS.map(([n, t]) => ({ k: "tab", name: n, title: t }) as TileArt),
    },
  ],
  shatter: [
    { kind: "one", art: { k: "lock" }, preset: "shatter", opts: { n: [160] }, back: 800, touch: true },
    {
      kind: "frames", preset: "shatter",
      items: ["villa", "cypress", "tuscany"].map((n) => ({ k: "frame", name: n }) as TileArt),
    },
  ],
  stream: [
    { kind: "stream", row: FX_FILES[0], label: "Taxes", preset: "stream" },
    { kind: "list", to: "bin", rows: FX_FILES, preset: "stream", opts: { duration: 1400 }, empty: "Downloads is empty" },
  ],
  gather: [
    { kind: "appear", art: "bubble", lines: FX_GATHER_LINES, preset: "gather", label: "Receive", max: 3, itemH: 44 },
    { kind: "appear", art: "bubble", lines: FX_CHAT_LINES, preset: "gather", label: "Send", chat: true, opts: { duration: 1000 } },
  ],
  rain: [
    { kind: "appear", art: "row", square: true, rows: FX_FEED, preset: "rain", label: "Refresh", max: 3, batch: 3, stagger: 90, itemH: 46, opts: { duration: 1100 } },
    {
      kind: "grid", cols: 4, cellH: 120, preset: "rain", opts: { duration: 1100 }, loadMore: true,
      art: FX_PRODUCTS.map(([n, t, price]) => ({ k: "product", name: n, title: t, price }) as TileArt),
    },
  ],
  print: [
    { kind: "doc", art: { k: "receipt" }, preset: "print", label: "Pay 15.50 €", w: 160, h: 196, opts: { duration: 1600 } },
    { kind: "doc", art: { k: "pass" }, preset: "print", label: "Check in", w: 420, h: 168, opts: { duration: 1500 } },
  ],
  snap: [
    { kind: "tags", items: FX_TAGS, preset: "snap" },
    { kind: "list", rows: FX_TOASTS, preset: "snap", opts: { n: [1.2] }, empty: "Nothing left", touch: true },
  ],
  fling: [
    { kind: "swipe", preset: "fling" },
    {
      kind: "deck", preset: "fling",
      items: FX_DECK.map(([n, title, sub]) => ({ k: "deck", name: n, title, sub }) as TileArt),
    },
  ],
  charge: [
    { kind: "hold", preset: "charge", label: "Hold to delete account", holdMs: 1200 },
    { kind: "hold", preset: "charge", rows: FX_PROJECTS, empty: "No projects", holdMs: 1000 },
  ],
  morph: [
    {
      kind: "morph", variant: "profile", preset: "morph",
      a: ["Lina Haddad", "Architect, Lisbon"], b: ["temple", ""],
      pillA: ["Follow", "ink"], pillB: ["Following", "ghost"],
    },
    {
      kind: "morph", variant: "product", preset: "morph",
      a: ["Linen shirt, sand", "Relaxed fit · 79 €"], b: ["villa", "84"],
      pillA: ["Add to cart", "me"], pillB: ["✓ In cart", "green"],
    },
  ],
  peel: [
    { kind: "peel", variant: "sticker", preset: "peel", sticker: { k: "sticker", name: "tuscany", shape: "circle" } },
    {
      kind: "peel", variant: "lid", preset: "peel",
      lid: [
        { k: "sticker", name: "arch", shape: "round" }, { k: "sticker", name: "lake", shape: "pill" }, { k: "sticker", name: "pines", shape: "circle" },
      ],
    },
  ],
  melt: [
    { kind: "one", art: { k: "icecream" }, preset: "melt", opts: { duration: 2000 }, back: 900 },
    { kind: "candles", cols: ["#F5E6D3", "#FBCFE8", "#BFDBFE"], preset: "melt" },
  ],
  puff: [
    { kind: "list", rows: FX_NOTIFS, preset: "puff", empty: "No reminders left" },
    { kind: "list", rows: FX_MAIL.slice(0, 3), preset: "puff", opts: { grain: 3 }, empty: "Inbox zero" },
  ],
  shred: [
    { kind: "one", art: { k: "note" }, preset: "shred", back: 900 },
    { kind: "list", rows: FX_FILES, preset: "shred", opts: { duration: 1300 }, empty: "Nothing left to shred" },
  ],
  crush: [
    { kind: "one", art: { k: "photo", name: "villa", trash: true }, preset: "crush", back: 900 },
    { kind: "list", rows: FX_TOASTS, preset: "crush", empty: "Nothing to crush" },
  ],
  sparkle: [
    { kind: "tags", items: FX_TAGS, preset: "sparkle" },
    { kind: "appear", art: "row", square: true, rows: FX_FEED, preset: "sparkle", label: "Reveal more", max: 3, batch: 3, stagger: 90, itemH: 46 },
  ],
  sink: [
    { kind: "appear", art: "bubble", lines: FX_GATHER_LINES, preset: "sink", label: "Receive", max: 3, itemH: 44 },
    {
      kind: "grid", cols: 4, cellH: 120, preset: "sink", loadMore: true,
      art: FX_PRODUCTS.map(([n, t, price]) => ({ k: "product", name: n, title: t, price }) as TileArt),
    },
  ],
  zap: [
    { kind: "tags", items: FX_TAGS, preset: "zap" },
    { kind: "list", rows: FX_TOASTS, preset: "zap", opts: { duration: 1100 }, empty: "Nothing left to zap" },
  ],
  ripple: [
    { kind: "one", art: { k: "photo", name: "pond" }, preset: "ripple", back: 900, touch: true },
    { kind: "tags", items: FX_TAGS, preset: "ripple", opts: { duration: 1400 } },
  ],
};

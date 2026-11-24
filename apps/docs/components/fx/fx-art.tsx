"use client";

import type { CSSProperties } from "react";

/**
 * DOM stand-ins for the canvas art the upstream tiles draw. Same content,
 * same colors, same rounded geometry — built from the /paintings assets.
 */

const img = (name: string, style: CSSProperties = {}) => (
  // eslint-disable-next-line @next/next/no-img-element
  <img src={`/paintings/${name}.jpg`} alt="" draggable={false}
    style={{ objectFit: "cover", display: "block", width: "100%", height: "100%", ...style }} />
);

export function PhotoArt({ name, trash }: { name: string; trash?: boolean }) {
  return (
    <div style={{ position: "relative", width: "100%", height: "100%", borderRadius: 14, overflow: "hidden" }}>
      {img(name)}
      {trash
        ? (
            <span style={{ position: "absolute", right: 10, bottom: 10, width: 30, height: 30, borderRadius: 15, background: "rgba(0,0,0,0.45)", display: "grid", placeItems: "center", color: "#fff" }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
                <path d="M4 6h16M9 6V4h6v2M6 6l1 14h10l1-14M10 10v6M14 10v6" />
              </svg>
            </span>
          )
        : null}
    </div>
  );
}

export function NoteArt() {
  return (
    <div style={{ position: "relative", width: "100%", height: "100%", borderRadius: 16, background: "#2A1C14", overflow: "hidden", padding: "14px 16px" }}>
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(135deg, rgba(255,140,60,0.35), rgba(255,60,40,0.05))" }} />
      <div style={{ fontFamily: "var(--dmono)", fontSize: 10.5, fontWeight: 600, color: "#FFB27A", letterSpacing: "0.08em" }}>SECRET</div>
      <div style={{ fontSize: 15, color: "#F7E6D8", marginTop: 20 }}>The door code is</div>
      <div style={{ fontFamily: "var(--dmono)", fontSize: 24, fontWeight: 600, color: "#FFF" }}>4 0 2 7 #</div>
      <div style={{ position: "absolute", left: 16, bottom: 12, fontSize: 11.5, color: "rgba(247,230,216,0.6)" }}>Self destructs when read</div>
    </div>
  );
}

const COIN = ["0011100", "0122210", "1223221", "1223221", "1223221", "0122210", "0011100"];
const COIN_COL = ["", "#B7791F", "#F6C343", "#FFF3C4"];

export function CoinArt() {
  return (
    <svg width="119" height="119" viewBox="0 0 70 70" style={{ imageRendering: "pixelated" }} aria-hidden="true">
      {COIN.flatMap((r, y) => [...r].map((v, x) => v === "0" ? null : <rect key={`${x}-${y}`} x={x * 10} y={y * 10} width="10" height="10" fill={COIN_COL[+v]} />))}
    </svg>
  );
}

const INVADER = ["00100100", "00011000", "00111100", "01101110", "11111111", "10111101", "10100101", "00011000"];

export function InvaderArt({ color }: { color: string }) {
  return (
    <div style={{ width: "100%", height: "100%", borderRadius: 12, background: "#101114", display: "grid", placeItems: "center" }}>
      <svg width="80" height="80" viewBox="0 0 8 8" aria-hidden="true">
        {INVADER.flatMap((r, y) => [...r].map((b, x) => b === "1" ? <rect key={`${x}-${y}`} x={x} y={y} width="1" height="1" fill={color} /> : null))}
      </svg>
    </div>
  );
}

export function LockArt() {
  return (
    <div style={{ position: "relative", width: "100%", height: "100%", borderRadius: 18, overflow: "hidden" }}>
      {img("aqueduct")}
      <div style={{ position: "absolute", inset: 0, background: "rgba(10,12,16,0.55)" }} />
      <div style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center", gap: 0 }}>
        <div style={{ textAlign: "center", color: "#fff" }}>
          <div style={{ fontSize: 14, fontWeight: 600 }}>Enter passcode</div>
          <div style={{ display: "flex", gap: 10, justifyContent: "center", margin: "12px 0" }}>
            {[0, 1, 2, 3].map((i) => <span key={i} style={{ width: 12, height: 12, borderRadius: 6, background: "#fff" }} />)}
          </div>
          <div style={{ fontSize: 12, color: "#FCA5A5" }}>Wrong passcode, try again</div>
        </div>
      </div>
    </div>
  );
}

export function FrameArt({ name }: { name: string }) {
  return (
    <div style={{ width: "100%", height: "100%", borderRadius: 6, background: "#C9B79C", padding: 8 }}>
      <div style={{ background: "#F5F0E6", padding: 8, height: "100%", position: "relative", overflow: "hidden" }}>
        {img(name)}
        <div style={{ position: "absolute", inset: 8, background: "linear-gradient(135deg, rgba(255,255,255,0.25), rgba(255,255,255,0) 40%)" }} />
      </div>
    </div>
  );
}

export function TabArt({ name, title }: { name: string; title: string }) {
  return (
    <div style={{ width: "100%", height: "100%", borderRadius: 12, background: "#1E1E1E", overflow: "hidden", display: "flex", flexDirection: "column" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "5px 8px 5px 10px", fontSize: 11, fontWeight: 500, color: "#cdcdcd" }}>
        <span style={{ overflow: "hidden", whiteSpace: "nowrap", textOverflow: "ellipsis" }}>{title}</span>
        <span style={{ color: "#979797", fontSize: 14, lineHeight: 1 }}>×</span>
      </div>
      <div style={{ flex: 1, minHeight: 0 }}>{img(name)}</div>
    </div>
  );
}

export function ProductCellArt({ name, title, price }: { name: string; title: string; price: string }) {
  return (
    <div style={{ width: "100%", height: "100%", borderRadius: 12, background: "#1E1E1E", overflow: "hidden", display: "flex", flexDirection: "column" }}>
      <div style={{ flex: 1, minHeight: 0 }}>{img(name)}</div>
      <div style={{ padding: "6px 8px" }}>
        <div style={{ fontSize: 12, fontWeight: 600, color: "#fbfbfb" }}>{title}</div>
        <div style={{ fontSize: 11.5, color: "#979797" }}>{price}</div>
      </div>
    </div>
  );
}

export function BubbleArt({ text, me }: { text: string; me?: boolean }) {
  return (
    <div style={{
      display: "inline-block",
      maxWidth: 260,
      padding: "10px 14px",
      borderRadius: me ? "18px 18px 18px 4px" : "18px 18px 4px 18px",
      background: me ? "#3A6FE6" : "#2A2E34",
      color: me ? "#fff" : "#e6e7ea",
      fontSize: 13,
      lineHeight: 1.35,
    }}
    >
      {text}
    </div>
  );
}

export function CandleArt({ col }: { col: string }) {
  return (
    <div style={{ position: "relative", width: "100%", height: "100%" }}>
      <div style={{ position: "absolute", left: "50%", top: "8%", transform: "translateX(-50%)", width: 14, height: 26, borderRadius: "50% 50% 45% 45%", background: "radial-gradient(circle at 50% 70%, #FFF0B4, #FFAA3C 55%, rgba(255,120,40,0))" }} />
      <div style={{ position: "absolute", left: "50%", top: "26%", transform: "translateX(-50%)", width: 2, height: "7%", background: "#3F3F46" }} />
      <div style={{ position: "absolute", left: "22%", right: "22%", top: "32%", bottom: 0, borderRadius: "10px 10px 4px 4px", background: col }}>
        <div style={{ position: "absolute", left: 6, top: 8, width: 5, height: "60%", background: "rgba(255,255,255,0.25)" }} />
      </div>
    </div>
  );
}

export function IceCreamArt() {
  return (
    <svg width="110" height="150" viewBox="0 0 110 150" aria-hidden="true">
      <polygon points="25,72 85,72 55,146" fill="#D9A066" />
      <circle cx="40" cy="66" r="22" fill="#F9A8D4" />
      <circle cx="70" cy="66" r="22" fill="#A7F3D0" />
      <circle cx="55" cy="45" r="24" fill="#FDE68A" />
      <circle cx="59" cy="22" r="6" fill="#DC2626" />
    </svg>
  );
}

export function ReceiptArt() {
  const rows: [string, string][] = [["Flat white", "4.20"], ["Croissant", "2.80"], ["Granola", "8.50"]];
  return (
    <div style={{ width: "100%", height: "100%", background: "#FBFAF7", color: "#1B1E24", fontFamily: "var(--dmono)", fontSize: 10.5, padding: "14px 12px 18px", clipPath: "polygon(0 0,100% 0,100% calc(100% - 6px),95% 100%,90% calc(100% - 6px),85% 100%,80% calc(100% - 6px),75% 100%,70% calc(100% - 6px),65% 100%,60% calc(100% - 6px),55% 100%,50% calc(100% - 6px),45% 100%,40% calc(100% - 6px),35% 100%,30% calc(100% - 6px),25% 100%,20% calc(100% - 6px),15% 100%,10% calc(100% - 6px),5% 100%,0 calc(100% - 6px))" }}>
      <div style={{ textAlign: "center", fontWeight: 600, letterSpacing: "0.08em" }}>CAFÉ LUMEN</div>
      <div style={{ textAlign: "center", color: "#6B7280", fontSize: 9.5, marginTop: 3 }}>12 rue des Arts, Paris</div>
      <div style={{ marginTop: 14, display: "grid", gap: 5 }}>
        {rows.map(([a, b]) => <div key={a} style={{ display: "flex", justifyContent: "space-between" }}><span>{a}</span><span>{b}</span></div>)}
      </div>
      <div style={{ border: 0, borderTop: "1px dashed #D1D5DB", margin: "10px 0" }} />
      <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 600, fontSize: 11 }}><span>TOTAL</span><span>15.50 €</span></div>
      <div style={{ textAlign: "center", color: "#6B7280", marginTop: 12, fontSize: 10 }}>Thank you!</div>
    </div>
  );
}

export function PassArt() {
  return (
    <div style={{ width: "100%", height: "100%", borderRadius: 16, background: "#1E1E1E", overflow: "hidden", display: "flex", flexDirection: "column" }}>
      <div style={{ background: "#3A6FE6", color: "#fff", display: "flex", justifyContent: "space-between", padding: "8px 14px", fontFamily: "var(--dmono)", fontSize: 11 }}>
        <span style={{ fontWeight: 600 }}>BOARDING PASS</span>
        <span style={{ opacity: 0.85 }}>AF 1234 · 14 NOV</span>
      </div>
      <div style={{ display: "flex", alignItems: "baseline", gap: 18, padding: "14px 16px 4px", color: "#fbfbfb" }}>
        <div><div style={{ fontSize: 28, fontWeight: 600 }}>CDG</div><div style={{ fontSize: 11.5, color: "#979797" }}>Paris</div></div>
        <div style={{ color: "#979797" }}>→</div>
        <div><div style={{ fontSize: 28, fontWeight: 600 }}>FCO</div><div style={{ fontSize: 11.5, color: "#979797" }}>Rome</div></div>
      </div>
      <div style={{ display: "flex", gap: 22, padding: "8px 16px", alignItems: "flex-end" }}>
        <div style={{ flex: 1 }}>
          {[["GATE", "K42"], ["SEAT", "14A"], ["BOARDS", "09:15"]].map(([k, v]) => (
            <div key={k} style={{ display: "inline-block", marginRight: 16 }}>
              <div style={{ fontSize: 10, color: "#979797", fontFamily: "var(--dmono)" }}>{k}</div>
              <div style={{ fontSize: 15, fontWeight: 600, color: "#fbfbfb" }}>{v}</div>
            </div>
          ))}
        </div>
        <div style={{ display: "flex", gap: 2, alignItems: "flex-end", height: 34 }}>
          {Array.from({ length: 20 }, (_, i) => <span key={i} style={{ width: 2, height: 14 + ((i * 7) % 3) * 7, background: "#fbfbfb" }} />)}
        </div>
      </div>
    </div>
  );
}

export function StickerArt({ name, shape }: { name: string; shape: "circle" | "pill" | "round" }) {
  const r = shape === "circle" ? "50%" : shape === "pill" ? 999 : 14;
  return (
    <div style={{ width: "100%", height: "100%", borderRadius: r, background: "#fff", padding: 6 }}>
      <div style={{ width: "100%", height: "100%", borderRadius: shape === "circle" ? "50%" : shape === "pill" ? 999 : 9, overflow: "hidden" }}>
        {img(name)}
      </div>
    </div>
  );
}

export function PillArt({ label, fill, color }: { label: string; fill: string; color: string }) {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", height: 34, padding: "0 16px", borderRadius: 999, background: fill, color, fontSize: 13, fontWeight: 600, whiteSpace: "nowrap" }}>
      {label}
    </span>
  );
}

export function FolderTargetArt({ label }: { label: string }) {
  return (
    <>
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round">
        <path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      </svg>
      <span>{label}</span>
    </>
  );
}

export function DeckCardArt({ name, title, sub }: { name: string; title: string; sub: string }) {
  return (
    <div style={{ position: "relative", width: "100%", height: "100%", borderRadius: 16, overflow: "hidden", boxShadow: "var(--shadow)" }}>
      {img(name)}
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, rgba(0,0,0,0) 50%, rgba(0,0,0,0.7))" }} />
      <div style={{ position: "absolute", left: 12, bottom: 10, color: "#fff" }}>
        <div style={{ fontSize: 15, fontWeight: 600 }}>{title}</div>
        <div style={{ fontSize: 11.5, color: "rgba(255,255,255,0.8)" }}>{sub}</div>
      </div>
    </div>
  );
}

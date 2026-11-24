"use client";

import { useRef, useState, type CSSProperties, type ReactNode } from "react";
import { Highlighted } from "@/components/highlight";
import { copyText } from "@/components/clipboard";
import { glyphCells, type FxCard, type FxRow } from "@/lib/fx-data";

/* ---------- icons (exact upstream markup) ---------- */

export function CopyIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4">
      <rect x="5" y="5" width="8.5" height="8.5" rx="2" />
      <path d="M11 5V3.5A1.5 1.5 0 0 0 9.5 2h-6A1.5 1.5 0 0 0 2 3.5v6A1.5 1.5 0 0 0 3.5 11H5" />
    </svg>
  );
}

export function ResetIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2.5 8a5.5 5.5 0 1 0 1.7-4M2.5 2.5v3h3" />
    </svg>
  );
}

export function ArrowIcon({ dir }: { dir: "l" | "r" }) {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      {dir === "l" ? <path d="M13 8H3M7 4 3 8l4 4" /> : <path d="M3 8h10M9 4l4 4-4 4" />}
    </svg>
  );
}

export function SliderIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
      <path d="M2 4.5h7M13 4.5h1M2 11.5h3M9 11.5h5" />
      <circle cx="11" cy="4.5" r="1.7" fill="currentColor" stroke="none" />
      <circle cx="7" cy="11.5" r="1.7" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function BinIcon({ count }: { count?: number }) {
  return (
    <>
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M19.5 5.5l-.62 10.03c-.16 2.56-.24 3.84-.88 4.76a4 4 0 0 1-1.2 1.13C15.84 22 14.56 22 12 22c-2.57 0-3.86 0-4.82-.59a4 4 0 0 1-1.2-1.13c-.64-.92-.72-2.2-.87-4.77L4.5 5.5" />
        <path d="M3 5.5h18M16.06 5.5l-.69-1.41c-.45-.94-.68-1.4-1.07-1.7a2 2 0 0 0-.27-.17C13.59 2 13.07 2 12.03 2c-1.06 0-1.6 0-2.04.23a2 2 0 0 0-.28.18c-.4.3-.62.79-1.06 1.76L8.05 5.5M9.5 16.5v-6M14.5 16.5v-6" />
      </svg>
      <span className="bin-count" hidden={!count}>{count ?? 0}</span>
    </>
  );
}

const BpIcon = ({ d }: { d: string }) => (
  <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d={d} />
  </svg>
);
export const DoIcon = () => <BpIcon d="m3.5 8.5 3 3 6-7" />;
export const DontIcon = () => <BpIcon d="m4.5 4.5 7 7M11.5 4.5l-7 7" />;

/* ---------- copy behaviour ([data-copy] in upstream app.js) ---------- */

export function useCopy() {
  const [done, setDone] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const copy = (root: HTMLElement | null) => {
    const code = root?.closest(".code, .cmd")?.querySelector("code")?.innerText ?? "";
    if (!code) return;
    setDone(true);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setDone(false), 900);
    void copyText(code);
  };
  return { done, copy };
}

/* ---------- code pane: dissolve .code + working copy + highlighting ---------- */

export function FxCode({ code, title, lang = "tsx" }: { code: string; title?: string; lang?: string }) {
  const { done, copy } = useCopy();
  return (
    <div className="code">
      {title
        ? (
            <div className="code-head">
              <span>{title}</span>
              <span className="code-lang">{lang}</span>
            </div>
          )
        : null}
      <button type="button" className={`icon-btn code-copy${done ? " done" : ""}`} aria-label="Copy code" onClick={(e) => copy(e.currentTarget)}>
        <CopyIcon />
      </button>
      <div className="code-body">
        <Highlighted code={code} lang={lang} />
      </div>
    </div>
  );
}

export function FxCmd({ command }: { command: string }) {
  const { done, copy } = useCopy();
  return (
    <div className="cmd">
      <span className="cmd-dollar">$</span>
      <code>{command}</code>
      <button type="button" className={`icon-btn${done ? " done" : ""}`} aria-label="Copy command" onClick={(e) => copy(e.currentTarget)}>
        <CopyIcon />
      </button>
    </div>
  );
}

/* ---------- the notification card (canvas drawCard as DOM) ---------- */

export function NCard({ card, sm, className = "", style, ...rest }: {
  card: FxCard; sm?: boolean; className?: string; style?: CSSProperties;
} & React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={`ncard demo-card${sm ? " sm" : ""}${className ? ` ${className}` : ""}`} style={style} {...rest}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img className="nc-thumb" src={`/paintings/${card.painting}.jpg`} alt="" draggable={false} />
      <div className="nc-body">
        <div className="nc-meta"><span>{card.app}</span><span>now</span></div>
        <span className="nc-title">{card.title}</span>
        <span className="nc-text">{card.body}</span>
      </div>
    </div>
  );
}

/** A tile list row: the same art, with letter avatars like upstream drawRow. */
export function RowCard({ row, onClick }: { row: FxRow; onClick?: (e: React.MouseEvent) => void }) {
  return (
    <div className="ncard sm" onClick={onClick}>
      {row.painting
        ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img className="nc-thumb" style={{ borderRadius: row.square ? 10 : 12 }} src={`/paintings/${row.painting}.jpg`} alt="" draggable={false} />
          )
        : (
            <span className="nc-thumb" style={{ background: row.color, color: "#fff", borderRadius: 12, display: "grid", placeItems: "center", fontWeight: 600, fontSize: 18 }}>
              {row.letter}
            </span>
          )}
      <div className="nc-body">
        <div className="nc-meta"><span>{row.title}</span><span>{row.meta}</span></div>
        {row.sub ? <span className="nc-text">{row.sub}</span> : null}
      </div>
    </div>
  );
}

/* ---------- page head glyph ---------- */

export function HeadGlyph({ id, size = 26 }: { id: string; size?: number }) {
  return (
    <span className="glyph-lg">
      <svg width={size} height={size} viewBox="0 0 18 18" aria-hidden="true">
        {glyphCells(id).map((p, i) => (p.kind === "rect"
          ? (
              <rect key={i} x={p.x} y={p.y} width="2.2" height="2.2" rx=".4" fill={p.warm ? "var(--accent)" : "currentColor"} opacity={p.o}
                transform={p.rot ? `rotate(${p.rot} ${(p.x + 1.1).toFixed(2)} ${(p.y + 1.1).toFixed(2)})` : undefined} />
            )
          : (
              <circle key={i} cx={p.cx} cy={p.cy} r="1.05" fill={p.warm ? "var(--accent)" : "currentColor"} opacity={p.o} />
            )))}
      </svg>
    </span>
  );
}

/* ---------- panel controls ---------- */

export function Chip({ on, disabled, children, onClick }: {
  on?: boolean; disabled?: boolean; children: ReactNode; onClick?: () => void;
}) {
  return (
    <button type="button" className={`chip${on ? " on" : ""}`} aria-pressed={on} disabled={disabled} onClick={onClick}>
      {children}
    </button>
  );
}

export function Group({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="ctl" role="group" aria-label={label}>
      <p className="ctl-label">{label}</p>
      <div className="chips">{children}</div>
    </div>
  );
}

export function RangeCtl({ label, value, min, max, step, text, onChange }: {
  label: string; value: number; min: number; max: number; step: number;
  text: string; onChange: (n: number) => void;
}) {
  const p = ((value - min) / (max - min)) * 100;
  return (
    <div className="ctl">
      <label className="slider" style={{ "--p": `${p}%` } as CSSProperties}>
        <span>{label}</span>
        <output className="slider-val">{text}</output>
        <input
          type="range" min={min} max={max} step={step} value={value}
          aria-label={label} aria-valuetext={text}
          onChange={(e) => onChange(Math.round(Number(e.target.value) * 100) / 100)}
        />
      </label>
    </div>
  );
}

export function SwitchCtl({ label, on, onChange }: { label: string; on: boolean; onChange: () => void }) {
  return (
    <div className="ctl ctl-row">
      <span>{label}</span>
      <button type="button" className={`switch${on ? " on" : ""}`} role="switch" aria-checked={on} aria-label={label} onClick={onChange} />
    </div>
  );
}

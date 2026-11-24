"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useDissolve, type SwashPreset } from "react-flint";
import {
  FX_COPY, STAGE_HINTS, defaultsFor, fxFullSnippet, fxPrompt, fxSnippet,
} from "@/lib/fx-data";
import type { EffectExample } from "@/lib/effect-examples";
import { copyText } from "@/components/clipboard";
import {
  ArrowIcon, CopyIcon, DoIcon, DontIcon, FxCode, FxCmd, HeadGlyph, NCard,
} from "./fx-kit";
import { FxTiles } from "./fx-tiles";
import { FxPlayground } from "./fx-playground";

/* ---------- the two buttons the upstream toolbar opens ---------- */

function CopyPromptBtn({ effect }: { effect: EffectExample }) {
  const [done, setDone] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => () => { if (timer.current) clearTimeout(timer.current); }, []);
  return (
    <button
      type="button"
      className={`btn${done ? " done" : ""}`}
      onClick={() => {
        setDone(true);
        if (timer.current) clearTimeout(timer.current);
        timer.current = setTimeout(() => setDone(false), 900);
        void copyText(
          fxPrompt(effect.slug, effect.name, effect.tagline, fxFullSnippet(effect.slug, defaultsFor(effect.slug))),
        );
      }}
    >
      <CopyIcon />
      {done ? "Copied" : "Copy prompt"}
    </button>
  );
}

/* ---------- the mini stage under the toolbar ---------- */

function VariantStage({ id }: { id: string }) {
  const gen = useDissolve<HTMLDivElement>();
  const s = defaultsFor(id);
  const [seen, setSeen] = useState(true);

  const play = (e?: React.MouseEvent<HTMLDivElement>) => {
    if (gen.dissolving) return;
    setSeen(false);
    // Effects whose origin is the impact point break where the pointer landed.
    const r = e?.currentTarget.getBoundingClientRect();
    const origin = s.origin === "touch" && r ? { x: e!.clientX - r.left, y: e!.clientY - r.top } : undefined;
    void gen.dissolve({ preset: id as SwashPreset, grain: s.grain, duration: s.duration, origin });
  };

  return (
    <section className="stage" id="main-stage">
      <div className="stage-slot">
        <div
          ref={gen.ref}
          role="button"
          tabIndex={0}
          aria-label={`Play ${id}`}
          onClick={(e) => play(e)}
          onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); play(); } }}
          style={{ opacity: gen.dissolving || !seen ? 0 : 1 }}
        >
          <NCard card={FX_COPY[id]} sm className="demo-card" style={{ pointerEvents: "none" }} />
        </div>
      </div>
      <p className="stage-hint">{!seen && !gen.dissolving ? "Gone — press Replay" : STAGE_HINTS[id]}</p>
      <button type="button" className="btn btn-sm stage-replay" onClick={() => setSeen(true)}>Replay</button>
    </section>
  );
}

/* ---------- nav arrow circle (upstream pageHead) ---------- */

function NavArrow({ href, title, dir, label }: { href?: string; title?: string; dir: "l" | "r"; label: string }) {
  const cls = "round";
  if (!href) {
    return (
      <span className={cls} aria-disabled="true" aria-label={label} role="link">
        <ArrowIcon dir={dir} />
      </span>
    );
  }
  return (
    <Link className={cls} href={href} title={title} aria-label={label}>
      <ArrowIcon dir={dir} />
    </Link>
  );
}

/* ---------- install panel (upstream installPanel, web edition) ---------- */

const PEERS: [string, string, string][] = [
  ["react", "19", "the only runtime dependency"],
  ["react-dom", "19", "rendering, already in your app"],
];

function InstallPanel({ title, id }: { title: string; id: string }) {
  return (
    <>
      <p className="dc-text">Install the package and its peers. {title} needs nothing more than that.</p>
      <FxCmd command="pnpm add react-flint" />
      <div className="dc-table-wrap">
        <table className="dc-table">
          <thead><tr><th>Peer</th><th>Tested</th><th>Used for</th></tr></thead>
          <tbody>
            {PEERS.map(([p, ver, u]) => (
              <tr key={p}><td><code>{p}</code></td><td>{ver}</td><td>{u}</td></tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="dc-note">
        No provider and no Babel plugin: <code>useDissolve</code> draws its grains in a fixed overlay
        it appends once, and the overlay ignores pointer events.
      </p>
      <h2 className="section-title">First burst</h2>
      <p className="dc-text">Grab a ref on anything, call dissolve, keep the promise as your source of truth.</p>
      <FxCode code={fxSnippet(id, defaultsFor(id))} title="App.tsx" />
    </>
  );
}

/* ---------- the whole variant page (upstream variantPage) ---------- */

export function EffectVariant({
  effect, prev, next,
}: {
  effect: EffectExample;
  prev: { slug: string; name: string } | null;
  next: { slug: string; name: string } | null;
}) {
  const [tab, setTab] = useState<"preview" | "install">("preview");
  const [plat, setPlat] = useState<"hook" | "full">("hook");
  const id = effect.slug;
  const nav = (slug?: string) => (slug ? `/docs/effects/${slug}` : undefined);

  return (
    <div className="fx-view">
      <header className="head">
        <div className="head-top">
          <div className="head-icon"><HeadGlyph id={id} size={26} /></div>
          <div className="head-nav">
            <NavArrow href={nav(prev?.slug)} title={prev?.name} dir="l" label="Previous variant" />
            <NavArrow href={nav(next?.slug)} title={next?.name} dir="r" label="Next variant" />
          </div>
        </div>
        <h1>{effect.name}</h1>
        <p className="sub">{effect.tagline}</p>
      </header>

      <div className="toolbar">
        <div className="seg" role="tablist">
          <button type="button" className={`seg-btn${tab === "preview" ? " on" : ""}`} aria-selected={tab === "preview"} role="tab" onClick={() => setTab("preview")}>Preview</button>
          <button type="button" className={`seg-btn${tab === "install" ? " on" : ""}`} aria-selected={tab === "install"} role="tab" onClick={() => setTab("install")}>Install</button>
        </div>
        <div className="toolbar-right">
          <div className="platforms" role="radiogroup" aria-label="API surface">
            <button type="button" className={`plat${plat === "hook" ? " on" : ""}`} role="radio" aria-checked={plat === "hook"} onClick={() => setPlat("hook")}>Hook</button>
            <button type="button" className={`plat${plat === "full" ? " on" : ""}`} role="radio" aria-checked={plat === "full"} onClick={() => setPlat("full")}>
              Component<span className="plat-tag">Full</span>
            </button>
          </div>
          <CopyPromptBtn effect={effect} />
        </div>
      </div>

      {tab === "preview"
        ? (
            <>
              <VariantStage id={id} />
              <FxTiles id={id} />
              <h2 className="section-title" id="playground">Playground</h2>
              <FxPlayground id={id} title={effect.name} plat={plat} />
              <h2 className="section-title">Options</h2>
              <div className="dc-table-wrap">
                <table className="dc-table opt-table">
                  <thead><tr><th>Option</th><th>Type</th><th>Default</th><th>Description</th></tr></thead>
                  <tbody>
                    {effect.options.map((o) => (
                      <tr key={o.name}>
                        <td><code>{o.name.replace(/`/g, "")}</code></td>
                        <td><code className="opt-type">{o.type.replace(/`/g, "")}</code></td>
                        <td><code>{o.def.replace(/`/g, "")}</code></td>
                        <td>{o.desc}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <h2 className="section-title">Best practices</h2>
              <ul className="bp">
                {effect.practices.map((p, i) => (
                  <li className={`bp-${p.kind}`} key={i}>
                    <span className="bp-icon" aria-label={p.kind === "do" ? "Do" : "Don't"}>{p.kind === "do" ? <DoIcon /> : <DontIcon />}</span>
                    <span>{p.text}</span>
                  </li>
                ))}
              </ul>
            </>
          )
        : <InstallPanel title={effect.name} id={id} />}
    </div>
  );
}

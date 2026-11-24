"use client";

/* One card per grain effect, grouped exactly like the upstream dissolve docs:
   Exits, Entrances, Gestures, Special, Casual. Each card runs the effect on a
   live sample view — click the card or press Play — and shows the same snippet
   the effect page prints, so the code can be copied straight out of the card. */

import { useState } from "react";
import { useDissolve, type SwashPreset } from "react-flint";
import { EFFECT_GROUPS, EFFECTS, type EffectExample } from "@/lib/effect-examples";
import { CopyButton } from "./copy-button";
import { Highlighted } from "./highlight";

function EffectExampleCard({ effect }: { effect: EffectExample }) {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const { ref, dissolving, dissolve } = useDissolve();

  const play = async () => {
    if (busy) return;
    setBusy(true);
    try {
      await dissolve({ ...effect.demo, preset: effect.slug as SwashPreset });
    } finally {
      setBusy(false);
    }
  };

  const running = busy || dissolving;

  return (
    <article className="example-card">
      <div className="example-body">
        <div className="pg-scene">
          <div
            ref={ref}
            className="pg-card"
            style={{ opacity: dissolving ? 0 : 1 }}
            onClick={() => void play()}
          >
            <strong>{effect.name}</strong>
            <span>{running ? "running…" : "click to dissolve"}</span>
          </div>
        </div>
      </div>
      <div className="example-bar">
        <div className="example-info">
          <h3>{effect.name}</h3>
          <p>{effect.tagline}</p>
        </div>
        <div className="example-actions">
          <button
            type="button"
            className="preview-replay"
            disabled={running}
            onClick={() => void play()}
          >
            {running ? "Running…" : "Play"}
          </button>
          <button
            type="button"
            className="preview-replay"
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
          >
            {open ? "Hide Code" : "Show Code"}
          </button>
          <span className="copy-inline">
            <CopyButton text={effect.code} />
          </span>
        </div>
      </div>
      {open ? (
        <div className="example-src">
          <Highlighted code={effect.code} lang="tsx" />
        </div>
      ) : null}
    </article>
  );
}

export function ExampleGallery() {
  return (
    <div className="example-sections">
      {EFFECT_GROUPS.map((group) => (
        <section key={group}>
          <h2 className="section-title">{group}</h2>
          <div className="example-grid">
            {EFFECTS.filter((e) => e.group === group).map((e) => (
              <EffectExampleCard key={e.slug} effect={e} />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}

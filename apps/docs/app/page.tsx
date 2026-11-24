import Link from "next/link";
import { HeroStage } from "@/components/hero-stage";
import { InstallTabs } from "@/components/install-tabs";
import { BentoGrid, BentoCard } from "@/components/bento";
import { PromptButton } from "@/components/prompt-button";
import { HeroCopy } from "@/components/hero-copy";
import { Catalog, type CatalogItem } from "@/components/catalog";
import { EFFECTS } from "@/lib/effect-examples";

const PRINCIPLES = [
  {
    title: "Zero dependencies",
    body: "The whole package runs on the platform: Web Animations API, ResizeObserver, Intl.Segmenter. Nothing to audit, nothing to update behind you.",
    span: 2 as const,
    icon: (
      <path
        d="M8 1.5 14 5v6L8 14.5 2 11V5l6-3.5Z"
        stroke="currentColor"
        fill="none"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
    ),
  },
  {
    title: "Reduced motion is a render mode",
    body: "Every effect declares a prefers-reduced-motion variant that shows the final state instantly. Toggle the OS setting mid-page and it responds, no reload.",
    span: 1 as const,
    icon: (
      <>
        <circle cx="8" cy="8" r="6" stroke="currentColor" fill="none" strokeWidth="1.4" />
        <path d="M5.5 8h5M8 5.5v5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      </>
    ),
  },
  {
    title: "One snapshot, any element",
    body: "useDissolve captures whatever node you hand it — a card, a row, a whole panel — and dissolves it into grains. No wrapper components, no special markup.",
    span: 1 as const,
    icon: (
      <>
        <rect x="2" y="3" width="12" height="10" rx="2" stroke="currentColor" fill="none" strokeWidth="1.4" />
        <path d="M5 7h6" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      </>
    ),
  },
  {
    title: "SSR without the flash",
    body: "The server writes real markup, not an empty shell. Hydration matches, so there is no correction flicker and no CLS on first paint.",
    span: 1 as const,
    icon: (
      <>
        <path d="M2 12 8 2l6 10" stroke="currentColor" fill="none" strokeWidth="1.4" strokeLinejoin="round" />
        <path d="M5 12h6" stroke="currentColor" strokeWidth="1.4" />
      </>
    ),
  },
  {
    title: "Tree-shakes to one hook",
    body: "The engine is a self-contained Canvas2D module behind useDissolve — and an app that imports one effect gets that effect and the engine, nothing else.",
    span: 1 as const,
    icon: (
      <>
        <path d="M8 2v12M8 6l4-3M8 6 4 3" stroke="currentColor" fill="none" strokeWidth="1.4" strokeLinecap="round" />
      </>
    ),
  },
  {
    title: "Promises you can await",
    body: "dissolve() resolves exactly when the last grain lands, even across backgrounded tabs — remove the element after the await and the timing always holds.",
    span: 3 as const,
    icon: (
      <>
        <path d="M3 8.5 6.5 12 13 4.5" stroke="currentColor" fill="none" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      </>
    ),
  },
];

// Every effect gets a cell; every fourth one is wide ("lg") so
// the 6-column bento packs without holes.
const EFFECT_CATALOG: CatalogItem[] = EFFECTS.map((e, i) => ({
  name: e.name,
  href: `/docs/effects/${e.slug}`,
  size: i % 4 === 0 ? "lg" : undefined,
}));

const FAQ = [
  {
    q: "Does Flint work with Next.js, Remix and Vite?",
    a: "Yes. It is plain React 18+ with a client boundary that ships compiled, so any React framework works. The docs site itself is a Next.js App Router project.",
  },
  {
    q: "Why no animation-library dependency?",
    a: "The effects run on a hand-written Canvas2D grain engine. No framer-motion, no gsap: you keep your bundle and your upgrade schedule.",
  },
  {
    q: "What happens with prefers-reduced-motion?",
    a: "Every effect reads it live and skips straight to the final state: no grain flights, no loops. An OS toggle mid-session takes effect without a reload.",
  },
  {
    q: "Is it SSR-safe?",
    a: "Yes — nothing touches the DOM at import, the server writes the real markup, and hydration matches, so there is no correction flicker and no CLS on first paint.",
  },
  {
    q: "How do I start an effect?",
    a: "Attach the ref from useDissolve to any element and call dissolve() — pick one of the twenty-three presets: dust, gather, shatter, ember, melt.",
  },
];

const TESTIMONIALS = [
  {
    quote:
      "We cut our animation bundle to zero and the UI motion got better. The reduced-motion handling alone paid for the switch.",
    name: "Priya Nair",
    role: "Staff FE, Lumen",
  },
  {
    quote:
      "Deleting a notification with real dust was the thing we could never get right in-house. One hook, twenty lines, it just works — SSR and all.",
    name: "Marco Bellini",
    role: "Design Eng, Globex",
  },
  {
    quote:
      "Dropped a gather entrance on a marketing hero, it assembled on scroll, no layout shift, no Lighthouse hit. Done in ten minutes.",
    name: "Sana Iqbal",
    role: "Frontend, Habitat",
  },
  {
    quote:
      "Tree-shakes to exactly what I import. Our first paint stopped paying for a library we barely used.",
    name: "Tomás Rivera",
    role: "Perf, Vertex",
  },
];

export default function Home() {
  return (
    <>
      <section className="hero wrap">
        <HeroCopy />
        <div className="hero-actions">
          <InstallTabs />
          <PromptButton href="/docs/quickstart">Read the docs</PromptButton>
        </div>

        <HeroStage />
        <div className="stage-cta">
          <PromptButton href="https://github.com/1xcoder-1/swash" external>
            Try it on your codebase
          </PromptButton>
        </div>
      </section>

      <section className="section wrap" id="why">
        <div className="pr-card">
          <div className="pr-head">
            <span className="pr-avatar">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                <path d="M8 8l8 8M16 8l-8 8" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
              </svg>
            </span>
            <strong>Flint</strong>
            <span className="pr-bot">v0.1.0</span>
            <span className="pr-when">zero dependencies</span>
          </div>
          <div className="pr-body">
            <div className="pr-file">npm i react-flint</div>
            <div className="pr-finding">
              <span className="pr-rule">23 grain effects</span>
              <span className="pr-sev">&bull; one engine</span>
            </div>
            <div className="pr-fix">
              Dust, ember, shatter, vortex, gather, rain, print, snap, fling,
              charge, morph, peel, melt, puff, shred, crush, ripple, sparkle, sink, zap &mdash;
              each tree-shaken to just what you import.
            </div>
          </div>
          <div className="pr-checks">
            <div className="pr-check">
              <span className="pr-x ok">&#10003;</span>
              <span>Safe on the server</span>
            </div>
            <div className="pr-line">Every effect ships a prefers-reduced-motion fallback.</div>
            <div className="pr-block">No provider, no config, no global CSS.</div>
          </div>
        </div>
        <div className="ci-copy">
          <h2>Drop into any React app</h2>
          <p>
            Install it, attach the ref, and you have motion that respects
            the platform &mdash; no provider, no config, no bundle bloat.
          </p>
          <Link href="/docs/quickstart" className="link-arrow">
            Read the quickstart &rarr;
          </Link>
        </div>
      </section>

      <section className="section wrap" id="principles">
        <div className="section-head">
          <p className="eyebrow">Engineering principles</p>
          <h2>Built on the platform, not a bundle</h2>
          <p>
            Six decisions that make these effects safe to put in production.
          </p>
        </div>
        <BentoGrid>
          {PRINCIPLES.map((p) => (
            <BentoCard key={p.title} span={p.span}>
              <div className="bento-icon">
                <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden>
                  {p.icon}
                </svg>
              </div>
              <h3 className="bento-title">{p.title}</h3>
              <p className="bento-desc">{p.body}</p>
            </BentoCard>
          ))}
        </BentoGrid>
      </section>

      <section className="section wrap" id="effects">
        <div className="section-head">
          <p className="eyebrow">The catalogue</p>
          <h2>Twenty-three effects, one grain engine</h2>
          <p>
            Pick a name, open its docs — every page has a live playground,
            options and copy-paste code. One Canvas2D engine underneath: zero
            dependencies, reduced motion built in.
          </p>
        </div>
        <Catalog items={EFFECT_CATALOG} />
      </section>

      <section className="section wrap" id="praise">
        <div className="section-head">
          <p className="eyebrow">In the wild</p>
          <h2>Teams that stopped hand-rolling particle canvas</h2>
        </div>
        <div className="tst-masonry">
          {TESTIMONIALS.map((t) => (
            <figure className="tst" key={t.name}>
              <blockquote>{t.quote}</blockquote>
              <figcaption>
                <span className="tst-name">{t.name}</span>
                <span className="tst-role">{t.role}</span>
              </figcaption>
            </figure>
          ))}
        </div>
      </section>

      <section className="section wrap faq" id="faq">
        <div className="section-head">
          <p className="eyebrow">FAQ</p>
          <h2>Questions worth asking</h2>
        </div>
        <div className="faq-list">
          {FAQ.map((item) => (
            <details key={item.q}>
              <summary>
                <span>{item.q}</span>
                <span className="faq-plus" aria-hidden />
              </summary>
              <div className="faq-body">
                <p className="answer">{item.a}</p>
              </div>
            </details>
          ))}
        </div>
      </section>

      <section className="cta wrap">
        <h2>Ship the effect, not the yak shave</h2>
        <p>One install, twenty-three effects, zero dependencies.</p>
        <div className="hero-actions">
          <PromptButton href="/docs/quickstart">
            Start with the quickstart
          </PromptButton>
          <a
            className="btn btn-ghost"
            href="https://github.com/1xcoder-1/swash"
            target="_blank"
            rel="noreferrer"
          >
            Star on GitHub
          </a>
        </div>
      </section>
    </>
  );
}

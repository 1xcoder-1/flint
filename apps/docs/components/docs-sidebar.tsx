"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import { EFFECTS } from "@/lib/effect-examples";

type Group = { title: string; links: { href: string; label: string }[]; count?: number };

const GROUPS: Group[] = [
  {
    title: "Getting started",
    links: [
      { href: "/docs/quickstart", label: "Quickstart" },
      { href: "/docs/accessibility", label: "Accessibility" },
    ],
  },
  {
    title: "Explore",
    links: [{ href: "/docs/examples", label: "Examples" }],
  },
  {
    title: "Effects",
    count: EFFECTS.length,
    links: [{ href: "/docs/effects", label: "All effects" }],
  },
  {
    title: "Exits",
    links: [
      { href: "/docs/effects/dust", label: "Dust" },
      { href: "/docs/effects/sand", label: "Sand" },
      { href: "/docs/effects/ember", label: "Ember" },
      { href: "/docs/effects/pixel", label: "Pixel" },
      { href: "/docs/effects/vortex", label: "Vortex" },
      { href: "/docs/effects/shatter", label: "Shatter" },
      { href: "/docs/effects/stream", label: "Stream" },
      { href: "/docs/effects/puff", label: "Puff" },
      { href: "/docs/effects/shred", label: "Shred" },
      { href: "/docs/effects/crush", label: "Crush" },
      { href: "/docs/effects/ripple", label: "Ripple" },
    ],
  },
  {
    title: "Entrances",
    links: [
      { href: "/docs/effects/gather", label: "Gather" },
      { href: "/docs/effects/rain", label: "Rain" },
      { href: "/docs/effects/print", label: "Print" },
      { href: "/docs/effects/sparkle", label: "Sparkle" },
      { href: "/docs/effects/sink", label: "Sink" },
    ],
  },
  {
    title: "Gestures",
    links: [
      { href: "/docs/effects/snap", label: "Snap" },
      { href: "/docs/effects/fling", label: "Fling" },
      { href: "/docs/effects/charge", label: "Charge" },
    ],
  },
  {
    title: "Special",
    links: [
      { href: "/docs/effects/morph", label: "Morph" },
      { href: "/docs/effects/zap", label: "Zap" },
    ],
  },
  {
    title: "Casual",
    links: [
      { href: "/docs/effects/peel", label: "Peel" },
      { href: "/docs/effects/melt", label: "Melt" },
    ],
  },
];

/** The docs rail: hairline groups, index numbers, one accent rail on the open page. */
export function DocsSidebar() {
  const pathname = usePathname();
  const rail = useRef<HTMLElement | null>(null);
  const active = useRef<HTMLAnchorElement | null>(null);

  // The rail scrolls inside its own fixed height without showing a bar, so the open page is
  // brought into view by hand instead of on the whole document.
  useEffect(() => {
    const el = active.current, box = rail.current;
    if (!el || !box) return;
    const r = el.getBoundingClientRect(), b = box.getBoundingClientRect();
    if (r.top < b.top + 12) box.scrollTop += r.top - b.top - 64;
    else if (r.bottom > b.bottom - 12) box.scrollTop += r.bottom - b.bottom + 64;
    // Narrow screens turn the rail into a sideways strip; same idea, other axis.
    if (r.left < b.left + 12) box.scrollLeft += r.left - b.left - 64;
    else if (r.right > b.right - 12) box.scrollLeft += r.right - b.right + 64;
  }, [pathname]);

  return (
    <aside className="sidebar" aria-label="Docs" ref={rail}>
      {GROUPS.map((g) => (
        <nav className="sidebar-group" key={g.title} aria-label={g.title}>
          <h4>
            {g.title}
            {g.count ? <span className="sb-count">{g.count}</span> : null}
          </h4>
          {g.links.map((l, i) => {
            const on = pathname === l.href;
            return (
              <Link
                key={l.href}
                href={l.href}
                ref={on ? active : undefined}
                className={`sb-link${on ? " on" : ""}`}
                aria-current={on ? "page" : undefined}
              >
                <span className="sb-idx" aria-hidden>{String(i + 1).padStart(2, "0")}</span>
                <span className="sb-label">{l.label}</span>
              </Link>
            );
          })}
        </nav>
      ))}
    </aside>
  );
}

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { EFFECTS } from "@/lib/effect-examples";

/** Reading order of the docs, used for the footer Prev / Next cards. */
const ORDER = [
  { href: "/docs/quickstart", title: "Quickstart" },
  { href: "/docs/accessibility", title: "Accessibility" },
  { href: "/docs/examples", title: "Examples" },
  ...EFFECTS.map((e) => ({ href: `/docs/effects/${e.slug}`, title: e.name })),
];

/**
 * Two cards at the foot of every docs page: where you came from and where
 * you go next. Renders nothing on pages outside the reading order.
 */
export function DocsPager() {
  const path = usePathname();
  const i = ORDER.findIndex((p) => path === p.href);
  if (i === -1) return null;
  const prev = i > 0 ? ORDER[i - 1] : null;
  const next = i < ORDER.length - 1 ? ORDER[i + 1] : null;
  if (!prev && !next) return null;

  return (
    <nav className="docs-pager" aria-label="Documentation pages">
      {prev ? (
        <Link className="pager-card" href={prev.href}>
          <span className="pager-dir">
            <svg width="13" height="13" viewBox="0 0 16 16" fill="none" aria-hidden>
              <path
                d="M10 3.5 5.5 8 10 12.5"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            Previous
          </span>
          <span className="pager-title">{prev.title}</span>
        </Link>
      ) : (
        <span aria-hidden />
      )}
      {next ? (
        <Link className="pager-card is-next" href={next.href}>
          <span className="pager-dir">
            Next
            <svg width="13" height="13" viewBox="0 0 16 16" fill="none" aria-hidden>
              <path
                d="M6 3.5 10.5 8 6 12.5"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>
          <span className="pager-title">{next.title}</span>
        </Link>
      ) : (
        <span aria-hidden />
      )}
    </nav>
  );
}

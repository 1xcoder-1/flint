import Link from "next/link";
import { LogoMark } from "@/components/logo-mark";

export function Footer() {
  return (
    <footer className="footer">
      <div className="footer-top">
        <span className="footer-logo" aria-hidden>
          <LogoMark />
        </span>
        <nav className="footer-col" aria-label="Documentation">
          <Link href="/docs/quickstart">Quickstart</Link>
          <Link href="/docs/accessibility">Accessibility</Link>
          <Link href="/docs/examples">Examples</Link>
        </nav>
        <nav className="footer-col" aria-label="Effects">
          <Link href="/docs/effects">All effects</Link>
          <Link href="/docs/effects/dust">Dust</Link>
          <Link href="/docs/effects/gather">Gather</Link>
          <Link href="/docs/effects/morph">Morph</Link>
        </nav>
        <nav className="footer-col" aria-label="Project">
          <a
            href="https://github.com/1xcoder-1/swash"
            target="_blank"
            rel="noreferrer"
          >
            GitHub
          </a>
          <a
            href="https://www.npmjs.com/package/react-flint"
            target="_blank"
            rel="noreferrer"
          >
            npm
          </a>
          <Link href="/">Landing</Link>
        </nav>
      </div>
      <span className="footer-mark" aria-hidden>
        Flint
      </span>
    </footer>
  );
}

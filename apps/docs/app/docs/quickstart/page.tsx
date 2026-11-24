import Link from "next/link";
import { CodeBlock } from "@/components/code-block";
import { InstallTabs } from "@/components/install-tabs";

export default function Quickstart() {
  return (
    <>
      <h1>Quickstart</h1>
      <p className="lead">
        Install the package, attach one ref to any element, and call one
        function. The grain engine snapshots the node, runs the effect and
        resolves when the last grain lands. No config, no CSS framework
        required.
      </p>

      <h2>1. Install</h2>
      <InstallTabs />
      <p>
        Flint is a single ESM + CJS package with React 18+ as its only peer
        dependency. All twenty-three effects share one hand-written Canvas2D grain
        engine, and the whole surface tree-shakes to what you import —
        pulling in <code className="inline-code">useDissolve</code> gets you
        the hook and the engine, nothing else.
      </p>

      <h2>2. Dissolve anything</h2>
      <CodeBlock
        caption="inbox.tsx"
        copy={`import { useDissolve } from "react-flint";\n\nexport function MailRow({ mail, onRemove }) {\n  const { ref, dissolving, dissolve } = useDissolve();\n\n  return (\n    <div\n      ref={ref}\n      style={{ opacity: dissolving ? 0 : 1 }}\n      onClick={async () => {\n        await dissolve({ preset: "dust", grain: 3, duration: 1500 });\n        onRemove(mail.id);\n      }}\n    >\n      {mail.subject}\n    </div>\n  );\n}`}
      />
      <p>
        The hook is a client component boundary already marked for you, so this
        works straight away in a Next.js App Router page, a Remix route, or any
        Vite React app. Hide the original with{" "}
        <code className="inline-code">dissolving</code> and do your state
        update after the <code className="inline-code">await</code>.
      </p>

      <h3>The twenty-three presets</h3>
      <p>
        Exits: <code className="inline-code">dust</code>,{" "}
        <code className="inline-code">sand</code>,{" "}
        <code className="inline-code">ember</code>,{" "}
        <code className="inline-code">pixel</code>,{" "}
        <code className="inline-code">vortex</code>,{" "}
        <code className="inline-code">shatter</code>,{" "}
        <code className="inline-code">stream</code>,{" "}
        <code className="inline-code">puff</code>,{" "}
        <code className="inline-code">shred</code>,{" "}
        <code className="inline-code">crush</code>,{" "}
        <code className="inline-code">ripple</code>. Entrances:{" "}
        <code className="inline-code">gather</code>,{" "}
        <code className="inline-code">rain</code>,{" "}
        <code className="inline-code">print</code>,{" "}
        <code className="inline-code">sparkle</code>,{" "}
        <code className="inline-code">sink</code>. Gestures:{" "}
        <code className="inline-code">snap</code>,{" "}
        <code className="inline-code">fling</code>,{" "}
        <code className="inline-code">charge</code>. Special:{" "}
        <code className="inline-code">morph</code>,{" "}
        <code className="inline-code">zap</code>. Casual:{" "}
        <code className="inline-code">peel</code>,{" "}
        <code className="inline-code">melt</code>.
      </p>

      <h2>3. Use the ready-made wrappers</h2>
      <p>
        For the common shapes there is a purpose-built hook so you do not have
        to wire the gesture yourself:
      </p>
      <CodeBlock
        copy={`import { DissolveIn, useDissolveMorph, useDissolvePeel } from "react-flint";\n\n// Mount with a grain entrance\n<DissolveIn preset="gather">assembled</DissolveIn>\n\n// Cross-fade two views by brightness\nconst { refA, refB, morph } = useDissolveMorph();\n\n// Drag a sticker corner, it peels and flies\nconst { ref, gesture, style } = useDissolvePeel({ onCommit: drop });`}
      />
      <p>
        <code className="inline-code">useDissolveHold</code> is the same idea
        for press-and-hold: hold to charge the grain, release to commit.
      </p>

      <h2>4. Respect reduced motion</h2>
      <p>
        You do nothing. The engine reads{" "}
        <code className="inline-code">prefers-reduced-motion</code> through a
        live subscription — the effect is skipped and the promise resolves at
        once, so your state update after the <code className="inline-code">await</code>{" "}
        still runs. Toggling the OS setting mid-session works without a reload.
        See <Link className="inline" href="/docs/accessibility">Accessibility</Link>{" "}
        for the details.
      </p>

      <h2>Next steps</h2>
      <ul>
        <li>
          <Link className="inline" href="/docs/effects">
            All effects
          </Link>
          : the twenty-three presets, each with a tunable playground and copy-paste
          code
        </li>
        <li>
          <Link className="inline" href="/docs/examples">
            Examples
          </Link>{" "}
          : every effect running live on one page
        </li>
        <li>
          Start with{" "}
          <Link className="inline" href="/docs/effects/dust">
            Dust
          </Link>{" "}
          if you just want something to blow away.
        </li>
      </ul>
    </>
  );
}

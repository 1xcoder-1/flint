import { CodeBlock } from "@/components/code-block";

export const metadata = { title: "Accessibility" };

const ROWS = [
  ["Grain flights (all 16)", "The engine reads prefers-reduced-motion, skips the particle flight and resolves the promise at once — the element simply arrives in its final state."],
  ["Exits (dust, sand, ember…)", "Your code after the await runs immediately, so the removal, archive or dismiss still happens — just without the grains."],
  ["Entrances (gather, rain, print)", "DissolveIn mounts its child already assembled: no coarse-to-fine pass, no stagger."],
  ["Gestures (snap, fling, charge)", "The gesture still commits — hold-to-charge fires onCommit on release, it just never builds grain while held."],
  ["Morph", "Both views swap instantly; the brightness-paired grain cross-fade is dropped."],
  ["Peel", "A pass over the threshold still commits and calls onCommit — the sticker disappears instead of flying off."],
];

export default function AccessibilityPage() {
  return (
    <>
      <h1>Accessibility</h1>
      <p className="lead">
        Motion is decoration; the state change is the contract. Every effect is
        built so that turning the animation off never removes information or
        function.
      </p>

      <h2>Reduced motion is a render mode</h2>
      <p>
        The engine reads{" "}
        <code className="inline-code">prefers-reduced-motion</code> through a
        live <code className="inline-code">matchMedia</code> subscription.
        Toggling the OS setting mid-page switches every effect to its static
        path without a reload, and switching back resumes the animated one.
        Because <code className="inline-code">dissolve()</code> resolves
        immediately on that path, the state update you keep after the{" "}
        <code className="inline-code">await</code> always runs — the effect is
        optional, your logic is not.
      </p>

      <table className="props">
        <thead>
          <tr>
            <th>Effect</th>
            <th>Reduced-motion behaviour</th>
          </tr>
        </thead>
        <tbody>
          {ROWS.map(([name, behaviour]) => (
            <tr key={name}>
              <td>{name}</td>
              <td style={{ fontFamily: "var(--font)", color: "var(--text-2)" }}>
                {behaviour}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <h2>The element stays in the DOM</h2>
      <p>
        Grain is painted on a canvas layered over real elements — it never
        replaces them. Text, labels and values remain plain DOM the whole time,
        so screen readers, crawlers, find-in-page and copy-paste all get the
        real content while the effect is running.
      </p>
      <ul>
        <li>The dissolve path hides the original with <code className="inline-code">opacity: dissolving ? 0 : 1</code> — the node stays in the tree until you remove it in your own state update.</li>
        <li>Gesture hooks keep a non-gesture path: everything <code className="inline-code">useDissolvePeel</code> or <code className="inline-code">useDissolveHold</code> commits to, a plain button click can commit to too.</li>
        <li>Haptics fire only where the browser supports them, and never on the reduced-motion path.</li>
      </ul>

      <h2>Hydration and focus</h2>
      <p>
        The server writes the same markup the client starts from — nothing
        touches the DOM at import — so hydration never corrects itself and
        nothing flashes. Effects never steal focus, and none of them run in a
        loop that a keyboard user has to wait out.
      </p>

      <h2>Testing it yourself</h2>
      <CodeBlock
        lang="CSS"
        highlight="css"
        copy="/* Force the static path locally, without touching OS settings: */\n@media (prefers-reduced-motion: reduce) {\n  /* every Flint effect skips the flight and resolves at once */\n}"
      />
      <p>
        Chrome DevTools can emulate the media feature under Rendering → Emulate
        prefers-reduced-motion, which is the fastest way to check the table
        above against a live playground.
      </p>
    </>
  );
}

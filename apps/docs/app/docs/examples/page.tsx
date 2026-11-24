import { ExampleGallery } from "@/components/example-gallery";

export const metadata = { title: "Examples" };

export default function ExamplesPage() {
  return (
    <>
      <h1>Examples</h1>
      <p className="lead">
        All 23 grain effects, running live on this page — the same playground
        the effect pages use, no video, no screenshot. Click a card or press
        Play, then copy the snippet.
      </p>

      <ExampleGallery />

      <h2>Built from the same snippets</h2>
      <p>
        Every card&rsquo;s <em>Show code</em> source is exactly what runs above
        it, so what you read is what you see — and what you paste into your own
        app once you install <code>react-flint</code>. Each effect also has a
        full page with a tunable playground under <em>Effects</em> in the sidebar.
      </p>
    </>
  );
}

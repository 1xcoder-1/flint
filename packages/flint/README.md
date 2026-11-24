# react-flint

Flint provides twenty-three grain effects for React on one dependency-free Canvas2D engine. Dissolve an element into dust, pour it out as sand, blow it into embers, or assemble it with an entrance. The package has zero runtime dependencies; React and React DOM are peer dependencies.

```bash
npm install react-flint    # or: pnpm add react-flint, bun add react-flint, deno add npm:react-flint
```

Version `0.1.0` supports React `>=18.0.0`. The published ESM and CJS bundles include a `"use client"` boundary. Use the hooks in client components.

## Quickstart

```tsx
"use client";

import { useDissolve } from "react-flint";

type MailRowProps = {
  mail: { id: string; subject: string };
  onRemove: (id: string) => void;
};

export function MailRow({ mail, onRemove }: MailRowProps) {
  const { ref, dissolving, dissolve } = useDissolve<HTMLButtonElement>();

  const remove = async () => {
    await dissolve({ preset: "dust", grain: 3, duration: 1500 });
    onRemove(mail.id);
  };

  return (
    <button
      type="button"
      ref={ref}
      disabled={dissolving}
      style={{ opacity: dissolving ? 0 : 1 }}
      onClick={() => void remove()}
    >
      {mail.subject}
    </button>
  );
}
```

`dissolve()` snapshots the element attached to `ref`, runs the effect on a fixed canvas overlay, and resolves when the burst finishes. Hide the original while `dissolving` is true, then update state after the `await`. With reduced motion enabled at playback time, the flight is skipped and the promise resolves without waiting for an animation.

## The twenty-three effects

| Group | Presets | What they do |
| --- | --- | --- |
| Exits | `dust` `sand` `ember` `pixel` `vortex` `shatter` `stream` `puff` `shred` `crush` `ripple` | Drift, pour, rise, collapse, spiral, break, fly to a target, billow away, shred into strips, press flat, or ripple out from a point. |
| Entrances | `gather` `rain` `print` `sparkle` `sink` | Assemble from a cloud, settle from above, print line by line, twinkle in, or float up from below. |
| Gestures | `snap` `fling` `charge` | Burst from a point, follow swipe velocity, or build while held. |
| Special | `morph` `zap` | Turn one captured view into another, or spark out in stepped scan lines. |
| Casual | `peel` `melt` | Peel a paper-like corner or flow downward in wax-like drips. |

## Public API

| Export | Kind | Behavior |
| --- | --- | --- |
| `useDissolve` | hook | Returns `ref`, `dissolving`, and `dissolve(options?)`. Runs any preset on the attached element. |
| `DissolveIn` | component | Wraps children and plays a grain entrance on mount. Defaults to `preset: "gather"` and `direction: "in"`. |
| `useDissolveHold` | hook | Returns `ref`, `pressHandlers`, and `style` for the `charge` preset. |
| `useDissolveMorph` | hook | Returns `refA`, `refB`, `styleA`, `styleB`, and `morph(options?)`. |
| `useDissolvePeel` | hook | Returns `ref`, `gesture`, and `style` for pointer-driven peeling. |

Public types remain `DissolveOptions`, `DissolveInProps`, `SwashPreset`, `SwashOrigin`, `SwashPoint`, `SwashBox`, and `UseDissolveResult`.

### Gesture wrapper options

| Hook | Options | Defaults |
| --- | --- | --- |
| `useDissolveHold` | `holdMs`, `grain`, `duration`, `onCommit` | `1200`, `3`, `900`, none |
| `useDissolvePeel` | `threshold`, `grain`, `duration`, `onCommit` | `0.4`, `3`, `700`, none |
| `useDissolveMorph` | `morph({ grain, duration, reverse })` | `4`, `1100`, `false` |

`onCommit` runs when a hold passes `holdMs` or a peel passes its distance threshold. It does not wait for the final fly-off animation.

## `DissolveOptions`

| Option | Type | Default | Notes |
| --- | --- | --- | --- |
| `preset` | `SwashPreset` | `"dust"` | Selects the effect. `DissolveIn` defaults to `"gather"`. |
| `grain` | `number` | per preset | Grain size in CSS pixels. Generic bursts raise it automatically to target a 5,000-grain ceiling. |
| `duration` | `number` | preset-specific | Most presets use `1500`; `fling` derives `700–1500` from velocity, `peel` uses `1900`, and `melt` uses `1800`. |
| `direction` | `"in" \| "out"` | preset's natural direction | Reverses presets with one natural direction. `stream` and `ripple` support both directions. `DissolveIn` always plays `"in"`. |
| `origin` | `SwashOrigin` | preset's natural order | Sets the delay origin for ordered effects and the impact point for `snap` and `shatter`. Presets that own their geometry ignore it. |
| `velocity` | `SwashPoint` | none | Swipe velocity in px/s for `fling`; `shatter` adds 30% of it to shard launch velocity. |
| `target` | `SwashBox` | none | Viewport box for `stream`. Without a target, it aims at the bottom center of the viewport. |
| `to` | `RefObject<HTMLElement \| null>` | none | Element target for `stream`; measured when `dissolve()` runs. |
| `onArrive` | `() => void` | none | Callback after the burst settles, useful for stream arrival. |
| `n` | `number[]` | none | Variant values such as `snap` push, `shatter` shard target, or `charge` push. |
| `field` | `"cascade"` | none | Replaces native timing with a diagonal delay field. |
| `rows` | `number[]` | none | Local Y boundaries used by `field: "cascade"`. |
| `hold` | `boolean` | `false` | Holds progress for gesture-driven presets. `useDissolve` does not expose the release handle; the gesture wrappers manage it. |
| `fixed` | `boolean` | `false` | Keeps grains stationary when the page scrolls. |
| `onDone` | `() => void` | none | Callback after the burst settles. |

## Accessibility and rendering

- Reduced motion is checked when a burst starts. The grain flight is skipped and returned promises resolve without waiting for an animation.
- No canvas or DOM overlay is created at import. Server rendering emits the real markup.
- The overlay canvas is `aria-hidden` and ignores pointer events. The original element stays in the DOM, preserving text and semantics while grains are drawn.
- Snapshots capture backgrounds, borders, text, images, canvases, and inline SVG. Shadows, gradients, and pseudo-elements are not captured.

## Docs

Every effect has a live playground with tunable options and copy-paste code at [the repository](https://github.com/1xcoder-1/swash) under `/docs/effects`.

## License

MIT

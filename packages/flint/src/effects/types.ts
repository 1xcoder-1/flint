import type { RefObject } from "react";

/** The 22 effects, in the same groups the docs use. */
export type SwashPreset =
  | "dust" | "sand" | "ember" | "pixel" | "vortex" | "shatter" | "stream"
  | "puff" | "shred" | "crush" | "zap" | "ripple"
  | "gather" | "rain" | "print" | "sparkle" | "sink"
  | "snap" | "fling" | "charge"
  | "morph"
  | "peel" | "melt";

export type SwashOrigin = "left" | "right" | "top" | "bottom" | "center" | { x: number; y: number };
export type SwashPoint = { x: number; y: number };
export type SwashBox = { x: number; y: number; width: number; height: number };

export interface DissolveOptions {
  /** Which of the 23 effects to run. */
  preset?: SwashPreset;
  /** Grain count. Each preset has its own default. */
  grain?: number;
  /** Burst duration in ms. */
  duration?: number;
  /** `out` takes the view apart, `in` assembles it. Presets pick their natural direction. */
  direction?: "in" | "out";
  /** Where the effect starts from. */
  origin?: SwashOrigin;
  /** Swipe velocity for `fling`. */
  velocity?: SwashPoint;
  /** Where `stream` flies to, in viewport px. */
  target?: SwashBox;
  /** Element `stream` flies to; its bounds become `target`. */
  to?: RefObject<HTMLElement | null>;
  /** Called when the last grains reach `to` (or `target`). */
  onArrive?: () => void;
  /** Variant knobs (snap count, shatter shards, peel anchor, …). */
  n?: number[];
  /** Replaces the native delay with a diagonal wave, for lists and screens. */
  field?: "cascade";
  /** Row boundaries in local Y used by `field: 'cascade'`. */
  rows?: number[];
  /** Keep progress at 0 until a gesture releases it (charge, peel). */
  hold?: boolean;
  /** The element is `position: fixed`; grains ignore page scroll. */
  fixed?: boolean;
  onDone?: () => void;
}

export interface UseDissolveResult<T extends HTMLElement = HTMLDivElement> {
  ref: RefObject<T | null>;
  /** Play the effect on the element attached to `ref`. */
  dissolve: (options?: DissolveOptions) => Promise<void>;
  /** True while the grains are flying. */
  dissolving: boolean;
}

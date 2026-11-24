import { renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { useDissolve } from "../src/index";
import { VARIANTS } from "../src/grain/engine";

const PRESETS = [
  "dust", "sand", "ember", "pixel", "vortex", "shatter", "stream",
  "puff", "shred", "crush", "zap", "ripple",
  "gather", "rain", "print", "sparkle", "sink",
  "snap", "fling", "charge",
  "morph",
  "peel", "melt",
];

describe("grain effects", () => {
  it("registers exactly the approved 23 presets", () => {
    expect(PRESETS).toHaveLength(23);
    expect(Object.keys(VARIANTS).sort()).toEqual([...PRESETS].sort());
  });

  it("exposes a useDissolve hook with a stable API", () => {
    const { result } = renderHook(() => useDissolve());
    expect(result.current.ref).toBeDefined();
    expect(result.current.dissolving).toBe(false);
    expect(result.current.dissolve).toBeTypeOf("function");
  });

  it("is a no-op when no element is attached", async () => {
    const { result } = renderHook(() => useDissolve());
    await expect(result.current.dissolve({ preset: "dust" })).resolves.toBeUndefined();
    expect(result.current.dissolving).toBe(false);
  });
});

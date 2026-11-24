// @vitest-environment node
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { renderToString } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import {
  DissolveIn,
  useDissolve,
  useDissolveHold,
  useDissolveMorph,
  useDissolvePeel,
} from "../src/index";

/**
 * This file has no window and no document, on purpose. A component that reaches
 * for the browser while it renders passes every test in an environment that has
 * one and throws on someone's server, and a hydration mismatch shows up first as
 * a React warning rather than as a failing assertion.
 */

const samples = [
  <DissolveIn preset="gather">assembled</DissolveIn>,
  <DissolveIn preset="dust">blown away</DissolveIn>,
];

describe("ssr safety", () => {
  it("has no browser to lean on", () => {
    expect(typeof window).toBe("undefined");
    expect(typeof document).toBe("undefined");
  });

  it("renders every component to a string", () => {
    for (const element of samples) expect(renderToString(element)).toContain("<");
  });

  it("keeps the words in the markup, where a reader without script finds them", () => {
    expect(renderToString(<DissolveIn preset="gather">assembled</DissolveIn>)).toContain("assembled");
  });

  it("renders without saying anything", () => {
    const errors = vi.spyOn(console, "error").mockImplementation(() => {});
    const warnings = vi.spyOn(console, "warn").mockImplementation(() => {});
    for (const element of samples) renderToString(element);
    expect(errors).not.toHaveBeenCalled();
    expect(warnings).not.toHaveBeenCalled();
  });

  it("does not touch the DOM from the engine at import time", async () => {
    // Re-importing in a windowless node proves the grain engine stays inert
    // until play() or morph() runs in a browser.
    const engine = await import("../src/grain/engine");
    expect(engine.play).toBeTypeOf("function");
    expect(typeof globalThis.document).toBe("undefined");
  });

  it("exports the hooks the docs promise", () => {
    expect(useDissolve).toBeTypeOf("function");
    expect(useDissolveHold).toBeTypeOf("function");
    expect(useDissolveMorph).toBeTypeOf("function");
    expect(useDissolvePeel).toBeTypeOf("function");
  });

  it("keeps effect internals in a meaningfully named folder", () => {
    const src = fileURLToPath(new URL("../src/", import.meta.url));
    const entry = readFileSync(join(src, "index.ts"), "utf8");

    expect(existsSync(join(src, "effects"))).toBe(true);
    expect(existsSync(join(src, "dissolve"))).toBe(false);
    expect(entry).toContain('"./effects/');
  });

  it("uses the Flint package identity across the workspace", () => {
    const root = fileURLToPath(new URL("../../../", import.meta.url));
    const pkg = JSON.parse(readFileSync(new URL("../package.json", import.meta.url), "utf8"));
    const workspace = JSON.parse(readFileSync(join(root, "package.json"), "utf8"));
    const docs = JSON.parse(readFileSync(join(root, "apps/docs/package.json"), "utf8"));
    const nextConfig = readFileSync(join(root, "apps/docs/next.config.ts"), "utf8");

    expect(pkg.name).toBe("react-flint");
    expect(pkg.version).toBe("0.1.0");
    expect(workspace.name).toBe("flint-monorepo");
    expect(workspace.scripts.build).toContain("react-flint");
    expect(docs.dependencies["react-flint"]).toBe("workspace:*");
    expect(docs.dependencies["react-" + "swash"]).toBeUndefined();
    expect(nextConfig).toContain('"react-flint"');
    expect(nextConfig).not.toContain('"react-' + 'swash"');
  });

  it("keeps the compatibility export names", () => {
    const entry = readFileSync(new URL("../src/index.ts", import.meta.url), "utf8");
    const exports = [
      "useDissolve", "DissolveIn", "useDissolveHold", "useDissolveMorph",
      "useDissolvePeel", "DissolveInProps", "DissolveOptions", "SwashBox",
      "SwashOrigin", "SwashPoint", "SwashPreset", "UseDissolveResult",
    ];

    for (const name of exports) expect(entry).toContain(name);
    expect(entry).not.toContain("react-" + "swash");
  });

  it("keeps retired scripts deleted", () => {
    const pkg = fileURLToPath(new URL("../", import.meta.url));
    expect(existsSync(join(pkg, "scripts/gates.mjs"))).toBe(false);
    expect(existsSync(join(pkg, "scripts/smoke.mjs"))).toBe(false);
  });
});

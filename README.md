# Flint monorepo

The publishable package lives in [`packages/flint`](packages/flint). Its README ([`packages/flint/README.md`](packages/flint/README.md)) covers installation, the public API, options, and accessibility behavior.

This repository is a pnpm workspace:

- `packages/flint/` the library, published to npm as `react-flint`, with Vitest coverage, typechecking, and production builds
- `apps/docs/` the documentation site (Next.js)

Common commands, run from the repository root:

```bash
pnpm install
pnpm --filter react-flint test     # vitest suite
pnpm --filter react-flint build    # dist + type declarations
pnpm --filter docs typecheck      # documentation TypeScript check
```

"use client";

import { useEffect, useRef, useState } from "react";
import {
  IconPnpm,
  IconNpm,
  IconBun,
  IconYarn,
  IconDeno,
  IconAntigravity,
  IconClaude,
  IconCursor,
  IconChatGPT,
  IconV0,
  IconWindsurf,
  IconCopy,
  IconCheck,
  IconChevron,
} from "./brand-icons";
import { copyText } from "./clipboard";

export const MANAGERS = [
  { id: "pnpm", label: "pnpm", cmd: "pnpm add react-flint", icon: IconPnpm },
  { id: "npm", label: "npm", cmd: "npm i react-flint", icon: IconNpm },
  { id: "bun", label: "bun", cmd: "bun add react-flint", icon: IconBun },
  { id: "yarn", label: "yarn", cmd: "yarn add react-flint", icon: IconYarn },
  { id: "deno", label: "deno", cmd: "deno add npm:react-flint", icon: IconDeno },
] as const;

export type ManagerId = (typeof MANAGERS)[number]["id"];

export const AI_AGENTS = [
  {
    id: "antigravity",
    name: "Antigravity",
    icon: IconAntigravity,
  },
  {
    id: "claude",
    name: "Claude Code",
    icon: IconClaude,
  },
  {
    id: "cursor",
    name: "Cursor",
    icon: IconCursor,
  },
  {
    id: "chatgpt",
    name: "ChatGPT",
    icon: IconChatGPT,
  },
  {
    id: "v0",
    name: "v0 / Bolt",
    icon: IconV0,
  },
  {
    id: "windsurf",
    name: "Windsurf",
    icon: IconWindsurf,
  },
] as const;

export type AgentId = (typeof AI_AGENTS)[number]["id"];

function getAgentPrompt(agentId: AgentId, cmd: string) {
  if (agentId === "antigravity") {
    return `# Google Antigravity — Flint instructions

Install package:
${cmd}

Package summary:
- "react-flint" provides zero-runtime-dependency React grain effects (React 18+) on one Canvas2D engine.
- Fully compatible with Next.js App Router (SSR-safe, zero hydration mismatch, no "use client" wrapper needed).
- Reduced motion (prefers-reduced-motion) skips the effect and resolves instantly.
- 23 presets: dust, sand, ember, pixel, vortex, shatter, stream, puff, shred, crush, ripple, gather, rain, print, sparkle, sink, snap, fling, charge, morph, zap, peel, melt.

Import in client components:
import { useDissolve, DissolveIn, useDissolveHold, useDissolveMorph, useDissolvePeel } from "react-flint";

Usage example:
const { ref, dissolving, dissolve } = useDissolve();
<div ref={ref} style={{ opacity: dissolving ? 0 : 1 }}><Card /></div>
await dissolve({ preset: "dust", grain: 3, duration: 1500 });`;
  }

  if (agentId === "claude") {
    return `# Claude Code instructions for Flint

Add dependency:
${cmd}

Guidelines:
1. Import useDissolve (and DissolveIn / useDissolveHold / useDissolveMorph / useDissolvePeel) directly from "react-flint".
2. Zero external dependencies; one hand-written Canvas2D grain engine underneath.
3. SSR-safe with Next.js 14/15/16 App Router.
4. Every effect honours prefers-reduced-motion: the promise resolves at once, so keep state updates after the await.`;
  }

  if (agentId === "cursor") {
    return `# .cursorrules for Flint

Install:
${cmd}

Rules:
- Library: "react-flint" (React grain effects on a Canvas2D engine, one useDissolve hook).
- Presets: dust, sand, ember, pixel, vortex, shatter, stream, puff, shred, crush, gather, rain, print, sparkle, sink, snap, fling, charge, morph, zap, peel, melt.
- No Framer Motion or GSAP needed for dissolve motion.
- SSR-safe, zero layout shift (CLS = 0).`;
  }

  if (agentId === "chatgpt") {
    return `# OpenAI ChatGPT Custom Prompt for Flint

To add dissolve motion, install:
${cmd}

Use Flint effects:
- const { ref, dissolving, dissolve } = useDissolve(); then await dissolve({ preset: "shatter" })
- <DissolveIn preset="gather">mounts with a grain entrance</DissolveIn>
- useDissolveHold / useDissolveMorph / useDissolvePeel for press-and-hold, morph and sticker peel`;
  }

  if (agentId === "v0") {
    return `Install Flint via "${cmd}".
Dissolve any element on click with const { ref, dissolving, dissolve } = useDissolve(); and await dissolve({ preset: "dust" });`;
  }

  return `# Windsurf / Codeium instructions for Flint

Install: ${cmd}
Run any of the 23 grain effects on any element with useDissolve from "react-flint": dust, sand, ember, pixel, vortex, shatter, stream, puff, shred, crush, gather, rain, print, sparkle, sink, snap, fling, charge, morph, zap, peel, melt.`;
}

async function writeClipboard(text: string) {
  return copyText(text);
}

export function InstallTabs() {
  const [activePm, setActivePm] = useState<ManagerId>("pnpm");
  const [activeAgent, setActiveAgent] = useState<AgentId>("antigravity");
  const [openMenu, setOpenMenu] = useState<"pm" | "agent" | null>(null);
  const [copied, setCopied] = useState<"cmd" | "agent" | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);

  const currentPm = MANAGERS.find((m) => m.id === activePm) || MANAGERS[0];
  const currentAgent = AI_AGENTS.find((a) => a.id === activeAgent) || AI_AGENTS[0];

  const CurrentPmIcon = currentPm.icon;

  // Dismiss menu on outside click or Escape
  useEffect(() => {
    if (!openMenu) return;
    const onDown = (e: PointerEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) {
        setOpenMenu(null);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpenMenu(null);
    };
    document.addEventListener("pointerdown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [openMenu]);

  const flash = (kind: "cmd" | "agent") => {
    setCopied(kind);
    setTimeout(() => setCopied(null), 1800);
  };

  const copyCmd = async () => {
    flash("cmd");
    await writeClipboard(currentPm.cmd);
  };

  const copyAgent = async (agentId?: AgentId) => {
    const chosen = agentId || activeAgent;
    if (agentId) setActiveAgent(agentId);
    flash("agent");
    await writeClipboard(getAgentPrompt(chosen, currentPm.cmd));
  };

  return (
    <div className="install-actions-group" ref={rootRef}>
      {/* 1. Install Command Control with Real PM Icons & PM Switcher */}
      <div className="install-command-bar">
        <button
          type="button"
          className="cmd-main-btn"
          aria-label={copied === "cmd" ? "Command copied" : "Copy install command"}
          onClick={copyCmd}
        >
          <span className="brand-icon-wrap">
            <CurrentPmIcon size={16} />
          </span>
          <code className="cmd-text">{currentPm.cmd}</code>
          <span className="cmd-copy-icon" aria-hidden="true">
            {copied === "cmd" ? <IconCheck size={14} /> : <IconCopy size={14} />}
          </span>
        </button>

        <button
          type="button"
          className="cmd-chevron-btn"
          aria-haspopup="listbox"
          aria-expanded={openMenu === "pm"}
          aria-label="Choose package manager"
          onClick={() => setOpenMenu((v) => (v === "pm" ? null : "pm"))}
        >
          <IconChevron size={12} />
        </button>

        {openMenu === "pm" && (
          <ul className="custom-dropdown-menu pm-dropdown" role="listbox" aria-label="Package Manager">
            {MANAGERS.map((m) => {
              const Icon = m.icon;
              const isSelected = m.id === activePm;
              return (
                <li key={m.id} role="option" aria-selected={isSelected}>
                  <button
                    type="button"
                    className={`dropdown-item ${isSelected ? "selected" : ""}`}
                    onClick={() => {
                      setActivePm(m.id);
                      setOpenMenu(null);
                    }}
                  >
                    <span className="dropdown-item-icon">
                      <Icon size={16} />
                    </span>
                    <span className="dropdown-item-label">{m.label}</span>
                    {isSelected && (
                      <span className="dropdown-item-check">
                        <IconCheck size={14} />
                      </span>
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {/* 2. AI Prompt Button: Clean without brand icon on the button; Menu shows name and icon */}
      <div className="ai-prompt-bar">
        <button
          type="button"
          className="prompt-main-btn"
          aria-label={copied === "agent" ? `Copied for ${currentAgent.name}` : `Copy prompt for ${currentAgent.name}`}
          onClick={() => copyAgent()}
        >
          <span className="prompt-label">
            {copied === "agent" ? "Copied prompt!" : "Copy prompt"}
          </span>
          <span className="prompt-copy-icon" aria-hidden="true">
            {copied === "agent" ? <IconCheck size={14} /> : <IconCopy size={14} />}
          </span>
        </button>

        <button
          type="button"
          className="prompt-chevron-btn"
          aria-haspopup="menu"
          aria-expanded={openMenu === "agent"}
          aria-label="Choose AI assistant prompt format"
          onClick={() => setOpenMenu((v) => (v === "agent" ? null : "agent"))}
        >
          <IconChevron size={12} />
        </button>

        {openMenu === "agent" && (
          <ul className="custom-dropdown-menu agent-dropdown" role="menu" aria-label="AI Assistant format">
            {AI_AGENTS.map((agent) => {
              const Icon = agent.icon;
              const isSelected = agent.id === activeAgent;
              return (
                <li key={agent.id} role="none">
                  <button
                    type="button"
                    role="menuitem"
                    className={`dropdown-item ${isSelected ? "selected" : ""}`}
                    onClick={() => {
                      copyAgent(agent.id);
                      setOpenMenu(null);
                    }}
                  >
                    <span className="dropdown-item-icon">
                      <Icon size={18} />
                    </span>
                    <span className="dropdown-item-label">{agent.name}</span>
                    {isSelected && (
                      <span className="dropdown-item-check">
                        <IconCheck size={14} />
                      </span>
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}

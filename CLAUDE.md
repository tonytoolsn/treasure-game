# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm install       # install dependencies
npm run dev       # start dev server at http://localhost:3000 (opens browser automatically)
npm run build     # production build → build/
```

No test runner is configured.

## Architecture

This is a single-page React + TypeScript + Vite app. All game logic lives in `src/App.tsx` — there are no routing layers or additional feature files.

**Game loop (`src/App.tsx`):**
- State: `boxes[]` (id, isOpen, hasTreasure), `score`, `gameEnded`
- One of the 3 boxes is randomly assigned `hasTreasure: true` on init/reset
- Clicking a box calls `openBox()`, which mutates score (+100 treasure / −50 skeleton) and checks end conditions (treasure found or all boxes opened)
- Animations use `motion` from `motion/react` (Framer Motion)

**UI components (`src/components/ui/`):** Full shadcn/ui component set built on Radix UI primitives. Import from `@/components/ui/<name>`. The `@` alias resolves to `src/`.

**Assets:**
- Images: `src/assets/` — `treasure_closed.png`, `treasure_opened.png`, `treasure_opened_skeleton.png`, `key.png`
- Audio: `src/audios/` — `chest_open.mp3`, `chest_open_with_evil_laugh.mp3`

**Vite config notes:** All dependencies are aliased by exact version (e.g., `'lucide-react@0.487.0': 'lucide-react'`) to handle versioned imports from generated code. Build output goes to `build/` (not `dist/`).

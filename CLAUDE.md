# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev      # Start dev server (http://localhost:3000)
npm run build    # Production build
npm run lint     # ESLint
npx tsc --noEmit # Type check without emitting
```

No test framework is configured. Verify changes with `npx tsc --noEmit` and `npm run build`.

## Architecture

Single-page Next.js 16 App Router app that analyzes NetEase Cloud Music playlists via Gemini AI. Deployed on Vercel.

**Data flow:** User input → `/api/playlist` (fetch songs from NetEase) → `/api/analyze` (Gemini structured output) → render report cards → optional long-image export.

### Key layers

- `lib/parse-input.ts` — Extracts playlist URL/ID from 4 input formats (short link, full link, share text, pure ID)
- `lib/netease.ts` — NetEase Cloud Music undocumented API: resolve short links, fetch trackIds via `/api/v6/playlist/detail`, batch song details via `/api/song/detail` (batches of 50)
- `lib/schema.ts` — Zod schemas for all data types (Song, AnalysisResult, etc). Types are inferred from schemas.
- `lib/gemini.ts` — Gemini API call with `responseJsonSchema` (structured output) + `thinkingConfig`. Contains the full JSON Schema definition (`RESPONSE_JSON_SCHEMA`), prompt construction, robust JSON parsing, and post-processing to clean hallucinated tags.
- `app/page.tsx` — Client-side state machine: `input` → `fetching` → `analyzing` → `done` | `error`
- `components/ReportCard.tsx` — Container for all report modules, handles long-image export via `modern-screenshot`

### Important constraints

- **Min 50 songs** to analyze (enforced in `/api/playlist`)
- **Max 500 songs** sent to Gemini (silently truncated in `/api/analyze`), but `songCount` in the report is overwritten with the real total on the client
- Gemini `tags` field is prone to hallucination (thinking text leaking into values). `propertyOrdering` places tags before `innerVoice` to reduce tail hallucination. Post-processing extracts only `#`-prefixed short strings with regex fallback.
- `parseJsonRobust()` handles cases where Gemini appends thinking text after the JSON closing brace

### Design system

Dark "Cosmic Vinyl" theme defined via CSS variables in `app/globals.css`. All colors reference `var(--accent-gold)`, `var(--bg-deep)`, etc. — avoid hardcoding hex values in components.

Fonts: Playfair Display (display) + Noto Sans SC (body), loaded via `next/font/google` in `app/layout.tsx`.

### Tailwind CSS v4

This project uses Tailwind v4 — no `tailwind.config.ts`. Configuration is in `globals.css` via `@import "tailwindcss"` and `@theme inline`. Don't use Tailwind `disabled:` variants with inline styles (causes hydration issues).

### Recharts

RadarChart and PieChart use **fixed dimensions** (not `ResponsiveContainer`) to avoid "width(-1) height(-1)" warnings on initial render.

@AGENTS.md

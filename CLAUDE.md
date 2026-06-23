# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Browser-based meeting bingo game with live speech recognition. No backend — fully static, deployed to Vercel. Stack: React 18 + TypeScript, Tailwind CSS, Vite, Web Speech API, canvas-confetti.

## Commands

```bash
npm run dev          # Vite dev server on :3000
npm run build        # tsc then vite build → dist/
npm run preview      # serve dist/ locally
npm run lint         # eslint on .ts/.tsx
npm run typecheck    # tsc --noEmit (no emit, type check only)
npx vitest           # unit tests (add Vitest in Phase 1)
npx vitest run src/lib/bingoChecker.test.ts  # run a single test file
```

## Architecture

### Screen flow

`App.tsx` owns a `screen` state string that drives rendering: `landing → category → game → win`. There is no router — each screen is a conditional render. On every screen transition, `useRef + .focus()` must target the primary `h1` to maintain screen-reader context.

### State ownership

`useGame.ts` is the **single source of game state**. `GameContext.tsx` re-exports its values only — it holds no state of its own. Do not add state to Context; go through `useGame`.

`GameState` must include a `schemaVersion` field. On `localStorage` hydration, compare versions and clear stale state rather than letting a broken shape silently load.

### Speech recognition

`useSpeechRecognition.ts` wraps the Web Speech API. Key constraints:
- Use `recognition.abort()` (not `stop()`) in `useEffect` cleanup.
- Guard all callbacks with a `mountedRef` check to avoid leaks into unmounted components.
- Only process `result.isFinal === true` events from `onresult`. Interim results must never call `fillSquare()`.
- Auto-restart on `onend` must have exponential backoff and a retry cap (5 attempts); after cap, surface an error state.
- Safari iOS stops recognition after ~60s — restart on `visibilitychange`.
- Add `@types/dom-speech-recognition` as a dev dep; `SpeechRecognitionEvent` is not in the default TS lib.
- Privacy copy: "audio processed by your browser's speech engine" — Chrome routes audio through Google's service, so "processed locally" is not accurate.

### Word detection

`detectWordsWithAliases()` in `src/lib/wordDetector.ts` is the entry point. The `\b` regex boundary fails on slash-separated tokens (`CI/CD`) and hyphenated words (`stand-up`) — normalise text before matching. Maintain a `Set` of already-filled word IDs per session; reset on recognition restart.

### BingoSquare states

Five states: default, manual-filled, auto-filled, free space, winning. **Never use color as the only differentiator** — each state needs a secondary cue (icon or border pattern) for colorblind users.

Manual tap **toggles** — clicking a filled square unfills it (user can correct accidental taps). Auto-filled squares should also be un-fillable by click so users can correct false positives.

### UX constraints (derived from use case)

The app is used during live meetings. This imposes hard constraints:
- **No sound** — audio is off by default and must stay off unless the user explicitly enables it. Users are on mute or in open offices.
- **Silent celebration** — confetti is visual only; the win screen must not trigger any audio.
- **Minimal UI footprint** — the card runs alongside a video call. Avoid full-screen takeovers or elements that demand active attention; the game should work in peripheral vision.
- **No light/dark theme toggle** — this is explicitly P2 and out of scope for v1.

### Animations

All animations (`canvas-confetti`, one-away pulse border) must be gated behind `prefers-reduced-motion`. When motion is reduced, show a static "BINGO!" banner instead of confetti, and a static border instead of the pulse. Import `canvas-confetti` dynamically inside `WinScreen` only — it must not appear in the initial bundle.

### Accessibility requirements

- WCAG 2.1 AA is a hard requirement (not optional).
- `BingoCard` needs `role="grid"`, each square `role="gridcell"`, roving `tabindex` with arrow-key navigation, Enter/Space to activate.
- `aria-live="polite"` region for auto-fill and win announcements.
- Mic toggle needs `aria-pressed`.
- Category cards need `aria-pressed` + a non-color selection indicator.
- Minimum square tap target: 44px.

### Share flow

`shareUtils.ts` must try: `navigator.share()` → `navigator.clipboard.writeText()` → fallback modal with a pre-selected `<textarea>`. The AC for share is text-only clipboard content (no "game link" — there is no seed/routing system in v1).

### Deployment

Requires a `vercel.json` with:
- SPA rewrite: all paths → `/index.html`
- Security headers: `Content-Security-Policy`, `X-Frame-Options: DENY`, `Permissions-Policy: microphone=(self)`

## Key files (planned)

| Path | Role |
|------|------|
| `src/types/index.ts` | All shared interfaces (`BingoSquare`, `GameState`, `WinningLine`, etc.) |
| `src/data/categories.ts` | Word packs — each category needs ≥80 words |
| `src/lib/cardGenerator.ts` | Fisher-Yates shuffle, 5×5 grid, free space at `[2][2]` |
| `src/lib/bingoChecker.ts` | Checks all 12 winning lines; `getClosestToWin()` for one-away hint |
| `src/lib/wordDetector.ts` | Regex + alias matching; always call `detectWordsWithAliases()` |
| `src/hooks/useSpeechRecognition.ts` | Web Speech API wrapper (see constraints above) |
| `src/hooks/useGame.ts` | Single source of game state |
| `src/App.tsx` | Screen router; wires speech output → word detection → `fillSquare()` |

## What's deferred (v2 / v1.1)

- Real-time multiplayer (shared card seeds via URL)
- Custom user-defined word packs
- Analytics beyond a console-log stub
- Native Share API on desktop (fallback textarea is sufficient for v1)
- Alias map, native Share, one-away hints (v1.1)
- Light/dark theme (P2)
- Sound effects (explicitly out of scope — users are in meetings)

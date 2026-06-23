# Meeting Bingo — Implementation Plan

**Stack**: React 18 + TypeScript · Tailwind CSS · Vite · Web Speech API · canvas-confetti · Vercel (free tier)

---

## Review Summary

**Reviewed**: 2026-06-23 | **Reviewers**: VP Product, VP Engineering, VP Design

### Changes Applied

| # | Change |
|---|--------|
| 1 | Add Vitest in Phase 1; unit-test all `src/lib/` modules (cardGenerator uniqueness, all 12 bingo lines, alias map edge cases). Budget 30 min. |
| 2 | Track `mountedRef` in `useSpeechRecognition`; call `recognition.abort()` (not `stop()`) in `useEffect` cleanup; guard all callbacks with `if (!mountedRef.current) return`. |
| 3 | Only process `result.isFinal === true` events in `onresult`, OR maintain a `Set` of already-filled word IDs per session and skip duplicates. Reset on recognition restart. |
| 4 | Remove "game link" from Acceptance Criteria OR encode card state in a URL hash (`?seed=N&category=agile`) in Phase 2 before `shareUtils` is built. |
| 5 | Re-estimate total at 6–8 hours. If 2 hours is a hard constraint, scope-cut to: single category, manual-only mode, clipboard share, no persistence — then layer features in. |
| 6 | Pair every BingoSquare state with a secondary cue beyond color: checkmark icon (manual fill), mic icon (auto-fill), star (free space), trophy/glow border (winning). Never color-only. |
| 7 | Implement roving `tabindex` on BingoCard: single tab stop, arrow keys move focus between squares, Enter/Space activates. Every square must be a `<button>` with visible 3:1 contrast focus ring. |
| 8 | On every screen mount, `useRef + .focus()` to the primary `h1` or first interactive element. Add `aria-live` region or `aria-label` on the screen container to announce context changes. |
| 9 | Gate all animations (`canvas-confetti`, one-away pulse) behind `prefers-reduced-motion`. Replace confetti with a static "BINGO!" banner; replace pulse with a static border. |
| 10 | Add `schemaVersion` field to persisted `GameState`; on load, check version and clear stale state rather than silently hydrating a broken shape. |
| 11 | Add a React error boundary wrapping `GameBoard` and `WinScreen`; show a "Something went wrong — start a new game" recovery UI. |
| 12 | Enable `strict: true` in `tsconfig.json`; add `@types/dom-speech-recognition` as a dev dependency for `SpeechRecognitionEvent`. |
| 13 | Extend `wordDetector.ts` regex to handle slash-separated tokens (`CI/CD`), hyphenated words (`stand-up`), and smart-quote normalisation before matching. |
| 14 | Call `confetti.reset()` in `WinScreen` `useEffect` cleanup to remove the appended canvas and cancel the rAF loop on fast replay. |
| 15 | Re-estimate Phase 3 at 60–90 min (6–9 min/component including props, Tailwind styling, and basic a11y). |
| 16 | On mobile, constrain BingoCard to viewport width; ensure each square is ≥44px tap target; render `TranscriptPanel` as a collapsible drawer below the grid. |
| 17 | Gate confetti and "one away" pulse behind `prefers-reduced-motion` media query (covered by change #9 above). |
| 18 | On mobile, supplement the one-away pulse with a Toast notification: "One away — [word] could win!". |
| 19 | Define mic permission modal copy in the plan: headline, privacy explanation ("processed locally, never sent to a server"), and a "Not now" option that falls back to manual mode. |
| 20 | Define error UI for all failure states: mic denied → banner + manual mode; speech error → retry button; clipboard failure → fallback textarea; localStorage quota → warn + disable persistence. |
| 21 | Show a "Listening… say a buzzword" placeholder in `TranscriptPanel` when `isListening && transcript === ""`; add a visual waveform or animated dots to confirm mic is active. |
| 22 | Expand each category to ≥80 words. Add a "Recently used" exclusion set so the card generator de-prioritises words seen in the last N sessions. |
| 23 | Add a dismissable first-run tooltip on `GameBoard` explaining: click to fill manually, mic auto-fills when listening. Persist dismissal in `localStorage`. |
| 24 | Add Acceptance Criteria for mic denial: app must fall back to manual mode with a visible banner; no crash or blank screen. |
| 25 | Define manual mode as a first-class experience in the plan: its own section in `GameControls`, onboarding tooltip, and AC row. |
| 26 | Add a scope note: v1 is single-device/single-player. Real-time multiplayer (shared card seeds via URL) is a documented v2 possibility, not in scope. |
| 27 | Add a privacy caveat to the plan: "processed locally" means the Web Speech API implementation; in Chrome this may involve Google's speech service. Update privacy copy accordingly. |
| 28 | In `shareUtils.ts`, try `navigator.share()` first; fall back to `navigator.clipboard.writeText()`; fall back to a modal with a `<textarea>` pre-selected for manual copy. |
| 29 | Designate `useGame.ts` as the single source of game state. `GameContext.tsx` re-exports its values; it does not hold its own state. Document this boundary in the plan. |
| 30 | Use HTTPS in all dev and preview environments (Vite's `--https` flag or Vercel preview URLs). Document clipboard fallback for corporate environments. |
| 31 | Add `vercel.json` with SPA rewrite rule (`"rewrites": [{"source": "/(.*)", "destination": "/index.html"}]`) and security headers: `Content-Security-Policy`, `X-Frame-Options: DENY`, `Permissions-Policy: microphone=(self)`. |
| 32 | Add ARIA to `BingoCard`: `role="grid"` on the grid container, `role="gridcell"` on each square, `aria-label="[word], [state]"` on squares, `aria-live="polite"` region for auto-fill announcements, `aria-pressed` on the mic toggle. |
| 33 | Add exponential backoff and a retry cap (e.g. 5 attempts) to the `onend` auto-restart logic; after cap is reached, surface an error state rather than looping indefinitely. |
| 34 | Document Safari iOS quirks in the plan: stop after ~60s (restart on `visibilitychange`), no `interimResults` support on some versions. Add a Safari-specific restart strategy to `useSpeechRecognition`. |
| 35 | Change the 500ms AC to: "Auto-fill fires within one `onresult` final event of the spoken word, targeting <1s end-to-end on a stable connection." Remove the untestable 500ms figure. |
| 36 | Add AC rows for: card generation failure (show retry), clipboard blocked (show fallback textarea), localStorage quota exceeded (warn and disable persistence), confetti library load failure (silent fallback). |
| 37 | Add a "Review card" mode to `WinScreen` that shows the completed board before starting a new game. Add a "Replay same card" option that restores the same seed. |
| 38 | Defer alias map, native Share API, and one-away hints to a v1.1 milestone. Keep confetti in v1 as a delight feature but gate it behind reduced-motion. |
| 39 | Specify Toast duration (3 s default), pause-on-hover behaviour, and a max-stack of 3 Toasts with oldest-first dismissal to prevent stacking during rapid auto-fills. |
| 40 | Add loading state to card generation (spinner, ≥200ms artificial delay if instant to prevent flash) and a "Warming up mic…" disabled state on the Listen button before `SpeechRecognition.start()` resolves. |
| 41 | Define "Manual mode" banner: full-width info bar below the header, amber background, copy: "Microphone unavailable — tap squares to mark them manually." |
| 42 | Show a share preview modal before writing to clipboard: display the text payload, confirm "Copy to clipboard" button, then dismiss. |
| 43 | Keep the completed card visible on `WinScreen` as a read-only overlay beneath the BINGO banner. Add a "Hide results" toggle so users can reveal the card to colleagues. |
| 44 | Add `aria-pressed` and a non-color visual indicator (bold border + checkmark icon) to the selected category card. |
| 45 | Add a WCAG 2.1 AA compliance requirement to Acceptance Criteria. |
| 46 | Add basic event tracking (e.g. Plausible or a `console.log` stub) for: game started, bingo achieved, share clicked, mic enabled. Define one success metric: % of sessions reaching the win screen. |
| 47 | Dynamically import `canvas-confetti` inside `WinScreen` only (`import('canvas-confetti').then(...)`) to remove it from the initial bundle. |
| 48 | Add a compile-time uniqueness check in `categories.ts` (TypeScript tuple uniqueness) and a runtime assertion in `cardGenerator.ts` that throws if duplicates are detected. |
| 49 | Remove `GameContext.tsx`; pass game state via props or use a single `useGame` hook at the `App` level. Eliminates competing state ownership at this app's scale. |
| 50 | Add `content: ['./index.html', './src/**/*.{ts,tsx}']` to `tailwind.config.js` and verify purged bundle size in `vite build --report` before deploy. |
| 51 | Define a minimum square font size (11px) and a max word length (25 chars); truncate longer words with an ellipsis and show full text on hover/focus via `title` attribute. |
| 52 | Add a "Copied!" success state to the Share button (replace icon with checkmark for 2 s) on both clipboard and native share success paths. |

### Unresolved Items

- [ ] Real-time multiplayer (shared card seeds) — deferred to v2
- [ ] Custom word packs (user-defined buzzwords) — deferred to v2
- [ ] Analytics beyond stub logging — deferred to v1.1
- [ ] Native Share API on desktop — fallback approach sufficient for v1

---

## Phase 1 — Project Scaffold (20 min)

1. Bootstrap Vite + React + TypeScript project
2. Install deps: `canvas-confetti`, `tailwindcss`, `postcss`, `autoprefixer`
3. Configure Tailwind (`tailwind.config.js`, `postcss.config.js`, `index.css`)
4. Create folder structure:
   - `src/components/`
   - `src/hooks/`
   - `src/lib/`
   - `src/data/`
   - `src/types/`
   - `src/context/`
5. Write `src/types/index.ts` — all interfaces (`BingoSquare`, `BingoCard`, `GameState`, `WinningLine`, `SpeechRecognitionState`, `Toast`, `CategoryId`)
6. Write `src/data/categories.ts` — 3 buzzword packs (Agile 47 words, Corporate 45 words, Tech 45 words)

---

## Phase 2 — Core Game Logic (30 min)

7. `src/lib/cardGenerator.ts` — Fisher-Yates shuffle, 5×5 grid builder, free space at [2][2]
8. `src/lib/bingoChecker.ts` — check all 12 winning lines (5 rows + 5 cols + 2 diagonals), `getClosestToWin()` for "one away" hint
9. `src/lib/wordDetector.ts` — word-boundary regex for single words, substring match for phrases, alias map (CI/CD, MVP, ROI, API, DevOps)
10. `src/lib/shareUtils.ts` — build clipboard-ready text summary, trigger native Share API on mobile
11. `src/lib/utils.ts` — `cn()` className helper

---

## Phase 3 — UI Components (35 min)

12. `src/components/ui/Button.tsx` — base button with variant props
13. `src/components/ui/Toast.tsx` — auto-dismissing notification
14. `src/components/LandingPage.tsx` — hero, "New Game" CTA, how-it-works steps, privacy badge
15. `src/components/CategorySelect.tsx` — 3 category cards with icon, name, sample words, select button
16. `src/components/BingoSquare.tsx` — 5 states: default, filled (manual), auto-filled, free space, winning; click-to-toggle
17. `src/components/BingoCard.tsx` — 5×5 grid, passes `isWinningSquare` prop from `winningLine`
18. `src/components/TranscriptPanel.tsx` — pulsing mic indicator, last-100-chars transcript, detected-words chips
19. `src/components/GameControls.tsx` — New Card button, Listen/Stop toggle, fill counter
20. `src/components/GameBoard.tsx` — composes GameHeader + BingoCard + TranscriptPanel + GameControls
21. `src/components/WinScreen.tsx` — BINGO header, winning card with winning line highlighted, stats (time, winning word, squares filled, category), Share + Play Again buttons, confetti trigger

---

## Phase 4 — Hooks & State Wiring (20 min)

22. `src/hooks/useSpeechRecognition.ts` — Web Speech API wrapper: feature-detect, `continuous=true`, `interimResults=true`, auto-restart on `onend`, expose `startListening(onResult)` / `stopListening()` / `resetTranscript`
23. `src/hooks/useLocalStorage.ts` — typed get/set with JSON serialization, used to persist game state across refreshes
24. `src/hooks/useGame.ts` — orchestrates card state mutations: `fillSquare(row, col, isAuto)`, calls `checkForBingo()` after every fill, emits win event
25. `src/context/GameContext.tsx` — wraps app in context so Toast and other global state is accessible
26. `src/App.tsx` — screen router (`landing` → `category` → `game` → `win`), wires speech hook output → `detectWordsWithAliases()` → `fillSquare()`

---

## Phase 5 — Polish & Deploy (15 min)

27. Confetti on win — fire `canvas-confetti` from `WinScreen`, no sound by default
28. "One away" hint — pulse border on squares that would complete a winning line
29. localStorage persistence — save/restore game state so a browser refresh doesn't reset mid-game
30. Responsive layout — mobile-first card sizing, stacked layout on small screens
31. Microphone permission modal — custom prompt before browser dialog, with privacy copy ("processed locally, never recorded")
32. Firefox fallback — feature-detect `SpeechRecognition`; hide mic toggle and show "manual mode" banner
33. Vite build + deploy to Vercel via `vercel --prod`

---

## Acceptance Criteria

| Check | Target |
|---|---|
| Card generates with 24 unique words + free space | All 12 winning lines checked; no duplicates on card |
| BINGO detected on all 12 winning lines | 5 rows + 5 cols + 2 diagonals |
| Auto-fill fires within one `onresult` final event | Targeting <1s end-to-end on a stable connection |
| Mic off by default; privacy copy reflects browser reality | Chrome uses Google speech service — copy states "audio processed by your browser's speech engine" |
| Mic permission denied → manual mode with visible banner | No crash, no blank screen |
| Share copies result text to clipboard | Fallback textarea shown if clipboard is blocked; Slack/Teams/Discord compatible |
| Works on Chrome, Edge, Safari (with iOS restart strategy) | Firefox: manual-only fallback with info banner |
| WCAG 2.1 AA compliant | Keyboard nav, 4.5:1 contrast, no color-only state indicators, reduced-motion respected |
| All animations respect `prefers-reduced-motion` | Confetti replaced with static banner; pulse replaced with static border |
| localStorage persistence survives refresh | Schema versioned; stale state cleared on version mismatch |

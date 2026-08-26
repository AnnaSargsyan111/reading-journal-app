# Handoff Notes — Reading Journal App

Read this first in a new session, then `docs/PRD.md` for full product spec. This file
exists because no chat session carries memory into the next one — everything a fresh
session needs to know should be here or in the code/PRD.

## What this is

A personal reading journal web app for the Armenian market (Armenian + English UI).
Vite + React + TypeScript, no real backend — everything (auth, books, mystery orders)
is mocked via `localStorage`, structured so a real API could replace it later without
touching component code (all reads/writes go through `src/lib/*Store.ts` modules).

Run it: `npm install && npm run dev` (port 5173).

## Where things live

- `docs/PRD.md` — the full product spec, kept in sync with the app as decisions were
  made. Section numbers matter; other docs/commits reference them.
- `src/i18n/locales/{en,hy}.json` — every UI string, both languages, always in sync.
- `src/lib/authStore.ts`, `bookStore.ts`, `mysteryStore.ts` — the mock persistence
  layer, all `localStorage`-backed, all per-user-id keyed.
- `src/lib/mysteryEngine.ts` — the Mystery Book recommendation scoring/ranking logic.
- `src/lib/mysteryCatalog.ts` — a small hand-written catalog (10 books) standing in
  for the real curated catalog described in PRD §13.2 Signal D (Open Question #11 —
  nobody has decided who sources this yet).
- `src/pages/dashboard/MysteryBookPage.tsx` — the biggest, most actively-developed
  file. The whole Mystery Book quiz → result → checkout → confirmation → feedback
  flow lives here as one step-machine component (see the `Step` union type).

## Built and working (matches PRD)

- Full auth flow: Registration, Login, Forgot/Reset Password, onboarding gate
  ("Tell Us About Yourself" — About Me is required, Genre/Authors optional).
- Left-rail (desktop, hover-to-expand) / bottom nav (mobile) shell.
- About Me page (editable profile, Change Password modal).
- Books: add/edit/delete, search (autocomplete, collapses filter/sort while active),
  filter (status/genre/rating, popover), sort, card grid, empty state.
- Mystery Book: full quiz (mood → conditional genre → optional experience → mystery
  level), Cold-Start skip logic, both reveal branches (hidden / progressive
  sneak-peek with a "Change Book" cycle on the sneak-peek path only — explicitly
  *not* on the hidden path per user instruction), delivery address (required fields,
  phone number with fixed +374 prefix), payment UI (card fields, all disabled —
  no real processor), order confirmation, post-delivery feedback loop.
- Full design-token system in `src/index.css` (Forest/Sage/Plum/Ivory palette from
  the user's own spec) — light-only, no dark mode (deliberate).
- Toast notifications (top-right, slide in/out, 4s, color by variant).

## Known-incomplete / explicitly deferred

- No real payment processor, no real book catalog sourcing, no real backend.
- PRD §16 Open Questions #4, #9, #11, #12 are still unresolved product/legal
  decisions (non-returnable legality, fulfillment ownership, catalog sourcing, free
  vs. paid tier gating for Mystery Book).
- PRD §17 "Still to Spec": Subscription/payment plans, Reading Lists, nav/layout
  polish, paid stats/insights, About Me delivery-address field group.
- Mystery Book's §13.25/13.26 (No-Match / Out-of-Stock states) and §13.29 analytics
  events were consciously **not** built — flagged as lower priority, not forgotten.

## House rules established during this project (apply these without being asked again)

- **Punctuation**: single sentence → no trailing colon/period. Two clauses joined by
  a colon → colon goes at the end of the first clause. Multiple items joined by
  commas → no trailing colon. Watch for Armenian "։" (U+0589), which renders like a
  colon — same "no trailing mark on a single sentence" rule applies to it.
- **Validation error state**: always store a translation **key** in state, never the
  resolved `t(...)` string — otherwise switching languages while an error is showing
  leaves it frozen in the old language. Translate at render time:
  `error={errors.field ? t(errors.field) : undefined}`. This was a real bug found
  and fixed across every form in the app — keep following the pattern in any new form.
- Every mandatory-field action (Save/Continue) must show a red border + inline
  message on empty/invalid fields when clicked — never silently no-op.
- Book titles/authors are never translated (PRD §15) — a proper noun stays as typed
  regardless of active UI language.

## Session boundary

Work stopped mid-polish on the "Keep It a Mystery" (hidden reveal) branch — the
"Change Book" button was added then explicitly removed from that branch per user
feedback (kept only on the sneak-peek branch), and two Armenian copy strings were
just updated. No other cleanup is pending; the app was building and running cleanly
(`npx tsc -b` clean, no dev-server errors) as of this handoff.

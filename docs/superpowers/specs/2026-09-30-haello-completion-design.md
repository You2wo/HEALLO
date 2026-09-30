# Haello completion and responsive redesign

Date: 2026-09-30
Status: approved in conversation (scope B, preserve-and-finish)

## Goal

Haello is a portfolio piece. A recruiter should be able to open the live site,
get into a lived-in account in one click, and click through every screen
without hitting a dead end, on a phone or a desktop.

## Constraints

- Keep the existing brand: blue accent, Poppins, the pet artwork.
- No new paid services. Pet speech is scripted, not AI.
- Database stays Prisma Postgres. Schema changes ship as one migration that
  Vercel applies during build (`prisma migrate deploy`).

## What is broken today

- Vercel build fails: dynamic route handlers type `params` as an object, Next 15
  requires a Promise.
- Dead controls: About, the chat bubble, Save nickname, Deactivate account,
  Save and Share, the component-size slider (drives `transform: scale`).
- Pet is drag-only. `petApi` is never called, level and XP are unused.
- Home streak is computed from `localStorage`; the streak card reads the server.
- Dates are sent as local-midnight ISO strings and read with server-local
  getters, so a user east of UTC logs "today" against yesterday on Vercel.
- Goals never reset: a daily goal ticked once stays ticked forever.
- Scene artwork ships as three 16 MB SVGs with embedded PNGs.
- Layout is absolute-positioned widgets shrunk with `transform: scale`.

## Design

### Layout

- `AppShell` owns the nav for every page. Logged-out pages get a reduced nav.
- Home is a CSS grid:
  - 1024px and up: three columns (mood + goals, pet scene, streak + pet status).
  - 768 to 1023px: scene on top, widgets in two columns below.
  - under 768px: scene on top, bottom tab bar switching Mood / Goals / Pet.
- The pet scene sizes to its container, not the window.
- Tokens: one accent blue, radius 16px cards / 12px inputs / pill buttons,
  light and dark themes through CSS variables, `100dvh` for full-height screens.
- The component-size setting is removed. Font size stays and drives the root
  font size.

### Dates

The browser sends its local date as `YYYY-MM-DD` in an `X-Client-Date` header
and as the `date` field of mood and journal writes. The server stores days as
UTC midnight of that key and never uses local getters. The header is accepted
only when it is within one day of the server's UTC date.

### Pet progression

XP is computed on the server and cached on `PetSettings`:

| Source | XP |
|---|---|
| Each day with a mood logged | 10 |
| Each journal entry with notes | 5 |
| Each goal completion | 5 (un-ticking in the same period takes it back) |
| Every 7 days of longest streak | 20 |

Level n starts at `25 * n * (n - 1)` XP (level 2 at 50, 3 at 150, 4 at 300).
`PUT /api/pet` accepts only `petName`.

Goal completions are banked in `PetSettings.goalXp`, so deleting or resetting a
goal never lowers the pet's level.

### Goal periods

A completed goal resets when its period rolls over (Daily: next day, Weekly:
next Monday, Biweekly: 14 days, Monthly: next month). The reset happens when
goals are listed.

### Pet speech

One scripted line picked from today's state, in priority order: level up,
streak milestone, mood not logged, goals open, all done, greeting. Several
variants each, in `src/lib/speech.ts`. Tapping the pet shows the next line.

### Demo account

`POST /api/auth/demo` creates a private user flagged `isDemo`, seeded with
about three weeks of moods, journals, goals and a level-3 pet, and returns a
token. Demo users older than 24 hours are deleted on the next demo start.
Demo users see a badge and cannot deactivate.

### Account

- `PATCH /api/auth/me`: nickname, personalization category.
- `DELETE /api/auth/me`: requires the password, cascades all data.

### Schema changes

- `User.isDemo Boolean @default(false)`
- `User.personalization String?`
- `PetSettings.goalXp Int @default(0)`

### UI states

Skeletons while loading, composed empty states, inline form errors, an
`aria-live` toast for transient errors, a real dialog component replacing
`alert`, `confirm` and `prompt`.

## Testing

- Unit tests (vitest) for date keys, streak counting, XP and level math, goal
  period rollover, and speech selection.
- A local run against a local Postgres: demo login, log mood, toggle goal,
  rename, deactivate.
- `next build` and `eslint` clean.

## Out of scope

Mood insights, pet customisation, AI chat, sharing a streak image.

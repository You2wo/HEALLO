# Haello

A self-care web app with a virtual pet. Log your mood, keep a journal and tick off small routines; the pet earns experience and levels up as you do.

Live: https://haello.vercel.app (use **Try the Demo** for a pre-filled account).

## Features

- Mood calendar with one check-in per day and a journal entry attached to it
- Routines that reopen daily, weekly, every two weeks or monthly
- Streak counter based on consecutive logged days
- A pet (Phaser scene) that gains XP from your activity, levels up and reacts to your day
- A short questionnaire that suggests starter routines
- One-click demo account with three weeks of sample data
- Light and dark themes, adjustable font size, phone to desktop layouts

## Stack

Next.js 15 (App Router), React 19, TypeScript, Tailwind CSS 4, Prisma, PostgreSQL, Phaser 3.

## Running locally

Requires Node.js 20 or newer and a PostgreSQL database.

1. Install dependencies:

   ```bash
   npm install
   ```

2. Copy `.env.example` to `.env` and fill it in:

   ```
   DATABASE_URL="postgresql://user:password@host:5432/dbname"
   JWT_SECRET="a-long-random-string"
   ```

   For a throwaway local database, `npx prisma dev` starts one and prints its URL.

3. Create the tables:

   ```bash
   npx prisma migrate deploy
   ```

4. Start the dev server at http://localhost:3000:

   ```bash
   npm run dev
   ```

## Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Development server |
| `npm run build` | Production build |
| `npm run start` | Serve the production build |
| `npm test` | Unit tests (dates, streak, XP, goal periods, pet speech) |
| `npm run lint` | ESLint |

## How the pet earns XP

| Action | XP |
|---|---|
| Logging a mood for a day | 10 |
| Writing notes with it | 5 |
| Completing a routine | 5 |
| Every 7 days of longest streak | 20 |

Level `n` starts at `25 * n * (n - 1)` XP. XP is computed on the server in `src/lib/game.ts`; the client cannot set it.

## Project layout

- `src/app` - pages and API routes (`src/app/api`)
- `src/components` - UI components; `home/` holds the dashboard and the pet scene
- `src/lib` - API client, auth, date handling, XP and streak rules, pet speech
- `prisma` - schema and migrations
- `tests` - unit tests

## Deployment

Deployed on Vercel. The build command in `vercel.json` runs `prisma migrate deploy`, so new migrations are applied on each deploy. Set `DATABASE_URL` and `JWT_SECRET` in the Vercel project's environment variables.

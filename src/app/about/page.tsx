import type { Metadata } from "next";
import Link from "next/link";
import { AppShell } from "@/components/AppShell";
import { MOODS, MOOD_META } from "@/lib/moods";
import { XP } from "@/lib/progress";

export const metadata: Metadata = {
  title: "About",
  description: "What Haello is, how the pet grows, and what it is built with.",
};

const XP_RULES = [
  { xp: XP.mood, label: "for each day you log a mood" },
  { xp: XP.journalNotes, label: "for writing about your day" },
  { xp: XP.goal, label: "for each routine you finish" },
  { xp: XP.streakWeek, label: "for every 7 days of streak" },
];

const STACK = ["Next.js", "React", "TypeScript", "Tailwind CSS", "Prisma", "PostgreSQL", "Phaser"];

export default function AboutPage() {
  return (
    <AppShell>
      <div className="mx-auto max-w-6xl space-y-16 px-4 py-10 md:space-y-24 md:px-8 md:py-16">
        {/* Intro */}
        <section className="grid items-center gap-10 md:grid-cols-2">
          <div>
            <h1 className="mb-5 text-4xl font-bold leading-tight md:text-5xl">
              A small pet that grows when you look after yourself
            </h1>
            <p className="mb-8 max-w-[52ch] text-lg text-muted">
              Haello turns three daily habits into one place: checking in on your mood, writing a few lines, and keeping
              small routines.
            </p>
            <Link href="/" className="btn btn-primary">
              Open Haello
            </Link>
          </div>
          <div className="relative aspect-[4/3] overflow-hidden rounded-card shadow-pop">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/scene/environment.webp"
              alt=""
              width={1920}
              height={1367}
              fetchPriority="high"
              className="absolute inset-0 size-full object-cover object-bottom"
            />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/pet.svg"
              alt="Heallo, the pet, standing in a sunny room"
              width={120}
              height={200}
              className="absolute bottom-[5%] left-1/2 h-[58%] w-auto -translate-x-1/2"
            />
          </div>
        </section>

        {/* A day in Haello */}
        <section aria-labelledby="day-heading">
          <h2 id="day-heading" className="mb-8 text-3xl font-bold">
            What a day looks like
          </h2>
          <div className="grid gap-4 md:grid-cols-5 md:grid-rows-2">
            <div className="flex flex-col justify-between gap-8 rounded-card bg-accent-soft p-6 md:col-span-3 md:row-span-2 md:p-10">
              <div>
                <h3 className="mb-2 text-2xl font-bold">Check in with a mood</h3>
                <p className="max-w-[45ch] text-muted">
                  Pick how today feels. The calendar fills in one day at a time, so a month reads at a glance.
                </p>
              </div>
              <ul className="flex flex-wrap gap-5">
                {MOODS.map((mood) => (
                  <li key={mood} className="flex flex-col items-center gap-1.5 text-sm font-medium">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={MOOD_META[mood].icon} alt="" width={48} height={48} loading="lazy" className="size-12" />
                    {MOOD_META[mood].label}
                  </li>
                ))}
              </ul>
            </div>
            <div className="card p-6 md:col-span-2">
              <h3 className="mb-2 text-xl font-bold">Write it down</h3>
              <p className="text-muted">Add a few lines to any check-in. The journal keeps every entry by day.</p>
            </div>
            <div className="rounded-card bg-streak p-6 text-white md:col-span-2">
              <h3 className="mb-2 text-xl font-bold">Keep small routines</h3>
              <p>
                A short questionnaire suggests routines that fit you. They reopen each day, week or month, and every
                consecutive day builds your streak.
              </p>
            </div>
          </div>
        </section>

        {/* Pet growth */}
        <section aria-labelledby="growth-heading" className="grid gap-8 md:grid-cols-[minmax(0,0.8fr)_1fr] md:items-center">
          <div>
            <h2 id="growth-heading" className="mb-4 text-3xl font-bold">
              How your pet grows
            </h2>
            <p className="max-w-[48ch] text-muted">
              Everything you do earns experience for your pet. It levels up as you go, and it has something to say about
              your day when you tap it.
            </p>
          </div>
          <dl className="grid grid-cols-2 gap-x-6 gap-y-8">
            {XP_RULES.map((rule) => (
              <div key={rule.label}>
                <dt className="text-4xl font-bold text-accent tabular-nums">+{rule.xp} XP</dt>
                <dd className="text-muted">{rule.label}</dd>
              </div>
            ))}
          </dl>
        </section>

        {/* Built with */}
        <section aria-labelledby="built-heading" className="border-t border-line pt-10">
          <h2 id="built-heading" className="mb-4 text-3xl font-bold">
            How it is built
          </h2>
          <p className="mb-6 max-w-[65ch] text-muted">
            Haello is a full-stack web app. The interface and the API live in one Next.js project, data is stored in
            PostgreSQL through Prisma, and the pet scene runs on Phaser.
          </p>
          <ul className="mb-8 flex flex-wrap gap-2">
            {STACK.map((item) => (
              <li key={item} className="rounded-full border border-line px-4 py-1.5 text-sm font-medium" translate="no">
                {item}
              </li>
            ))}
          </ul>
          <a href="https://github.com/You2wo/HEALLO" className="font-semibold text-accent underline" rel="noreferrer">
            View the source on GitHub
          </a>
        </section>
      </div>
    </AppShell>
  );
}

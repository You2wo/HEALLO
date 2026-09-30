"use client";

import React, { useId, useState } from "react";
import { Fire } from "@phosphor-icons/react";
import { Dialog } from "@/components/ui/Dialog";
import type { GameState } from "@/lib/api";

const dayWord = (days: number) => (days === 1 ? "day" : "days");

export const StreakCard: React.FC<{ streak: GameState["streak"] | null }> = ({ streak }) => {
  const [open, setOpen] = useState(false);

  if (!streak) return <div className="skeleton h-24 rounded-card" aria-busy="true" />;

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex w-full items-center gap-4 rounded-card bg-streak p-5 text-left text-white shadow-card transition-transform hover:scale-[1.02] active:scale-[0.98]"
        aria-label={`Streak: ${streak.current} ${dayWord(streak.current)}. Show details`}
      >
        <Fire size={40} weight="fill" aria-hidden="true" />
        <span>
          <span className="block text-sm font-medium opacity-90">Streak</span>
          <span className="block text-3xl font-bold leading-tight tabular-nums">
            {streak.current} <span className="text-base font-medium">{dayWord(streak.current)}</span>
          </span>
        </span>
      </button>

      <Dialog open={open} onClose={() => setOpen(false)} title="Your streak" hideTitle width="26rem">
        <div className="text-center">
          <p className="text-muted">
            {streak.current > 0 ? "Congrats, you are on a" : "Log your mood today to start a"}
          </p>
          <p className="mb-6 text-4xl font-bold tabular-nums">
            {streak.current > 0 ? `${streak.current}-Day Streak!` : "New Streak"}
          </p>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/modalstreak.svg" alt="" width={186} height={208} loading="lazy" className="mx-auto mb-6 h-48 w-auto" />
          <p className="text-muted">
            Longest streak:{" "}
            <span className="font-semibold text-ink tabular-nums">
              {streak.longest} {dayWord(streak.longest)}
            </span>
          </p>
          <button type="button" className="btn btn-primary mt-6" onClick={() => setOpen(false)}>
            Keep It Going
          </button>
        </div>
      </Dialog>
    </>
  );
};

export const PetStatus: React.FC<{ pet: GameState["pet"] | null }> = ({ pet }) => {
  const headingId = useId();
  if (!pet) return <div className="skeleton h-36 rounded-card" aria-busy="true" />;

  const percent = Math.round((pet.xpIntoLevel / pet.xpForNextLevel) * 100);

  return (
    <section className="card p-5" aria-labelledby={headingId}>
      <div className="flex items-center gap-4">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/tiny.svg" alt="" width={56} height={56} className="size-14 shrink-0 rounded-full bg-accent-soft p-1.5" />
        <div className="min-w-0">
          <h2 id={headingId} className="truncate text-xl font-bold" translate="no">
            {pet.name}
          </h2>
          <p className="text-sm text-muted">Level {pet.level}</p>
        </div>
      </div>

      <div
        role="progressbar"
        aria-label={`Progress to level ${pet.level + 1}`}
        aria-valuenow={pet.xpIntoLevel}
        aria-valuemin={0}
        aria-valuemax={pet.xpForNextLevel}
        className="mt-4 h-2.5 overflow-hidden rounded-full bg-surface-2"
      >
        <div
          className="h-full origin-left rounded-full bg-accent transition-transform duration-700"
          style={{ transform: `scaleX(${percent / 100})` }}
        />
      </div>
      <p className="mt-2 text-sm text-muted tabular-nums">
        {pet.xpIntoLevel} / {pet.xpForNextLevel} XP to level {pet.level + 1}
      </p>
      <p className="mt-3 text-xs text-muted">Log your mood, write in your journal and finish routines to help {pet.name} grow.</p>
    </section>
  );
};

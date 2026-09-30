"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { CaretLeft, CaretRight, Check } from "@phosphor-icons/react";
import { journalApi, type GameState, type Journal } from "@/lib/api";
import { localDateKey } from "@/lib/dates";
import { MOODS, MOOD_META, type Mood } from "@/lib/moods";
import { MoodEntryDialog } from "./MoodEntryDialog";

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const monthFormat = new Intl.DateTimeFormat("en", { month: "long", timeZone: "UTC" });

const pad = (n: number) => String(n).padStart(2, "0");

interface MoodCalendarProps {
  onGame: (game: GameState) => void;
}

export const MoodCalendar: React.FC<MoodCalendarProps> = ({ onGame }) => {
  const todayKey = useMemo(() => localDateKey(), []);
  const [year, month] = todayKey.split("-").map(Number);
  // The month on screen, counted in months since year 0.
  const [viewIndex, setViewIndex] = useState(year * 12 + (month - 1));
  const [journals, setJournals] = useState<Record<string, Journal>>({});
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);

  const viewYear = Math.floor(viewIndex / 12);
  const viewMonth = (viewIndex % 12) + 1;
  const isCurrentMonth = viewIndex === year * 12 + (month - 1);

  const load = useCallback(async () => {
    setLoading(true);
    setFailed(false);
    try {
      const response = await journalApi.getAll({ month: viewMonth, year: viewYear });
      setJournals(Object.fromEntries(response.journals.map((j) => [j.date.slice(0, 10), j])));
    } catch {
      setFailed(true);
    } finally {
      setLoading(false);
    }
  }, [viewMonth, viewYear]);

  useEffect(() => {
    load();
  }, [load]);

  const firstDay = new Date(Date.UTC(viewYear, viewMonth - 1, 1));
  const daysInMonth = new Date(Date.UTC(viewYear, viewMonth, 0)).getUTCDate();
  const leadingBlanks = (firstDay.getUTCDay() + 6) % 7;
  const todayEntry = journals[todayKey];

  return (
    <section className="card p-5 md:p-6" aria-labelledby="mood-heading">
      {/* Header */}
      <div className="mb-4 flex items-end justify-between gap-2">
        <div>
          <p className="text-sm text-muted">Mood Tracking</p>
          <h2 id="mood-heading" className="text-2xl font-bold">
            {monthFormat.format(firstDay)} <span className="font-normal text-muted">{viewYear}</span>
          </h2>
        </div>
        <div className="flex">
          <button type="button" className="icon-btn" onClick={() => setViewIndex(viewIndex - 1)} aria-label="Previous month">
            <CaretLeft size={20} aria-hidden="true" />
          </button>
          <button
            type="button"
            className="icon-btn disabled:opacity-40"
            onClick={() => setViewIndex(viewIndex + 1)}
            disabled={isCurrentMonth}
            aria-label="Next month"
          >
            <CaretRight size={20} aria-hidden="true" />
          </button>
        </div>
      </div>

      {/* Mood Calendar Grid */}
      <div className="grid grid-cols-7 justify-items-center gap-y-2 text-center" aria-busy={loading}>
        {WEEKDAYS.map((day) => (
          <span key={day} className="text-xs font-medium text-muted">
            {day}
          </span>
        ))}
        {Array.from({ length: leadingBlanks }, (_, i) => (
          <span key={`blank-${i}`} />
        ))}
        {Array.from({ length: daysInMonth }, (_, i) => {
          const day = i + 1;
          const key = `${viewYear}-${pad(viewMonth)}-${pad(day)}`;
          const mood: Mood | undefined = journals[key]?.mood;
          const isToday = key === todayKey;
          const label = `${monthFormat.format(firstDay)} ${day}: ${mood ? MOOD_META[mood].label : "no mood logged"}`;
          const circle = (
            <span
              className={`flex size-8 items-center justify-center rounded-full text-xs font-semibold ${
                loading ? "skeleton rounded-full" : ""
              } ${isToday ? "ring-2 ring-accent ring-offset-2 ring-offset-surface" : ""}`}
              style={loading ? undefined : { background: mood ? MOOD_META[mood].color : "var(--mood-none)" }}
            >
              {!loading &&
                (mood ? (
                  <Check size={14} weight="bold" color="#fff" aria-hidden="true" />
                ) : (
                  <span className={key > todayKey ? "opacity-40" : ""}>{day}</span>
                ))}
            </span>
          );

          return isToday ? (
            <button
              key={key}
              type="button"
              onClick={() => setDialogOpen(true)}
              className="rounded-full transition-transform hover:scale-110"
              aria-label={`${label}. Today, open to ${mood ? "edit" : "log"}`}
            >
              {circle}
            </button>
          ) : (
            <span key={key} role="img" aria-label={label} title={mood ? MOOD_META[mood].label : undefined}>
              {circle}
            </span>
          );
        })}
      </div>

      {failed && (
        <p className="mt-4 text-sm text-danger">
          Could not load this month.{" "}
          <button type="button" className="font-semibold underline" onClick={load}>
            Try again
          </button>
        </p>
      )}

      {/* Legend */}
      <ul className="mt-5 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted">
        {MOODS.map((mood) => (
          <li key={mood} className="flex items-center gap-1.5">
            <span className="size-2.5 rounded-full" style={{ background: MOOD_META[mood].color }} aria-hidden="true" />
            {MOOD_META[mood].label}
          </li>
        ))}
      </ul>

      <button type="button" className="btn btn-primary mt-5 w-full" onClick={() => setDialogOpen(true)}>
        {todayEntry ? "Edit Today's Entry" : "Log Today's Mood"}
      </button>

      <MoodEntryDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        dateKey={todayKey}
        existing={todayEntry}
        onSaved={(journal, game) => {
          setViewIndex(year * 12 + (month - 1));
          setJournals((current) => ({ ...current, [todayKey]: journal }));
          onGame(game);
        }}
      />
    </section>
  );
};

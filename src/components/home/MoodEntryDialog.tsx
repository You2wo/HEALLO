"use client";

import React, { useEffect, useState } from "react";
import { Dialog } from "@/components/ui/Dialog";
import { useToast } from "@/components/ui/Toast";
import { journalApi, type GameState, type Journal } from "@/lib/api";
import { parseDateKey } from "@/lib/dates";
import { MOODS, MOOD_META, type Mood } from "@/lib/moods";

interface MoodEntryDialogProps {
  open: boolean;
  onClose: () => void;
  // The day being logged, as a YYYY-MM-DD key.
  dateKey: string;
  existing?: Journal;
  onSaved: (journal: Journal, game: GameState) => void;
}

const weekdayFormat = new Intl.DateTimeFormat("en", { weekday: "long", timeZone: "UTC" });
const dayFormat = new Intl.DateTimeFormat("en", { month: "long", day: "numeric", timeZone: "UTC" });

export const MoodEntryDialog: React.FC<MoodEntryDialogProps> = ({ open, onClose, dateKey, existing, onSaved }) => {
  const [mood, setMood] = useState<Mood | null>(null);
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const toast = useToast();

  useEffect(() => {
    if (open) {
      setMood(existing?.mood ?? null);
      setNotes(existing?.notes ?? "");
    }
  }, [open, existing]);

  const date = parseDateKey(dateKey);

  const handleSave = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!mood) return;
    setSaving(true);
    try {
      const { journal, ...game } = await journalApi.save({ date: dateKey, mood, notes });
      onSaved(journal, game);
      onClose();
    } catch (error) {
      toast(error instanceof Error ? error.message : "Could not save your entry. Please try again.", "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} title="How are you feeling today?" width="46rem">
      <form onSubmit={handleSave} className="grid gap-8 md:grid-cols-[14rem_1fr]">
        {/* Date and mascot */}
        <div className="hidden flex-col justify-between rounded-card bg-accent-soft p-5 md:flex">
          <p>
            <span className="block text-muted">{weekdayFormat.format(date)},</span>
            <span className="block text-2xl font-bold">{dayFormat.format(date)}</span>
          </p>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/pet-wave.svg" alt="" width={145} height={170} className="mx-auto mt-6 h-40 w-auto" />
        </div>

        <div>
          <p className="mb-4 text-muted md:hidden">
            {weekdayFormat.format(date)}, {dayFormat.format(date)}
          </p>

          {/* Mood Selection */}
          <fieldset>
            <legend className="sr-only">Mood</legend>
            <div className="grid grid-cols-5 gap-2">
              {MOODS.map((option) => {
                const meta = MOOD_META[option];
                const selected = mood === option;
                return (
                  <label
                    key={option}
                    className={`flex cursor-pointer flex-col items-center gap-2 rounded-field border-2 px-1 py-3 text-sm font-medium transition-colors has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-accent ${
                      selected ? "border-accent bg-accent-soft" : "border-line hover:border-accent"
                    }`}
                  >
                    <input
                      type="radio"
                      name="mood"
                      value={option}
                      checked={selected}
                      onChange={() => setMood(option)}
                      className="sr-only"
                    />
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={meta.icon} alt="" width={40} height={40} className="size-9 sm:size-10" />
                    {meta.label}
                  </label>
                );
              })}
            </div>
          </fieldset>

          {/* Notes Section */}
          <label htmlFor="journal-notes" className="label mt-6">
            How was your day? <span className="font-normal text-muted">(optional)</span>
          </label>
          <textarea
            id="journal-notes"
            name="notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            maxLength={2000}
            rows={5}
            placeholder="Tell us about your day…"
            className="field resize-none"
          />

          <div className="mt-6 flex justify-end">
            <button type="submit" className="btn btn-primary" disabled={!mood || saving}>
              {saving ? "Saving…" : "Save Journal"}
            </button>
          </div>
        </div>
      </form>
    </Dialog>
  );
};

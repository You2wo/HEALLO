"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { CaretLeft, CaretRight, PencilSimple, Trash } from "@phosphor-icons/react";
import { AppShell, RequireAuth } from "@/components/AppShell";
import { ConfirmDialog, Dialog } from "@/components/ui/Dialog";
import { useToast } from "@/components/ui/Toast";
import { journalApi, type Journal } from "@/lib/api";
import { localDateKey, parseDateKey } from "@/lib/dates";
import { MOODS, MOOD_META, type Mood } from "@/lib/moods";

const monthFormat = new Intl.DateTimeFormat("en", { month: "long", year: "numeric", timeZone: "UTC" });
const dayFormat = new Intl.DateTimeFormat("en", { weekday: "long", month: "long", day: "numeric", timeZone: "UTC" });
const weekdayFormat = new Intl.DateTimeFormat("en", { weekday: "short", timeZone: "UTC" });

const journalDate = (journal: Journal) => parseDateKey(journal.date.slice(0, 10));
const errorText = (error: unknown, fallback: string) => (error instanceof Error ? error.message : fallback);

function JournalView() {
  const [year, month] = useMemo(() => localDateKey().split("-").map(Number), []);
  const currentIndex = year * 12 + (month - 1);
  const [viewIndex, setViewIndex] = useState(currentIndex);
  const [journals, setJournals] = useState<Journal[] | null>(null);
  const [failed, setFailed] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [busy, setBusy] = useState(false);
  const toast = useToast();

  const viewYear = Math.floor(viewIndex / 12);
  const viewMonth = (viewIndex % 12) + 1;

  // Load journal data from backend
  const load = useCallback(async () => {
    setJournals(null);
    setFailed(false);
    try {
      const response = await journalApi.getAll({ month: viewMonth, year: viewYear });
      setJournals(response.journals);
      // Auto-select the latest entry on wide screens; phones start on the list.
      setSelectedId(window.matchMedia("(min-width: 1024px)").matches ? response.journals[0]?.id ?? null : null);
    } catch {
      setJournals([]);
      setFailed(true);
    }
  }, [viewMonth, viewYear]);

  useEffect(() => {
    load();
  }, [load]);

  const selected = journals?.find((journal) => journal.id === selectedId) ?? null;

  const handleDelete = async () => {
    if (!selected) return;
    setBusy(true);
    try {
      await journalApi.delete(selected.id);
      setJournals((current) => current?.filter((journal) => journal.id !== selected.id) ?? null);
      setSelectedId(null);
      setDeleting(false);
    } catch (error) {
      toast(errorText(error, "Could not delete that entry. Please try again."), "error");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mx-auto max-w-6xl p-4 md:p-8">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-4xl font-bold">Journal</h1>
          <p className="text-muted">{monthFormat.format(new Date(Date.UTC(viewYear, viewMonth - 1, 1)))}</p>
        </div>
        <div className="flex">
          <button type="button" className="icon-btn" onClick={() => setViewIndex(viewIndex - 1)} aria-label="Previous month">
            <CaretLeft size={20} aria-hidden="true" />
          </button>
          <button
            type="button"
            className="icon-btn disabled:opacity-40"
            onClick={() => setViewIndex(viewIndex + 1)}
            disabled={viewIndex === currentIndex}
            aria-label="Next month"
          >
            <CaretRight size={20} aria-hidden="true" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,22rem)_minmax(0,1fr)]">
        {/* Entry list: hidden on phones while an entry is open */}
        <div className={selected ? "hidden min-w-0 lg:block" : "min-w-0"}>
          {journals === null ? (
            <div className="space-y-3" aria-busy="true">
              <span className="sr-only">Loading…</span>
              <div className="skeleton h-16" />
              <div className="skeleton h-16" />
              <div className="skeleton h-16" />
            </div>
          ) : failed ? (
            <div className="card p-6 text-center">
              <p className="mb-4 text-danger">Could not load your journal.</p>
              <button type="button" className="btn btn-secondary" onClick={load}>
                Try Again
              </button>
            </div>
          ) : journals.length === 0 ? (
            <div className="card p-8 text-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/tiny.svg" alt="" width={80} height={80} className="mx-auto mb-4 size-24" />
              <p className="font-semibold">No entries this month</p>
              <p className="mb-5 text-sm text-muted">
                {viewIndex === currentIndex
                  ? "Log today's mood on the home page and it will show up here."
                  : "Use the arrows to look at another month."}
              </p>
              {viewIndex === currentIndex && (
                <Link href="/" className="btn btn-primary">
                  Log Today&apos;s Mood
                </Link>
              )}
            </div>
          ) : (
            <ul className="space-y-2">
              {journals.map((journal) => {
                const meta = MOOD_META[journal.mood];
                const active = journal.id === selectedId;
                return (
                  <li key={journal.id}>
                    <button
                      type="button"
                      onClick={() => setSelectedId(journal.id)}
                      aria-current={active ? "true" : undefined}
                      className={`flex w-full items-center gap-3 rounded-field border p-3 text-left transition-colors ${
                        active ? "border-accent bg-accent-soft" : "border-line bg-surface hover:border-accent"
                      }`}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={meta.icon} alt={meta.label} width={36} height={36} loading="lazy" className="size-9 shrink-0" />
                      <span className="min-w-0 flex-1">
                        <span className="block font-semibold">{weekdayFormat.format(journalDate(journal))} {journalDate(journal).getUTCDate()}</span>
                        <span className="block truncate text-sm text-muted">{journal.notes || "No notes"}</span>
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {/* Journal Entry */}
        <div className={selected ? "min-w-0" : "hidden min-w-0 lg:block"}>
          {selected ? (
            <article className="card p-5 md:p-8">
              <button type="button" className="btn btn-ghost -ml-3 mb-3 px-3 py-1.5 lg:hidden" onClick={() => setSelectedId(null)}>
                <CaretLeft size={18} aria-hidden="true" />
                All Entries
              </button>
              {/* Date and Mood Header */}
              <div className="mb-6 flex items-start gap-4">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={MOOD_META[selected.mood].icon} alt="" width={64} height={64} className="size-14 shrink-0 md:size-16" />
                <div className="min-w-0 flex-1">
                  <h2 className="text-2xl font-bold">{dayFormat.format(journalDate(selected))}</h2>
                  <p className="text-muted">Feeling {MOOD_META[selected.mood].label.toLowerCase()}</p>
                </div>
                {/* Action Buttons */}
                <div className="flex shrink-0">
                  <button type="button" className="icon-btn" onClick={() => setEditing(true)} aria-label="Edit entry">
                    <PencilSimple size={20} aria-hidden="true" />
                  </button>
                  <button type="button" className="icon-btn hover:text-danger" onClick={() => setDeleting(true)} aria-label="Delete entry">
                    <Trash size={20} aria-hidden="true" />
                  </button>
                </div>
              </div>

              {/* Journal Text */}
              {selected.notes ? (
                <p className="max-w-[65ch] whitespace-pre-wrap break-words text-lg leading-relaxed">{selected.notes}</p>
              ) : (
                <p className="text-muted">
                  No notes for this day.{" "}
                  <button type="button" className="font-semibold text-accent underline" onClick={() => setEditing(true)}>
                    Add some
                  </button>
                </p>
              )}
            </article>
          ) : (
            journals !== null &&
            journals.length > 0 && (
              <div className="card flex h-full min-h-48 items-center justify-center p-8 text-muted">
                Select a day to read its entry
              </div>
            )
          )}
        </div>
      </div>

      <EditEntryDialog
        journal={editing ? selected : null}
        onClose={() => setEditing(false)}
        onSaved={(saved) => {
          setJournals((current) => current?.map((journal) => (journal.id === saved.id ? saved : journal)) ?? null);
          setEditing(false);
        }}
      />

      <ConfirmDialog
        open={deleting}
        onClose={() => setDeleting(false)}
        onConfirm={handleDelete}
        title="Delete this entry?"
        message="The journal entry and its mood will be removed from your calendar. This cannot be undone."
        confirmLabel="Delete Entry"
        danger
        busy={busy}
      />
    </div>
  );
}

function EditEntryDialog({
  journal,
  onClose,
  onSaved,
}: {
  journal: Journal | null;
  onClose: () => void;
  onSaved: (journal: Journal) => void;
}) {
  const [mood, setMood] = useState<Mood>("good");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (journal) {
      setMood(journal.mood);
      setNotes(journal.notes ?? "");
      setError("");
    }
  }, [journal]);

  const handleSave = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!journal) return;
    setSaving(true);
    setError("");
    try {
      const response = await journalApi.update(journal.id, { mood, notes });
      onSaved(response.journal);
    } catch (err) {
      setError(errorText(err, "Could not save the entry. Please try again."));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={journal !== null} onClose={onClose} title="Edit Entry">
      <form onSubmit={handleSave}>
        <label htmlFor="edit-mood" className="label">
          Mood
        </label>
        <select id="edit-mood" name="mood" value={mood} onChange={(e) => setMood(e.target.value as Mood)} className="field">
          {MOODS.map((option) => (
            <option key={option} value={option}>
              {MOOD_META[option].label}
            </option>
          ))}
        </select>

        <label htmlFor="edit-notes" className="label mt-5">
          Notes
        </label>
        <textarea
          id="edit-notes"
          name="notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          maxLength={2000}
          rows={7}
          className="field resize-none"
        />

        {error && (
          <p role="alert" className="mt-4 text-sm text-danger">
            {error}
          </p>
        )}

        <div className="mt-8 flex justify-end gap-3">
          <button type="button" className="btn btn-ghost" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" className="btn btn-primary" disabled={saving}>
            {saving ? "Saving…" : "Save Entry"}
          </button>
        </div>
      </form>
    </Dialog>
  );
}

export default function JournalPage() {
  return (
    <AppShell>
      <RequireAuth>
        <JournalView />
      </RequireAuth>
    </AppShell>
  );
}

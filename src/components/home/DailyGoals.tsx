"use client";

import React, { useEffect, useState } from "react";
import { Check, PencilSimple, Plus, Trash } from "@phosphor-icons/react";
import { ConfirmDialog, Dialog } from "@/components/ui/Dialog";
import { useToast } from "@/components/ui/Toast";
import { goalApi, type GameState, type Goal } from "@/lib/api";
import { GOAL_PERIODS } from "@/lib/progress";

const PERIOD_LABEL: Record<string, string> = {
  Daily: "today",
  Weekly: "this week",
  Biweekly: "every 2 weeks",
  Monthly: "this month",
};

interface DailyGoalsProps {
  // null while the first load is in flight
  goals: Goal[] | null;
  onGoals: (goals: Goal[]) => void;
  onGame: (game: GameState) => void;
}

const errorText = (error: unknown, fallback: string) => (error instanceof Error ? error.message : fallback);

export const DailyGoals: React.FC<DailyGoalsProps> = ({ goals, onGoals, onGame }) => {
  const [editing, setEditing] = useState<Goal | "new" | null>(null);
  const [deleting, setDeleting] = useState<Goal | null>(null);
  const [busy, setBusy] = useState(false);
  const toast = useToast();

  const list = goals ?? [];
  const doneCount = list.filter((goal) => goal.completed).length;

  const toggleGoal = async (goal: Goal) => {
    // Update local state optimistically
    const flip = (completed: boolean) => onGoals(list.map((g) => (g.id === goal.id ? { ...g, completed } : g)));
    flip(!goal.completed);
    try {
      onGame(await goalApi.toggle(goal.id));
    } catch (error) {
      flip(goal.completed);
      toast(errorText(error, "Could not update that goal. Please try again."), "error");
    }
  };

  const handleDelete = async () => {
    if (!deleting) return;
    setBusy(true);
    try {
      await goalApi.delete(deleting.id);
      onGoals(list.filter((g) => g.id !== deleting.id));
      setDeleting(null);
    } catch (error) {
      toast(errorText(error, "Could not delete that goal. Please try again."), "error");
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="card p-5 md:p-6" aria-labelledby="goals-heading">
      {/* Header */}
      <div className="mb-4 flex items-baseline justify-between gap-2">
        <h2 id="goals-heading" className="text-2xl font-bold">
          Daily Goals
        </h2>
        {list.length > 0 && (
          <p className="text-sm text-muted tabular-nums">
            {doneCount} of {list.length} done
          </p>
        )}
      </div>

      {/* Goals List */}
      {goals === null ? (
        <div className="space-y-3" aria-busy="true">
          <div className="skeleton h-16" />
          <div className="skeleton h-16" />
        </div>
      ) : list.length === 0 ? (
        <div className="rounded-field border border-dashed border-line px-4 py-6 text-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/addroutinemodal.svg" alt="" width={66} height={80} className="mx-auto mb-3 h-20 w-auto" />
          <p className="font-semibold">No routines yet</p>
          <p className="text-sm text-muted">Add one small thing you want to do regularly.</p>
        </div>
      ) : (
        <ul className="space-y-3">
          {list.map((goal) => (
            <li
              key={goal.id}
              className={`flex items-start gap-3 rounded-field border p-3 transition-colors ${
                goal.completed ? "border-line bg-surface-2" : "border-line"
              }`}
            >
              {/* Checkbox */}
              <button
                type="button"
                role="checkbox"
                aria-checked={goal.completed}
                aria-label={goal.title}
                onClick={() => toggleGoal(goal)}
                className={`mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-lg border-2 transition-colors ${
                  goal.completed ? "border-accent bg-accent text-on-accent" : "border-accent hover:bg-accent-soft"
                }`}
              >
                {goal.completed && <Check size={16} weight="bold" aria-hidden="true" />}
              </button>

              {/* Content */}
              <div className="min-w-0 flex-1">
                <p className={`font-semibold break-words ${goal.completed ? "text-muted line-through" : ""}`}>
                  {goal.title} {goal.icon && <span aria-hidden="true">{goal.icon}</span>}
                </p>
                {goal.description && !goal.completed && (
                  <p className="text-sm text-muted break-words">{goal.description}</p>
                )}
                <p className="mt-0.5 text-xs font-medium text-accent">{PERIOD_LABEL[goal.period] ?? goal.period}</p>
              </div>

              <div className="flex shrink-0">
                <button type="button" className="icon-btn size-8" onClick={() => setEditing(goal)} aria-label={`Edit ${goal.title}`}>
                  <PencilSimple size={17} aria-hidden="true" />
                </button>
                <button
                  type="button"
                  className="icon-btn size-8 hover:text-danger"
                  onClick={() => setDeleting(goal)}
                  aria-label={`Delete ${goal.title}`}
                >
                  <Trash size={17} aria-hidden="true" />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {/* Add New Routine Button */}
      <button type="button" className="btn btn-secondary mt-4 w-full" onClick={() => setEditing("new")}>
        <Plus size={18} weight="bold" aria-hidden="true" />
        Add New Routine
      </button>

      <GoalDialog
        target={editing}
        onClose={() => setEditing(null)}
        onSaved={(saved) => {
          onGoals(list.some((g) => g.id === saved.id) ? list.map((g) => (g.id === saved.id ? saved : g)) : [...list, saved]);
          setEditing(null);
        }}
      />

      <ConfirmDialog
        open={deleting !== null}
        onClose={() => setDeleting(null)}
        onConfirm={handleDelete}
        title="Delete this routine?"
        message={`"${deleting?.title ?? ""}" will be removed. XP your pet already earned from it stays.`}
        confirmLabel="Delete Routine"
        danger
        busy={busy}
      />
    </section>
  );
};

interface GoalDialogProps {
  target: Goal | "new" | null;
  onClose: () => void;
  onSaved: (goal: Goal) => void;
}

const GoalDialog: React.FC<GoalDialogProps> = ({ target, onClose, onSaved }) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [period, setPeriod] = useState<string>("Daily");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const isEdit = target !== null && target !== "new";

  useEffect(() => {
    if (target === null) return;
    const goal = target === "new" ? null : target;
    setTitle(goal?.title ?? "");
    setDescription(goal?.description ?? "");
    setPeriod(goal?.period ?? "Daily");
    setError("");
  }, [target]);

  const handleSave = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!title.trim()) {
      setError("Give your routine a name.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      const payload = { title, description, period };
      const { goal } = isEdit ? await goalApi.update(target.id, payload) : await goalApi.create({ ...payload, icon: "🌱" });
      onSaved(goal);
    } catch (err) {
      setError(errorText(err, "Could not save the routine. Please try again."));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={target !== null} onClose={onClose} title={isEdit ? "Edit Your Routine" : "Make a New Routine"}>
      <form onSubmit={handleSave} noValidate>
        <label htmlFor="routine-name" className="label">
          Routine name
        </label>
        <input
          id="routine-name"
          name="title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          maxLength={80}
          autoComplete="off"
          aria-invalid={!!error && !title.trim()}
          aria-describedby={error ? "routine-error" : undefined}
          placeholder="Take a 15-minute walk…"
          className="field"
        />

        <label htmlFor="routine-description" className="label mt-5">
          Description <span className="font-normal text-muted">(optional)</span>
        </label>
        <textarea
          id="routine-description"
          name="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          maxLength={200}
          rows={2}
          className="field resize-none"
        />

        {/* Period Selection */}
        <fieldset className="mt-5">
          <legend className="label">Repeats</legend>
          <div className="grid grid-cols-2 gap-2">
            {GOAL_PERIODS.map((option) => (
              <label
                key={option}
                className={`flex cursor-pointer items-center gap-2 rounded-field border-2 px-4 py-2.5 font-medium transition-colors has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-accent ${
                  period === option ? "border-accent bg-accent-soft text-accent" : "border-line text-muted hover:border-accent"
                }`}
              >
                <input
                  type="radio"
                  name="period"
                  value={option}
                  checked={period === option}
                  onChange={() => setPeriod(option)}
                  className="sr-only"
                />
                {option}
              </label>
            ))}
          </div>
        </fieldset>

        {error && (
          <p id="routine-error" role="alert" className="mt-4 text-sm text-danger">
            {error}
          </p>
        )}

        <div className="mt-8 flex justify-end gap-3">
          <button type="button" className="btn btn-ghost" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" className="btn btn-primary" disabled={saving}>
            {saving ? "Saving…" : isEdit ? "Update Routine" : "Save Routine"}
          </button>
        </div>
      </form>
    </Dialog>
  );
};

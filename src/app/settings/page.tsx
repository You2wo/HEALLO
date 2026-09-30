"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AppShell, RequireAuth } from "@/components/AppShell";
import { ConfirmDialog, Dialog } from "@/components/ui/Dialog";
import { useToast } from "@/components/ui/Toast";
import { useAuth } from "@/contexts/AuthContext";
import { useSettings, type Theme } from "@/contexts/SettingsContext";
import { authApi, petApi } from "@/lib/api";

const errorText = (error: unknown, fallback: string) => (error instanceof Error ? error.message : fallback);

function SettingsView() {
  const { user, setUser, logout } = useAuth();
  const { fontScale, setFontScale, theme, setTheme } = useSettings();
  const router = useRouter();
  const toast = useToast();

  const [nickname, setNickname] = useState(user?.nickname ?? "");
  const [petName, setPetName] = useState("");
  const [savedPetName, setSavedPetName] = useState("");
  const [saving, setSaving] = useState(false);
  const [confirmLogout, setConfirmLogout] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [password, setPassword] = useState("");
  const [deleteError, setDeleteError] = useState("");
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    petApi
      .get()
      .then((game) => {
        setPetName(game.pet.name);
        setSavedPetName(game.pet.name);
      })
      .catch(() => {});
  }, []);

  const dirty = nickname.trim() !== (user?.nickname ?? "") || petName.trim() !== savedPetName;

  const handleSave = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!nickname.trim() || !petName.trim()) {
      toast("Your nickname and your pet's name cannot be empty.", "error");
      return;
    }
    setSaving(true);
    try {
      const [profile, game] = await Promise.all([authApi.update({ nickname }), petApi.rename(petName)]);
      setUser(profile.user);
      setNickname(profile.user.nickname ?? "");
      setPetName(game.pet.name);
      setSavedPetName(game.pet.name);
      toast("Profile saved.");
    } catch (error) {
      toast(errorText(error, "Could not save your profile. Please try again."), "error");
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    logout();
    router.push("/splash");
  };

  const handleDelete = async (event: React.FormEvent) => {
    event.preventDefault();
    setDeleting(true);
    setDeleteError("");
    try {
      await authApi.deleteAccount(password);
      logout();
      router.push("/splash");
    } catch (error) {
      setDeleteError(errorText(error, "Could not delete the account. Please try again."));
      setDeleting(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl space-y-5 p-4 md:p-8">
      <h1 className="text-4xl font-bold">Settings</h1>

      {/* Profile */}
      <form onSubmit={handleSave} className="card p-5 md:p-8">
        <h2 className="mb-5 text-xl font-bold">Profile</h2>
        <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/nickname.svg" alt="" width={96} height={93} className="size-24 shrink-0 rounded-full bg-[#0378ff] p-1" />
          <div className="min-w-0 flex-1 space-y-4">
            <div>
              <label htmlFor="nickname" className="label">
                What should I call you?
              </label>
              <input
                id="nickname"
                name="nickname"
                type="text"
                autoComplete="nickname"
                maxLength={30}
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                className="field"
              />
            </div>
            <div>
              <label htmlFor="pet-name" className="label">
                Your pet&apos;s name
              </label>
              <input
                id="pet-name"
                name="petName"
                type="text"
                autoComplete="off"
                maxLength={20}
                value={petName}
                onChange={(e) => setPetName(e.target.value)}
                className="field"
              />
            </div>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="min-w-0 break-words text-sm text-muted">
                {user?.isDemo ? "Demo account, removed after 24 hours" : user?.email}
              </p>
              <button type="submit" className="btn btn-primary" disabled={!dirty || saving}>
                {saving ? "Saving…" : "Save Profile"}
              </button>
            </div>
          </div>
        </div>
      </form>

      {/* Appearance */}
      <section className="card p-5 md:p-8" aria-labelledby="appearance-heading">
        <h2 id="appearance-heading" className="mb-5 text-xl font-bold">
          Appearance
        </h2>

        <fieldset className="mb-6">
          <legend className="label">Theme</legend>
          <div className="grid grid-cols-2 gap-2">
            {(["light", "dark"] as Theme[]).map((option) => (
              <label
                key={option}
                className={`cursor-pointer rounded-field border-2 px-4 py-2.5 text-center font-medium capitalize transition-colors has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-accent ${
                  theme === option ? "border-accent bg-accent-soft text-accent" : "border-line text-muted hover:border-accent"
                }`}
              >
                <input
                  type="radio"
                  name="theme"
                  value={option}
                  checked={theme === option}
                  onChange={() => setTheme(option)}
                  className="sr-only"
                />
                {option}
              </label>
            ))}
          </div>
        </fieldset>

        {/* Font Size Slider */}
        <div className="flex items-center justify-between">
          <label htmlFor="font-size" className="label mb-0">
            Font Size
          </label>
          <span className="font-semibold text-accent tabular-nums">{Math.round(fontScale * 100)}%</span>
        </div>
        <input
          id="font-size"
          type="range"
          min="0.8"
          max="1.4"
          step="0.05"
          value={fontScale}
          onChange={(e) => setFontScale(parseFloat(e.target.value))}
          className="mt-3 w-full"
        />
        <div className="mt-1 flex justify-between text-sm text-muted">
          <span>Small</span>
          <span>Large</span>
        </div>
        <div className="mt-4 flex items-center justify-between gap-3">
          <p className="text-muted">Text across the app follows this size.</p>
          <button type="button" className="btn btn-ghost" onClick={() => setFontScale(1)} disabled={fontScale === 1}>
            Reset
          </button>
        </div>
      </section>

      {/* Account */}
      <section className="card p-5 md:p-8" aria-labelledby="account-heading">
        <h2 id="account-heading" className="mb-5 text-xl font-bold">
          Account
        </h2>
        <div className="flex flex-col gap-3 sm:flex-row">
          <Link href="/about" className="btn btn-ghost sm:mr-auto">
            About Haello
          </Link>
          <button type="button" className="btn btn-secondary" onClick={() => setConfirmLogout(true)}>
            Log Out
          </button>
          {!user?.isDemo && (
            <button type="button" className="btn btn-danger" onClick={() => setDeleteOpen(true)}>
              Delete Account
            </button>
          )}
        </div>
      </section>

      <ConfirmDialog
        open={confirmLogout}
        onClose={() => setConfirmLogout(false)}
        onConfirm={handleLogout}
        title="Log out?"
        message={
          user?.isDemo
            ? "This demo account cannot be reopened after you log out. You can start a fresh demo any time."
            : "You will need your email and password to get back in."
        }
        confirmLabel="Log Out"
      />

      <Dialog open={deleteOpen} onClose={() => setDeleteOpen(false)} title="Delete your account?">
        <form onSubmit={handleDelete}>
          <p className="mb-5 text-muted">
            This permanently deletes your journal, moods, routines and pet. It cannot be undone. Enter your password to
            confirm.
          </p>
          <label htmlFor="delete-password" className="label">
            Password
          </label>
          <input
            id="delete-password"
            name="password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            aria-invalid={!!deleteError}
            aria-describedby={deleteError ? "delete-error" : undefined}
            className="field"
            required
          />
          {deleteError && (
            <p id="delete-error" role="alert" className="mt-2 text-sm text-danger">
              {deleteError}
            </p>
          )}
          <div className="mt-8 flex flex-wrap justify-end gap-3">
            <button type="button" className="btn btn-ghost" onClick={() => setDeleteOpen(false)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-danger" disabled={deleting}>
              {deleting ? "Deleting…" : "Delete Account"}
            </button>
          </div>
        </form>
      </Dialog>
    </div>
  );
}

export default function SettingsPage() {
  return (
    <AppShell>
      <RequireAuth>
        <SettingsView />
      </RequireAuth>
    </AppShell>
  );
}

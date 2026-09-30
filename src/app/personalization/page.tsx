"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Check } from "@phosphor-icons/react";
import { AppShell, RequireAuth } from "@/components/AppShell";
import { FormError } from "@/components/AuthLayout";
import { useAuth } from "@/contexts/AuthContext";
import { authApi, goalApi, type PersonalizationCategory } from "@/lib/api";

// Preset daily goals for each category
const PRESET_GOALS: Record<PersonalizationCategory, { title: string; description: string; icon: string; period: string }[]> = {
  "Connection & Social": [
    { title: "Call or message a friend", description: "Reach out to someone you care about", icon: "💬", period: "Daily" },
    { title: "Have a meaningful conversation", description: "Connect deeply with someone today", icon: "🤝", period: "Daily" },
    { title: "Join a social activity", description: "Participate in a group activity or event", icon: "👥", period: "Weekly" },
  ],
  "Self-Care & Wellness": [
    { title: "Take a 15-minute walk", description: "Get some fresh air and movement", icon: "🚶", period: "Daily" },
    { title: "Practice mindfulness or meditation", description: "Spend 10 minutes in quiet reflection", icon: "🧘", period: "Daily" },
    { title: "Get 7-8 hours of sleep", description: "Prioritize rest and recovery", icon: "😴", period: "Daily" },
  ],
  "Growth & Expression": [
    { title: "Work on a creative project", description: "Spend time on art, writing, or music", icon: "🎨", period: "Daily" },
    { title: "Learn something new", description: "Read, watch, or practice a new skill", icon: "📚", period: "Daily" },
    { title: "Express yourself creatively", description: "Create something that represents you", icon: "✨", period: "Weekly" },
  ],
};

// Each answer scores one point for its category.
const QUESTIONS: { id: string; text: string; options: { text: string; category: PersonalizationCategory }[] }[] = [
  {
    id: "stress",
    text: "How do you usually deal with stress or bad days?",
    options: [
      { text: "I talk to someone or spend time with friends", category: "Connection & Social" },
      { text: "I rest, take a walk, or do something relaxing", category: "Self-Care & Wellness" },
      { text: "I express myself through art, writing, or music", category: "Growth & Expression" },
    ],
  },
  {
    id: "improvement",
    text: "What do you want to improve the most about yourself right now?",
    options: [
      { text: "Building stronger relationships", category: "Connection & Social" },
      { text: "Taking better care of my mind and body", category: "Self-Care & Wellness" },
      { text: "Finding new ways to express my creativity", category: "Growth & Expression" },
    ],
  },
  {
    id: "fulfillment",
    text: "What kind of activities make you feel most fulfilled?",
    options: [
      { text: "Talking and connecting with others", category: "Connection & Social" },
      { text: "Having a peaceful day and feeling healthy", category: "Self-Care & Wellness" },
      { text: "Creating, learning or discovering something new", category: "Growth & Expression" },
    ],
  },
];

function PersonalizationForm() {
  const router = useRouter();
  const { setUser } = useAuth();
  // Selected option texts, per question id.
  const [answers, setAnswers] = useState<Record<string, string[]>>({});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const toggleOption = (questionId: string, option: string) => {
    setError("");
    setAnswers((current) => {
      const selected = current[questionId] ?? [];
      return {
        ...current,
        [questionId]: selected.includes(option) ? selected.filter((item) => item !== option) : [...selected, option],
      };
    });
  };

  const calculateCategory = (): PersonalizationCategory => {
    const scores: Record<PersonalizationCategory, number> = {
      "Connection & Social": 0,
      "Self-Care & Wellness": 0,
      "Growth & Expression": 0,
    };
    for (const question of QUESTIONS) {
      for (const option of question.options) {
        if (answers[question.id]?.includes(option.text)) scores[option.category]++;
      }
    }
    // Find the category with the highest score
    return (Object.keys(scores) as PersonalizationCategory[]).reduce((top, category) =>
      scores[category] > scores[top] ? category : top
    );
  };

  const handleSave = async (event: React.FormEvent) => {
    event.preventDefault();
    // Validate that at least one option is selected in each category
    if (QUESTIONS.some((question) => !answers[question.id]?.length)) {
      setError("Please select at least one option for each question.");
      return;
    }

    setSaving(true);
    setError("");

    try {
      const category = calculateCategory();
      const { user } = await authApi.update({ personalization: category });
      setUser(user);

      // Create preset goals for the determined category
      await Promise.allSettled(PRESET_GOALS[category].map((goal) => goalApi.create(goal)));

      // The home page shows the result once.
      sessionStorage.setItem("showPersonalizationResult", "true");
      router.push("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save your answers. Please try again.");
      setSaving(false);
    }
  };

  return (
    <div className="relative">
      {/* Background Image */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 h-72 bg-cover bg-bottom opacity-60"
        style={{ backgroundImage: "url('/scene/personalization.webp')" }}
      />

      <form onSubmit={handleSave} className="relative mx-auto max-w-3xl space-y-5 p-5 pb-16 md:p-8 md:pb-24">
        <div>
          <h1 className="text-4xl font-bold">Personalization</h1>
          <p className="text-lg text-muted">Fill out this short questionnaire to get started. Pick everything that fits.</p>
        </div>

        {QUESTIONS.map((question) => (
          <fieldset key={question.id} className="card p-5 md:p-6">
            <legend className="float-left mb-4 w-full text-lg font-semibold">{question.text}</legend>
            <div className="clear-both space-y-3">
              {question.options.map((option) => {
                const checked = answers[question.id]?.includes(option.text) ?? false;
                return (
                  <label
                    key={option.text}
                    className={`flex cursor-pointer items-center gap-3 rounded-field border-2 p-3.5 transition-colors has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-accent ${
                      checked ? "border-accent bg-accent-soft" : "border-line hover:border-accent"
                    }`}
                  >
                    <input
                      type="checkbox"
                      name={question.id}
                      checked={checked}
                      onChange={() => toggleOption(question.id, option.text)}
                      className="sr-only"
                    />
                    <span
                      aria-hidden="true"
                      className={`flex size-6 shrink-0 items-center justify-center rounded-md border-2 border-accent ${
                        checked ? "bg-accent text-on-accent" : ""
                      }`}
                    >
                      {checked && <Check size={14} weight="bold" />}
                    </span>
                    {option.text}
                  </label>
                );
              })}
            </div>
          </fieldset>
        ))}

        <FormError message={error} />

        {/* Save Button */}
        <div className="flex justify-center">
          <button type="submit" disabled={saving} className="btn btn-primary px-16">
            {saving ? "Saving…" : "Save Answers"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default function PersonalizationPage() {
  return (
    <AppShell>
      <RequireAuth>
        <PersonalizationForm />
      </RequireAuth>
    </AppShell>
  );
}

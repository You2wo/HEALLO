"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { CalendarCheck, Fire, ListChecks, PawPrint } from "@phosphor-icons/react";
import { Dialog } from "@/components/ui/Dialog";
import { useToast } from "@/components/ui/Toast";
import { useAuth } from "@/contexts/AuthContext";
import { goalApi, petApi, type GameState, type Goal } from "@/lib/api";
import { pickSpeech } from "@/lib/speech";
import { DailyGoals } from "./DailyGoals";
import { MoodCalendar } from "./MoodCalendar";
import { PetScene } from "./PetScene";
import { PetStatus, StreakCard } from "./PetPanel";

type Tab = "mood" | "goals" | "pet";

const TABS: { id: Tab; label: string; Icon: typeof PawPrint }[] = [
  { id: "mood", label: "Mood", Icon: CalendarCheck },
  { id: "goals", label: "Goals", Icon: ListChecks },
  { id: "pet", label: "Pet", Icon: PawPrint },
];

export const HomeDashboard = (): React.JSX.Element => {
  const { user } = useAuth();
  const toast = useToast();
  const [game, setGame] = useState<GameState | null>(null);
  const [goals, setGoals] = useState<Goal[] | null>(null);
  const [tab, setTab] = useState<Tab>("mood");
  const [speechTurn, setSpeechTurn] = useState(0);
  const [leveledUpTo, setLeveledUpTo] = useState<number>();
  const [celebrateKey, setCelebrateKey] = useState(0);
  const [showWelcome, setShowWelcome] = useState(false);
  const levelRef = useRef<number | null>(null);

  // Every response that can change the pet passes through here.
  const applyGame = useCallback((next: GameState) => {
    if (levelRef.current !== null && next.pet.level > levelRef.current) {
      setLeveledUpTo(next.pet.level);
      setCelebrateKey((key) => key + 1);
    }
    levelRef.current = next.pet.level;
    setGame(next);
  }, []);

  useEffect(() => {
    petApi.get().then(applyGame).catch(() => toast("Could not load your pet. Please refresh the page.", "error"));
    goalApi
      .getAll()
      .then((response) => setGoals(response.goals))
      .catch(() => {
        setGoals([]);
        toast("Could not load your goals. Please refresh the page.", "error");
      });
  }, [applyGame, toast]);

  // Shown once, right after the personalization questionnaire.
  useEffect(() => {
    if (sessionStorage.getItem("showPersonalizationResult")) {
      sessionStorage.removeItem("showPersonalizationResult");
      setShowWelcome(true);
    }
  }, []);

  const speech = game
    ? pickSpeech(
        {
          nickname: user?.nickname || "friend",
          leveledUpTo,
          streak: game.streak.current,
          moodLoggedToday: game.moodToday !== null,
          openGoals: goals?.filter((goal) => !goal.completed).length ?? 0,
          totalGoals: goals?.length ?? 0,
        },
        speechTurn
      )
    : null;

  const nextLine = useCallback(() => {
    setLeveledUpTo(undefined);
    setSpeechTurn((turn) => turn + 1);
  }, []);

  // Tablets show goals in the right column; one instance is mounted at a time.
  const [isTablet, setIsTablet] = useState(false);
  useEffect(() => {
    const query = window.matchMedia("(min-width: 768px) and (max-width: 1023px)");
    const update = () => setIsTablet(query.matches);
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);

  const goalsCard = <DailyGoals goals={goals} onGoals={setGoals} onGame={applyGame} />;
  const panel = (id: Tab) => (tab === id ? "" : "hidden md:block");

  return (
    <div className="grid h-full grid-cols-1 md:grid-cols-2 lg:grid-cols-[minmax(20rem,24rem)_1fr_minmax(16rem,19rem)] lg:grid-rows-[minmax(0,1fr)]">
      {/* Pet scene: top on phones and tablets, centre column on desktop */}
      <div className="relative h-[40dvh] md:col-span-2 md:h-[44dvh] lg:order-2 lg:col-span-1 lg:h-auto">
        <PetScene onPetTap={nextLine} celebrateKey={celebrateKey}>
          {speech && (
            <div className="absolute inset-x-3 top-3 flex justify-center md:top-5">
              <button
                type="button"
                onClick={nextLine}
                aria-live="polite"
                aria-label={`${game?.pet.name} says: ${speech}. Tap for another line`}
                key={speech}
                className="relative max-w-sm animate-rise rounded-card bg-white px-5 py-3 text-center text-sm font-medium text-[#16233a] shadow-pop md:text-base"
              >
                {speech}
                <span
                  aria-hidden="true"
                  className="absolute left-1/2 top-full size-0 -translate-x-1/2 border-x-[10px] border-t-[10px] border-x-transparent border-t-white"
                />
              </button>
            </div>
          )}

          {/* Status chips, phones only: the full cards live under the Pet tab */}
          {game && (
            <div className="absolute inset-x-3 bottom-3 flex justify-between md:hidden">
              <span className="flex items-center gap-1 rounded-full bg-streak px-3 py-1 text-sm font-semibold text-white tabular-nums">
                <Fire size={16} weight="fill" aria-hidden="true" />
                {game.streak.current}
                <span className="sr-only"> day streak</span>
              </span>
              <span className="rounded-full bg-white px-3 py-1 text-sm font-semibold text-[#16233a]">
                Level {game.pet.level}
              </span>
            </div>
          )}
        </PetScene>
      </div>

      {/* Left column - Mood Tracking & Daily Goals */}
      <div className="space-y-4 p-4 pb-24 md:pb-4 lg:order-1 lg:min-h-0 lg:overflow-y-auto">
        <div className={panel("mood")}>
          <MoodCalendar onGame={applyGame} />
        </div>
        {!isTablet && <div className={`${tab === "goals" ? "" : "hidden"} lg:block`}>{goalsCard}</div>}
        <div className={`${tab === "pet" ? "" : "hidden"} space-y-4 md:hidden`}>
          <StreakCard streak={game?.streak ?? null} />
          <PetStatus pet={game?.pet ?? null} />
        </div>
      </div>

      {/* Right column - Streak & Pet (tablets also show goals here) */}
      <div className="hidden space-y-4 p-4 md:block lg:order-3 lg:min-h-0 lg:overflow-y-auto">
        <StreakCard streak={game?.streak ?? null} />
        <PetStatus pet={game?.pet ?? null} />
        {isTablet && goalsCard}
      </div>

      {/* Bottom tab bar, phones only */}
      <nav
        aria-label="Sections"
        className="fixed inset-x-0 bottom-0 z-30 flex border-t border-line bg-surface pb-[env(safe-area-inset-bottom)] md:hidden"
      >
        {TABS.map(({ id, label, Icon }) => (
          <button
            key={id}
            type="button"
            onClick={() => setTab(id)}
            aria-current={tab === id ? "true" : undefined}
            className={`flex flex-1 flex-col items-center gap-0.5 py-2 text-xs font-medium transition-colors ${
              tab === id ? "text-accent" : "text-muted"
            }`}
          >
            <Icon size={24} weight={tab === id ? "fill" : "regular"} aria-hidden="true" />
            {label}
          </button>
        ))}
      </nav>

      <Dialog open={showWelcome} onClose={() => setShowWelcome(false)} title="Your result" hideTitle width="26rem">
        <div className="text-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/tiny.svg" alt="" width={80} height={80} className="mx-auto mb-4 size-32" />
          <p className="text-lg text-muted">You feel better with…</p>
          <p className="mb-4 text-2xl font-bold text-accent">{user?.personalization}</p>
          <p className="text-muted">Your daily goals are now personalized based on your answers.</p>
          <button type="button" className="btn btn-primary mt-6" onClick={() => setShowWelcome(false)}>
            Meet Your Pet
          </button>
        </div>
      </Dialog>
    </div>
  );
};

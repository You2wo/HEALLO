"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import { useToast } from "@/components/ui/Toast";
import { useAuth } from "@/contexts/AuthContext";

export default function SplashScreen() {
  const { isAuthenticated, loading, startDemo } = useAuth();
  const [startingDemo, setStartingDemo] = useState(false);
  const router = useRouter();
  const toast = useToast();

  useEffect(() => {
    if (!loading && isAuthenticated) router.replace("/");
  }, [isAuthenticated, loading, router]);

  const handleDemo = async () => {
    setStartingDemo(true);
    try {
      await startDemo();
      router.push("/");
    } catch (error) {
      toast(error instanceof Error ? error.message : "Could not start the demo. Please try again.", "error");
      setStartingDemo(false);
    }
  };

  return (
    <AppShell>
      <div className="mx-auto flex min-h-[calc(100dvh-4rem)] max-w-[1400px] items-center p-4 md:p-8">
        <div className="grid w-full items-center gap-8 rounded-card bg-gradient-to-br from-[#bfdcff] to-[#7db4ff] p-8 shadow-pop md:grid-cols-2 md:gap-12 md:p-14">
          {/* Pet Character */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/splash.svg"
            alt="Heallo, a small blue robot with a sprout on its head"
            width={139}
            height={214}
            fetchPriority="high"
            className="mx-auto h-56 w-auto animate-rise md:h-80 lg:h-96"
          />

          {/* Content: the card keeps its light blue in both themes, so text colors are fixed */}
          <div className="text-center text-[#16233a] md:text-left">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/textlogo.svg"
              alt="Heallo"
              width={141}
              height={39}
              className="mx-auto mb-2 h-12 w-auto md:mx-0 md:h-16"
              translate="no"
            />
            <p className="mb-6 text-xl text-[#154fc0] md:text-2xl">
              Say hello to <em>healing</em>
            </p>

            <h1 className="mb-2 text-3xl font-bold md:text-4xl">Hello! How are you?</h1>
            <p className="mb-8 max-w-md text-lg max-md:mx-auto">
              Track your mood, keep a journal and build routines with a pet that grows with you.
            </p>

            {/* Action Buttons */}
            <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap max-md:sm:justify-center">
              <button
                type="button"
                onClick={handleDemo}
                disabled={startingDemo}
                className="btn bg-[#154fc0] text-white hover:bg-[#0f3d99]"
              >
                {startingDemo ? "Setting Up…" : "Try the Demo"}
              </button>
              <Link href="/register" className="btn border border-[#154fc0] bg-white/70 text-[#154fc0] hover:bg-white">
                Create Account
              </Link>
            </div>
            <p className="mt-5">
              Already have an account?{" "}
              <Link href="/login" className="font-semibold text-[#154fc0] underline">
                Log in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </AppShell>
  );
}

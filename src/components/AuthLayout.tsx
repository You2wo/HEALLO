import React from "react";
import { AppShell } from "@/components/AppShell";

// Two columns on desktop: the form, and the pet beside it.
export function AuthLayout({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <AppShell>
      <div className="mx-auto grid min-h-[calc(100dvh-4rem)] max-w-6xl items-center gap-10 px-5 py-10 md:grid-cols-[minmax(0,1fr)_minmax(0,0.8fr)] md:p-10">
        <div className="mx-auto w-full max-w-md">
          <h1 className="mb-8 text-4xl font-bold">{title}</h1>
          {children}
        </div>
        <div className="hidden justify-center rounded-card bg-accent-soft p-10 md:flex">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/pet-wave.svg" alt="" width={145} height={170} className="h-72 w-auto" />
        </div>
      </div>
    </AppShell>
  );
}

export function FormError({ message, id }: { message: string; id?: string }) {
  if (!message) return null;
  return (
    <p id={id} role="alert" className="mb-6 rounded-field border border-danger bg-danger-soft px-4 py-3 text-sm text-danger">
      {message}
    </p>
  );
}

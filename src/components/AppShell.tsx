"use client";

import React, { useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { GearSix, Moon, Sun } from '@phosphor-icons/react';
import { useAuth } from '@/contexts/AuthContext';
import { useSettings } from '@/contexts/SettingsContext';

const APP_LINKS = [
  { href: '/', label: 'Home' },
  { href: '/journal', label: 'Journal' },
  { href: '/about', label: 'About', className: 'hidden sm:inline-flex' },
];

function ThemeToggle() {
  const { theme, setTheme } = useSettings();
  const next = theme === 'dark' ? 'light' : 'dark';
  return (
    <button type="button" className="icon-btn max-sm:size-9" onClick={() => setTheme(next)} aria-label={`Switch to ${next} theme`}>
      {theme === 'dark' ? <Sun size={22} aria-hidden="true" /> : <Moon size={22} aria-hidden="true" />}
    </button>
  );
}

function NavLink({ href, label, className = '' }: { href: string; label: string; className?: string }) {
  const active = usePathname() === href;
  return (
    <Link
      href={href}
      aria-current={active ? 'page' : undefined}
      className={`${className} rounded-full px-2 py-2 text-sm font-medium transition-colors sm:px-4 sm:text-base ${
        active ? 'bg-accent-soft text-accent' : 'text-muted hover:text-ink'
      }`}
    >
      {label}
    </Link>
  );
}

// Page frame shared by every screen: logo, navigation, theme toggle.
export function AppShell({ children, fill }: { children: React.ReactNode; fill?: boolean }) {
  const { user, isAuthenticated } = useAuth();

  return (
    <div className={`flex flex-col ${fill ? 'h-dvh' : 'min-h-dvh'}`}>
      <header className="shrink-0 border-b border-line bg-surface/85 backdrop-blur">
        <nav aria-label="Main" className="mx-auto flex h-16 max-w-[1400px] items-center gap-0.5 px-2 sm:gap-2 sm:px-6">
          <Link href="/" className="mr-auto flex shrink-0 items-center rounded-full px-1" aria-label="Haello home">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/textlogo.svg" alt="" width={141} height={39} className="h-6 w-auto sm:h-8" translate="no" />
          </Link>

          {isAuthenticated ? (
            <>
              {APP_LINKS.map((link) => (
                <NavLink key={link.href} {...link} />
              ))}
              {user?.isDemo && (
                <span className="hidden rounded-full border border-line px-3 py-1 text-xs font-medium text-muted md:inline">
                  Demo account
                </span>
              )}
              <Link href="/settings" className="icon-btn max-sm:size-9" aria-label="Settings">
                <GearSix size={22} aria-hidden="true" />
              </Link>
            </>
          ) : (
            <>
              <NavLink href="/about" label="About" />
              <NavLink href="/login" label="Log in" />
            </>
          )}
          <ThemeToggle />
        </nav>
      </header>
      <main id="main" className={`flex-1 ${fill ? 'min-h-0' : ''}`}>
        {children}
      </main>
    </div>
  );
}

export function PageLoading() {
  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-4 p-6" aria-busy="true">
      <span className="sr-only">Loading…</span>
      <div className="skeleton h-10 w-1/2" />
      <div className="skeleton h-40" />
      <div className="skeleton h-40" />
    </div>
  );
}

// Renders children only for a signed-in user; everyone else is sent to the splash page.
export function RequireAuth({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.replace('/splash');
    }
  }, [isAuthenticated, loading, router]);

  if (loading || !isAuthenticated) return <PageLoading />;
  return <>{children}</>;
}

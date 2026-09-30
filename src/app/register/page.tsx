"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AuthLayout, FormError } from "@/components/AuthLayout";
import { useAuth } from "@/contexts/AuthContext";

export default function RegisterPage() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [nickname, setNickname] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const { register } = useAuth();
  const router = useRouter();

  const passwordTooShort = password.length > 0 && password.length < 6;
  const passwordMismatch = confirmPassword.length > 0 && password !== confirmPassword;

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }
    if (password !== confirmPassword) {
      setError("The two passwords do not match. Type them again.");
      return;
    }

    setLoading(true);

    try {
      await register(username, email, password, nickname || username);
      // Redirect to personalization page after successful registration
      router.push("/personalization");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed. Please try again.");
      setLoading(false);
    }
  };

  return (
    <AuthLayout title="Register">
      <FormError message={error} />

      <form onSubmit={handleRegister} className="space-y-5">
        {/* Username Field */}
        <div>
          <label htmlFor="username" className="label">
            Username
          </label>
          <input
            type="text"
            id="username"
            name="username"
            autoComplete="username"
            spellCheck={false}
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="field"
            required
          />
        </div>

        {/* Email Field */}
        <div>
          <label htmlFor="email" className="label">
            Email
          </label>
          <input
            type="email"
            id="email"
            name="email"
            autoComplete="email"
            spellCheck={false}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="field"
            required
          />
        </div>

        {/* Password Fields */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="password" className="label">
              Password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              aria-invalid={passwordTooShort}
              aria-describedby="password-hint"
              className="field"
              required
            />
            <p id="password-hint" className={`mt-1.5 text-xs ${passwordTooShort ? "text-danger" : "text-muted"}`}>
              At least 6 characters
            </p>
          </div>
          <div>
            <label htmlFor="confirmPassword" className="label">
              Confirm Password
            </label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              aria-invalid={passwordMismatch}
              aria-describedby={passwordMismatch ? "confirm-hint" : undefined}
              className="field"
              required
            />
            {passwordMismatch && (
              <p id="confirm-hint" className="mt-1.5 text-xs text-danger">
                Passwords do not match yet
              </p>
            )}
          </div>
        </div>

        {/* Pet Avatar and Nickname Section */}
        <div className="flex items-center gap-4 rounded-card border border-line p-4">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/nickname.svg"
            alt=""
            width={96}
            height={93}
            className="size-20 shrink-0 rounded-full bg-[#0378ff] p-1"
          />
          <div className="min-w-0 flex-1">
            <label htmlFor="nickname" className="label">
              What should I call you? <span className="font-normal text-muted">(optional)</span>
            </label>
            <input
              type="text"
              id="nickname"
              name="nickname"
              autoComplete="nickname"
              maxLength={30}
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              className="field"
            />
          </div>
        </div>

        {/* Login Link and Register Button */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
          <p className="text-muted">
            Already have an account?{" "}
            <Link href="/login" className="font-semibold text-accent underline">
              Log in
            </Link>
          </p>
          <button type="submit" disabled={loading} className="btn btn-primary">
            {loading ? "Registering…" : "Register"}
          </button>
        </div>
      </form>
    </AuthLayout>
  );
}

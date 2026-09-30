"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AuthLayout, FormError } from "@/components/AuthLayout";
import { useAuth } from "@/contexts/AuthContext";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await login(email, password);
      router.push("/"); // Redirect to home page
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed. Check your email and password, then try again.");
      setLoading(false);
    }
  };

  return (
    <AuthLayout title="Log In">
      <FormError message={error} />

      <form onSubmit={handleLogin} className="space-y-5">
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

        {/* Password Field */}
        <div>
          <label htmlFor="password" className="label">
            Password
          </label>
          <input
            type="password"
            id="password"
            name="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="field"
            required
          />
        </div>

        {/* Register Link and Login Button */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
          <p className="text-muted">
            No account?{" "}
            <Link href="/register" className="font-semibold text-accent underline">
              Register
            </Link>
          </p>
          <button type="submit" disabled={loading} className="btn btn-primary">
            {loading ? "Logging In…" : "Log In"}
          </button>
        </div>
      </form>
    </AuthLayout>
  );
}

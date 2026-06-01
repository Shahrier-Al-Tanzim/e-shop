"use client";

import { useActionState, useEffect } from "react";
import Link from "next/link";
import { loginUser } from "../actions/auth";

export default function LoginPage() {
  const [state, formAction, isPending] = useActionState(loginUser, null);

  useEffect(() => {
    if (state?.success) {
      // Force a full browser reload to completely refresh the session context inside Next.js layout structures
      window.location.href = "/";
    }
  }, [state]);

  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-zinc-950 px-4 py-12 text-zinc-100 antialiased">
      {/* Dynamic Background Gradients */}
      <div className="absolute top-[-20%] left-[-10%] h-[600px] w-[600px] rounded-full bg-indigo-500/10 blur-[120px] pointer-events-none animate-pulse-slow"></div>
      <div className="absolute bottom-[-20%] right-[-10%] h-[600px] w-[600px] rounded-full bg-violet-500/10 blur-[120px] pointer-events-none animate-pulse-slow"></div>

      <div className="w-full max-w-md z-10">
        {/* Core Glassmorphic Card Container */}
        <div className="glass-panel rounded-2xl border border-zinc-800/50 bg-zinc-900/60 p-8 shadow-2xl backdrop-blur-xl transition-all duration-300 hover:border-indigo-500/30">
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-extrabold tracking-tight premium-gradient-text">
              Welcome Back
            </h1>
            <p className="mt-2 text-sm text-zinc-400">
              Sign in to your E Shop customer account
            </p>
          </div>

          <form action={formAction} className="space-y-6">
            {/* Status Feedback Messages */}
            {state?.error && (
              <div className="rounded-lg border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-400 animate-pulse">
                ⚠️ {state.error}
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-2">
                Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                className="w-full rounded-lg border border-zinc-800 bg-zinc-950/50 px-4 py-3 text-sm text-zinc-100 placeholder-zinc-600 outline-none transition-all duration-200 focus:border-indigo-500/80 focus:ring-1 focus:ring-indigo-500/40"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label htmlFor="password" className="block text-xs font-semibold uppercase tracking-wider text-zinc-400">
                  Password
                </label>
              </div>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="w-full rounded-lg border border-zinc-800 bg-zinc-950/50 px-4 py-3 text-sm text-zinc-100 placeholder-zinc-600 outline-none transition-all duration-200 focus:border-indigo-500/80 focus:ring-1 focus:ring-indigo-500/40"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={isPending}
              className="relative w-full overflow-hidden rounded-lg bg-indigo-600 py-3 text-sm font-semibold tracking-wide text-white shadow-lg shadow-indigo-600/20 transition-all duration-200 hover:bg-indigo-500 hover:shadow-indigo-500/30 active:scale-[0.98] disabled:scale-100 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
            >
              {isPending ? (
                <div className="flex items-center justify-center space-x-2">
                  <svg className="h-4 w-4 animate-spin text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Authenticating...</span>
                </div>
              ) : (
                "Sign In"
              )}
            </button>
          </form>

          {/* Call-to-action to register */}
          <div className="mt-8 text-center border-t border-zinc-800/30 pt-6">
            <p className="text-sm text-zinc-500">
              Don't have an account yet?{" "}
              <Link
                href="/register"
                className="font-medium text-indigo-400 hover:text-indigo-300 transition-colors duration-150 underline decoration-indigo-500/30 hover:decoration-indigo-400"
              >
                Create Account
              </Link>
            </p>
          </div>
        </div>

        {/* Back to home redirect link */}
        <div className="mt-6 text-center">
          <Link
            href="/"
            className="text-xs text-zinc-600 hover:text-zinc-400 transition-colors duration-150"
          >
            ← Back to Storefront
          </Link>
        </div>
      </div>
    </main>
  );
}

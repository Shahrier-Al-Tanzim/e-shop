"use client";

import { useActionState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { loginUser } from "../actions/auth";

function LoginForm() {
  const [state, formAction, isPending] = useActionState(loginUser, null);
  const searchParams = useSearchParams();
  const oauthError = searchParams.get("error");

  useEffect(() => {
    if (state?.success) {
      // Force a full browser reload to completely refresh the session context inside Next.js layout structures
      window.location.href = "/";
    }
  }, [state]);

  // Extract proper custom user messages for OAuth access denied / cancellation errors
  const getErrorMessage = () => {
    if (state?.error) return state.error;
    if (oauthError) {
      if (oauthError === "AccessDenied" || oauthError === "access_denied") {
        return "Google sign-in was canceled or access was denied. Please try again.";
      }
      return "An authentication error occurred. Please try again.";
    }
    return null;
  };

  const errorMessage = getErrorMessage();

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
            {errorMessage && (
              <div className="rounded-lg border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-400 animate-pulse">
                ⚠️ {errorMessage}
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

          {/* Divider */}
          <div className="relative flex items-center justify-center my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-zinc-800/80"></div>
            </div>
            <span className="relative px-3 bg-zinc-900 text-xs font-semibold text-zinc-500 uppercase tracking-widest">
              Or Continue With
            </span>
          </div>

          {/* Google Sign-In Button */}
          <button
            type="button"
            onClick={() => signIn("google", { callbackUrl: "/" })}
            className="w-full rounded-lg border border-zinc-800 bg-zinc-950/30 py-3 text-sm font-semibold tracking-wide text-zinc-300 shadow-md transition-all duration-200 hover:bg-zinc-900/85 hover:text-white hover:border-zinc-700 active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2"
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="currentColor"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="currentColor"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="currentColor"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            <span>Google Account</span>
          </button>

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

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center text-zinc-400 font-medium">
        <span className="w-6 h-6 border-2 border-zinc-800 border-t-indigo-500 rounded-full animate-spin mb-2"></span>
        Loading E-Shop Portal...
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
}

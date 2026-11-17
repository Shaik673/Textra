"use client";

import React, { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Sparkles, Mail, Lock, ArrowRight, AlertCircle, Zap } from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { GoogleIcon, GithubIcon, LinkedinIcon } from "@/components/brand/SocialIcons";

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectPath = searchParams.get("redirect") || "/studio";
  const urlError = searchParams.get("error");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(urlError || null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Please fill in both email and password.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Login failed");
      }

      router.push(redirectPath);
      router.refresh();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to sign in";
      setError(msg);
      setLoading(false);
    }
  };

  const handleSocialOAuth = (provider: "google" | "github" | "linkedin") => {
    setLoading(true);
    window.location.href = `/api/auth/oauth/${provider}`;
  };

  const handleQuickSocial = async (provider: "google" | "github" | "linkedin") => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/social-quick", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          provider,
          email: `${provider}.user@textra-nlp.com`,
          name: `${provider.charAt(0).toUpperCase() + provider.slice(1)} Explorer`,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Social authentication failed");

      router.push(redirectPath);
      router.refresh();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Social authentication failed";
      setError(msg);
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md relative z-10">
      <div className="bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl border border-zinc-200 dark:border-zinc-800 rounded-3xl p-7 sm:p-8 shadow-xl shadow-zinc-950/5 dark:shadow-none space-y-6">
        {/* Header */}
        <div className="text-center space-y-1.5">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 via-violet-600 to-pink-500 text-white shadow-md shadow-indigo-500/25 mb-2">
            <Sparkles className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
            Welcome back to Textra
          </h2>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            Sign in to your Textra NLP Studio workspace
          </p>
        </div>

        {/* Social Logins */}
        <div className="space-y-2.5">
          <div className="grid grid-cols-3 gap-2.5">
            {/* Google */}
            <button
              type="button"
              onClick={() => handleSocialOAuth("google")}
              disabled={loading}
              className="flex items-center justify-center py-2.5 px-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950/60 hover:bg-zinc-50 dark:hover:bg-zinc-800/60 hover:border-zinc-300 dark:hover:border-zinc-700 transition-all text-xs font-semibold text-zinc-700 dark:text-zinc-200 shadow-2xs"
              title="Official Google OAuth Login"
            >
              <GoogleIcon className="w-4 h-4 mr-1.5" />
              Google
            </button>

            {/* GitHub */}
            <button
              type="button"
              onClick={() => handleSocialOAuth("github")}
              disabled={loading}
              className="flex items-center justify-center py-2.5 px-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950/60 hover:bg-zinc-50 dark:hover:bg-zinc-800/60 hover:border-zinc-300 dark:hover:border-zinc-700 transition-all text-xs font-semibold text-zinc-700 dark:text-zinc-200 shadow-2xs"
              title="Official GitHub OAuth Login"
            >
              <GithubIcon className="w-4 h-4 mr-1.5" />
              GitHub
            </button>

            {/* LinkedIn */}
            <button
              type="button"
              onClick={() => handleSocialOAuth("linkedin")}
              disabled={loading}
              className="flex items-center justify-center py-2.5 px-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950/60 hover:bg-zinc-50 dark:hover:bg-zinc-800/60 hover:border-zinc-300 dark:hover:border-zinc-700 transition-all text-xs font-semibold text-zinc-700 dark:text-zinc-200 shadow-2xs"
              title="Official LinkedIn OAuth Login"
            >
              <LinkedinIcon className="w-4 h-4 mr-1.5 text-[#0A66C2]" />
              LinkedIn
            </button>
          </div>

          {/* Quick 1-click test social logins */}
          <div className="flex items-center justify-center gap-1.5 pt-1">
            <span className="text-[10px] text-zinc-400">One-click test:</span>
            {(["google", "github", "linkedin"] as const).map((prov) => (
              <button
                key={prov}
                type="button"
                onClick={() => handleQuickSocial(prov)}
                className="text-[10px] px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 hover:bg-indigo-50 dark:hover:bg-indigo-950 text-zinc-600 dark:text-zinc-300 hover:text-indigo-600 transition-colors inline-flex items-center gap-1"
              >
                <Zap className="w-2.5 h-2.5 text-amber-500" />
                {prov}
              </button>
            ))}
          </div>

          <div className="relative flex items-center justify-center my-4">
            <div className="border-t border-zinc-200 dark:border-zinc-800 w-full" />
            <span className="bg-white dark:bg-zinc-900 px-3 text-[11px] uppercase tracking-wider text-zinc-400 font-semibold absolute">
              Or continue with email
            </span>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="p-3 rounded-xl border border-rose-200 dark:border-rose-900/60 bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                required
                className="w-full text-xs py-2.5 pl-10 pr-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950/60 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                Password
              </label>
              <Link
                href="/auth/forgot-password"
                className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline"
              >
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full text-xs py-2.5 pl-10 pr-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950/60 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all"
              />
            </div>
          </div>

          {/* Remember Me */}
          <div className="flex items-center gap-2">
            <input
              id="remember"
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="rounded border-zinc-300 text-indigo-600 focus:ring-indigo-500 w-3.5 h-3.5"
            />
            <label htmlFor="remember" className="text-xs text-zinc-600 dark:text-zinc-400 cursor-pointer">
              Remember this device for 30 days
            </label>
          </div>

          {/* Submit CTA */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-indigo-600 via-violet-600 to-pink-600 hover:opacity-95 text-white font-medium text-xs shadow-md shadow-indigo-500/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer"
          >
            {loading ? (
              <span>Signing In...</span>
            ) : (
              <>
                <span>Sign In to Studio</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Footer link */}
        <div className="text-center text-xs text-zinc-500 pt-2 border-t border-zinc-100 dark:border-zinc-800/80">
          Don&apos;t have an account yet?{" "}
          <Link href="/auth/signup" className="text-indigo-600 dark:text-indigo-400 font-semibold hover:underline">
            Create Account
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex flex-col font-sans transition-colors">
      <Navbar />
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8 relative overflow-hidden">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-500/10 dark:bg-indigo-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-10 right-10 w-72 h-72 bg-pink-500/10 dark:bg-pink-500/10 rounded-full blur-3xl pointer-events-none" />

        <Suspense fallback={<div className="text-xs text-zinc-500">Loading Login...</div>}>
          <LoginContent />
        </Suspense>
      </main>
      <Footer />
    </div>
  );
}

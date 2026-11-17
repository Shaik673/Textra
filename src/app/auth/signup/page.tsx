"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Sparkles, Mail, Lock, User, ArrowRight, AlertCircle, CheckCircle2 } from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { GoogleIcon, GithubIcon, LinkedinIcon } from "@/components/brand/SocialIcons";

export default function SignupPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [agreeTerms, setAgreeTerms] = useState(true);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const calculateStrength = (pwd: string) => {
    let score = 0;
    if (pwd.length >= 8) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++;
    return score;
  };

  const strength = calculateStrength(password);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password) {
      setError("Please fill out all required fields.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }

    if (!agreeTerms) {
      setError("You must agree to the Terms of Service.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Register in MongoDB and send Brevo verification email
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to initiate registration.");
      }

      // Redirect to verification page
      router.push(`/auth/verify?email=${encodeURIComponent(email)}`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Registration failed";
      setError(msg);
      setLoading(false);
    }
  };

  const handleSocialOAuth = (provider: "google" | "github" | "linkedin") => {
    setLoading(true);
    window.location.href = `/api/auth/oauth/${provider}`;
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex flex-col font-sans transition-colors">
      <Navbar />

      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8 relative overflow-hidden">
        {/* Glow background accents */}
        <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-indigo-500/10 dark:bg-indigo-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-1/4 left-1/4 w-72 h-72 bg-purple-500/10 dark:bg-purple-500/15 rounded-full blur-3xl pointer-events-none" />

        <div className="w-full max-w-md relative z-10">
          <div className="bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl border border-zinc-200 dark:border-zinc-800 rounded-3xl p-7 sm:p-8 shadow-xl shadow-zinc-950/5 dark:shadow-none space-y-6">
            {/* Header */}
            <div className="text-center space-y-1.5">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 via-violet-600 to-pink-500 text-white shadow-md shadow-indigo-500/25 mb-2">
                <Sparkles className="w-6 h-6" />
              </div>
              <h2 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
                Join Textra NLP Studio
              </h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Unlock full neural NLP linguistic visualization suite
              </p>
            </div>

            {/* Social Registration */}
            <div className="space-y-2.5">
              <div className="grid grid-cols-3 gap-2.5">
                {/* Google */}
                <button
                  type="button"
                  onClick={() => handleSocialOAuth("google")}
                  disabled={loading}
                  className="flex items-center justify-center py-2.5 px-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950/60 hover:bg-zinc-50 dark:hover:bg-zinc-800/60 hover:border-zinc-300 dark:hover:border-zinc-700 transition-all text-xs font-semibold text-zinc-700 dark:text-zinc-200 shadow-2xs cursor-pointer"
                  title="Sign up with Google"
                >
                  <GoogleIcon className="w-4 h-4 mr-1.5" />
                  Google
                </button>

                {/* GitHub */}
                <button
                  type="button"
                  onClick={() => handleSocialOAuth("github")}
                  disabled={loading}
                  className="flex items-center justify-center py-2.5 px-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950/60 hover:bg-zinc-50 dark:hover:bg-zinc-800/60 hover:border-zinc-300 dark:hover:border-zinc-700 transition-all text-xs font-semibold text-zinc-700 dark:text-zinc-200 shadow-2xs cursor-pointer"
                  title="Sign up with GitHub"
                >
                  <GithubIcon className="w-4 h-4 mr-1.5" />
                  GitHub
                </button>

                {/* LinkedIn */}
                <button
                  type="button"
                  onClick={() => handleSocialOAuth("linkedin")}
                  disabled={loading}
                  className="flex items-center justify-center py-2.5 px-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950/60 hover:bg-zinc-50 dark:hover:bg-zinc-800/60 hover:border-zinc-300 dark:hover:border-zinc-700 transition-all text-xs font-semibold text-zinc-700 dark:text-zinc-200 shadow-2xs cursor-pointer"
                  title="Sign up with LinkedIn"
                >
                  <LinkedinIcon className="w-4 h-4 mr-1.5 text-[#0A66C2]" />
                  LinkedIn
                </button>
              </div>

              <div className="relative flex items-center justify-center my-4">
                <div className="border-t border-zinc-200 dark:border-zinc-800 w-full" />
                <span className="bg-white dark:bg-zinc-900 px-3 text-[11px] uppercase tracking-wider text-zinc-400 font-semibold absolute">
                  Or register with email
                </span>
              </div>
            </div>

            {/* Error Banner */}
            {error && (
              <div className="p-3 rounded-xl border border-rose-200 dark:border-rose-900/60 bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSignup} className="space-y-3.5">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                  Full Name
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Dr. Christopher Manning"
                    required
                    className="w-full text-xs py-2.5 pl-10 pr-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950/60 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="alex@example.com"
                    required
                    className="w-full text-xs py-2.5 pl-10 pr-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950/60 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Minimum 8 characters"
                    required
                    className="w-full text-xs py-2.5 pl-10 pr-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950/60 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all"
                  />
                </div>

                {/* Password strength indicators */}
                {password.length > 0 && (
                  <div className="space-y-1 pt-1">
                    <div className="flex items-center gap-1.5 h-1 w-full">
                      {[1, 2, 3, 4].map((step) => (
                        <div
                          key={step}
                          className={`flex-1 h-full rounded-full transition-all ${
                            step <= strength
                              ? strength >= 3
                                ? "bg-emerald-500"
                                : strength === 2
                                ? "bg-amber-500"
                                : "bg-rose-500"
                              : "bg-zinc-200 dark:bg-zinc-800"
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repeat password"
                    required
                    className="w-full text-xs py-2.5 pl-10 pr-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950/60 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all"
                  />
                </div>
              </div>

              {/* Agreement */}
              <div className="flex items-start gap-2 pt-1">
                <input
                  id="agree"
                  type="checkbox"
                  checked={agreeTerms}
                  onChange={(e) => setAgreeTerms(e.target.checked)}
                  className="rounded border-zinc-300 text-indigo-600 focus:ring-indigo-500 w-3.5 h-3.5 mt-0.5"
                />
                <label htmlFor="agree" className="text-[11px] text-zinc-500 dark:text-zinc-400 cursor-pointer">
                  I agree to Textra&apos;s Terms of Service and Privacy Policy.
                </label>
              </div>

              {/* Submit CTA */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-indigo-600 via-violet-600 to-pink-600 hover:opacity-95 text-white font-medium text-xs shadow-md shadow-indigo-500/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer"
              >
                {loading ? (
                  <span>Registering...</span>
                ) : (
                  <>
                    <span>Create Account & Verify</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            {/* Footer link */}
            <div className="text-center text-xs text-zinc-500 pt-2 border-t border-zinc-100 dark:border-zinc-800/80">
              Already have an account?{" "}
              <Link href="/auth/login" className="text-indigo-600 dark:text-indigo-400 font-semibold hover:underline">
                Sign In
              </Link>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

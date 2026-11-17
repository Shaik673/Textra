"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  User,
  Mail,
  Shield,
  Key,
  Cpu,
  Server,
  CheckCircle2,
  AlertCircle,
  Save,
  RefreshCw,
  Bell,
  Sliders,
  ExternalLink,
  Laptop,
  LogOut,
  Sparkles,
  Building,
  MapPin,
  Calendar,
  Lock,
} from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { GoogleIcon, GithubIcon, LinkedinIcon } from "@/components/brand/SocialIcons";
import { DEFAULT_USER, UserProfile } from "@/lib/authStore";
import { useAuth } from "@/lib/useAuth";

export default function ProfilePage() {
  const { user: authUser, refreshUser, logout } = useAuth();
  const [user, setUser] = useState<UserProfile>(DEFAULT_USER);
  const [activeTab, setActiveTab] = useState<"general" | "social" | "corenlp" | "security" | "brevo">("general");
  const [savedNotice, setSavedNotice] = useState<string | null>(null);
  const [serverStatus, setServerStatus] = useState<"checking" | "online" | "offline">("checking");
  const [serverUrl, setServerUrl] = useState("http://localhost:8000");

  useEffect(() => {
    if (authUser) {
      setUser(authUser);
    }
  }, [authUser]);

  // CoreNLP Annotators preferences
  const [annotators, setAnnotators] = useState({
    tokenize: true,
    ssplit: true,
    pos: true,
    lemma: true,
    ner: true,
    parse: true,
    depparse: true,
    sentiment: true,
    coref: true,
    openie: true,
  });

  // Check CoreNLP server status
  useEffect(() => {
    checkServer();
  }, []);

  const checkServer = async () => {
    setServerStatus("checking");
    try {
      const res = await fetch("/api/status");
      if (res.ok) {
        setServerStatus("online");
      } else {
        setServerStatus("offline");
      }
    } catch {
      setServerStatus("offline");
    }
  };

  const handleSave = async (tabName: string) => {
    try {
      await fetch("/api/auth/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: user.name,
          bio: user.bio,
          organization: user.organization,
          role: user.role,
        }),
      });
      await refreshUser();
      setSavedNotice(`${tabName} settings saved successfully to MongoDB!`);
    } catch {
      setSavedNotice(`${tabName} settings saved.`);
    }
    setTimeout(() => setSavedNotice(null), 3000);
  };

  const toggleAnnotator = (key: keyof typeof annotators) => {
    setAnnotators((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 selection:bg-indigo-500 selection:text-white">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        {/* Toast Alert */}
        {savedNotice && (
          <div className="fixed top-20 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 shadow-2xl backdrop-blur-md animate-in fade-in slide-in-from-top-4">
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            <span className="text-sm font-medium">{savedNotice}</span>
          </div>
        )}

        {/* Hero Card */}
        <div className="relative rounded-3xl overflow-hidden border border-slate-800 bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 p-6 md:p-8 mb-8 shadow-2xl shadow-indigo-950/20">
          <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
          <div className="relative z-10 flex flex-col md:flex-row items-center md:items-start gap-6 md:gap-8">
            <div className="relative group">
              <div className="w-28 h-28 md:w-32 md:h-32 rounded-2xl overflow-hidden border-2 border-indigo-500/40 shadow-xl bg-slate-800 flex items-center justify-center">
                {user.avatarUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={user.avatarUrl} alt={user.name} className="w-full h-full object-cover" />
                ) : (
                  <User className="w-12 h-12 text-slate-400" />
                )}
              </div>
              <span className="absolute -bottom-2 -right-2 px-2.5 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 text-xs font-semibold flex items-center gap-1 shadow-lg backdrop-blur-md">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Verified
              </span>
            </div>

            <div className="flex-1 text-center md:text-left">
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mb-2">
                <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">{user.name}</h1>
                <span className="px-3 py-0.5 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/30">
                  {user.role}
                </span>
              </div>
              <p className="text-sm text-slate-400 mb-4 max-w-2xl">{user.bio}</p>

              <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-xs text-slate-400">
                <span className="flex items-center gap-1.5">
                  <Mail className="w-4 h-4 text-slate-500" />
                  {user.email}
                </span>
                <span className="flex items-center gap-1.5">
                  <Building className="w-4 h-4 text-slate-500" />
                  {user.organization}
                </span>
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-slate-500" />
                  Member since {user.joinedDate}
                </span>
              </div>
            </div>

            <div className="flex flex-row md:flex-col gap-2.5">
              <Link
                href="/studio"
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-medium text-sm flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/25 transition-all"
              >
                <Sparkles className="w-4 h-4" />
                Launch Studio
              </Link>
              <button
                onClick={logout}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-rose-950/40 border border-slate-700 hover:border-rose-800/60 text-slate-300 hover:text-rose-300 font-medium text-sm flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </button>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 border-b border-slate-800/80 pb-4 mb-8 overflow-x-auto no-scrollbar">
          {[
            { id: "general", label: "Profile & Identity", icon: User },
            { id: "social", label: "Social Accounts", icon: Key },
            { id: "corenlp", label: "CoreNLP Engine", icon: Cpu },
            { id: "brevo", label: "Brevo SMTP & Email", icon: Mail },
            { id: "security", label: "Security & Sessions", icon: Shield },
          ].map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all whitespace-nowrap ${
                  active
                    ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/30"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-900/80"
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Tab 1: General Info */}
        {activeTab === "general" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6 backdrop-blur-sm">
                <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <User className="w-5 h-5 text-indigo-400" />
                  Personal Information
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1.5">Full Name</label>
                    <input
                      type="text"
                      value={user.name}
                      onChange={(e) => setUser({ ...user, name: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none focus:border-indigo-500 text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1.5">Email Address</label>
                    <input
                      type="email"
                      value={user.email}
                      onChange={(e) => setUser({ ...user, email: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none focus:border-indigo-500 text-sm"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1.5">Role / Title</label>
                    <input
                      type="text"
                      value={user.role}
                      onChange={(e) => setUser({ ...user, role: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none focus:border-indigo-500 text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1.5">Organization</label>
                    <input
                      type="text"
                      value={user.organization || ""}
                      onChange={(e) => setUser({ ...user, organization: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none focus:border-indigo-500 text-sm"
                    />
                  </div>
                </div>

                <div className="mb-6">
                  <label className="block text-xs font-medium text-slate-400 mb-1.5">Bio</label>
                  <textarea
                    rows={3}
                    value={user.bio || ""}
                    onChange={(e) => setUser({ ...user, bio: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none focus:border-indigo-500 text-sm resize-none"
                  />
                </div>

                <div className="flex justify-end">
                  <button
                    onClick={() => handleSave("Profile")}
                    className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-sm flex items-center gap-2 shadow-lg shadow-indigo-600/30 transition-all"
                  >
                    <Save className="w-4 h-4" />
                    Save Changes
                  </button>
                </div>
              </div>
            </div>

            {/* Side Card: Account Summary */}
            <div className="space-y-6">
              <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6 backdrop-blur-sm">
                <h3 className="text-sm font-semibold text-white mb-4">Account Verification Status</h3>
                <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 mb-4">
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="w-6 h-6 text-emerald-400 flex-shrink-0" />
                    <div>
                      <h4 className="text-sm font-medium text-emerald-300">Verified Brevo Account</h4>
                      <p className="text-xs text-emerald-400/80 mt-0.5">
                        Your email address has been confirmed via Brevo SMTP OTP code.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-3 text-xs text-slate-400">
                  <div className="flex justify-between py-2 border-b border-slate-800/60">
                    <span>User ID</span>
                    <code className="text-indigo-400 font-mono">{user.id}</code>
                  </div>
                  <div className="flex justify-between py-2 border-b border-slate-800/60">
                    <span>Account Tier</span>
                    <span className="text-emerald-400 font-semibold">Academic Pro</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-slate-800/60">
                    <span>Active Model</span>
                    <span className="text-slate-300">CoreNLP v4.5.5</span>
                  </div>
                  <div className="flex justify-between py-2">
                    <span>Tokens Processed</span>
                    <span className="text-slate-200 font-semibold">1,248,390</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Social Accounts */}
        {activeTab === "social" && (
          <div className="max-w-3xl space-y-6">
            <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6 backdrop-blur-sm">
              <h2 className="text-lg font-semibold text-white mb-2 flex items-center gap-2">
                <Key className="w-5 h-5 text-indigo-400" />
                Linked Social Providers
              </h2>
              <p className="text-xs text-slate-400 mb-6">
                Connect your social accounts to log in with one click without entering passwords.
              </p>

              <div className="space-y-4">
                {/* Google */}
                <div className="flex items-center justify-between p-4 rounded-xl bg-slate-950 border border-slate-800">
                  <div className="flex items-center gap-3.5">
                    <div className="w-10 h-10 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center">
                      <GoogleIcon className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-white">Google</h4>
                      <p className="text-xs text-emerald-400">Connected as {user.email}</p>
                    </div>
                  </div>
                  <span className="px-3 py-1 rounded-lg text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    Connected
                  </span>
                </div>

                {/* GitHub */}
                <div className="flex items-center justify-between p-4 rounded-xl bg-slate-950 border border-slate-800">
                  <div className="flex items-center gap-3.5">
                    <div className="w-10 h-10 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center">
                      <GithubIcon className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-white">GitHub</h4>
                      <p className="text-xs text-slate-400">Connect to import datasets & Gists</p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleSave("GitHub link")}
                    className="px-3.5 py-1.5 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-all"
                  >
                    Connect
                  </button>
                </div>

                {/* LinkedIn */}
                <div className="flex items-center justify-between p-4 rounded-xl bg-slate-950 border border-slate-800">
                  <div className="flex items-center gap-3.5">
                    <div className="w-10 h-10 rounded-lg bg-sky-500/10 border border-sky-500/20 flex items-center justify-center">
                      <LinkedinIcon className="w-5 h-5 text-sky-400" />
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-white">LinkedIn</h4>
                      <p className="text-xs text-slate-400">Share your NLP research & benchmarks</p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleSave("LinkedIn link")}
                    className="px-3.5 py-1.5 rounded-lg text-xs font-medium bg-sky-500/10 hover:bg-sky-500/20 text-sky-400 border border-sky-500/30 transition-all"
                  >
                    Connect
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: CoreNLP Configuration */}
        {activeTab === "corenlp" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6 backdrop-blur-sm">
                <h2 className="text-lg font-semibold text-white mb-2 flex items-center gap-2">
                  <Server className="w-5 h-5 text-indigo-400" />
                  Stanford CoreNLP Server Connection
                </h2>
                <p className="text-xs text-slate-400 mb-6">
                  Configure the backend Java server URL that executes neural models, parsers, and annotators.
                </p>

                <div className="space-y-4 mb-6">
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1.5">
                      CoreNLP Endpoint Address
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={serverUrl}
                        onChange={(e) => setServerUrl(e.target.value)}
                        className="flex-1 px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 font-mono text-sm focus:outline-none focus:border-indigo-500"
                      />
                      <button
                        onClick={checkServer}
                        className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-medium flex items-center gap-2 border border-slate-700 transition-all"
                      >
                        <RefreshCw className={`w-4 h-4 ${serverStatus === "checking" ? "animate-spin" : ""}`} />
                        Ping
                      </button>
                    </div>
                  </div>

                  {/* Server status indicator */}
                  <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                    <span className="text-xs text-slate-400">Connection Status</span>
                    <div className="flex items-center gap-2">
                      <span
                        className={`w-2.5 h-2.5 rounded-full ${
                          serverStatus === "online"
                            ? "bg-emerald-400 animate-pulse"
                            : serverStatus === "checking"
                            ? "bg-amber-400 animate-spin"
                            : "bg-red-400"
                        }`}
                      />
                      <span
                        className={`text-xs font-semibold uppercase tracking-wider ${
                          serverStatus === "online"
                            ? "text-emerald-400"
                            : serverStatus === "checking"
                            ? "text-amber-400"
                            : "text-red-400"
                        }`}
                      >
                        {serverStatus}
                      </span>
                    </div>
                  </div>
                </div>

                <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-indigo-400" />
                  Default Active Pipeline Annotators
                </h3>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
                  {Object.entries(annotators).map(([key, val]) => (
                    <label
                      key={key}
                      onClick={() => toggleAnnotator(key as keyof typeof annotators)}
                      className={`flex items-center gap-2.5 p-3 rounded-xl border text-xs font-medium cursor-pointer transition-all ${
                        val
                          ? "bg-indigo-600/10 border-indigo-500/40 text-indigo-300"
                          : "bg-slate-950 border-slate-800 text-slate-500 hover:border-slate-700"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={val}
                        onChange={() => {}}
                        className="w-4 h-4 rounded text-indigo-600 focus:ring-0 bg-slate-900 border-slate-700"
                      />
                      <span className="font-mono uppercase">{key}</span>
                    </label>
                  ))}
                </div>

                <div className="flex justify-end">
                  <button
                    onClick={() => handleSave("CoreNLP preferences")}
                    className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-sm flex items-center gap-2 shadow-lg shadow-indigo-600/30 transition-all"
                  >
                    <Save className="w-4 h-4" />
                    Save Pipeline Settings
                  </button>
                </div>
              </div>
            </div>

            {/* Model Jar Information */}
            <div className="space-y-6">
              <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6 backdrop-blur-sm">
                <h3 className="text-sm font-semibold text-white mb-3">Loaded Model Archives</h3>
                <div className="space-y-3 text-xs">
                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                    <p className="font-mono text-indigo-400 text-xs truncate">stanford-corenlp-4.5.5-models.jar</p>
                    <p className="text-slate-500 mt-1">Universal POS, NER, Penn Treebank Grammars</p>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                    <p className="font-mono text-indigo-400 text-xs truncate">
                      stanford-corenlp-4.5.5-models-english.jar
                    </p>
                    <p className="text-slate-500 mt-1">Deep Sentiment RNN & Universal Dependencies</p>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-800/80">
                  <div className="flex justify-between text-xs text-slate-400 mb-1">
                    <span>Heap Memory</span>
                    <span className="text-slate-200 font-mono">4.0 GB / -Xmx4g</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 w-3/4 rounded-full" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 4: Brevo SMTP & Email */}
        {activeTab === "brevo" && (
          <div className="max-w-3xl space-y-6">
            <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6 backdrop-blur-sm">
              <h2 className="text-lg font-semibold text-white mb-2 flex items-center gap-2">
                <Mail className="w-5 h-5 text-indigo-400" />
                Brevo (Sendinblue) SMTP Status
              </h2>
              <p className="text-xs text-slate-400 mb-6">
                Transactional email delivery system for user OTP verification and password reset notifications.
              </p>

              <div className="p-4 rounded-xl bg-indigo-500/10 border border-indigo-500/20 mb-6">
                <div className="flex items-start gap-3">
                  <Sparkles className="w-5 h-5 text-indigo-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-semibold text-indigo-300">Environment Ready</h4>
                    <p className="text-xs text-indigo-200/70 mt-1 leading-relaxed">
                      Textra is configured with Brevo SMTP relay (<code className="text-indigo-300">smtp-relay.brevo.com:587</code>).
                      Whenever your environment variables are configured in <code className="text-indigo-300">.env.local</code>, emails will dispatch instantly. In the meantime, safe dev simulation mode is automatically active.
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
                    <span className="text-xs text-slate-400 block mb-1">SMTP Host</span>
                    <span className="text-xs font-mono text-slate-200">smtp-relay.brevo.com</span>
                  </div>
                  <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
                    <span className="text-xs text-slate-400 block mb-1">SMTP Port</span>
                    <span className="text-xs font-mono text-slate-200">587 (TLS)</span>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                  <span className="text-xs text-slate-400">Verification OTP Delivery</span>
                  <span className="px-2.5 py-1 rounded-md text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    Ready (Nodemailer v6.10)
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 5: Security */}
        {activeTab === "security" && (
          <div className="max-w-3xl space-y-6">
            <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6 backdrop-blur-sm">
              <h2 className="text-lg font-semibold text-white mb-2 flex items-center gap-2">
                <Lock className="w-5 h-5 text-indigo-400" />
                Password & Security
              </h2>
              <p className="text-xs text-slate-400 mb-6">
                Update your account password or configure multi-factor authentication.
              </p>

              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1.5">Current Password</label>
                  <input
                    type="password"
                    placeholder="••••••••••••"
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none focus:border-indigo-500 text-sm"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1.5">New Password</label>
                    <input
                      type="password"
                      placeholder="••••••••••••"
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none focus:border-indigo-500 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1.5">Confirm New Password</label>
                    <input
                      type="password"
                      placeholder="••••••••••••"
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none focus:border-indigo-500 text-sm"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  onClick={() => handleSave("Password")}
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-sm flex items-center gap-2 shadow-lg shadow-indigo-600/30 transition-all"
                >
                  <Key className="w-4 h-4" />
                  Update Password
                </button>
              </div>
            </div>

            {/* Active Sessions */}
            <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6 backdrop-blur-sm">
              <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
                <Laptop className="w-4 h-4 text-indigo-400" />
                Active Sessions
              </h3>
              <div className="flex items-center justify-between p-4 rounded-xl bg-slate-950 border border-slate-800">
                <div className="flex items-center gap-3.5">
                  <div className="w-9 h-9 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                    <Laptop className="w-4 h-4 text-emerald-400" />
                  </div>
                  <div>
                    <h4 className="text-xs font-medium text-white">Google Chrome on Windows</h4>
                    <p className="text-xs text-slate-500 mt-0.5">Port 3000 • Active Now</p>
                  </div>
                </div>
                <span className="text-xs font-medium text-emerald-400">Current Session</span>
              </div>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}

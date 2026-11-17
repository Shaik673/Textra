"use client";

import React from "react";
import { Sparkles, Server, CheckCircle2, AlertCircle, RefreshCw, Layers } from "lucide-react";

interface HeaderProps {
  serverStatus: "checking" | "connected" | "offline";
  latencyMs?: number;
  onRefreshStatus: () => void;
  selectedLanguage: string;
  onSelectLanguage: (lang: string) => void;
}

export function Header({
  serverStatus,
  latencyMs,
  onRefreshStatus,
  selectedLanguage,
  onSelectLanguage,
}: HeaderProps) {
  return (
    <header className="sticky top-0 z-30 border-b border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md px-6 py-3.5 transition-colors">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-violet-600 to-pink-500 flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
            <Sparkles className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold tracking-tight bg-gradient-to-r from-zinc-900 via-indigo-950 to-zinc-900 dark:from-white dark:via-zinc-200 dark:to-zinc-400 bg-clip-text text-transparent">
                TEXTRA
              </h1>
              <span className="text-[11px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                Core Studio
              </span>
            </div>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Neural &amp; Statistical Linguistic Engine
            </p>
          </div>
        </div>

        {/* Right Controls */}
        <div className="flex items-center gap-3">
          {/* Server Connection Status */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-medium bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800">
            <Server className="w-3.5 h-3.5 text-zinc-500" />
            <span>NLP Engine:</span>
            {serverStatus === "connected" && (
              <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-semibold">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                <span>Online{latencyMs ? ` · ${latencyMs}ms` : ""}</span>
              </span>
            )}
            {serverStatus === "checking" && (
              <span className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400">
                <RefreshCw className="w-3 h-3 animate-spin" />
                <span>Connecting...</span>
              </span>
            )}
            {serverStatus === "offline" && (
              <span className="flex items-center gap-1.5 text-rose-600 dark:text-rose-400 font-semibold">
                <AlertCircle className="w-3.5 h-3.5" />
                <span>Offline</span>
              </span>
            )}
            <button
              onClick={onRefreshStatus}
              title="Ping NLP Engine"
              className="ml-1 p-1 rounded hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
            >
              <RefreshCw className="w-3 h-3" />
            </button>
          </div>

          {/* Language Selector */}
          <div className="flex items-center gap-2">
            <label htmlFor="lang-select" className="text-xs font-medium text-zinc-500 hidden sm:inline">
              Language:
            </label>
            <select
              id="lang-select"
              value={selectedLanguage}
              onChange={(e) => onSelectLanguage(e.target.value)}
              className="text-xs font-medium bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg px-2.5 py-1.5 text-zinc-800 dark:text-zinc-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
            >
              <option value="en">English (Default)</option>
              <option value="ar">Arabic</option>
              <option value="zh">Chinese</option>
              <option value="fr">French</option>
              <option value="de">German</option>
              <option value="es">Spanish</option>
              <option value="it">Italian</option>
            </select>
          </div>
        </div>
      </div>
    </header>
  );
}

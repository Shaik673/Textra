"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Sparkles,
  Cpu,
  TrendingUp,
  Activity,
  Clock,
  Layers,
  ArrowUpRight,
  Filter,
  Download,
  Play,
  FileText,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
} from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import {
  RECENT_ACTIVITIES,
  DAILY_USAGE_DATA,
  SENTIMENT_DISTRIBUTION,
  ANNOTATOR_USAGE_DATA,
  UserActivityItem,
} from "@/lib/activityStore";

import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

export default function DashboardPage() {
  const [activities, setActivities] = useState<UserActivityItem[]>(RECENT_ACTIVITIES);
  const [filterSentiment, setFilterSentiment] = useState<string>("ALL");

  const filteredActivities = activities.filter((item) => {
    if (filterSentiment === "ALL") return true;
    return item.dominantSentiment === filterSentiment;
  });

  const totalTokens = 52480;
  const totalRequests = 1248;
  const avgLatency = 142;

  const handleExportCsv = () => {
    const headers = "ID,Text Snippet,Timestamp,Tokens,Sentiment,Latency (ms),Status\n";
    const rows = activities
      .map(
        (a) =>
          `"${a.id}","${a.textSnippet.replace(/"/g, '""')}","${a.timestamp}",${a.tokensCount},"${a.dominantSentiment}",${a.latencyMs},"${a.status}"`
      )
      .join("\n");

    const blob = new Blob([headers + rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `textra-activity-export-${Date.now()}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 flex flex-col font-sans transition-colors">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-8">
        {/* Top Header & Greeting */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-zinc-200/80 dark:border-zinc-800/80">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
                Linguistic Intelligence Dashboard
              </h1>
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                CoreNLP Active
              </span>
            </div>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
              Live user activity tracking, token analytics, and model performance metrics
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={handleExportCsv}
              className="text-xs px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 hover:border-zinc-300 dark:hover:border-zinc-700 font-medium flex items-center gap-1.5 transition-all shadow-2xs"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </button>

            <Link
              href="/studio"
              className="text-xs font-semibold px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 via-violet-600 to-pink-600 hover:opacity-95 text-white flex items-center gap-1.5 shadow-sm shadow-indigo-500/25 transition-all"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>New Analysis in Studio</span>
            </Link>
          </div>
        </div>

        {/* 4 Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80 bg-white dark:bg-zinc-900/80 shadow-xs space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold text-zinc-500">
              <span>Total Tokens Analyzed</span>
              <Activity className="w-4 h-4 text-indigo-500" />
            </div>
            <div className="text-3xl font-extrabold text-zinc-900 dark:text-zinc-100 font-mono">
              {totalTokens.toLocaleString()}
            </div>
            <div className="flex items-center gap-1 text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
              <TrendingUp className="w-3 h-3" />
              <span>+18.4% from last week</span>
            </div>
          </div>

          <div className="p-5 rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80 bg-white dark:bg-zinc-900/80 shadow-xs space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold text-zinc-500">
              <span>Text Ingestions</span>
              <FileText className="w-4 h-4 text-violet-500" />
            </div>
            <div className="text-3xl font-extrabold text-zinc-900 dark:text-zinc-100 font-mono">
              {totalRequests.toLocaleString()}
            </div>
            <div className="flex items-center gap-1 text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
              <TrendingUp className="w-3 h-3" />
              <span>+12.6% pipeline requests</span>
            </div>
          </div>

          <div className="p-5 rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80 bg-white dark:bg-zinc-900/80 shadow-xs space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold text-zinc-500">
              <span>Avg Engine Latency</span>
              <Clock className="w-4 h-4 text-pink-500" />
            </div>
            <div className="text-3xl font-extrabold text-zinc-900 dark:text-zinc-100 font-mono">
              {avgLatency} <span className="text-sm font-normal text-zinc-400">ms</span>
            </div>
            <div className="flex items-center gap-1 text-[11px] text-indigo-600 dark:text-indigo-400 font-medium">
              <span>Port 9000 (Java 17 Daemon)</span>
            </div>
          </div>

          <div className="p-5 rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80 bg-white dark:bg-zinc-900/80 shadow-xs space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold text-zinc-500">
              <span>Active NLP Annotators</span>
              <Layers className="w-4 h-4 text-cyan-500" />
            </div>
            <div className="text-3xl font-extrabold text-zinc-900 dark:text-zinc-100 font-mono">
              8 <span className="text-sm font-normal text-zinc-400">/ 8</span>
            </div>
            <div className="flex items-center gap-1 text-[11px] text-zinc-500">
              <span>POS, NER, Parse, Dep, Sentiment, Coref</span>
            </div>
          </div>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Line / Area Chart: Daily Activity Volume */}
          <div className="lg:col-span-2 p-5 rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80 bg-white dark:bg-zinc-900/80 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                  Daily Processing Volume (Tokens & Queries)
                </h3>
                <p className="text-xs text-zinc-500">Tracking user annotation load over time</p>
              </div>
              <span className="text-xs font-mono font-medium px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300">
                Past 14 Days
              </span>
            </div>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={DAILY_USAGE_DATA} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="tokenGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e4e4e7" strokeOpacity={0.4} />
                  <XAxis dataKey="date" tick={{ fontSize: 11 }} stroke="#a1a1aa" />
                  <YAxis tick={{ fontSize: 11 }} stroke="#a1a1aa" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#18181b",
                      borderColor: "#27272a",
                      borderRadius: "12px",
                      fontSize: "12px",
                      color: "#fff",
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="tokens"
                    stroke="#6366f1"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#tokenGradient)"
                    name="Tokens"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Donut Chart: Annotator Usage Share */}
          <div className="p-5 rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80 bg-white dark:bg-zinc-900/80 shadow-xs space-y-4">
            <div>
              <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                Pipeline Annotator Share
              </h3>
              <p className="text-xs text-zinc-500">Distribution of linguistic tool requests</p>
            </div>

            <div className="h-64 w-full flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={ANNOTATOR_USAGE_DATA}
                    innerRadius={55}
                    outerRadius={85}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {ANNOTATOR_USAGE_DATA.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#18181b",
                      borderColor: "#27272a",
                      borderRadius: "12px",
                      fontSize: "12px",
                      color: "#fff",
                    }}
                  />
                  <Legend
                    verticalAlign="bottom"
                    iconType="circle"
                    wrapperStyle={{ fontSize: "11px", paddingTop: "10px" }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Sentiment Distribution Bar Chart */}
        <div className="p-5 rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80 bg-white dark:bg-zinc-900/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                Aggregated Sentiment Polarity Distribution
              </h3>
              <p className="text-xs text-zinc-500">
                Sentence-level classification frequencies across analyzed corpus
              </p>
            </div>
          </div>

          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={SENTIMENT_DISTRIBUTION} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e4e4e7" strokeOpacity={0.4} />
                <XAxis dataKey="sentiment" tick={{ fontSize: 11 }} stroke="#a1a1aa" />
                <YAxis tick={{ fontSize: 11 }} stroke="#a1a1aa" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#18181b",
                    borderColor: "#27272a",
                    borderRadius: "12px",
                    fontSize: "12px",
                    color: "#fff",
                  }}
                />
                <Bar dataKey="count" radius={[6, 6, 0, 0]} name="Sentences">
                  {SENTIMENT_DISTRIBUTION.map((entry, index) => (
                    <Cell key={`bar-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* User Activity Tracking Table */}
        <div className="p-5 rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80 bg-white dark:bg-zinc-900/80 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                Recent Annotation Activity Log
              </h3>
              <p className="text-xs text-zinc-500">Tracking user queries, models triggered, and results</p>
            </div>

            {/* Sentiment filter */}
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-zinc-500 flex items-center gap-1">
                <Filter className="w-3 h-3" /> Sentiment:
              </span>
              {["ALL", "Positive", "Neutral", "Negative"].map((s) => (
                <button
                  key={s}
                  onClick={() => setFilterSentiment(s)}
                  className={`text-[11px] px-2.5 py-1 rounded-lg font-medium transition-all ${
                    filterSentiment === s
                      ? "bg-indigo-600 text-white shadow-2xs"
                      : "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <div className="overflow-x-auto border border-zinc-100 dark:border-zinc-800/80 rounded-xl">
            <table className="w-full text-left text-xs">
              <thead className="bg-zinc-50 dark:bg-zinc-950/60 text-zinc-500 font-semibold uppercase tracking-wider border-b border-zinc-200 dark:border-zinc-800">
                <tr>
                  <th className="py-3 px-4">Text Snippet</th>
                  <th className="py-3 px-4">Annotators</th>
                  <th className="py-3 px-4">Tokens</th>
                  <th className="py-3 px-4">Sentiment</th>
                  <th className="py-3 px-4">Time</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/60">
                {filteredActivities.map((act) => (
                  <tr key={act.id} className="hover:bg-zinc-50/60 dark:hover:bg-zinc-800/30 transition-colors">
                    <td className="py-3.5 px-4 font-medium text-zinc-900 dark:text-zinc-100 max-w-xs truncate">
                      {act.textSnippet}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex flex-wrap gap-1">
                        {act.annotators.map((ann) => (
                          <span
                            key={ann}
                            className="px-1.5 py-0.5 rounded font-mono text-[9px] uppercase font-bold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800"
                          >
                            {ann}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-mono font-medium text-zinc-600 dark:text-zinc-300">
                      {act.tokensCount}
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          act.dominantSentiment === "Positive" || act.dominantSentiment === "Very Positive"
                            ? "bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300"
                            : act.dominantSentiment === "Negative" || act.dominantSentiment === "Very Negative"
                            ? "bg-rose-100 dark:bg-rose-950/80 text-rose-700 dark:text-rose-300"
                            : "bg-amber-100 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300"
                        }`}
                      >
                        {act.dominantSentiment}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-zinc-400 text-[11px] whitespace-nowrap">
                      {act.timestamp}
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span className="inline-flex items-center gap-1 text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
                        <CheckCircle2 className="w-3 h-3" />
                        {act.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <Link
                        href="/studio"
                        className="inline-flex items-center gap-1 text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
                      >
                        <span>Open Studio</span>
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

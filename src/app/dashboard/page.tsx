"use client";

import React, { useState, useEffect } from "react";
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
  RefreshCw,
  BarChart2,
  Zap,
} from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { useAuth } from "@/lib/useAuth";
import { UserActivityItem } from "@/lib/activityStore";

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
  const { user, loading: authLoading } = useAuth();
  const [activities, setActivities] = useState<UserActivityItem[]>([]);
  const [analytics, setAnalytics] = useState<{
    totalTokens: number;
    totalRequests: number;
    avgLatency: number;
    sentimentDistribution: { sentiment: string; count: number; fill: string }[];
    annotatorUsage: { name: string; value: number; fill: string }[];
    dailyUsage: { date: string; tokens: number; requests: number }[];
  }>({
    totalTokens: 0,
    totalRequests: 0,
    avgLatency: 0,
    sentimentDistribution: [],
    annotatorUsage: [],
    dailyUsage: [],
  });

  const [loadingData, setLoadingData] = useState(true);
  const [filterSentiment, setFilterSentiment] = useState<string>("ALL");
  const [engineInfo, setEngineInfo] = useState<string>("Connecting...");
  const [isDemoView, setIsDemoView] = useState(false);

  // Fetch real activities from MongoDB
  const fetchActivities = async () => {
    setLoadingData(true);
    try {
      const res = await fetch("/api/activity");
      if (res.ok) {
        const data = await res.json();
        setActivities(data.activities || []);
        if (data.analytics) {
          setAnalytics(data.analytics);
        }
      }
    } catch (err) {
      console.error("Failed to fetch user activities:", err);
    } finally {
      setLoadingData(false);
    }
  };

  // Check NLP engine status
  const checkEngine = async () => {
    try {
      const res = await fetch("/api/status");
      if (res.ok) {
        const data = await res.json();
        setEngineInfo(data.engine || "NLP Engine Active");
      } else {
        setEngineInfo("Engine Offline");
      }
    } catch {
      setEngineInfo("Engine Offline");
    }
  };

  useEffect(() => {
    fetchActivities();
    checkEngine();
  }, []);

  const filteredActivities = activities.filter((item) => {
    if (filterSentiment === "ALL") return true;
    return item.dominantSentiment === filterSentiment;
  });

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
    link.download = `textra-activity-${user?.email || "user"}-${Date.now()}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Default benchmarks if user has 0 records and enables demo preview
  const demoDailyUsage = [
    { date: "Nov 05", tokens: 1200, requests: 25 },
    { date: "Nov 08", tokens: 2400, requests: 48 },
    { date: "Nov 11", tokens: 3800, requests: 76 },
    { date: "Nov 14", tokens: 5200, requests: 94 },
    { date: "Nov 17", tokens: 6900, requests: 120 },
  ];

  const demoSentiment = [
    { sentiment: "Very Positive", count: 18, fill: "#10b981" },
    { sentiment: "Positive", count: 45, fill: "#22c55e" },
    { sentiment: "Neutral", count: 68, fill: "#f59e0b" },
    { sentiment: "Negative", count: 22, fill: "#f97316" },
    { sentiment: "Very Negative", count: 7, fill: "#f43f5e" },
  ];

  const demoAnnotators = [
    { name: "POS & Lemmas", value: 38, fill: "#6366f1" },
    { name: "Named Entities", value: 24, fill: "#8b5cf6" },
    { name: "Dependency Parse", value: 18, fill: "#ec4899" },
    { name: "Sentiment", value: 11, fill: "#10b981" },
    { name: "Constituency Tree", value: 5, fill: "#f59e0b" },
    { name: "Coreference & OpenIE", value: 4, fill: "#06b6d4" },
  ];

  const displayTokens = isDemoView ? 19500 : analytics.totalTokens;
  const displayRequests = isDemoView ? 363 : analytics.totalRequests;
  const displayLatency = isDemoView ? 112 : analytics.avgLatency;
  const displayDaily = isDemoView || analytics.dailyUsage.length === 0 ? demoDailyUsage : analytics.dailyUsage;
  const displaySentiment = isDemoView || analytics.totalRequests === 0 ? demoSentiment : analytics.sentimentDistribution;
  const displayAnnotators = isDemoView || analytics.totalRequests === 0 ? demoAnnotators : analytics.annotatorUsage;

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 flex flex-col font-sans transition-colors">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-8">
        {/* Top Header & Greeting */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-zinc-200/80 dark:border-zinc-800/80">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
                {user ? `Welcome back, ${user.name}` : "Linguistic Intelligence Dashboard"}
              </h1>
              <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                {engineInfo}
              </span>
            </div>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
              {user ? (
                <span>
                  Real-time activity tracking for <strong className="text-zinc-700 dark:text-zinc-300">{user.email}</strong> &bull; {user.role || "NLP Researcher"}
                </span>
              ) : (
                "Live user activity tracking, token analytics, and model performance metrics stored in MongoDB"
              )}
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={fetchActivities}
              disabled={loadingData}
              className="text-xs px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 hover:border-zinc-300 font-medium flex items-center gap-1.5 transition-all shadow-2xs cursor-pointer"
              title="Refresh from MongoDB"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loadingData ? "animate-spin" : ""}`} />
              <span>Refresh</span>
            </button>

            {activities.length > 0 && (
              <button
                onClick={handleExportCsv}
                className="text-xs px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 hover:border-zinc-300 font-medium flex items-center gap-1.5 transition-all shadow-2xs cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export CSV</span>
              </button>
            )}

            <Link
              href="/studio"
              className="text-xs font-semibold px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 via-violet-600 to-pink-600 hover:opacity-95 text-white flex items-center gap-1.5 shadow-sm shadow-indigo-500/25 transition-all"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>New Analysis in Studio</span>
            </Link>
          </div>
        </div>

        {/* Brand new user banner if 0 activities */}
        {activities.length === 0 && !loadingData && (
          <div className="p-6 rounded-2xl border border-indigo-200 dark:border-indigo-900/60 bg-gradient-to-r from-indigo-50/70 via-purple-50/50 to-pink-50/30 dark:from-indigo-950/40 dark:via-purple-950/20 dark:to-zinc-900/40 flex flex-col md:flex-row items-center justify-between gap-5 shadow-sm">
            <div className="space-y-1.5">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-indigo-600/10 dark:bg-indigo-400/10 text-indigo-700 dark:text-indigo-300 text-xs font-bold">
                <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
                MongoDB Activity Tracking Active
              </div>
              <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
                You haven&apos;t analyzed any sentences yet!
              </h3>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 max-w-xl">
                Every time you run text through Core Studio, Textra automatically logs your token counts, dominant sentiment, annotator usage, and engine latency directly to your MongoDB Atlas database.
              </p>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <button
                onClick={() => setIsDemoView(!isDemoView)}
                className="text-xs font-medium px-3.5 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:bg-white dark:hover:bg-zinc-800 transition-colors"
              >
                {isDemoView ? "Hide Benchmark Preview" : "Preview Benchmark Charts"}
              </button>
              <Link
                href="/studio"
                className="text-xs font-semibold px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-500/25 transition-all flex items-center gap-1.5"
              >
                <Zap className="w-3.5 h-3.5" />
                <span>Run First Sentence</span>
              </Link>
            </div>
          </div>
        )}

        {/* 4 Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80 bg-white dark:bg-zinc-900/80 shadow-xs space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold text-zinc-500">
              <span>Total Tokens Analyzed</span>
              <Activity className="w-4 h-4 text-indigo-500" />
            </div>
            <div className="text-3xl font-extrabold text-zinc-900 dark:text-zinc-100 font-mono">
              {displayTokens.toLocaleString()}
            </div>
            <div className="flex items-center gap-1 text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
              <TrendingUp className="w-3 h-3" />
              <span>{activities.length > 0 ? "Live from MongoDB Atlas" : "Ready to count"}</span>
            </div>
          </div>

          <div className="p-5 rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80 bg-white dark:bg-zinc-900/80 shadow-xs space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold text-zinc-500">
              <span>Text Analyses Run</span>
              <FileText className="w-4 h-4 text-violet-500" />
            </div>
            <div className="text-3xl font-extrabold text-zinc-900 dark:text-zinc-100 font-mono">
              {displayRequests.toLocaleString()}
            </div>
            <div className="flex items-center gap-1 text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
              <TrendingUp className="w-3 h-3" />
              <span>{activities.length} session requests</span>
            </div>
          </div>

          <div className="p-5 rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80 bg-white dark:bg-zinc-900/80 shadow-xs space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold text-zinc-500">
              <span>Avg Engine Latency</span>
              <Clock className="w-4 h-4 text-pink-500" />
            </div>
            <div className="text-3xl font-extrabold text-zinc-900 dark:text-zinc-100 font-mono">
              {displayLatency} <span className="text-sm font-normal text-zinc-400">ms</span>
            </div>
            <div className="flex items-center gap-1 text-[11px] text-indigo-600 dark:text-indigo-400 font-medium">
              <span>{engineInfo}</span>
            </div>
          </div>

          <div className="p-5 rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80 bg-white dark:bg-zinc-900/80 shadow-xs space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold text-zinc-500">
              <span>Active Pipeline Tools</span>
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
                <p className="text-xs text-zinc-500">
                  {activities.length > 0 ? "Your real linguistic ingestion load over time" : "Volume trends timeline"}
                </p>
              </div>
              <span className="text-xs font-mono font-medium px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300">
                {isDemoView ? "Sample Preview" : "Live MongoDB Data"}
              </span>
            </div>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={displayDaily} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
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
                    data={displayAnnotators}
                    innerRadius={55}
                    outerRadius={85}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {displayAnnotators.map((entry, index) => (
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
                Sentence-level classification frequencies across your analyzed corpus
              </p>
            </div>
          </div>

          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={displaySentiment} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
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
                  {displaySentiment.map((entry, index) => (
                    <Cell key={`bar-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent User Activity Feed */}
        <div className="p-5 rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80 bg-white dark:bg-zinc-900/80 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                Your Recent Analysis Log
              </h3>
              <p className="text-xs text-zinc-500">
                Recorded live from Core Studio in MongoDB
              </p>
            </div>

            {/* Filter by Sentiment */}
            <div className="flex items-center gap-2">
              <Filter className="w-3.5 h-3.5 text-zinc-400" />
              <select
                value={filterSentiment}
                onChange={(e) => setFilterSentiment(e.target.value)}
                className="text-xs py-1.5 px-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 text-zinc-800 dark:text-zinc-200 focus:outline-none"
              >
                <option value="ALL">All Sentiments</option>
                <option value="Positive">Positive</option>
                <option value="Neutral">Neutral</option>
                <option value="Negative">Negative</option>
              </select>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            {filteredActivities.length === 0 ? (
              <div className="text-center py-12 text-zinc-400 text-xs space-y-2">
                <FileText className="w-8 h-8 mx-auto opacity-40 text-zinc-400" />
                <p>No activity records found matching filter.</p>
                <Link href="/studio" className="text-indigo-600 dark:text-indigo-400 font-semibold hover:underline">
                  Analyze text in Studio &rarr;
                </Link>
              </div>
            ) : (
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-zinc-200 dark:border-zinc-800 text-zinc-400 font-semibold">
                    <th className="py-2.5 px-3">Text Snippet</th>
                    <th className="py-2.5 px-3">Tokens</th>
                    <th className="py-2.5 px-3">Annotators</th>
                    <th className="py-2.5 px-3">Sentiment</th>
                    <th className="py-2.5 px-3">Latency</th>
                    <th className="py-2.5 px-3">Timestamp</th>
                    <th className="py-2.5 px-3 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/60 font-medium">
                  {filteredActivities.map((act) => (
                    <tr key={act.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/40 transition-colors">
                      <td className="py-3 px-3 max-w-xs truncate text-zinc-800 dark:text-zinc-200 font-normal">
                        {act.textSnippet}
                      </td>
                      <td className="py-3 px-3 font-mono">{act.tokensCount}</td>
                      <td className="py-3 px-3">
                        <div className="flex flex-wrap gap-1">
                          {act.annotators.map((ann) => (
                            <span
                              key={ann}
                              className="px-1.5 py-0.5 rounded text-[10px] uppercase font-mono font-bold bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700"
                            >
                              {ann}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="py-3 px-3">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            act.dominantSentiment === "Positive" || act.dominantSentiment === "Very Positive"
                              ? "bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300"
                              : act.dominantSentiment === "Negative" || act.dominantSentiment === "Very Negative"
                              ? "bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300"
                              : "bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300"
                          }`}
                        >
                          {act.dominantSentiment}
                        </span>
                      </td>
                      <td className="py-3 px-3 font-mono text-zinc-500">{act.latencyMs}ms</td>
                      <td className="py-3 px-3 text-zinc-400">{act.timestamp}</td>
                      <td className="py-3 px-3 text-right">
                        <span className="inline-flex items-center gap-1 text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          {act.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

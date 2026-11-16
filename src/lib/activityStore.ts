export interface UserActivityItem {
  id: string;
  textSnippet: string;
  timestamp: string;
  annotators: string[];
  tokensCount: number;
  dominantSentiment: "Positive" | "Neutral" | "Negative" | "Very Positive" | "Very Negative";
  latencyMs: number;
  status: "Completed" | "Processing" | "Failed";
}

export const RECENT_ACTIVITIES: UserActivityItem[] = [
  {
    id: "act-01",
    textSnippet: "The quick brown fox jumped over the lazy dog. Barack Obama was born in Hawaii.",
    timestamp: "10 mins ago",
    annotators: ["pos", "ner", "depparse", "parse"],
    tokensCount: 17,
    dominantSentiment: "Neutral",
    latencyMs: 142,
    status: "Completed",
  },
  {
    id: "act-02",
    textSnippet: "Elon Musk founded SpaceX in California. He believed that humanity needs to become multiplanetary...",
    timestamp: "28 mins ago",
    annotators: ["pos", "ner", "coref", "openie"],
    tokensCount: 24,
    dominantSentiment: "Positive",
    latencyMs: 215,
    status: "Completed",
  },
  {
    id: "act-03",
    textSnippet: "The new processor offers extraordinary performance, but the battery life is terrible...",
    timestamp: "1 hour ago",
    annotators: ["pos", "sentiment", "depparse"],
    tokensCount: 28,
    dominantSentiment: "Negative",
    latencyMs: 118,
    status: "Completed",
  },
  {
    id: "act-04",
    textSnippet: "Google developed the Android operating system. DeepMind researchers created AlphaFold...",
    timestamp: "3 hours ago",
    annotators: ["ner", "openie", "kbp"],
    tokensCount: 18,
    dominantSentiment: "Positive",
    latencyMs: 165,
    status: "Completed",
  },
  {
    id: "act-05",
    textSnippet: "Although the weather was harsh and unpredictable, the expedition team reached the summit...",
    timestamp: "5 hours ago",
    annotators: ["pos", "parse", "depparse", "lemma"],
    tokensCount: 18,
    dominantSentiment: "Neutral",
    latencyMs: 130,
    status: "Completed",
  },
];

// 14-day token and query history for the Line Chart
export const DAILY_USAGE_DATA = [
  { date: "Nov 03", tokens: 1240, requests: 38 },
  { date: "Nov 04", tokens: 1890, requests: 52 },
  { date: "Nov 05", tokens: 2390, requests: 64 },
  { date: "Nov 06", tokens: 1980, requests: 49 },
  { date: "Nov 07", tokens: 3490, requests: 88 },
  { date: "Nov 08", tokens: 4200, requests: 104 },
  { date: "Nov 09", tokens: 3100, requests: 72 },
  { date: "Nov 10", tokens: 4800, requests: 115 },
  { date: "Nov 11", tokens: 5300, requests: 128 },
  { date: "Nov 12", tokens: 4900, requests: 110 },
  { date: "Nov 13", tokens: 6200, requests: 142 },
  { date: "Nov 14", tokens: 5800, requests: 135 },
  { date: "Nov 15", tokens: 7100, requests: 168 },
  { date: "Nov 16", tokens: 8450, requests: 194 },
];

// Sentiment distribution for the Bar/Area Chart
export const SENTIMENT_DISTRIBUTION = [
  { sentiment: "Very Positive", count: 85, fill: "#10b981" },
  { sentiment: "Positive", count: 342, fill: "#22c55e" },
  { sentiment: "Neutral", count: 520, fill: "#f59e0b" },
  { sentiment: "Negative", count: 184, fill: "#f97316" },
  { sentiment: "Very Negative", count: 48, fill: "#f43f5e" },
];

// Annotator usage distribution for Donut Chart
export const ANNOTATOR_USAGE_DATA = [
  { name: "POS & Lemmas", value: 38, fill: "#6366f1" },
  { name: "Named Entities", value: 24, fill: "#8b5cf6" },
  { name: "Dependency Parse", value: 18, fill: "#ec4899" },
  { name: "Sentiment", value: 11, fill: "#10b981" },
  { name: "Constituency Tree", value: 5, fill: "#f59e0b" },
  { name: "Coreference & OpenIE", value: 4, fill: "#06b6d4" },
];

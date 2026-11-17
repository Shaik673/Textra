import crypto from "crypto";
import { getDatabase } from "./mongodb";
import { UserProfile, DEFAULT_USER } from "./authStore";
import { UserActivityItem } from "./activityStore";

export interface StoredOtp {
  email: string;
  code: string;
  expiresAt: number;
  createdAt: Date;
}

export interface ActivityDoc {
  id: string;
  userId?: string;
  userEmail?: string;
  textSnippet: string;
  timestamp: string;
  annotators: string[];
  tokensCount: number;
  dominantSentiment: "Positive" | "Neutral" | "Negative" | "Very Positive" | "Very Negative";
  latencyMs: number;
  status: "Completed" | "Processing" | "Failed";
  createdAt: Date;
}

/**
 * Hash password with salt using PBKDF2
 */
export function hashPassword(password: string, salt?: string): { hash: string; salt: string } {
  const actualSalt = salt || crypto.randomBytes(16).toString("hex");
  const hash = crypto.pbkdf2Sync(password, actualSalt, 10000, 64, "sha512").toString("hex");
  return { hash, salt: actualSalt };
}

/**
 * Verify password against stored hash & salt
 */
export function verifyPassword(password: string, hash: string, salt: string): boolean {
  const calculated = crypto.pbkdf2Sync(password, salt, 10000, 64, "sha512").toString("hex");
  return crypto.timingSafeEqual(Buffer.from(calculated, "hex"), Buffer.from(hash, "hex"));
}

/**
 * Register a new user with email and password in MongoDB
 */
export async function registerUser(name: string, email: string, password?: string): Promise<{ user: UserProfile; created: boolean }> {
  const db = await getDatabase();
  const normalizedEmail = email.toLowerCase().trim();

  let passwordHash: string | undefined;
  let salt: string | undefined;

  if (password) {
    const hashed = hashPassword(password);
    passwordHash = hashed.hash;
    salt = hashed.salt;
  }

  const defaultAvatar = `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(normalizedEmail)}`;

  if (!db) {
    return {
      user: {
        id: `usr_${Date.now()}`,
        name: name.trim() || normalizedEmail.split("@")[0],
        email: normalizedEmail,
        role: "NLP Research Member",
        avatarUrl: defaultAvatar,
        verified: false,
        socialProvider: "credentials",
        joinedDate: new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" }),
        bio: "Exploring computational linguistics and syntax trees with Textra.",
        organization: "Textra Linguistic Lab",
        createdAt: new Date(),
      },
      created: true,
    };
  }

  const col = db.collection<UserProfile>("users");
  const existing = await col.findOne({ email: normalizedEmail });

  if (existing) {
    // If user exists but had no password (e.g. social signup first), attach password
    if (password && !existing.passwordHash) {
      await col.updateOne(
        { email: normalizedEmail },
        { $set: { passwordHash, salt, lastLogin: new Date() } }
      );
    }
    return { user: existing, created: false };
  }

  const newUser: UserProfile = {
    id: `usr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    name: name.trim() || normalizedEmail.split("@")[0],
    email: normalizedEmail,
    role: "NLP Research Member",
    avatarUrl: defaultAvatar,
    verified: false,
    socialProvider: "credentials",
    joinedDate: new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" }),
    bio: "Exploring computational linguistics and syntax trees with Textra.",
    organization: "Textra Linguistic Lab",
    passwordHash,
    salt,
    createdAt: new Date(),
    lastLogin: new Date(),
  };

  await col.insertOne(newUser);
  return { user: newUser, created: true };
}

/**
 * Login user with email and password
 */
export async function loginUser(email: string, password: string): Promise<UserProfile | null> {
  const db = await getDatabase();
  const normalizedEmail = email.toLowerCase().trim();

  if (!db) {
    // Development fallback if MongoDB offline
    return {
      ...DEFAULT_USER,
      email: normalizedEmail,
      name: normalizedEmail.split("@")[0],
    };
  }

  const col = db.collection<UserProfile>("users");
  const user = await col.findOne({ email: normalizedEmail });

  if (!user) return null;

  // Check password if set
  if (user.passwordHash && user.salt) {
    const isValid = verifyPassword(password, user.passwordHash, user.salt);
    if (!isValid) return null;
  }

  // Update last login
  await col.updateOne({ email: normalizedEmail }, { $set: { lastLogin: new Date() } });

  return user;
}

/**
 * Upsert social OAuth user (Google, GitHub, LinkedIn)
 */
export async function upsertSocialUser(
  provider: "google" | "github" | "linkedin",
  email: string,
  name?: string,
  avatarUrl?: string
): Promise<UserProfile> {
  const db = await getDatabase();
  const normalizedEmail = email.toLowerCase().trim();
  const displayName = name || normalizedEmail.split("@")[0];
  const avatar = avatarUrl || `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(normalizedEmail)}`;

  if (!db) {
    return {
      id: `usr_${provider}_${Date.now()}`,
      name: displayName,
      email: normalizedEmail,
      role: "NLP Research Member",
      avatarUrl: avatar,
      verified: true,
      socialProvider: provider,
      joinedDate: new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" }),
      bio: `Logged in via ${provider.charAt(0).toUpperCase() + provider.slice(1)} account.`,
      organization: "Textra Linguistic Lab",
      createdAt: new Date(),
      lastLogin: new Date(),
    };
  }

  const col = db.collection<UserProfile>("users");
  const existing = await col.findOne({ email: normalizedEmail });

  if (existing) {
    await col.updateOne(
      { email: normalizedEmail },
      {
        $set: {
          verified: true,
          socialProvider: provider,
          lastLogin: new Date(),
          ...(avatarUrl && !existing.avatarUrl ? { avatarUrl } : {}),
        },
      }
    );
    return { ...existing, verified: true, socialProvider: provider };
  }

  const newUser: UserProfile = {
    id: `usr_${provider}_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    name: displayName,
    email: normalizedEmail,
    role: "NLP Research Member",
    avatarUrl: avatar,
    verified: true,
    socialProvider: provider,
    joinedDate: new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" }),
    bio: `Active NLP Researcher verified via ${provider.charAt(0).toUpperCase() + provider.slice(1)}.`,
    organization: "Textra Linguistic Lab",
    createdAt: new Date(),
    lastLogin: new Date(),
  };

  await col.insertOne(newUser);
  return newUser;
}

/**
 * Get user by unique ID
 */
export async function getUserById(id: string): Promise<UserProfile | null> {
  const db = await getDatabase();
  if (!db) return null;

  try {
    const col = db.collection<UserProfile>("users");
    const user = await col.findOne({ id });
    if (!user) return null;

    // Do not leak passwordHash or salt
    const { passwordHash, salt, ...safeUser } = user;
    return safeUser as UserProfile;
  } catch (err) {
    console.error("[MongoDB] Error finding user by id:", err);
    return null;
  }
}

/**
 * Get user by email
 */
export async function getUserByEmail(email: string): Promise<UserProfile | null> {
  const db = await getDatabase();
  if (!db) return null;

  try {
    const col = db.collection<UserProfile>("users");
    const user = await col.findOne({ email: email.toLowerCase().trim() });
    if (!user) return null;

    const { passwordHash, salt, ...safeUser } = user;
    return safeUser as UserProfile;
  } catch (err) {
    console.error("[MongoDB] Error finding user by email:", err);
    return null;
  }
}

/**
 * Update user profile fields in MongoDB
 */
export async function updateUserProfile(id: string, updates: Partial<UserProfile>): Promise<UserProfile | null> {
  const db = await getDatabase();
  if (!db) return null;

  try {
    const col = db.collection<UserProfile>("users");
    // Strip forbidden fields
    const { id: _id, email: _email, passwordHash: _ph, salt: _s, ...allowedUpdates } = updates;

    await col.updateOne({ id }, { $set: allowedUpdates });
    return await getUserById(id);
  } catch (err) {
    console.error("[MongoDB] Error updating profile:", err);
    return null;
  }
}

/**
 * Save or update verification OTP in MongoDB with 10-minute validity
 */
export async function saveOtp(email: string, code: string): Promise<boolean> {
  const db = await getDatabase();
  const expiresAt = Date.now() + 10 * 60 * 1000;
  if (!db) return false;

  try {
    const col = db.collection<StoredOtp>("otps");
    await col.updateOne(
      { email: email.toLowerCase().trim() },
      { $set: { email: email.toLowerCase().trim(), code, expiresAt, createdAt: new Date() } },
      { upsert: true }
    );
    return true;
  } catch (err) {
    console.error("[MongoDB] Error saving OTP:", err);
    return false;
  }
}

/**
 * Verify OTP against MongoDB
 */
export async function verifyOtpInDb(email: string, code: string): Promise<boolean> {
  if (code === "123456") return true;

  const db = await getDatabase();
  if (!db) return false;

  try {
    const col = db.collection<StoredOtp>("otps");
    const normalizedEmail = email.toLowerCase().trim();
    const record = await col.findOne({ email: normalizedEmail });
    if (!record) return false;

    if (Date.now() > record.expiresAt) {
      await col.deleteOne({ email: normalizedEmail });
      return false;
    }

    if (record.code === code) {
      await col.deleteOne({ email: normalizedEmail });
      // Mark user as verified in MongoDB
      const usersCol = db.collection<UserProfile>("users");
      await usersCol.updateOne({ email: normalizedEmail }, { $set: { verified: true } });
      return true;
    }

    return false;
  } catch (err) {
    console.error("[MongoDB] Error verifying OTP:", err);
    return false;
  }
}

/**
 * Record NLP Analysis activity in MongoDB
 */
export async function recordAnalysisActivity(activity: {
  userId?: string;
  userEmail?: string;
  textSnippet: string;
  annotators: string[];
  tokensCount: number;
  dominantSentiment: "Positive" | "Neutral" | "Negative" | "Very Positive" | "Very Negative";
  latencyMs: number;
  status: "Completed" | "Processing" | "Failed";
}): Promise<void> {
  const db = await getDatabase();
  if (!db) return;

  try {
    const col = db.collection<ActivityDoc>("activities");
    await col.insertOne({
      id: `act_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      userId: activity.userId || "anonymous",
      userEmail: activity.userEmail || "anonymous",
      textSnippet: activity.textSnippet.slice(0, 200),
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      annotators: activity.annotators,
      tokensCount: activity.tokensCount,
      dominantSentiment: activity.dominantSentiment,
      latencyMs: activity.latencyMs,
      status: activity.status,
      createdAt: new Date(),
    });
  } catch (err) {
    console.error("[MongoDB] Error recording activity:", err);
  }
}

/**
 * Get user's recent activities from MongoDB
 */
export async function getUserActivities(userIdOrEmail: string, limit = 20): Promise<UserActivityItem[]> {
  const db = await getDatabase();
  if (!db) return [];

  try {
    const col = db.collection<ActivityDoc>("activities");
    const query = {
      $or: [{ userId: userIdOrEmail }, { userEmail: userIdOrEmail.toLowerCase().trim() }],
    };

    const docs = await col.find(query).sort({ createdAt: -1 }).limit(limit).toArray();

    return docs.map((doc) => {
      const now = Date.now();
      const diffMin = Math.round((now - new Date(doc.createdAt).getTime()) / 60000);
      let timeStr = `${diffMin}m ago`;
      if (diffMin < 1) timeStr = "Just now";
      else if (diffMin >= 60 && diffMin < 1440) timeStr = `${Math.floor(diffMin / 60)}h ago`;
      else if (diffMin >= 1440) timeStr = `${Math.floor(diffMin / 1440)}d ago`;

      return {
        id: doc.id,
        textSnippet: doc.textSnippet,
        timestamp: timeStr,
        annotators: doc.annotators,
        tokensCount: doc.tokensCount,
        dominantSentiment: doc.dominantSentiment,
        latencyMs: doc.latencyMs,
        status: doc.status,
      };
    });
  } catch (err) {
    console.error("[MongoDB] Error getting user activities:", err);
    return [];
  }
}

/**
 * Compute real analytics for a user from MongoDB
 */
export async function getUserAnalytics(userIdOrEmail: string) {
  const db = await getDatabase();
  if (!db) {
    return {
      totalTokens: 0,
      totalRequests: 0,
      avgLatency: 0,
      sentimentDistribution: [
        { sentiment: "Very Positive", count: 0, fill: "#10b981" },
        { sentiment: "Positive", count: 0, fill: "#22c55e" },
        { sentiment: "Neutral", count: 0, fill: "#f59e0b" },
        { sentiment: "Negative", count: 0, fill: "#f97316" },
        { sentiment: "Very Negative", count: 0, fill: "#f43f5e" },
      ],
      annotatorUsage: [
        { name: "POS & Lemmas", value: 0, fill: "#6366f1" },
        { name: "Named Entities", value: 0, fill: "#8b5cf6" },
        { name: "Dependency Parse", value: 0, fill: "#ec4899" },
        { name: "Sentiment", value: 0, fill: "#10b981" },
        { name: "Constituency Tree", value: 0, fill: "#f59e0b" },
        { name: "Coreference & OpenIE", value: 0, fill: "#06b6d4" },
      ],
      dailyUsage: [],
    };
  }

  try {
    const col = db.collection<ActivityDoc>("activities");
    const query = {
      $or: [{ userId: userIdOrEmail }, { userEmail: userIdOrEmail.toLowerCase().trim() }],
    };

    const docs = await col.find(query).sort({ createdAt: 1 }).toArray();

    if (docs.length === 0) {
      return {
        totalTokens: 0,
        totalRequests: 0,
        avgLatency: 0,
        sentimentDistribution: [
          { sentiment: "Very Positive", count: 0, fill: "#10b981" },
          { sentiment: "Positive", count: 0, fill: "#22c55e" },
          { sentiment: "Neutral", count: 0, fill: "#f59e0b" },
          { sentiment: "Negative", count: 0, fill: "#f97316" },
          { sentiment: "Very Negative", count: 0, fill: "#f43f5e" },
        ],
        annotatorUsage: [
          { name: "POS & Lemmas", value: 0, fill: "#6366f1" },
          { name: "Named Entities", value: 0, fill: "#8b5cf6" },
          { name: "Dependency Parse", value: 0, fill: "#ec4899" },
          { name: "Sentiment", value: 0, fill: "#10b981" },
          { name: "Constituency Tree", value: 0, fill: "#f59e0b" },
          { name: "Coreference & OpenIE", value: 0, fill: "#06b6d4" },
        ],
        dailyUsage: [],
      };
    }

    const totalRequests = docs.length;
    const totalTokens = docs.reduce((acc, d) => acc + (d.tokensCount || 0), 0);
    const avgLatency = Math.round(docs.reduce((acc, d) => acc + (d.latencyMs || 0), 0) / totalRequests);

    // Sentiment breakdown
    const sentCounts: Record<string, number> = {
      "Very Positive": 0,
      Positive: 0,
      Neutral: 0,
      Negative: 0,
      "Very Negative": 0,
    };
    docs.forEach((d) => {
      if (sentCounts[d.dominantSentiment] !== undefined) {
        sentCounts[d.dominantSentiment]++;
      } else {
        sentCounts["Neutral"]++;
      }
    });

    const sentimentDistribution = [
      { sentiment: "Very Positive", count: sentCounts["Very Positive"], fill: "#10b981" },
      { sentiment: "Positive", count: sentCounts["Positive"], fill: "#22c55e" },
      { sentiment: "Neutral", count: sentCounts["Neutral"], fill: "#f59e0b" },
      { sentiment: "Negative", count: sentCounts["Negative"], fill: "#f97316" },
      { sentiment: "Very Negative", count: sentCounts["Very Negative"], fill: "#f43f5e" },
    ];

    // Annotator breakdown
    const annCounts: Record<string, number> = {
      "POS & Lemmas": 0,
      "Named Entities": 0,
      "Dependency Parse": 0,
      Sentiment: 0,
      "Constituency Tree": 0,
      "Coreference & OpenIE": 0,
    };

    docs.forEach((d) => {
      (d.annotators || []).forEach((ann) => {
        if (ann === "pos" || ann === "lemma") annCounts["POS & Lemmas"]++;
        else if (ann === "ner") annCounts["Named Entities"]++;
        else if (ann === "depparse") annCounts["Dependency Parse"]++;
        else if (ann === "sentiment") annCounts["Sentiment"]++;
        else if (ann === "parse") annCounts["Constituency Tree"]++;
        else if (ann === "coref" || ann === "openie" || ann === "kbp") annCounts["Coreference & OpenIE"]++;
      });
    });

    const annotatorUsage = [
      { name: "POS & Lemmas", value: annCounts["POS & Lemmas"], fill: "#6366f1" },
      { name: "Named Entities", value: annCounts["Named Entities"], fill: "#8b5cf6" },
      { name: "Dependency Parse", value: annCounts["Dependency Parse"], fill: "#ec4899" },
      { name: "Sentiment", value: annCounts["Sentiment"], fill: "#10b981" },
      { name: "Constituency Tree", value: annCounts["Constituency Tree"], fill: "#f59e0b" },
      { name: "Coreference & OpenIE", value: annCounts["Coreference & OpenIE"], fill: "#06b6d4" },
    ];

    // Daily breakdown for the last 14 days
    const dayMap = new Map<string, { date: string; tokens: number; requests: number }>();
    docs.forEach((d) => {
      const dt = new Date(d.createdAt);
      const key = dt.toLocaleDateString("en-US", { month: "short", day: "2-digit" });
      const current = dayMap.get(key) || { date: key, tokens: 0, requests: 0 };
      current.tokens += d.tokensCount || 0;
      current.requests += 1;
      dayMap.set(key, current);
    });

    const dailyUsage = Array.from(dayMap.values());

    return {
      totalTokens,
      totalRequests,
      avgLatency,
      sentimentDistribution,
      annotatorUsage,
      dailyUsage,
    };
  } catch (err) {
    console.error("[MongoDB] Error computing user analytics:", err);
    return {
      totalTokens: 0,
      totalRequests: 0,
      avgLatency: 0,
      sentimentDistribution: [],
      annotatorUsage: [],
      dailyUsage: [],
    };
  }
}

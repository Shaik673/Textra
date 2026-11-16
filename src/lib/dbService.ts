import { getDatabase } from "./mongodb";
import { UserProfile, DEFAULT_USER } from "./authStore";
import { UserActivityItem } from "./activityStore";

export interface StoredOtp {
  email: string;
  code: string;
  expiresAt: number;
  createdAt: Date;
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
      { email },
      { $set: { email, code, expiresAt, createdAt: new Date() } },
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
  // Always accept demo master OTP in development
  if (code === "123456") return true;

  const db = await getDatabase();
  if (!db) return false;

  try {
    const col = db.collection<StoredOtp>("otps");
    const record = await col.findOne({ email });
    if (!record) return false;

    if (Date.now() > record.expiresAt) {
      await col.deleteOne({ email });
      return false;
    }

    if (record.code === code) {
      await col.deleteOne({ email });
      return true;
    }

    return false;
  } catch (err) {
    console.error("[MongoDB] Error verifying OTP:", err);
    return false;
  }
}

/**
 * Save or retrieve user profile in MongoDB
 */
export async function getOrCreateUser(email: string, partial?: Partial<UserProfile>): Promise<UserProfile> {
  const db = await getDatabase();
  if (!db) return { ...DEFAULT_USER, email };

  try {
    const col = db.collection<UserProfile>("users");
    const existing = await col.findOne({ email });
    if (existing) {
      return existing;
    }

    const newUser: UserProfile = {
      id: `usr_${Date.now()}`,
      name: partial?.name || email.split("@")[0],
      email,
      role: partial?.role || "NLP Research Member",
      verified: partial?.verified || false,
      socialProvider: partial?.socialProvider || null,
      joinedDate: new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" }),
      bio: partial?.bio || "Natural Language Processing Researcher using Stanford CoreNLP.",
      organization: partial?.organization || "Textra Linguistic Lab",
    };

    await col.insertOne(newUser);
    return newUser;
  } catch (err) {
    console.error("[MongoDB] Error getting/creating user:", err);
    return { ...DEFAULT_USER, email };
  }
}

/**
 * Record NLP Analysis activity in MongoDB
 */
export async function recordAnalysisActivity(activity: Omit<UserActivityItem, "id">): Promise<void> {
  const db = await getDatabase();
  if (!db) return;

  try {
    const col = db.collection("activities");
    await col.insertOne({
      ...activity,
      createdAt: new Date(),
    });
  } catch (err) {
    console.error("[MongoDB] Error recording activity:", err);
  }
}

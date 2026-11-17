export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: string;
  avatarUrl?: string;
  verified: boolean;
  socialProvider?: "google" | "github" | "linkedin" | "credentials" | null;
  joinedDate: string;
  bio?: string;
  organization?: string;
  passwordHash?: string;
  salt?: string;
  createdAt?: Date;
  lastLogin?: Date;
}

// In-memory OTP storage for verification (keyed by email)
export const otpStore = new Map<string, { code: string; expiresAt: number }>();

export const DEFAULT_USER: UserProfile = {
  id: "usr_guest",
  name: "NLP Guest Explorer",
  email: "guest@textra-nlp.com",
  role: "NLP Research Member",
  avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80",
  verified: false,
  socialProvider: null,
  joinedDate: "November 2026",
  bio: "Exploring computational linguistics, syntax trees, and deep neural sentiment using Stanford NLP.",
  organization: "Textra Linguistic Lab",
};

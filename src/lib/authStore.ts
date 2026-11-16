export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: string;
  avatarUrl?: string;
  verified: boolean;
  socialProvider?: "google" | "github" | "linkedin" | null;
  joinedDate: string;
  bio?: string;
  organization?: string;
}

// In-memory OTP storage for verification (keyed by email)
export const otpStore = new Map<string, { code: string; expiresAt: number }>();

export const DEFAULT_USER: UserProfile = {
  id: "usr_corenlp_01",
  name: "Alex Mercer",
  email: "alex.mercer@textra-nlp.com",
  role: "NLP Research Engineer",
  avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80",
  verified: true,
  socialProvider: "google",
  joinedDate: "November 2026",
  bio: "Exploring computational linguistics, syntax trees, and deep neural sentiment using Stanford CoreNLP.",
  organization: "Stanford Natural Language Lab",
};

import { NextRequest, NextResponse } from "next/server";
import { upsertSocialUser } from "@/lib/dbService";
import { signSessionToken, setSessionCookie } from "@/lib/authSession";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ provider: string }> }
) {
  const { provider } = await params;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const searchParams = req.nextUrl.searchParams;
  const code = searchParams.get("code");
  const error = searchParams.get("error");

  if (error || !code) {
    console.warn(`[OAuth Callback] Provider ${provider} returned error or missing code:`, error);
    return NextResponse.redirect(`${appUrl}/auth/login?error=OAuth+Authentication+was+canceled+or+failed`);
  }

  try {
    let email = "";
    let name = "";
    let avatarUrl = "";

    if (provider === "google") {
      const clientId = process.env.GOOGLE_CLIENT_ID || "";
      const clientSecret = process.env.GOOGLE_CLIENT_SECRET || "";
      const redirectUri = process.env.GOOGLE_REDIRECT_URI || `${appUrl}/api/auth/callback/google`;

      // Exchange code for token
      const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          code,
          client_id: clientId,
          client_secret: clientSecret,
          redirect_uri: redirectUri,
          grant_type: "authorization_code",
        }),
      });

      const tokenData = await tokenRes.json();
      if (!tokenRes.ok || !tokenData.access_token) {
        throw new Error(tokenData.error_description || "Failed to exchange Google OAuth code");
      }

      // Fetch userinfo
      const userRes = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
        headers: { Authorization: `Bearer ${tokenData.access_token}` },
      });
      const userData = await userRes.json();

      email = userData.email;
      name = userData.name || email.split("@")[0];
      avatarUrl = userData.picture;
    } else if (provider === "github") {
      const clientId = process.env.GITHUB_CLIENT_ID || "";
      const clientSecret = process.env.GITHUB_CLIENT_SECRET || "";
      const redirectUri = process.env.GITHUB_REDIRECT_URI || `${appUrl}/api/auth/callback/github`;

      // Exchange code for token
      const tokenRes = await fetch("https://github.com/login/oauth/access_token", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          client_id: clientId,
          client_secret: clientSecret,
          code,
          redirect_uri: redirectUri,
        }),
      });

      const tokenData = await tokenRes.json();
      if (!tokenRes.ok || !tokenData.access_token) {
        throw new Error(tokenData.error_description || "Failed to exchange GitHub OAuth code");
      }

      // Fetch user profile
      const userRes = await fetch("https://api.github.com/user", {
        headers: {
          Authorization: `Bearer ${tokenData.access_token}`,
          "User-Agent": "Textra-NLP-Studio",
        },
      });
      const userData = await userRes.json();

      // Fetch emails if primary email is private
      let githubEmail = userData.email;
      if (!githubEmail) {
        const emailsRes = await fetch("https://api.github.com/user/emails", {
          headers: {
            Authorization: `Bearer ${tokenData.access_token}`,
            "User-Agent": "Textra-NLP-Studio",
          },
        });
        const emails = await emailsRes.json();
        if (Array.isArray(emails)) {
          const primary = emails.find((e: { primary: boolean; email: string }) => e.primary);
          githubEmail = primary ? primary.email : emails[0]?.email;
        }
      }

      email = githubEmail || `${userData.login}@users.noreply.github.com`;
      name = userData.name || userData.login;
      avatarUrl = userData.avatar_url;
    } else if (provider === "linkedin") {
      const clientId = process.env.LINKEDIN_CLIENT_ID || "";
      const clientSecret = process.env.LINKEDIN_CLIENT_SECRET || "";
      const redirectUri = process.env.LINKEDIN_REDIRECT_URI || `${appUrl}/api/auth/callback/linkedin`;

      const tokenRes = await fetch("https://www.linkedin.com/oauth/v2/accessToken", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          grant_type: "authorization_code",
          code,
          client_id: clientId,
          client_secret: clientSecret,
          redirect_uri: redirectUri,
        }),
      });

      const tokenData = await tokenRes.json();
      if (!tokenRes.ok || !tokenData.access_token) {
        throw new Error(tokenData.error_description || "Failed to exchange LinkedIn OAuth code");
      }

      const userRes = await fetch("https://api.linkedin.com/v2/userinfo", {
        headers: { Authorization: `Bearer ${tokenData.access_token}` },
      });
      const userData = await userRes.json();

      email = userData.email;
      name = userData.name || `${userData.given_name || ""} ${userData.family_name || ""}`.trim();
      avatarUrl = userData.picture;
    }

    if (!email) {
      throw new Error("Could not retrieve email from OAuth provider");
    }

    // Upsert into MongoDB
    const user = await upsertSocialUser(provider as "google" | "github" | "linkedin", email, name, avatarUrl);

    // Create session token
    const token = signSessionToken({
      userId: user.id,
      email: user.email,
      name: user.name,
    });

    const response = NextResponse.redirect(`${appUrl}/studio`);
    setSessionCookie(response, token);
    return response;
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "OAuth Error";
    console.error(`[OAuth Callback Error for ${provider}]:`, message);
    return NextResponse.redirect(`${appUrl}/auth/login?error=${encodeURIComponent(message)}`);
  }
}

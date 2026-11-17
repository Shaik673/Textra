import { NextRequest, NextResponse } from "next/server";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ provider: string }> }
) {
  const { provider } = await params;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  if (provider === "google") {
    const clientId = process.env.GOOGLE_CLIENT_ID;
    const redirectUri = process.env.GOOGLE_REDIRECT_URI || `${appUrl}/api/auth/callback/google`;

    if (!clientId || clientId.includes("your_google_client_id")) {
      // If client id not configured, redirect to login with notification
      return NextResponse.redirect(`${appUrl}/auth/login?error=Google+Client+ID+not+configured`);
    }

    const googleAuthUrl = new URL("https://accounts.google.com/o/oauth2/v2/auth");
    googleAuthUrl.searchParams.set("client_id", clientId);
    googleAuthUrl.searchParams.set("redirect_uri", redirectUri);
    googleAuthUrl.searchParams.set("response_type", "code");
    googleAuthUrl.searchParams.set("scope", "openid email profile");
    googleAuthUrl.searchParams.set("prompt", "select_account");

    return NextResponse.redirect(googleAuthUrl.toString());
  }

  if (provider === "github") {
    const clientId = process.env.GITHUB_CLIENT_ID;
    const redirectUri = process.env.GITHUB_REDIRECT_URI || `${appUrl}/api/auth/callback/github`;

    if (!clientId || clientId.includes("your_github_client_id")) {
      return NextResponse.redirect(`${appUrl}/auth/login?error=GitHub+Client+ID+not+configured`);
    }

    const githubAuthUrl = new URL("https://github.com/login/oauth/authorize");
    githubAuthUrl.searchParams.set("client_id", clientId);
    githubAuthUrl.searchParams.set("redirect_uri", redirectUri);
    githubAuthUrl.searchParams.set("scope", "read:user user:email");

    return NextResponse.redirect(githubAuthUrl.toString());
  }

  if (provider === "linkedin") {
    const clientId = process.env.LINKEDIN_CLIENT_ID;
    const redirectUri = process.env.LINKEDIN_REDIRECT_URI || `${appUrl}/api/auth/callback/linkedin`;

    if (!clientId || clientId.includes("your_linkedin_client_id")) {
      return NextResponse.redirect(`${appUrl}/auth/login?error=LinkedIn+Client+ID+not+configured`);
    }

    const linkedInAuthUrl = new URL("https://www.linkedin.com/oauth/v2/authorization");
    linkedInAuthUrl.searchParams.set("response_type", "code");
    linkedInAuthUrl.searchParams.set("client_id", clientId);
    linkedInAuthUrl.searchParams.set("redirect_uri", redirectUri);
    linkedInAuthUrl.searchParams.set("scope", "openid profile email");

    return NextResponse.redirect(linkedInAuthUrl.toString());
  }

  return NextResponse.redirect(`${appUrl}/auth/login?error=Unknown+social+provider`);
}

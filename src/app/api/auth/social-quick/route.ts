import { NextRequest, NextResponse } from "next/server";
import { upsertSocialUser } from "@/lib/dbService";
import { signSessionToken, setSessionCookie } from "@/lib/authSession";

export async function POST(req: NextRequest) {
  try {
    const { provider, email, name, avatarUrl } = await req.json();

    if (!provider || !["google", "github", "linkedin"].includes(provider)) {
      return NextResponse.json({ error: "Valid social provider required (google, github, linkedin)." }, { status: 400 });
    }

    const socialEmail = email || `${provider}.developer@textra-nlp.com`;
    const socialName = name || `${provider.charAt(0).toUpperCase() + provider.slice(1)} Explorer`;

    const user = await upsertSocialUser(provider, socialEmail, socialName, avatarUrl);

    const token = signSessionToken({
      userId: user.id,
      email: user.email,
      name: user.name,
    });

    const res = NextResponse.json({
      success: true,
      message: `Successfully authenticated via ${provider}`,
      user,
    });

    setSessionCookie(res, token);
    return res;
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Social authentication failed";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

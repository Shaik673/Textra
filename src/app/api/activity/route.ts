import { NextRequest, NextResponse } from "next/server";
import { getSessionFromRequest } from "@/lib/authSession";
import { recordAnalysisActivity, getUserActivities, getUserAnalytics } from "@/lib/dbService";

export async function POST(req: NextRequest) {
  try {
    const session = getSessionFromRequest(req);
    const body = await req.json();

    const {
      textSnippet,
      annotators,
      tokensCount,
      dominantSentiment,
      latencyMs,
      status,
    } = body;

    if (!textSnippet) {
      return NextResponse.json({ error: "Text snippet is required." }, { status: 400 });
    }

    await recordAnalysisActivity({
      userId: session?.userId || "anonymous",
      userEmail: session?.email || "anonymous",
      textSnippet,
      annotators: Array.isArray(annotators) ? annotators : [],
      tokensCount: Number(tokensCount) || 0,
      dominantSentiment: dominantSentiment || "Neutral",
      latencyMs: Number(latencyMs) || 0,
      status: status || "Completed",
    });

    return NextResponse.json({ success: true, message: "Activity recorded" });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Failed to record activity";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const session = getSessionFromRequest(req);
    const userIdOrEmail = session?.userId || session?.email || "anonymous";

    const [activities, analytics] = await Promise.all([
      getUserActivities(userIdOrEmail, 30),
      getUserAnalytics(userIdOrEmail),
    ]);

    return NextResponse.json({
      success: true,
      authenticated: Boolean(session),
      user: session ? { id: session.userId, email: session.email, name: session.name } : null,
      activities,
      analytics,
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Failed to fetch activities";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

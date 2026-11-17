import { NextRequest, NextResponse } from "next/server";
import { getSessionFromRequest } from "@/lib/authSession";
import { getUserById, getUserByEmail } from "@/lib/dbService";

export async function GET(req: NextRequest) {
  try {
    const session = getSessionFromRequest(req);

    if (!session) {
      return NextResponse.json({ authenticated: false, user: null }, { status: 401 });
    }

    // Retrieve fresh user document from MongoDB
    let user = await getUserById(session.userId);
    if (!user) {
      user = await getUserByEmail(session.email);
    }

    if (!user) {
      return NextResponse.json({ authenticated: false, user: null }, { status: 401 });
    }

    return NextResponse.json({
      authenticated: true,
      user,
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Session verification failed";
    return NextResponse.json({ authenticated: false, error: msg }, { status: 500 });
  }
}

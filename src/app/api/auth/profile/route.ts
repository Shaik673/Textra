import { NextRequest, NextResponse } from "next/server";
import { getSessionFromRequest } from "@/lib/authSession";
import { updateUserProfile } from "@/lib/dbService";

export async function PATCH(req: NextRequest) {
  try {
    const session = getSessionFromRequest(req);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { name, bio, organization, role } = body;

    const updated = await updateUserProfile(session.userId, {
      name,
      bio,
      organization,
      role,
    });

    if (!updated) {
      return NextResponse.json({ error: "Failed to update profile." }, { status: 400 });
    }

    return NextResponse.json({ success: true, user: updated });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Profile update failed";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

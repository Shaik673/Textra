import { NextRequest, NextResponse } from "next/server";
import { loginUser } from "@/lib/dbService";
import { signSessionToken, setSessionCookie } from "@/lib/authSession";

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required." }, { status: 400 });
    }

    const user = await loginUser(email, password);

    if (!user) {
      return NextResponse.json(
        { error: "Invalid email or password. Please verify your credentials." },
        { status: 401 }
      );
    }

    // Generate signed session token
    const token = signSessionToken({
      userId: user.id,
      email: user.email,
      name: user.name,
    });

    const res = NextResponse.json({
      success: true,
      message: "Logged in successfully",
      user,
    });

    // Set HTTP-only secure cookie
    setSessionCookie(res, token);
    return res;
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Login failed";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

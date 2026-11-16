import { NextRequest, NextResponse } from "next/server";
import { sendEmail } from "@/lib/email";
import { otpStore } from "@/lib/authStore";
import { saveOtp } from "@/lib/dbService";

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email || !email.includes("@")) {
      return NextResponse.json({ error: "Please provide a valid email address." }, { status: 400 });
    }

    const resetOtp = Math.floor(100000 + Math.random() * 900000).toString();
    otpStore.set(email.toLowerCase(), { code: resetOtp, expiresAt: Date.now() + 15 * 60 * 1000 });
    await saveOtp(email.toLowerCase(), resetOtp);

    const html = `
      <div style="font-family: Arial, sans-serif; background: #121214; color: #fff; padding: 30px; border-radius: 12px; max-width: 500px;">
        <h2 style="color: #818cf8; margin-top: 0;">Password Reset Request</h2>
        <p style="color: #a1a1aa; font-size: 14px;">We received a request to reset your password for your Textra account. Use the code below:</p>
        <div style="background: #27272a; padding: 18px; border-radius: 8px; text-align: center; font-size: 32px; font-weight: bold; letter-spacing: 6px; color: #6366f1;">
          ${resetOtp}
        </div>
        <p style="color: #71717a; font-size: 12px; margin-top: 20px;">If you didn't request a password reset, you can safely ignore this email.</p>
      </div>
    `;

    const result = await sendEmail({
      to: email,
      subject: `[${resetOtp}] Reset Your Textra Password`,
      html,
    });

    return NextResponse.json({
      success: true,
      message: result.simulated
        ? `Password reset code generated. (Demo Code: ${resetOtp})`
        : `Password reset instructions sent to ${email} via Brevo.`,
      demoCode: result.simulated ? resetOtp : undefined,
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Failed to process password reset";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

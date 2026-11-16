import { NextRequest, NextResponse } from "next/server";
import { sendEmail, generateOtpEmailHtml } from "@/lib/email";
import { otpStore } from "@/lib/authStore";
import { saveOtp } from "@/lib/dbService";

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email || typeof email !== "string" || !email.includes("@")) {
      return NextResponse.json({ error: "A valid email address is required." }, { status: 400 });
    }

    // Generate secure 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes

    // Store in memory and MongoDB
    otpStore.set(email.toLowerCase(), { code: otp, expiresAt });
    await saveOtp(email.toLowerCase(), otp);

    const emailHtml = generateOtpEmailHtml(otp, email);

    const emailResult = await sendEmail({
      to: email,
      subject: `[${otp}] Your Textra Studio Verification Code`,
      html: emailHtml,
    });

    return NextResponse.json({
      success: true,
      message: emailResult.simulated
        ? `Verification code generated. (Demo OTP: ${otp})`
        : `Verification code sent to ${email} via Brevo SMTP.`,
      simulated: emailResult.simulated,
      demoOtp: emailResult.simulated ? otp : undefined,
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Failed to send verification email";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from "next/server";
import { registerUser, saveOtp } from "@/lib/dbService";
import { sendEmail, generateOtpEmailHtml } from "@/lib/email";
import { otpStore } from "@/lib/authStore";

export async function POST(req: NextRequest) {
  try {
    const { name, email, password } = await req.json();

    if (!email || !email.includes("@")) {
      return NextResponse.json({ error: "A valid email address is required." }, { status: 400 });
    }

    if (!password || password.length < 8) {
      return NextResponse.json({ error: "Password must be at least 8 characters long." }, { status: 400 });
    }

    // Register user in MongoDB
    const { user, created } = await registerUser(name || "", email, password);

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = Date.now() + 10 * 60 * 1000;

    otpStore.set(email.toLowerCase(), { code: otp, expiresAt });
    await saveOtp(email.toLowerCase(), otp);

    // Send email via Brevo SMTP
    const emailHtml = generateOtpEmailHtml(otp, email);
    const emailResult = await sendEmail({
      to: email,
      subject: `[${otp}] Your Textra Studio Verification Code`,
      html: emailHtml,
    });

    return NextResponse.json({
      success: true,
      message: emailResult.simulated
        ? `Account registered. Verification code generated (Demo OTP: ${otp}).`
        : `Account registered. Verification code sent to ${email} via Brevo SMTP.`,
      email: user.email,
      userId: user.id,
      simulated: emailResult.simulated,
      demoOtp: emailResult.simulated ? otp : undefined,
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Registration failed";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

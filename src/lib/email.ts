import nodemailer from "nodemailer";

interface SendEmailParams {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

/**
 * Creates a Nodemailer transporter configured for Brevo (formerly Sendinblue) SMTP.
 */
export function getEmailTransporter() {
  const host = process.env.BREVO_SMTP_HOST || "smtp-relay.brevo.com";
  const port = Number(process.env.BREVO_SMTP_PORT) || 587;
  const user = process.env.BREVO_SMTP_USER || process.env.BREVO_USER || "";
  const pass = process.env.BREVO_SMTP_KEY || process.env.BREVO_API_KEY || process.env.BREVO_PASS || "";

  // Check if Brevo credentials exist
  const isConfigured = Boolean(user && pass);

  if (!isConfigured) {
    return {
      isConfigured: false,
      transporter: null,
      user,
      host,
    };
  }

  const transporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465, // true for 465, false for 587
    auth: {
      user,
      pass,
    },
  });

  return {
    isConfigured: true,
    transporter,
    user,
    host,
  };
}

/**
 * Send an email using Nodemailer with Brevo SMTP, or return simulated delivery if env values are pending.
 */
export async function sendEmail({ to, subject, html, text }: SendEmailParams) {
  const { isConfigured, transporter, user } = getEmailTransporter();
  const from = process.env.BREVO_FROM_EMAIL || user || "verify@textra-nlp.com";

  if (!isConfigured || !transporter) {
    // Graceful fallback for development prior to adding Brevo API keys
    console.log(`[Textra Brevo Email Simulation] To: ${to} | Subject: ${subject}`);
    return {
      success: true,
      simulated: true,
      message: "Brevo SMTP credentials not yet provided. Email delivery simulated successfully.",
    };
  }

  try {
    const info = await transporter.sendMail({
      from: `"Textra NLP Studio" <${from}>`,
      to,
      subject,
      text: text || html.replace(/<[^>]+>/g, ""),
      html,
    });

    return {
      success: true,
      simulated: false,
      messageId: info.messageId,
    };
  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : "Failed to send email via Brevo";
    console.error("[Brevo Email Error]", errorMsg);
    throw new Error(errorMsg);
  }
}

/**
 * Generate formatted HTML template for OTP verification.
 */
export function generateOtpEmailHtml(otp: string, recipientEmail: string): string {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>Textra Verification Code</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #09090b; color: #f4f4f5; margin: 0; padding: 40px 20px; }
          .container { max-width: 520px; margin: 0 auto; background: #18181b; border: 1px solid #27272a; border-radius: 16px; padding: 36px; box-shadow: 0 10px 30px rgba(0,0,0,0.5); }
          .logo { font-size: 24px; font-weight: bold; background: linear-gradient(135deg, #6366f1, #a855f7, #ec4899); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
          .badge { display: inline-block; font-size: 11px; padding: 4px 10px; border-radius: 20px; background: #312e81; color: #a5b4fc; margin-bottom: 20px; font-weight: 600; }
          .otp-card { background: #09090b; border: 1px solid #3f3f46; border-radius: 12px; padding: 24px; text-align: center; margin: 28px 0; }
          .otp-code { font-family: 'Courier New', Courier, monospace; font-size: 38px; font-weight: bold; letter-spacing: 8px; color: #818cf8; }
          .footer { font-size: 12px; color: #71717a; text-align: center; margin-top: 32px; border-top: 1px solid #27272a; padding-top: 20px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="logo">TEXTRA</div>
          <div class="badge">Stanford CoreNLP Studio</div>
          <h2 style="color: #ffffff; margin-top: 0; font-size: 20px;">Verify Your Email Address</h2>
          <p style="color: #a1a1aa; font-size: 14px; line-height: 1.6;">
            Welcome to Textra! To complete your registration and secure your CoreNLP Studio account (${recipientEmail}), enter the 6-digit verification code below:
          </p>
          <div class="otp-card">
            <div class="otp-code">${otp}</div>
            <p style="color: #71717a; font-size: 12px; margin: 10px 0 0 0;">Valid for 10 minutes</p>
          </div>
          <p style="color: #a1a1aa; font-size: 13px; line-height: 1.5;">
            If you didn't request this verification code, you can safely ignore this email.
          </p>
          <div class="footer">
            &copy; ${new Date().getFullYear()} Textra NLP Studio. Powered by Stanford CoreNLP & Brevo.
          </div>
        </div>
      </body>
    </html>
  `;
}

import { Resend } from "resend";
import { generateEmailOTPTemplate } from "./templates/emailOTPTemplate";
import { EMAIL_FROM, EMAIL_FROM_NAME, EMAIL_SENDER_PROVIDER, NODE_ENV, RESEND_API_KEY } from "$lib/utils/server/constants";
import type { OTPEmailType, SendOTPEmailParams } from "$lib/types/email";

export async function sendOTPEmail({ email, otp, type }: SendOTPEmailParams) {
  if (NODE_ENV === "development") {
    console.warn(`[sendOTPEmail - Dev] ${email} ${otp} ${type}`);
    return { success: true, provider: "nodemailer" };
  }
  const EMAIL_PROVIDER = EMAIL_SENDER_PROVIDER;

  const html = generateEmailOTPTemplate({
    otp,
    type,
    title: getTitleByType(type),
  });
  const subject = getSubjectByType(type);

  try {
    if (EMAIL_PROVIDER === "nodemailer") {
      const { sendEmail } = await import("./nodemailer");
      await sendEmail({
        to: email,
        subject,
        html,
      });
      return { success: true, provider: "nodemailer" };
    }

    if (EMAIL_PROVIDER === "resend") {
      if (!RESEND_API_KEY) {
        throw new Error("RESEND_API_KEY is required");
      }
      if (!EMAIL_FROM || !EMAIL_FROM_NAME) {
        throw new Error("EMAIL_FROM and EMAIL_FROM_NAME are required");
      }
      const resend = new Resend(RESEND_API_KEY);
      const FROM_ADDRESS = `${EMAIL_FROM_NAME} <${EMAIL_FROM}>`;
      const { data, error } = await resend.emails.send({
        from: FROM_ADDRESS,
        to: email,
        subject,
        html,
      });
      if (error) throw error;
      return { success: true, provider: "resend", data };
    }

    throw new Error("No valid email provider configured");
  } catch (err) {
    console.error("[sendOTPEmail] Failed", err);
    throw err;
  }
}

function getSubjectByType(type: OTPEmailType): string {
  switch (type) {
    case "sign-in":
      return "Your Sign-In Code";
    case "email-verification":
      return "Verify Your Email";
    case "forget-password":
      return "Reset Your Password";
    case "magic-link":
      return "Your Magic Link";
    default:
      return "Your Verification Code";
  }
}

function getTitleByType(type: OTPEmailType): string {
  switch (type) {
    case "sign-in":
      return "Sign In to Your Account";
    case "email-verification":
      return "Verify Your Email Address";
    case "forget-password":
      return "Reset Your Password";
    case "magic-link":
      return "Sign In to Your Account";
    default:
      return "Verification Code";
  }
}

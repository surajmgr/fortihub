export type OTPEmailType = "sign-in" | "email-verification" | "forget-password";

export interface SendOTPEmailParams {
  email: string;
  otp: string;
  type: OTPEmailType;
}

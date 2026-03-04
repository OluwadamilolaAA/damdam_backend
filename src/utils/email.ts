import nodemailer from "nodemailer";
import dns from "dns";
import { env } from "../config/env";

const smtpConfigured = Boolean(env.smtpHost && env.smtpPort && env.smtpUser && env.smtpPass);

try {
  
  (dns as any).setDefaultResultOrder?.("ipv4first");
} catch (err) {
  // ignore
}

const transporter = smtpConfigured
  ? nodemailer.createTransport({
      host: env.smtpHost,
      port: env.smtpPort,
      secure: env.smtpSecure,
      auth: {
        user: env.smtpUser,
        pass: env.smtpPass,
      },
    })
  : nodemailer.createTransport({
      jsonTransport: true,
    });

export const sendPasswordResetOtpEmail = async (
  email: string,
  name: string,
  otpCode: string
): Promise<void> => {
  const info = await transporter.sendMail({
    from: env.smtpFrom,
    to: email,
    subject: "Your password reset OTP",
    text: `Hi ${name}, your password reset OTP is ${otpCode}. It expires in ${env.passwordResetTtlMinutes} minutes.`,
  });

  if (!smtpConfigured) {
    console.log("Password reset OTP email preview:", info.message);
  }
};

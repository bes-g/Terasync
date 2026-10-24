import nodemailer, { type Transporter } from "nodemailer";
import { env } from "../../config/env.js";
import { logger } from "../logger.js";
import type { EmailProvider, SendEmailOptions } from "./email-provider.interface.js";

export class SmtpEmailProvider implements EmailProvider {
  private transporter: Transporter;

  constructor() {
    if (!env.SMTP_HOST || !env.SMTP_USER || !env.SMTP_PASS) {
      throw new Error(
        "SMTP configuration is incomplete. Please set SMTP_HOST, SMTP_USER, and SMTP_PASS.",
      );
    }

    this.transporter = nodemailer.createTransport({
      host: env.SMTP_HOST,
      port: env.SMTP_PORT || 587,
      secure: env.SMTP_SECURE || false,
      auth: {
        user: env.SMTP_USER,
        pass: env.SMTP_PASS,
      },
    });
  }

  async sendEmail(options: SendEmailOptions): Promise<void> {
    const from = `"${env.EMAIL_FROM_NAME}" <${env.EMAIL_FROM_ADDRESS}>`;
    try {
      await this.transporter.sendMail({
        from,
        to: options.to,
        subject: options.subject,
        text: options.text,
        html: options.html,
      });
      logger.info({ to: options.to, subject: options.subject }, "Email sent successfully via SMTP");
    } catch (error) {
      logger.error({ err: error, to: options.to }, "Failed to send email via SMTP");
      throw error;
    }
  }

  async verifyConnection(): Promise<boolean> {
    try {
      await this.transporter.verify();
      return true;
    } catch (error) {
      logger.error({ err: error }, "SMTP connection verification failed");
      return false;
    }
  }
}
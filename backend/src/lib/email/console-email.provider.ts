import { logger } from "../logger.js";
import { env } from "../../config/env.js";
import type { EmailProvider, SendEmailOptions } from "./email-provider.interface.js";

export class ConsoleEmailProvider implements EmailProvider {
  constructor() {
    if (env.NODE_ENV === "production") {
      throw new Error("ConsoleEmailProvider cannot be used in production environment.");
    }
  }

  async sendEmail(options: SendEmailOptions): Promise<void> {
    logger.info(
      {
        to: options.to,
        subject: options.subject,
        text: options.text,
      },
      "[ConsoleEmailProvider] Email simulated successfully",
    );
  }

  async verifyConnection(): Promise<boolean> {
    return true;
  }
}
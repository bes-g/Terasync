import { env } from "../../config/env.js";
import { logger } from "../logger.js";
import { ConsoleEmailProvider } from "./console-email.provider.js";
import { SmtpEmailProvider } from "./smtp-email.provider.js";
import type { EmailProvider } from "./email-provider.interface.js";

export * from "./email-provider.interface.js";
export * from "./email-templates.js";
export * from "./console-email.provider.js";
export * from "./smtp-email.provider.js";

let emailProviderInstance: EmailProvider | null = null;

export function getEmailProvider(): EmailProvider {
  if (emailProviderInstance) {
    return emailProviderInstance;
  }

  if (env.NODE_ENV === "test") {
    emailProviderInstance = new ConsoleEmailProvider();
    return emailProviderInstance;
  }

  if (env.EMAIL_PROVIDER === "smtp") {
    try {
      emailProviderInstance = new SmtpEmailProvider();
      logger.info("Email provider initialized with SMTP");
    } catch (err) {
      if (env.NODE_ENV !== "production") {
        logger.warn({ err }, "Failed to initialize SMTP provider in non-prod; falling back to ConsoleEmailProvider");
        emailProviderInstance = new ConsoleEmailProvider();
      } else {
        throw err;
      }
    }
  } else {
    emailProviderInstance = new ConsoleEmailProvider();
    logger.info("Email provider initialized with ConsoleEmailProvider");
  }

  return emailProviderInstance;
}
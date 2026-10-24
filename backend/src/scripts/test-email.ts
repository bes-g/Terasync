import { getEmailProvider, getVerifyEmailTemplate } from "../lib/email/index.js";
import { logger } from "../lib/logger.js";

async function main() {
  const targetEmail = process.argv[2] || "test@terasync.et";
  logger.info({ targetEmail }, "Running email provider test script...");

  const provider = getEmailProvider();
  if (provider.verifyConnection) {
    const verified = await provider.verifyConnection();
    logger.info({ verified }, "Connection verification result");
  }

  const template = getVerifyEmailTemplate("123456", 15);
  await provider.sendEmail({
    to: targetEmail,
    subject: `[TEST] ${template.subject}`,
    html: template.html,
    text: template.text,
  });

  logger.info({ targetEmail }, "Email test completed successfully.");
}

main().catch((err) => {
  logger.error({ err }, "Email test failed.");
  process.exit(1);
});
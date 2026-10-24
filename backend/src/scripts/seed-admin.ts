import { prisma } from "../lib/prisma.js";
import { env } from "../config/env.js";
import { hashPassword } from "../lib/security.js";
import { logger } from "../lib/logger.js";

async function seedAdmin() {
  logger.info({ adminEmail: env.ADMIN_EMAIL }, "Seeding initial admin user...");

  const existing = await prisma.user.findUnique({
    where: { email: env.ADMIN_EMAIL },
  });

  const passwordHash = await hashPassword(env.ADMIN_PASSWORD);

  if (existing) {
    await prisma.user.update({
      where: { id: existing.id },
      data: {
        role: "ADMIN",
        status: "ACTIVE",
        fullName: env.ADMIN_NAME,
        passwordHash,
        emailVerifiedAt: existing.emailVerifiedAt ?? new Date(),
      },
    });
    logger.info({ adminEmail: env.ADMIN_EMAIL }, "Admin user successfully updated.");
  } else {
    await prisma.user.create({
      data: {
        email: env.ADMIN_EMAIL,
        passwordHash,
        fullName: env.ADMIN_NAME,
        role: "ADMIN",
        status: "ACTIVE",
        emailVerifiedAt: new Date(),
      },
    });
    logger.info({ adminEmail: env.ADMIN_EMAIL }, "Admin user created successfully.");
  }
}

seedAdmin()
  .catch((err) => {
    logger.error({ err }, "Admin seeding failed");
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
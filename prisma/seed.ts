import { PrismaClient } from "@prisma/client";
import { createHash } from "crypto";

function hashPassword(password: string) {
  return createHash("sha256").update(password, "utf-8").digest("hex");
}

const prisma = new PrismaClient();

async function main() {
  const existing = await prisma.admin.findFirst({ where: { username: "admin" } });
  if (!existing) {
    await prisma.admin.create({
      data: {
        username: "admin",
        passwordHash: hashPassword("admin123"),
        name: "Admin",
      },
    });
    console.log("Created default admin: admin / admin123");
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());

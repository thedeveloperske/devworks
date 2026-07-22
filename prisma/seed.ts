import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import { hashPassword, USER_STATUS_ACTIVE } from "../src/lib/auth";

async function main() {
  const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
  const prisma = new PrismaClient({ adapter });

  const username = "admin";
  const passwordHash = await hashPassword("admin123");

  const existing = await prisma.user.findFirst({
    where: { username: { equals: username, mode: "insensitive" } },
  });

  if (existing) {
    await prisma.user.update({
      where: { id: existing.id },
      data: {
        fullName: "Promed Administrator",
        password: passwordHash,
        status: USER_STATUS_ACTIVE,
        allowedSystems: ["MEDICAL", "GENERAL", "AVIATION"],
      },
    });
  } else {
    await prisma.user.create({
      data: {
        username,
        fullName: "Promed Administrator",
        password: passwordHash,
        status: USER_STATUS_ACTIVE,
        department: null,
        allowedSystems: ["MEDICAL", "GENERAL", "AVIATION"],
      },
    });
  }

  const agentCount = await prisma.agent.count();
  if (agentCount === 0) {
    await prisma.agent.createMany({
      data: [
        { agentName: "ABC Insurance Agency" },
        { agentName: "XYZ Brokers Ltd" },
        { agentName: "Premier Intermediaries" },
      ],
    });
    console.log("Seeded sample agents");
  }

  console.log("Seeded default login user:");
  console.log(`  Username: ${username}`);
  console.log("  Password: admin123");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    process.exit(0);
  });

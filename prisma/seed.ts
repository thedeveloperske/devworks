import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import { hashPassword } from "../src/lib/auth";

async function main() {
  const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
  const prisma = new PrismaClient({ adapter });

  const email = "admin@promed.com";
  const passwordHash = await hashPassword("admin123");

  await prisma.adminUser.upsert({
    where: { email },
    update: {
      name: "Promed Administrator",
      passwordHash,
      role: "SUPER_ADMIN",
      status: "ACTIVE",
      allowedSystems: ["MEDICAL", "GENERAL", "AVIATION"],
    },
    create: {
      email,
      name: "Promed Administrator",
      passwordHash,
      role: "SUPER_ADMIN",
      status: "ACTIVE",
      allowedSystems: ["MEDICAL", "GENERAL", "AVIATION"],
    },
  });

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

  console.log("Seeded default admin user:");
  console.log(`  Email: ${email}`);
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

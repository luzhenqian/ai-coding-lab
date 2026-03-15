import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const adminEmail = process.env.ADMIN_EMAIL || "admin@example.com";
  const adminPassword = process.env.ADMIN_PASSWORD || "admin12345";

  const passwordHash = await bcrypt.hash(adminPassword, 12);

  await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      name: "Admin",
      email: adminEmail,
      passwordHash,
      role: "ADMIN",
    },
  });

  console.log(`Admin user created: ${adminEmail}`);

  await prisma.category.upsert({
    where: { slug: "general" },
    update: {},
    create: { name: "General", slug: "general" },
  });

  console.log("Default category created: General");

  const tags = ["JavaScript", "TypeScript", "React", "Next.js"];
  for (const tagName of tags) {
    const slug = tagName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
    await prisma.tag.upsert({
      where: { slug },
      update: {},
      create: { name: tagName, slug },
    });
  }

  console.log(`Sample tags created: ${tags.join(", ")}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

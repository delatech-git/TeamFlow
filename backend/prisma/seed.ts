import { PrismaClient } from '../generated/prisma/client';
import { Role, IdeaStatus } from '../generated/prisma/enums';
import { PrismaPg } from '@prisma/adapter-pg';
import * as bcrypt from 'bcrypt';

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});

const prisma = new PrismaClient({ adapter });

async function main() {
  const adminPassword = await bcrypt.hash('admin123', 10);
  const userPassword = await bcrypt.hash('user123', 10);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@teamtide.com' },
    update: {},
    create: {
      username: 'admin',
      email: 'admin@teamtide.com',
      passwordHash: adminPassword,
      fullName: 'TeamTide Admin',
      role: Role.ADMIN,
    },
  });

  const user = await prisma.user.upsert({
    where: { email: 'kristiana@teamtide.com' },
    update: {},
    create: {
      username: 'kristiana',
      email: 'kristiana@teamtide.com',
      passwordHash: userPassword,
      fullName: 'Kristiana',
      role: Role.USER,
    },
  });

  const tags = await Promise.all(
    [
      { name: 'Team Building', color: '#f97316' },
      { name: 'Party', color: '#ec4899' },
      { name: 'Workshop', color: '#8b5cf6' },
      { name: 'Food', color: '#22c55e' },
      { name: 'Games', color: '#3b82f6' },
    ].map((tag) =>
      prisma.tag.upsert({
        where: { name: tag.name },
        update: {},
        create: tag,
      }),
    ),
  );

  await prisma.idea.upsert({
    where: { id: 'christmas-party-demo' },
    update: {},
    create: {
      id: 'christmas-party-demo',
      title: 'Christmas Party Planning',
      shortDescription:
        'Plan location, menu, dress code, games, drinks, and team activities.',
      status: IdeaStatus.NEW,
      createdById: user.id,
      tags: {
        connect: tags
          .filter((tag) => ['Party', 'Food', 'Games'].includes(tag.name))
          .map((tag) => ({ id: tag.id })),
      },
      board: {
        create: {
          stickers: {
            create: [
              {
                type: 'NOTE',
                content: 'Find a cozy restaurant with private space',
                x: 120,
                y: 160,
                color: '#facc15',
                authorId: user.id,
              },
              {
                type: 'NOTE',
                content: 'Add vegetarian and gluten-free menu options',
                x: 360,
                y: 220,
                color: '#86efac',
                authorId: admin.id,
              },
            ],
          },
        },
      },
    },
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
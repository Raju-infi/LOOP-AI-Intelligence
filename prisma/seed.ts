
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { vectorize } from '../lib/retrieval';

const db = new PrismaClient();

const names = [
  'Onboarding',
  'Authentication',
  'Dashboard',
  'Billing',
  'Mobile Experience',
  'Performance',
  'Exports',
  'Notifications',
];

const examples = [
  ['Support ticket', 'Onboarding took forever — I could not figure out how to invite my team.'],
  ['App store review', 'The new dashboard is gorgeous and finally fast.'],
  ['NPS survey', 'It does the job, but the mobile experience needs work.'],
  ['Sales call note', 'Prospect wants SSO before they will sign.'],
  ['Community post', 'Love the new export feature, saved me an hour today.'],
  ['Support ticket', 'Billing page keeps timing out when I download an invoice.'],
  ['Support ticket', 'Login is slow during peak hours.'],
  ['App store review', 'The reports are easy to understand and useful.'],
];

async function main() {
  await db.feedbackTheme.deleteMany();
  await db.embedding.deleteMany();
  await db.report.deleteMany();
  await db.feedback.deleteMany();
  await db.theme.deleteMany();
  await db.user.deleteMany();
  await db.workspace.deleteMany();

  const ws = await db.workspace.create({
    data: {
      name: 'LOOP AI Intelligence',
    },
  });

  const pass = await bcrypt.hash('Loop@12345', 12);

  const users = await Promise.all([
    db.user.create({
      data: {
        name: 'Raju Kumar',
        email: 'rajuvermaa3215@gmail.com',
        passwordHash: pass,
        role: 'ADMIN',
        workspaceId: ws.id,
      },
    }),
    db.user.create({
      data: {
        name: 'Md Raihan',
        email: 'mohdraihan0786@gmail.com',
        passwordHash: pass,
        role: 'ANALYST',
        workspaceId: ws.id,
      },
    }),
    db.user.create({
      data: {
        name: 'Sonu Kumar',
        email: 'sonukumar763303@gmail.com',
        passwordHash: pass,
        role: 'ANALYST',
        workspaceId: ws.id,
      },
    }),
    db.user.create({
      data: {
        name: 'Yogita Mahesh Shelke',
        email: 'yogita1836@gmail.com',
        passwordHash: pass,
        role: 'VIEWER',
        workspaceId: ws.id,
      },
    }),
  ]);

  const themeMap = new Map<string, string>();

  for (const name of names) {
    const t = await db.theme.create({
      data: {
        name,
        workspaceId: ws.id,
        description: `Customer feedback theme: ${name}`,
      },
    });

    themeMap.set(name, t.id);
  }

  for (let i = 0; i < 128; i++) {
    const [channel, base] = examples[i % examples.length];

    const content =
      i % 5 === 0
        ? `${base} Customers also mentioned item ${i + 1}.`
        : base;

    const theme = names[i % names.length];

    const sentiment =
      /(slow|bad|work|timeout|wants|issue|problem)/i.test(content)
        ? 'NEG'
        : /(love|great|fast|easy|useful|gorgeous)/i.test(content)
          ? 'POS'
          : 'NEU';

    const score =
      sentiment === 'NEG' ? -0.6 : sentiment === 'POS' ? 0.7 : 0;

    const createdAt = new Date(Date.now() - ((127 - i) % 45) * 864e5);

    const f = await db.feedback.create({
      data: {
        content,
        channel,
        customerLabel: `Customer ${i + 1}`,
        sentiment: sentiment as any,
        sentimentScore: score,
        featureArea: theme,
        status:
          i % 3 === 0
            ? 'NEW'
            : i % 3 === 1
              ? 'REVIEWED'
              : 'ACTIONED',
        createdAt,
        workspaceId: ws.id,
        embedding: {
          create: {
            vector: vectorize(content),
          },
        },
      },
    });

    await db.feedbackTheme.create({
      data: {
        feedbackId: f.id,
        themeId: themeMap.get(theme)!,
        confidence: 0.82,
      },
    });
  }

  console.log(
    'Seeded workspace, 4 users, 128 feedback items and themes.'
  );
}

main().finally(() => db.$disconnect());

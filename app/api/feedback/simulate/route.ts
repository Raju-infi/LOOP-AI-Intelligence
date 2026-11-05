
import { db } from '@/lib/db';
import { requireRole } from '@/lib/auth';
import { classifyFeedback } from '@/lib/ai';
import { vectorize } from '@/lib/retrieval';

const samples = [
  ['Support ticket', 'Onboarding took forever — I could not figure out how to invite my team.'],
  ['App store review', 'The new dashboard is gorgeous and finally fast.'],
  ['NPS survey', 'It does the job, but the mobile experience needs work.'],
  ['Sales call note', 'Prospect wants SSO before they will sign.'],
  ['Community post', 'Love the new export feature, saved me an hour today.'],
  ['Support ticket', 'Billing page keeps timing out when I download an invoice.']
];

export async function POST(req: Request) {
  try {
    const s = await requireRole(['ADMIN', 'ANALYST']);
    const workspaceId = (s.user as any).workspaceId;

    let created = 0;

    // Load themes once instead of querying in every iteration
    const existingThemes = await db.theme.findMany({
      where: { workspaceId }
    });

    const themeNames = existingThemes.map(x => x.name);

    for (let i = 0; i < 12; i++) {
      const [channel, content] = samples[i % samples.length];

      // Distribute feedback across the last 30 days
      const daysAgo = Math.round((i / 11) * 29);

      const createdAt = new Date(
        Date.now() - daysAgo * 24 * 60 * 60 * 1000
      );

      const ai = await classifyFeedback(content, themeNames);

      const f = await db.feedback.create({
        data: {
          content,
          channel,
          customerLabel: `Simulated Customer ${i + 1}`,
          workspaceId,
          createdAt,
          sentiment: ai.sentiment as any,
          sentimentScore: ai.sentimentScore,
          featureArea: ai.featureArea,
          rationale: ai.rationale,
          embedding: {
            create: {
              vector: vectorize(content)
            }
          }
        }
      });

      for (const name of ai.themes) {
        const t = await db.theme.upsert({
          where: {
            workspaceId_name: { workspaceId, name }
          },
          update: {},
          create: { workspaceId, name }
        });

        await db.feedbackTheme.create({
          data: {
            feedbackId: f.id,
            themeId: t.id,
            confidence: 0.9
          }
        });
      }

      created++;
    }

    return Response.json({ created });

  } catch (e: any) {
    return Response.json(
      { error: e?.message || 'Simulation failed' },
      { status: 400 }
    );
  }
}

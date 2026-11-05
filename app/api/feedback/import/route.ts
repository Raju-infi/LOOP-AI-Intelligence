import { db } from '@/lib/db';
import { requireRole } from '@/lib/auth';
import { classifyFeedback } from '@/lib/ai';
import { vectorize } from '@/lib/retrieval';

export async function POST(req: Request) {
  try {
    const s = await requireRole(['ADMIN', 'ANALYST']);
    const body = await req.json();
    const rows = Array.isArray(body.rows) ? body.rows : [];
    const workspaceId = (s.user as any).workspaceId;
    let imported = 0, failed = 0;
    for (const r of rows) {
      try {
        if (!r.content || !r.channel) throw new Error('Invalid row');
        const themes = await db.theme.findMany({ where: { workspaceId } });
        const ai = await classifyFeedback(String(r.content), themes.map(x => x.name));
        const f = await db.feedback.create({
          data: {
            content: String(r.content),
            channel: String(r.channel),
            customerLabel: r.customer_label ? String(r.customer_label) : undefined,
            createdAt: r.created_at ? new Date(r.created_at) : undefined,
            sentiment: ai.sentiment as any,
            sentimentScore: ai.sentimentScore,
            featureArea: ai.featureArea,
            rationale: ai.rationale,
            workspaceId,
            embedding: { create: { vector: vectorize(String(r.content)) } }
          }
        });
        for (const name of ai.themes) {
          const t = await db.theme.upsert({
            where: { workspaceId_name: { workspaceId, name } },
            update: {}, create: { workspaceId, name }
          });
          await db.feedbackTheme.create({ data: { feedbackId: f.id, themeId: t.id, confidence: .85 } });
        }
        imported++;
      } catch { failed++; }
    }
    return Response.json({ imported, failed });
  } catch (e: any) {
    return Response.json({ error: e?.message || 'Import failed' }, { status: 400 });
  }
}

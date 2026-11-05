
import { db } from '@/lib/db';
import { requireRole } from '@/lib/auth';

export async function GET(req: Request) {
  try {
    const s = await requireRole(['ADMIN', 'ANALYST', 'VIEWER']);
    const workspaceId = (s.user as any).workspaceId;

    const u = new URL(req.url);
    const days = Math.min(
      365,
      Math.max(7, Number(u.searchParams.get('days') || 30))
    );

    const now = new Date();
    const from = new Date(now);
    from.setUTCHours(0, 0, 0, 0);
    from.setUTCDate(from.getUTCDate() - (days - 1));

    const all = await db.feedback.findMany({
      where: {
        workspaceId,
        createdAt: { gte: from, lte: now }
      },
      include: {
        themes: {
          include: { theme: true }
        }
      },
      orderBy: { createdAt: 'asc' }
    });

    const sentiment = { POS: 0, NEU: 0, NEG: 0 };
    const byDate: Record<string, number> = {};
    const themes: Record<string, number> = {};

    for (const f of all) {
      sentiment[f.sentiment]++;

      const date = f.createdAt.toISOString().slice(0, 10);
      byDate[date] = (byDate[date] || 0) + 1;

      for (const ft of f.themes) {
        const name = ft.theme.name;
        themes[name] = (themes[name] || 0) + 1;
      }
    }

    // Fill missing dates with zero
    const volume = [];

    for (let i = 0; i < days; i++) {
      const date = new Date(from);
      date.setUTCDate(date.getUTCDate() + i);

      const key = date.toISOString().slice(0, 10);

      volume.push({
        date: key,
        count: byDate[key] || 0
      });
    }

    const weekAgo = new Date(now);
    weekAgo.setDate(weekAgo.getDate() - 7);

    const newThisWeek = all.filter(
      f => f.createdAt >= weekAgo
    ).length;

    return Response.json({
      days,
      total: all.length,
      negativePct: all.length
        ? Math.round((sentiment.NEG / all.length) * 100)
        : 0,
      newThisWeek,
      sentiment,
      volume,
      topThemes: Object.entries(themes)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 8)
        .map(([name, count]) => ({ name, count }))
    });

  } catch (e: any) {
    return Response.json(
      { error: e?.message || 'Failed' },
      { status: 400 }
    );
  }
}

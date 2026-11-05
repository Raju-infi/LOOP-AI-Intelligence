# LOOP — AI Customer-Feedback Intelligence Platform

Corporate-grade Zidio internship project for the **Zidio Demo Workspace**.

## Stack
Next.js 14 App Router, TypeScript, Tailwind CSS, PostgreSQL, Prisma, Auth.js/NextAuth, Anthropic Claude API, Recharts and Zod.

## Team
- Raju Kumar — ADMIN
- Md Raihan — ANALYST
- Sonu Kumar — ANALYST
- Yogita Mahesh Shelke — VIEWER

## Local setup
1. Install Node.js 18+ and Git.
2. Create PostgreSQL database (Neon or Supabase works).
3. Copy `.env.example` to `.env` and fill `DATABASE_URL`, `NEXTAUTH_SECRET`, and optionally `ANTHROPIC_API_KEY`.
4. `npm install`
5. `npx prisma migrate dev --name init`
6. `npm run seed`
7. `npm run dev`
8. Open `http://localhost:3000`.

### Demo credentials
Password for all seeded users: `Loop@12345`

- Admin: rajuvermaa3215@gmail.com
- Analyst: mohdraihan0786@gmail.com
- Analyst: sonukumar763303@gmail.com
- Viewer: yogita1836@gmail.com

> Never reuse this demo password elsewhere.

## AI
Without `ANTHROPIC_API_KEY`, the app uses deterministic fallback classification/grounding so the UI and data flow can be demonstrated locally. For the required AI evaluation, configure the Anthropic API key and keep it server-side.

## Security
Every tenant-owned operation is scoped by the authenticated `workspaceId`. Claude API calls happen server-side. `.env` is ignored by Git.

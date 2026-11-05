import { getServerSession, type NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import { db } from './db';

export const authOptions: NextAuthOptions = {
  session: { strategy: 'jwt' },
  providers: [CredentialsProvider({
    name: 'Credentials',
    credentials: { email: {}, password: {} },
    async authorize(credentials) {
      if (!credentials?.email || !credentials.password) return null;
      const user = await db.user.findUnique({ where: { email: credentials.email.toLowerCase() } });
      if (!user || !(await bcrypt.compare(credentials.password, user.passwordHash))) return null;
      return { id: user.id, name: user.name, email: user.email, role: user.role, workspaceId: user.workspaceId } as any;
    }
  })],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        const u = user as any;
        token.role = u.role; token.workspaceId = u.workspaceId;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.sub;
        (session.user as any).role = token.role;
        (session.user as any).workspaceId = token.workspaceId;
      }
      return session;
    }
  },
  secret: process.env.NEXTAUTH_SECRET
};

export async function requireSession() {
  const session = await getServerSession(authOptions);
  if (!session?.user) throw new Error('UNAUTHORIZED');
  return session;
}

export async function requireRole(roles: string[]) {
  const session = await requireSession();
  if (!roles.includes((session.user as any).role)) throw new Error('FORBIDDEN');
  return session;
}

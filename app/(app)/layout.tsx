import {getServerSession} from 'next-auth'; import {authOptions} from '@/lib/auth'; import {redirect} from 'next/navigation'; import {AppShell} from '@/components/app-shell';
export default async function Layout({children}:{children:React.ReactNode}){const s=await getServerSession(authOptions);if(!s?.user)redirect('/login');return <AppShell>{children}</AppShell>}

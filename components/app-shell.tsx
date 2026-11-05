import { Sidebar } from './sidebar'; import { Topbar } from './topbar';
export function AppShell({children}:{children:React.ReactNode}){return <div className="min-h-screen flex"><Sidebar/><div className="flex-1 min-w-0"><Topbar/><main className="p-4 md:p-8 max-w-[1500px] mx-auto">{children}</main></div></div>}

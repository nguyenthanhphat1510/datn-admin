import type { ReactNode } from 'react';
import Sidebar from './Sidebar';
import Topbar from './Topbar';

export default function DashboardShell({ children }: { children: ReactNode }) {
  return (
    <div className="relative flex min-h-screen w-full bg-[#e5e7eb]">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar />
        <main className="flex-1 px-6 py-6">{children}</main>
      </div>
    </div>
  );
}

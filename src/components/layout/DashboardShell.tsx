import type { ReactNode } from 'react';
import Sidebar from './Sidebar';
import Topbar from './Topbar';

export default function DashboardShell({ children }: { children: ReactNode }) {
  return (
    <div className="relative flex min-h-screen w-full">
      {/* Subtle background pattern giống storefront */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-emerald-50/30 via-white to-white" />
      <div className="absolute inset-0 -z-10 opacity-[0.03] bg-[radial-gradient(rgba(0,126,66,0.4)_1px,transparent_1px)] [background-size:24px_24px]" />

      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar />
        <main className="flex-1 px-6 py-6">{children}</main>
      </div>
    </div>
  );
}

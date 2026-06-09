import DashboardShell from '@/components/layout/DashboardShell';
import ManufacturersPage from '@/components/manufacturers/ManufacturersPage';

export default function Page() {
  return (
    <DashboardShell>
      <ManufacturersPage />
    </DashboardShell>
  );
}

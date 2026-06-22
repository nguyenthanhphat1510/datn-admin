import DashboardShell from '@/components/layout/DashboardShell';
import DiseasesPage from '@/components/diseases/DiseasesPage';

export default function Page() {
  return (
    <DashboardShell>
      <DiseasesPage />
    </DashboardShell>
  );
}

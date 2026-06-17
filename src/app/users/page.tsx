import DashboardShell from '@/components/layout/DashboardShell';
import UsersPage from '@/components/users/UsersPage';

export default function Page() {
  return (
    <DashboardShell>
      <UsersPage />
    </DashboardShell>
  );
}

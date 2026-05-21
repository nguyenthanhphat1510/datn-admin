import DashboardShell from '@/components/layout/DashboardShell';
import CategoriesPage from '@/components/categories/CategoriesPage';

export default function Page() {
  return (
    <DashboardShell>
      <CategoriesPage />
    </DashboardShell>
  );
}

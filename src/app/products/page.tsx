import DashboardShell from '@/components/layout/DashboardShell';
import ProductsPage from '@/components/products/ProductsPage';

export default function Page() {
  return (
    <DashboardShell>
      <ProductsPage />
    </DashboardShell>
  );
}

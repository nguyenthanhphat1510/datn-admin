import DashboardShell from '@/components/layout/DashboardShell';
import OrdersPage from '@/components/orders/OrdersPage';

export default function Page() {
  return (
    <DashboardShell>
      <OrdersPage />
    </DashboardShell>
  );
}

import type { OrderStatus } from './order';

/** Một mốc doanh thu theo tháng (dùng cho biểu đồ). */
export interface MonthlyRevenuePoint {
  month: string; // "YYYY-MM"
  label: string; // "T6"
  revenue: number;
  orders: number;
}

/** Response của GET /dashboard/stats. */
export interface DashboardStats {
  kpi: {
    totalRevenue: number;
    totalOrders: number;
    totalUsers: number;
    totalProducts: number;
  };
  ordersByStatus: Record<OrderStatus, number>;
  monthlyRevenue: MonthlyRevenuePoint[];
}

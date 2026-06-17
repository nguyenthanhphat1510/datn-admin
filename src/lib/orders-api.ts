import { api } from './api';
import type { Order, OrderStatus } from '@/types/order';

export interface PaginatedOrders {
  data: Order[];
  total: number;
  page: number;
  limit: number;
}

export interface ListOrdersParams {
  status?: OrderStatus;
  page?: number;
  limit?: number;
}

/** [Admin] Lấy đơn hàng (phân trang), lọc theo trạng thái (tùy chọn). */
export async function listOrders(
  params: ListOrdersParams = {},
): Promise<PaginatedOrders> {
  const { data } = await api.get<PaginatedOrders>('/orders/admin', {
    params: {
      status: params.status || undefined,
      page: params.page,
      limit: params.limit,
    },
  });
  return data;
}

/** [Admin] Cập nhật trạng thái đơn hàng. */
export async function updateOrderStatus(
  id: string,
  status: OrderStatus,
): Promise<Order> {
  const { data } = await api.patch<Order>(`/orders/admin/${id}/status`, {
    status,
  });
  return data;
}

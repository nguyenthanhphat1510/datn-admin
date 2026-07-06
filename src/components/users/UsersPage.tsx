'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { listUsers, updateUser } from '@/lib/users-api';
import type { User, UserRole } from '@/types/user';
import { ISearch, IShield, IEye, IEyeOff, IAlert, ILeaf, IPlus } from '@/components/icons';
import StatCard from '@/components/ui/StatCard';
import SelectMenu from '@/components/ui/SelectMenu';
import IconBtn from '@/components/ui/IconBtn';
import Pagination from '@/components/ui/Pagination';
import Th from '@/components/ui/TableHead';
import UserFormModal from './UserFormModal';

function fmtDate(s: string) {
  return new Date(s).toLocaleString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/** Lấy chữ cái đầu cho avatar placeholder. */
function initial(u: User) {
  return (u.fullName || u.email || '?').trim().charAt(0).toUpperCase();
}

/**
 * Chuẩn hóa user: nhiều tài khoản (đăng nhập Google) không có sẵn `role`/`isActive`
 * trong DB → coi role thiếu là 'user', isActive thiếu là true (chưa bị khóa).
 */
function normalize(u: User): User {
  return {
    ...u,
    role: u.role === 'admin' ? 'admin' : 'user',
    isActive: u.isActive !== false,
  };
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('');
  const [page, setPage] = useState(1);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const LIMIT = 5;

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const list = await listUsers();
      setUsers(list.map(normalize));
    } catch (err) {
      console.error(err);
      setError('Không tải được danh sách người dùng. Kiểm tra backend đang chạy chưa?');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // Lọc + tìm kiếm client-side
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return users.filter((u) => {
      if (roleFilter && u.role !== roleFilter) return false;
      if (!q) return true;
      return (
        (u.fullName?.toLowerCase().includes(q) ?? false) ||
        u.email.toLowerCase().includes(q)
      );
    });
  }, [users, search, roleFilter]);

  // Đổi bộ lọc/tìm kiếm → quay về trang 1
  useEffect(() => {
    setPage(1);
  }, [search, roleFilter]);

  // Cắt danh sách đã lọc theo trang hiện tại (phân trang client-side)
  const paged = useMemo(
    () => filtered.slice((page - 1) * LIMIT, page * LIMIT),
    [filtered, page],
  );

  const totalAdmin = users.filter((u) => u.role === 'admin').length;
  const totalActive = users.filter((u) => u.isActive).length;

  /** Cập nhật 1 user qua API rồi đồng bộ state tại chỗ. */
  const applyUpdate = async (
    u: User,
    dto: { role?: UserRole; isActive?: boolean },
  ) => {
    setBusyId(u._id);
    try {
      const { user } = await updateUser(u._id, dto);
      const fresh = normalize(user);
      setUsers((prev) => prev.map((x) => (x._id === fresh._id ? fresh : x)));
    } catch (err) {
      console.error(err);
      alert('Cập nhật thất bại');
    } finally {
      setBusyId(null);
    }
  };

  const handleToggleRole = (u: User) => {
    const next: UserRole = u.role === 'admin' ? 'user' : 'admin';
    const verb = next === 'admin' ? 'cấp quyền ADMIN cho' : 'gỡ quyền admin của';
    if (!confirm(`Bạn chắc chắn muốn ${verb} "${u.fullName || u.email}"?`)) return;
    applyUpdate(u, { role: next });
  };

  const handleToggleActive = (u: User) => {
    const verb = u.isActive ? 'KHÓA' : 'mở khóa';
    if (!confirm(`Bạn chắc chắn muốn ${verb} tài khoản "${u.fullName || u.email}"?`))
      return;
    applyUpdate(u, { isActive: !u.isActive });
  };

  return (
    <div className="mx-auto w-full max-w-7xl space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-[#007e42]/20 bg-emerald-50 px-3 py-1 mb-2">
            <span className="h-1.5 w-1.5 rounded-full bg-[#007e42] animate-pulse" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#007e42]">
              Quản lý người dùng
            </span>
          </div>
          <h1 className="text-2xl font-extrabold text-gray-900">
            Danh sách{' '}
            <span
              className="bg-clip-text text-transparent"
              style={{ backgroundImage: 'linear-gradient(90deg, #007e42, #0a9d52, #84cc16)' }}
            >
              người dùng
            </span>
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Xem, đổi vai trò và khóa/mở tài khoản người dùng
          </p>
        </div>

        <button
          type="button"
          onClick={() => setModalOpen(true)}
          className="inline-flex h-10 items-center gap-2 rounded-xl px-4 text-sm font-semibold text-white shadow-sm transition hover:shadow-md"
          style={{ background: 'linear-gradient(135deg, #007e42 0%, #0a9d52 100%)' }}
        >
          <IPlus />
          Thêm người dùng
        </button>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <StatCard label="Tổng người dùng" value={users.length} hint="Tất cả trong DB" />
        <StatCard label="Quản trị viên" value={totalAdmin} hint="Role admin" tone="active" />
        <StatCard label="Đang hoạt động" value={totalActive} hint="Chưa bị khóa" />
      </div>

      <div className="flex flex-wrap items-center gap-3 rounded-xl border border-gray-300 bg-white px-4 py-3 shadow-sm">
        <div className="relative flex-1 min-w-[200px]">
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
            <ISearch />
          </span>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm theo tên hoặc email..."
            className="h-10 w-full rounded-lg border border-gray-300 bg-white pl-10 pr-3 text-sm font-medium text-gray-700 outline-none focus:border-[#007e42] focus:ring-1 focus:ring-[#007e42]"
          />
        </div>

        <SelectMenu
          value={roleFilter}
          onChange={setRoleFilter}
          placeholder="Tất cả vai trò"
          className="min-w-[180px]"
          options={[
            { value: '', label: 'Tất cả vai trò' },
            { value: 'admin', label: 'Quản trị viên' },
            { value: 'user', label: 'Người dùng' },
          ]}
        />
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <IAlert />
          {error}
        </div>
      )}

      <div className="overflow-hidden rounded-xl border border-gray-300 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-300">
            <thead className="bg-[#007e42] [&_th]:text-white">
              <tr>
                <Th>Người dùng</Th>
                <Th>Vai trò</Th>
                <Th>Trạng thái</Th>
                <Th>Ngày tạo</Th>
                <Th align="right">Hành động</Th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-300">
              {loading && (
                <tr>
                  <td colSpan={5} className="px-4 py-10 text-center text-sm text-gray-400">
                    Đang tải...
                  </td>
                </tr>
              )}
              {!loading && filtered.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-12 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <ILeaf size={40} />
                      <p className="text-sm font-semibold text-gray-600">
                        Không có người dùng nào
                      </p>
                    </div>
                  </td>
                </tr>
              )}
              {!loading &&
                paged.map((u, i) => (
                  <tr
                    key={u._id}
                    className="transition hover:bg-emerald-50/40 animate-fade-in-up"
                    style={{ animationDelay: `${i * 30}ms` }}
                  >
                    <td className="px-4 py-2">
                      <div className="flex items-center gap-3">
                        {u.avatar ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={u.avatar}
                            alt={u.fullName || u.email}
                            className="h-10 w-10 rounded-full border border-gray-300 object-cover"
                          />
                        ) : (
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-emerald-100 to-teal-200 text-sm font-bold text-[#007e42]">
                            {initial(u)}
                          </div>
                        )}
                        <div className="min-w-0">
                          <div className="truncate text-sm font-bold text-gray-800">
                            {u.fullName || '— chưa đặt tên —'}
                          </div>
                          <div className="truncate text-xs text-gray-500">{u.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-2">
                      {u.role === 'admin' ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-purple-50 px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide text-purple-600">
                          <IShield />
                          Admin
                        </span>
                      ) : (
                        <span className="inline-flex rounded-full bg-gray-100 px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide text-gray-600">
                          User
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-2">
                      {u.isActive ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide text-[#007e42]">
                          <IEye />
                          Hoạt động
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide text-gray-500">
                          <IEyeOff />
                          Bị khóa
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-2 text-sm tabular-nums text-gray-600">
                      {fmtDate(u.createdAt)}
                    </td>
                    <td className="px-4 py-2">
                      <div className="flex justify-end gap-1">
                        <IconBtn
                          title={u.role === 'admin' ? 'Gỡ quyền admin' : 'Cấp quyền admin'}
                          tone={u.role === 'admin' ? 'default' : 'success'}
                          onClick={() => !busyId && handleToggleRole(u)}
                        >
                          <IShield />
                        </IconBtn>
                        {u.isActive ? (
                          <IconBtn
                            title="Khóa tài khoản"
                            tone="danger"
                            onClick={() => !busyId && handleToggleActive(u)}
                          >
                            <IEyeOff />
                          </IconBtn>
                        ) : (
                          <IconBtn
                            title="Mở khóa"
                            tone="success"
                            onClick={() => !busyId && handleToggleActive(u)}
                          >
                            <IEye />
                          </IconBtn>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>

      {!loading && !error && (
        <Pagination
          page={page}
          total={filtered.length}
          limit={LIMIT}
          onPageChange={setPage}
        />
      )}

      {modalOpen && (
        <UserFormModal
          onClose={() => setModalOpen(false)}
          onSaved={() => {
            setModalOpen(false);
            fetchUsers();
          }}
        />
      )}
    </div>
  );
}

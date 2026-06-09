'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  hardDeleteManufacturer,
  listManufacturers,
  restoreManufacturer,
  softDeleteManufacturer,
} from '@/lib/manufacturers-api';
import type { Manufacturer } from '@/types/manufacturer';
import {
  IPlus,
  IPencil,
  ITrash,
  IEye,
  IEyeOff,
  ISearch,
  ILeaf,
  IRotate,
  IAlert,
} from '@/components/icons';
import StatCard from '@/components/ui/StatCard';
import IconBtn from '@/components/ui/IconBtn';
import Th from '@/components/ui/TableHead';
import ManufacturerFormModal from './ManufacturerFormModal';

export default function ManufacturersPage() {
  const [manufacturers, setManufacturers] = useState<Manufacturer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Manufacturer | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const list = await listManufacturers(true);
      setManufacturers(list);
    } catch (err) {
      console.error(err);
      setError('Không tải được danh sách nhà sản xuất. Kiểm tra backend đang chạy chưa?');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return manufacturers;
    return manufacturers.filter(
      (m) =>
        m.name.toLowerCase().includes(q) ||
        m.slug.toLowerCase().includes(q) ||
        (m.description ?? '').toLowerCase().includes(q),
    );
  }, [manufacturers, search]);

  const openCreate = () => {
    setEditing(null);
    setModalOpen(true);
  };

  const openEdit = (m: Manufacturer) => {
    setEditing(m);
    setModalOpen(true);
  };

  const handleSoftDelete = async (m: Manufacturer) => {
    if (!confirm(`Ẩn nhà sản xuất "${m.name}"?`)) return;
    try {
      await softDeleteManufacturer(m._id);
      fetchData();
    } catch (err) {
      console.error(err);
      alert('Ẩn nhà sản xuất thất bại');
    }
  };

  const handleRestore = async (m: Manufacturer) => {
    try {
      await restoreManufacturer(m._id);
      fetchData();
    } catch (err) {
      console.error(err);
      alert('Khôi phục nhà sản xuất thất bại');
    }
  };

  const handleHardDelete = async (m: Manufacturer) => {
    if (
      !confirm(
        `XÓA VĨNH VIỄN nhà sản xuất "${m.name}"?\nKhông thể khôi phục. Nếu còn sản phẩm thì sẽ bị chặn.`,
      )
    ) {
      return;
    }
    try {
      await hardDeleteManufacturer(m._id);
      fetchData();
    } catch (err: unknown) {
      console.error(err);
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      alert(msg ?? 'Xóa nhà sản xuất thất bại');
    }
  };

  const totalActive = manufacturers.filter((m) => m.isActive).length;
  const totalHidden = manufacturers.length - totalActive;

  return (
    <div className="mx-auto w-full max-w-7xl space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-[#007e42]/20 bg-emerald-50 px-3 py-1 mb-2">
            <span className="h-1.5 w-1.5 rounded-full bg-[#007e42] animate-pulse" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#007e42]">
              Quản lý nhà sản xuất
            </span>
          </div>
          <h1 className="text-2xl font-extrabold text-gray-900">
            Danh sách{' '}
            <span
              className="bg-clip-text text-transparent"
              style={{ backgroundImage: 'linear-gradient(90deg, #007e42, #0a9d52, #84cc16)' }}
            >
              nhà sản xuất
            </span>
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Thêm, sửa, xóa nhà sản xuất. Mỗi sản phẩm sẽ liên kết tới một nhà sản xuất qua ID.
          </p>
        </div>

        <button
          type="button"
          onClick={openCreate}
          className="inline-flex h-10 items-center gap-2 rounded-xl px-4 text-sm font-semibold text-white shadow-sm transition hover:shadow-md"
          style={{ background: 'linear-gradient(135deg, #007e42 0%, #0a9d52 100%)' }}
        >
          <IPlus />
          Thêm nhà sản xuất
        </button>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <StatCard label="Tổng nhà sản xuất" value={manufacturers.length} hint="Tất cả trong DB" />
        <StatCard label="Đang hiện" value={totalActive} hint="Khách thấy được" tone="active" />
        <StatCard label="Đang ẩn" value={totalHidden} hint="Soft delete" tone="hidden" />
      </div>

      <div className="flex flex-wrap items-center gap-3 rounded-xl border border-gray-100 bg-white px-4 py-3 shadow-sm">
        <div className="relative flex-1 min-w-[200px]">
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
            <ISearch />
          </span>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm nhà sản xuất theo tên, slug, mô tả..."
            className="h-10 w-full rounded-lg border border-gray-200 bg-white pl-10 pr-3 text-sm font-medium text-gray-700 outline-none focus:border-[#007e42] focus:ring-1 focus:ring-[#007e42]"
          />
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <IAlert />
          {error}
        </div>
      )}

      {!loading && !error && (
        <p className="text-sm text-gray-500">
          Hiển thị <span className="font-semibold text-gray-800">{filtered.length}</span> /{' '}
          <span className="font-semibold text-gray-800">{manufacturers.length}</span> nhà sản xuất
        </p>
      )}

      <div className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-100">
            <thead className="bg-gray-50/70">
              <tr>
                <Th>Logo</Th>
                <Th>Tên nhà sản xuất</Th>
                <Th>Slug</Th>
                <Th>Mô tả</Th>
                <Th>Trạng thái</Th>
                <Th align="right">Hành động</Th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading && (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center text-sm text-gray-400">
                    Đang tải...
                  </td>
                </tr>
              )}
              {!loading && filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <ILeaf size={40} />
                      <p className="text-sm font-semibold text-gray-600">
                        {manufacturers.length === 0
                          ? 'Chưa có nhà sản xuất nào'
                          : 'Không tìm thấy nhà sản xuất phù hợp'}
                      </p>
                      <p className="text-xs text-gray-400">
                        {manufacturers.length === 0
                          ? 'Bấm "Thêm nhà sản xuất" để tạo nhà sản xuất đầu tiên'
                          : 'Thử từ khóa khác'}
                      </p>
                    </div>
                  </td>
                </tr>
              )}
              {!loading &&
                filtered.map((m, i) => (
                  <tr
                    key={m._id}
                    className="transition hover:bg-emerald-50/40 animate-fade-in-up"
                    style={{ animationDelay: `${i * 30}ms` }}
                  >
                    <td className="px-4 py-3">
                      <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-lg border border-gray-100 bg-white">
                        {m.logo?.url ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={m.logo.url}
                            alt={m.name}
                            className="h-full w-full object-contain"
                          />
                        ) : (
                          <ILeaf size={18} />
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm font-semibold text-gray-800">{m.name}</td>
                    <td className="px-4 py-3">
                      <code className="rounded bg-gray-100 px-2 py-0.5 font-mono text-[11px] text-gray-700">
                        {m.slug}
                      </code>
                    </td>
                    <td className="max-w-md px-4 py-3">
                      <div className="truncate text-sm text-gray-500">
                        {m.description || <span className="italic text-gray-300">— trống —</span>}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {m.isActive ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-[#007e42]">
                          <IEye />
                          Hiện
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-gray-500">
                          <IEyeOff />
                          Ẩn
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-1">
                        <IconBtn title="Sửa" onClick={() => openEdit(m)}>
                          <IPencil />
                        </IconBtn>
                        {m.isActive ? (
                          <IconBtn title="Ẩn" onClick={() => handleSoftDelete(m)}>
                            <IEyeOff />
                          </IconBtn>
                        ) : (
                          <IconBtn
                            title="Hiện lại"
                            tone="success"
                            onClick={() => handleRestore(m)}
                          >
                            <IRotate />
                          </IconBtn>
                        )}
                        <IconBtn
                          title="Xóa vĩnh viễn"
                          tone="danger"
                          onClick={() => handleHardDelete(m)}
                        >
                          <ITrash />
                        </IconBtn>
                      </div>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>

      {modalOpen && (
        <ManufacturerFormModal
          manufacturer={editing}
          onClose={() => setModalOpen(false)}
          onSaved={() => {
            setModalOpen(false);
            fetchData();
          }}
        />
      )}
    </div>
  );
}

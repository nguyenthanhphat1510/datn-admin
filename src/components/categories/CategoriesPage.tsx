'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  hardDeleteCategory,
  listCategories,
  restoreCategory,
  softDeleteCategory,
} from '@/lib/categories-api';
import type { Category } from '@/types/category';
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
import CategoryFormModal from './CategoryFormModal';

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const list = await listCategories(true); // include inactive
      setCategories(list);
    } catch (err) {
      console.error(err);
      setError('Không tải được danh sách danh mục. Kiểm tra backend đang chạy chưa?');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Filter search client-side (danh sách thường nhỏ)
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return categories;
    return categories.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.slug.toLowerCase().includes(q) ||
        (c.description ?? '').toLowerCase().includes(q),
    );
  }, [categories, search]);

  const openCreate = () => {
    setEditing(null);
    setModalOpen(true);
  };

  const openEdit = (c: Category) => {
    setEditing(c);
    setModalOpen(true);
  };

  const handleSoftDelete = async (c: Category) => {
    if (!confirm(`Ẩn danh mục "${c.name}"?`)) return;
    try {
      await softDeleteCategory(c._id);
      fetchData();
    } catch (err) {
      console.error(err);
      alert('Ẩn danh mục thất bại');
    }
  };

  const handleRestore = async (c: Category) => {
    try {
      await restoreCategory(c._id);
      fetchData();
    } catch (err) {
      console.error(err);
      alert('Khôi phục danh mục thất bại');
    }
  };

  const handleHardDelete = async (c: Category) => {
    if (
      !confirm(
        `XÓA VĨNH VIỄN danh mục "${c.name}"?\nKhông thể khôi phục. Nếu còn sản phẩm thì sẽ bị chặn.`,
      )
    ) {
      return;
    }
    try {
      await hardDeleteCategory(c._id);
      fetchData();
    } catch (err: unknown) {
      console.error(err);
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      alert(msg ?? 'Xóa danh mục thất bại');
    }
  };

  const totalActive = categories.filter((c) => c.isActive).length;
  const totalHidden = categories.length - totalActive;

  return (
    <div className="mx-auto w-full max-w-7xl space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-[#007e42]/20 bg-emerald-50 px-3 py-1 mb-2">
            <span className="h-1.5 w-1.5 rounded-full bg-[#007e42] animate-pulse" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#007e42]">
              Quản lý danh mục
            </span>
          </div>
          <h1 className="text-2xl font-extrabold text-gray-900">
            Danh sách{' '}
            <span
              className="bg-clip-text text-transparent"
              style={{ backgroundImage: 'linear-gradient(90deg, #007e42, #0a9d52, #84cc16)' }}
            >
              danh mục
            </span>
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Thêm, sửa, xóa danh mục sản phẩm. Slug được dùng cho URL trên cửa hàng.
          </p>
        </div>

        <button
          type="button"
          onClick={openCreate}
          className="inline-flex h-10 items-center gap-2 rounded-xl px-4 text-sm font-semibold text-white shadow-sm transition hover:shadow-md"
          style={{ background: 'linear-gradient(135deg, #007e42 0%, #0a9d52 100%)' }}
        >
          <IPlus />
          Thêm danh mục
        </button>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <StatCard label="Tổng danh mục" value={categories.length} hint="Tất cả trong DB" />
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
            placeholder="Tìm danh mục theo tên, slug, mô tả..."
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
          <span className="font-semibold text-gray-800">{categories.length}</span> danh mục
        </p>
      )}

      <div className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-100">
            <thead className="bg-gray-50/70">
              <tr>
                <Th>Tên danh mục</Th>
                <Th>Slug</Th>
                <Th>Mô tả</Th>
                <Th>Trạng thái</Th>
                <Th align="right">Hành động</Th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
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
                        {categories.length === 0
                          ? 'Chưa có danh mục nào'
                          : 'Không tìm thấy danh mục phù hợp'}
                      </p>
                      <p className="text-xs text-gray-400">
                        {categories.length === 0
                          ? 'Bấm "Thêm danh mục" để tạo danh mục đầu tiên'
                          : 'Thử từ khóa khác'}
                      </p>
                    </div>
                  </td>
                </tr>
              )}
              {!loading &&
                filtered.map((c, i) => (
                  <tr
                    key={c._id}
                    className="transition hover:bg-emerald-50/40 animate-fade-in-up"
                    style={{ animationDelay: `${i * 30}ms` }}
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-50 to-teal-100">
                          <ILeaf size={20} />
                        </div>
                        <div className="text-sm font-semibold text-gray-800">{c.name}</div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <code className="rounded bg-gray-100 px-2 py-0.5 font-mono text-[11px] text-gray-700">
                        {c.slug}
                      </code>
                    </td>
                    <td className="max-w-md px-4 py-3">
                      <div className="truncate text-sm text-gray-500">
                        {c.description || <span className="italic text-gray-300">— trống —</span>}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {c.isActive ? (
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
                        <IconBtn title="Sửa" onClick={() => openEdit(c)}>
                          <IPencil />
                        </IconBtn>
                        {c.isActive ? (
                          <IconBtn title="Ẩn" onClick={() => handleSoftDelete(c)}>
                            <IEyeOff />
                          </IconBtn>
                        ) : (
                          <IconBtn
                            title="Hiện lại"
                            tone="success"
                            onClick={() => handleRestore(c)}
                          >
                            <IRotate />
                          </IconBtn>
                        )}
                        <IconBtn
                          title="Xóa vĩnh viễn"
                          tone="danger"
                          onClick={() => handleHardDelete(c)}
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
        <CategoryFormModal
          category={editing}
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

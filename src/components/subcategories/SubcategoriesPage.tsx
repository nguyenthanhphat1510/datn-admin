'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  hardDeleteSubcategory,
  listSubcategories,
  restoreSubcategory,
  softDeleteSubcategory,
} from '@/lib/subcategories-api';
import { listCategories } from '@/lib/categories-api';
import type { Subcategory } from '@/types/subcategory';
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
import SelectMenu from '@/components/ui/SelectMenu';
import IconBtn from '@/components/ui/IconBtn';
import Th from '@/components/ui/TableHead';
import Pagination from '@/components/ui/Pagination';
import SubcategoryFormModal from './SubcategoryFormModal';

export default function SubcategoriesPage() {
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [filterCategoryId, setFilterCategoryId] = useState('');

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Subcategory | null>(null);
  const [page, setPage] = useState(1);

  const LIMIT = 5;

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [subs, cats] = await Promise.all([
        listSubcategories(true),
        listCategories(true),
      ]);
      setSubcategories(subs);
      setCategories(cats);
    } catch (err) {
      console.error(err);
      setError('Không tải được dữ liệu. Kiểm tra backend đang chạy chưa?');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const categoryMap = useMemo(
    () => Object.fromEntries(categories.map((c) => [c._id, c.name])),
    [categories],
  );

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return subcategories.filter((s) => {
      const matchSearch =
        !q ||
        s.name.toLowerCase().includes(q) ||
        s.slug.toLowerCase().includes(q) ||
        (s.description ?? '').toLowerCase().includes(q);
      const matchCategory = !filterCategoryId || s.categoryId === filterCategoryId;
      return matchSearch && matchCategory;
    });
  }, [subcategories, search, filterCategoryId]);

  // Đổi bộ lọc → quay về trang 1
  useEffect(() => {
    setPage(1);
  }, [search, filterCategoryId]);

  // Phân trang client-side
  const paged = useMemo(
    () => filtered.slice((page - 1) * LIMIT, page * LIMIT),
    [filtered, page],
  );

  const openCreate = () => {
    setEditing(null);
    setModalOpen(true);
  };

  const openEdit = (s: Subcategory) => {
    setEditing(s);
    setModalOpen(true);
  };

  const handleSoftDelete = async (s: Subcategory) => {
    if (!confirm(`Ẩn danh mục con "${s.name}"?`)) return;
    try {
      await softDeleteSubcategory(s._id);
      fetchData();
    } catch (err) {
      console.error(err);
      alert('Ẩn danh mục con thất bại');
    }
  };

  const handleRestore = async (s: Subcategory) => {
    try {
      await restoreSubcategory(s._id);
      fetchData();
    } catch (err) {
      console.error(err);
      alert('Khôi phục danh mục con thất bại');
    }
  };

  const handleHardDelete = async (s: Subcategory) => {
    if (
      !confirm(`XÓA VĨNH VIỄN danh mục con "${s.name}"?\nKhông thể khôi phục.`)
    )
      return;
    try {
      await hardDeleteSubcategory(s._id);
      fetchData();
    } catch (err: unknown) {
      console.error(err);
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data
        ?.message;
      alert(msg ?? 'Xóa danh mục con thất bại');
    }
  };

  const totalActive = subcategories.filter((s) => s.isActive).length;
  const totalHidden = subcategories.length - totalActive;

  return (
    <div className="mx-auto w-full max-w-7xl space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-[#007e42]/20 bg-emerald-50 px-3 py-1 mb-2">
            <span className="h-1.5 w-1.5 rounded-full bg-[#007e42] animate-pulse" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#007e42]">
              Quản lý danh mục con
            </span>
          </div>
          <h1 className="text-2xl font-extrabold text-gray-900">
            Danh sách{' '}
            <span
              className="bg-clip-text text-transparent"
              style={{ backgroundImage: 'linear-gradient(90deg, #007e42, #0a9d52, #84cc16)' }}
            >
              danh mục con
            </span>
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Mỗi danh mục con thuộc về một danh mục cha. Slug dùng cho URL trên cửa hàng.
          </p>
        </div>

        <button
          type="button"
          onClick={openCreate}
          className="inline-flex h-10 items-center gap-2 rounded-xl px-4 text-sm font-semibold text-white shadow-sm transition hover:shadow-md"
          style={{ background: 'linear-gradient(135deg, #007e42 0%, #0a9d52 100%)' }}
        >
          <IPlus />
          Thêm danh mục con
        </button>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <StatCard label="Tổng danh mục con" value={subcategories.length} hint="Tất cả trong DB" />
        <StatCard label="Đang hiện" value={totalActive} hint="Khách thấy được" tone="active" />
        <StatCard label="Đang ẩn" value={totalHidden} hint="Soft delete" tone="hidden" />
      </div>

      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3 rounded-xl border border-gray-300 bg-white px-4 py-3 shadow-sm">
        <div className="relative flex-1 min-w-[200px]">
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
            <ISearch />
          </span>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm danh mục con theo tên, slug, mô tả..."
            className="h-10 w-full rounded-lg border border-gray-300 bg-white pl-10 pr-3 text-sm font-medium text-gray-700 outline-none focus:border-[#007e42] focus:ring-1 focus:ring-[#007e42]"
          />
        </div>
        <SelectMenu
          value={filterCategoryId}
          onChange={setFilterCategoryId}
          placeholder="Tất cả danh mục cha"
          className="min-w-[200px]"
          options={[
            { value: '', label: 'Tất cả danh mục cha' },
            ...categories.map((c) => ({ value: c._id, label: c.name })),
          ]}
        />
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
          <span className="font-semibold text-gray-800">{subcategories.length}</span> danh mục con
        </p>
      )}

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-gray-300 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-300">
            <thead className="bg-[#007e42] [&_th]:text-white">
              <tr>
                <Th>Tên danh mục con</Th>
                <Th>Danh mục cha</Th>
                <Th>Slug</Th>
                <Th>Mô tả</Th>
                <Th>Trạng thái</Th>
                <Th align="right">Hành động</Th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-300">
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
                        {subcategories.length === 0
                          ? 'Chưa có danh mục con nào'
                          : 'Không tìm thấy danh mục con phù hợp'}
                      </p>
                      <p className="text-xs text-gray-400">
                        {subcategories.length === 0
                          ? 'Bấm "Thêm danh mục con" để tạo mới'
                          : 'Thử từ khóa hoặc bộ lọc khác'}
                      </p>
                    </div>
                  </td>
                </tr>
              )}
              {!loading &&
                paged.map((s, i) => (
                  <tr
                    key={s._id}
                    className="transition hover:bg-emerald-50/40 animate-fade-in-up"
                    style={{ animationDelay: `${i * 30}ms` }}
                  >
                    {/* Tên */}
                    <td className="px-4 py-3">
                      <div className="text-sm font-semibold text-gray-800">{s.name}</div>
                    </td>

                    {/* Danh mục cha */}
                    <td className="px-4 py-3">
                      {categoryMap[s.categoryId] ? (
                        <span className="inline-flex items-center rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-[#007e42]">
                          {categoryMap[s.categoryId]}
                        </span>
                      ) : (
                        <span className="text-xs text-gray-400 italic">—</span>
                      )}
                    </td>

                    {/* Slug */}
                    <td className="px-4 py-3">
                      <code className="rounded bg-gray-100 px-2 py-0.5 font-mono text-[11px] text-gray-700">
                        {s.slug}
                      </code>
                    </td>

                    {/* Mô tả */}
                    <td className="max-w-xs px-4 py-3">
                      <div className="truncate text-sm text-gray-500">
                        {s.description || (
                          <span className="italic text-gray-300">— trống —</span>
                        )}
                      </div>
                    </td>

                    {/* Trạng thái */}
                    <td className="px-4 py-3 text-sm">
                      {s.isActive ? (
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

                    {/* Hành động */}
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-1">
                        <IconBtn title="Sửa" onClick={() => openEdit(s)}>
                          <IPencil />
                        </IconBtn>
                        {s.isActive ? (
                          <IconBtn title="Ẩn" onClick={() => handleSoftDelete(s)}>
                            <IEyeOff />
                          </IconBtn>
                        ) : (
                          <IconBtn title="Hiện lại" tone="success" onClick={() => handleRestore(s)}>
                            <IRotate />
                          </IconBtn>
                        )}
                        <IconBtn
                          title="Xóa vĩnh viễn"
                          tone="danger"
                          onClick={() => handleHardDelete(s)}
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

      {!loading && !error && (
        <Pagination
          page={page}
          total={filtered.length}
          limit={LIMIT}
          onPageChange={setPage}
        />
      )}

      {modalOpen && (
        <SubcategoryFormModal
          subcategory={editing}
          categories={categories}
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

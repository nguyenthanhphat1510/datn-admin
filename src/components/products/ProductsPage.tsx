'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  hardDeleteProduct,
  listProducts,
  restoreProduct,
  softDeleteProduct,
} from '@/lib/products-api';
import { listCategories } from '@/lib/categories-api';
import { listManufacturers } from '@/lib/manufacturers-api';
import { listSubcategories } from '@/lib/subcategories-api';
import type { Product } from '@/types/product';
import type { Category } from '@/types/category';
import type { Manufacturer } from '@/types/manufacturer';
import type { Subcategory } from '@/types/subcategory';
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
import Pagination from '@/components/ui/Pagination';
import IconBtn from '@/components/ui/IconBtn';
import Th from '@/components/ui/TableHead';
import ProductFormModal from './ProductFormModal';

function fmt(n: number) {
  return n.toLocaleString('vi-VN') + '₫';
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [manufacturers, setManufacturers] = useState<Manufacturer[]>([]);
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [categoryId, setCategoryId] = useState<string>('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);

  const LIMIT = 10;

  // Lookup map cho cột "Danh mục"
  const categoryMap = useMemo(() => {
    const m = new Map<string, Category>();
    categories.forEach((c) => m.set(c._id, c));
    return m;
  }, [categories]);

  // Lookup map cho cột "Danh mục con"
  const subcategoryMap = useMemo(() => {
    const m = new Map<string, Subcategory>();
    subcategories.forEach((s) => m.set(s._id, s));
    return m;
  }, [subcategories]);

  // Lookup map cho cột "Nhà sản xuất"
  const manufacturerMap = useMemo(() => {
    const m = new Map<string, Manufacturer>();
    manufacturers.forEach((mf) => m.set(mf._id, mf));
    return m;
  }, [manufacturers]);

  const fetchCategories = useCallback(async () => {
    try {
      // Lấy cả inactive để product gán danh mục đã ẩn vẫn hiển thị tên
      const list = await listCategories(true);
      setCategories(list);
    } catch (err) {
      console.error(err);
    }
  }, []);

  const fetchManufacturers = useCallback(async () => {
    try {
      const list = await listManufacturers(true);
      setManufacturers(list);
    } catch (err) {
      console.error(err);
    }
  }, []);

  const fetchSubcategories = useCallback(async () => {
    try {
      // Lấy cả inactive để product gán danh mục con đã ẩn vẫn hiển thị tên
      const list = await listSubcategories(true);
      setSubcategories(list);
    } catch (err) {
      console.error(err);
    }
  }, []);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await listProducts({
        page,
        limit: LIMIT,
        search: search || undefined,
        categoryId: categoryId || undefined,
      });
      setProducts(result.data);
      setTotal(result.total);
    } catch (err) {
      console.error(err);
      setError('Không tải được danh sách sản phẩm. Kiểm tra backend đang chạy chưa?');
    } finally {
      setLoading(false);
    }
  }, [search, categoryId, page]);

  // Đổi bộ lọc → quay về trang 1
  useEffect(() => {
    setPage(1);
  }, [search, categoryId]);

  useEffect(() => {
    fetchCategories();
    fetchManufacturers();
    fetchSubcategories();
  }, [fetchCategories, fetchManufacturers, fetchSubcategories]);

  useEffect(() => {
    const id = setTimeout(fetchProducts, 300);
    return () => clearTimeout(id);
  }, [fetchProducts]);

  const openCreate = () => {
    setEditing(null);
    setModalOpen(true);
  };

  const openEdit = (p: Product) => {
    setEditing(p);
    setModalOpen(true);
  };

  const handleSoftDelete = async (p: Product) => {
    if (!confirm(`Ẩn sản phẩm "${p.name}"?`)) return;
    try {
      await softDeleteProduct(p._id);
      fetchProducts();
    } catch (err) {
      console.error(err);
      alert('Ẩn sản phẩm thất bại');
    }
  };

  const handleRestore = async (p: Product) => {
    try {
      await restoreProduct(p._id);
      fetchProducts();
    } catch (err) {
      console.error(err);
      alert('Khôi phục sản phẩm thất bại');
    }
  };

  const handleHardDelete = async (p: Product) => {
    if (
      !confirm(
        `XÓA VĨNH VIỄN sản phẩm "${p.name}"?\nẢnh trên Cloudinary cũng sẽ bị xóa. Không thể khôi phục.`,
      )
    ) {
      return;
    }
    try {
      await hardDeleteProduct(p._id);
      fetchProducts();
    } catch (err) {
      console.error(err);
      alert('Xóa vĩnh viễn thất bại');
    }
  };

  const totalActive = products.filter((p) => p.isActive).length;
  const totalHidden = products.length - totalActive;

  return (
    <div className="mx-auto w-full max-w-7xl space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-[#007e42]/20 bg-emerald-50 px-3 py-1 mb-2">
            <span className="h-1.5 w-1.5 rounded-full bg-[#007e42] animate-pulse" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#007e42]">
              Quản lý sản phẩm
            </span>
          </div>
          <h1 className="text-2xl font-extrabold text-gray-900">
            Danh sách{' '}
            <span
              className="bg-clip-text text-transparent"
              style={{ backgroundImage: 'linear-gradient(90deg, #007e42, #0a9d52, #84cc16)' }}
            >
              sản phẩm
            </span>
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Thêm, sửa, xóa và quản lý ảnh sản phẩm trên cửa hàng
          </p>
        </div>

        <button
          type="button"
          onClick={openCreate}
          className="inline-flex h-10 items-center gap-2 rounded-xl px-4 text-sm font-semibold text-white shadow-sm transition hover:shadow-md"
          style={{ background: 'linear-gradient(135deg, #007e42 0%, #0a9d52 100%)' }}
        >
          <IPlus />
          Thêm sản phẩm
        </button>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <StatCard label="Tổng sản phẩm" value={products.length} hint="Tất cả trong DB" />
        <StatCard label="Đang hiện" value={totalActive} hint="Khách thấy được" tone="active" />
        <StatCard label="Đang ẩn" value={totalHidden} hint="Soft delete" tone="hidden" />
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
            placeholder="Tìm sản phẩm theo tên..."
            className="h-10 w-full rounded-lg border border-gray-300 bg-white pl-10 pr-3 text-sm font-medium text-gray-700 outline-none focus:border-[#007e42] focus:ring-1 focus:ring-[#007e42]"
          />
        </div>

        <SelectMenu
          value={categoryId}
          onChange={setCategoryId}
          placeholder="Tất cả danh mục"
          className="min-w-[200px]"
          options={[
            { value: '', label: 'Tất cả danh mục' },
            ...categories.map((c) => ({
              value: c._id,
              label: c.name + (!c.isActive ? ' (ẩn)' : ''),
            })),
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
          <table className="w-full min-w-[900px] divide-y divide-gray-300">
            <thead className="bg-[#007e42] [&_th]:text-white">
              <tr>
                <Th>Ảnh</Th>
                <Th>Sản phẩm</Th>
                <Th>Danh mục</Th>
                <Th>Danh mục con</Th>
                <Th>Nhà sản xuất</Th>
                <Th align="right">Giá</Th>
                <Th align="right">Tồn kho</Th>
                <Th>Trạng thái</Th>
                <Th align="right">Hành động</Th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-300">
              {loading && (
                <tr>
                  <td colSpan={9} className="px-4 py-10 text-center text-sm text-gray-400">
                    Đang tải...
                  </td>
                </tr>
              )}
              {!loading && products.length === 0 && (
                <tr>
                  <td colSpan={9} className="px-4 py-12 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <ILeaf size={40} />
                      <p className="text-sm font-semibold text-gray-600">Chưa có sản phẩm nào</p>
                      <p className="text-xs text-gray-400">
                        Bấm &ldquo;Thêm sản phẩm&rdquo; để tạo sản phẩm đầu tiên
                      </p>
                    </div>
                  </td>
                </tr>
              )}
              {!loading &&
                products.map((p, i) => {
                  const cat = categoryMap.get(p.categoryId);
                  const sub = p.subcategoryId ? subcategoryMap.get(p.subcategoryId) : undefined;
                  const mf = p.manufacturer ? manufacturerMap.get(p.manufacturer) : undefined;
                  return (
                    <tr
                      key={p._id}
                      className="transition hover:bg-emerald-50/40 animate-fade-in-up"
                      style={{ animationDelay: `${i * 30}ms` }}
                    >
                      <td className="px-4 py-2">
                        {p.images?.[0]?.url ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={p.images[0].url}
                            alt={p.name}
                            loading="lazy"
                            style={{ width: 80, height: 80, minWidth: 80 }}
                            className="rounded-lg border border-gray-300 bg-gray-50 object-contain p-1"
                          />
                        ) : (
                          <div
                            style={{ width: 80, height: 80, minWidth: 80 }}
                            className="flex items-center justify-center rounded-lg bg-gradient-to-br from-emerald-50 to-teal-100"
                          >
                            <ILeaf size={40} />
                          </div>
                        )}
                      </td>
                      <td className="max-w-xs px-4 py-2">
                        <div className="truncate text-base font-bold text-gray-800">{p.name}</div>
                      </td>
                      <td className="px-4 py-2">
                        {cat ? (
                          <span className="inline-flex rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-[#007e42]">
                            {cat.name}
                          </span>
                        ) : (
                          <span className="text-xs italic text-gray-400">— không có —</span>
                        )}
                      </td>
                      <td className="px-4 py-2">
                        {sub ? (
                          <span className="inline-flex rounded-full bg-teal-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-teal-700">
                            {sub.name}
                          </span>
                        ) : (
                          <span className="text-xs italic text-gray-400">— không có —</span>
                        )}
                      </td>
                      <td className="px-4 py-2">
                        {mf ? (
                          <span className="text-sm font-medium text-gray-700">{mf.name}</span>
                        ) : (
                          <span className="text-xs italic text-gray-400">— không có —</span>
                        )}
                      </td>
                      <td className="px-4 py-2 text-right text-sm font-bold tabular-nums text-[#007e42]">
                        {p.salePrice != null ? (
                          <div className="flex flex-col items-end leading-tight">
                            <span>{fmt(p.salePrice)}</span>
                            <span className="text-[11px] font-medium text-gray-500 line-through">
                              {fmt(p.price)}
                            </span>
                          </div>
                        ) : (
                          fmt(p.price)
                        )}
                      </td>
                      <td className="px-4 py-2 text-right text-sm tabular-nums text-gray-700">
                        {p.stock}
                      </td>
                      <td className="px-4 py-2 text-sm">
                        {p.isActive ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide text-[#007e42]">
                            <IEye />
                            Hiện
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide text-gray-500">
                            <IEyeOff />
                            Ẩn
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-2">
                        <div className="flex justify-end gap-1 [&_button]:h-9 [&_button]:w-9 [&_svg]:h-4 [&_svg]:w-4">
                          <IconBtn title="Sửa" onClick={() => openEdit(p)}>
                            <IPencil />
                          </IconBtn>
                          {p.isActive ? (
                            <IconBtn title="Ẩn" onClick={() => handleSoftDelete(p)}>
                              <IEyeOff />
                            </IconBtn>
                          ) : (
                            <IconBtn
                              title="Hiện lại"
                              tone="success"
                              onClick={() => handleRestore(p)}
                            >
                              <IRotate />
                            </IconBtn>
                          )}
                          <IconBtn
                            title="Xóa vĩnh viễn"
                            tone="danger"
                            onClick={() => handleHardDelete(p)}
                          >
                            <ITrash />
                          </IconBtn>
                        </div>
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>
      </div>

      {!loading && !error && (
        <Pagination
          page={page}
          total={total}
          limit={LIMIT}
          onPageChange={setPage}
        />
      )}

      {modalOpen && (
        <ProductFormModal
          product={editing}
          categories={categories.filter((c) => c.isActive)}
          manufacturers={manufacturers.filter((m) => m.isActive)}
          subcategories={subcategories.filter((s) => s.isActive)}
          onClose={() => setModalOpen(false)}
          onSaved={() => {
            setModalOpen(false);
            fetchProducts();
          }}
        />
      )}
    </div>
  );
}

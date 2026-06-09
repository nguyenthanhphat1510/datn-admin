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
import type { Product } from '@/types/product';
import type { Category } from '@/types/category';
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
import ProductFormModal from './ProductFormModal';

function fmt(n: number) {
  return n.toLocaleString('vi-VN') + '₫';
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [manufacturers, setManufacturers] = useState<Manufacturer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [categoryId, setCategoryId] = useState<string>('');

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);

  // Lookup map cho cột "Danh mục"
  const categoryMap = useMemo(() => {
    const m = new Map<string, Category>();
    categories.forEach((c) => m.set(c._id, c));
    return m;
  }, [categories]);

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

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await listProducts({
        limit: 100,
        search: search || undefined,
        categoryId: categoryId || undefined,
      });
      setProducts(result.data);
    } catch (err) {
      console.error(err);
      setError('Không tải được danh sách sản phẩm. Kiểm tra backend đang chạy chưa?');
    } finally {
      setLoading(false);
    }
  }, [search, categoryId]);

  useEffect(() => {
    fetchCategories();
    fetchManufacturers();
  }, [fetchCategories, fetchManufacturers]);

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

      <div className="flex flex-wrap items-center gap-3 rounded-xl border border-gray-200 bg-white px-4 py-3 shadow-sm">
        <div className="relative flex-1 min-w-[200px]">
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
            <ISearch />
          </span>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm sản phẩm theo tên..."
            className="h-10 w-full rounded-lg border border-gray-200 bg-white pl-10 pr-3 text-sm font-medium text-gray-700 outline-none focus:border-[#007e42] focus:ring-1 focus:ring-[#007e42]"
          />
        </div>

        <select
          value={categoryId}
          onChange={(e) => setCategoryId(e.target.value)}
          className="h-10 rounded-lg border border-gray-200 bg-white px-3 text-sm font-medium text-gray-700 outline-none focus:border-[#007e42] focus:ring-1 focus:ring-[#007e42]"
        >
          <option value="">Tất cả danh mục</option>
          {categories.map((c) => (
            <option key={c._id} value={c._id}>
              {c.name}
              {!c.isActive ? ' (ẩn)' : ''}
            </option>
          ))}
        </select>
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <IAlert />
          {error}
        </div>
      )}

      {!loading && !error && (
        <p className="text-sm text-gray-500">
          Hiển thị <span className="font-semibold text-gray-800">{products.length}</span> sản phẩm
        </p>
      )}

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50/70">
              <tr>
                <Th>Ảnh</Th>
                <Th>Sản phẩm</Th>
                <Th>Danh mục</Th>
                <Th align="right">Giá</Th>
                <Th align="right">Tồn kho</Th>
                <Th>Trạng thái</Th>
                <Th align="right">Hành động</Th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loading && (
                <tr>
                  <td colSpan={7} className="px-4 py-10 text-center text-sm text-gray-400">
                    Đang tải...
                  </td>
                </tr>
              )}
              {!loading && products.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center">
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
                            className="h-20 w-20 rounded-lg border border-gray-200 object-cover"
                          />
                        ) : (
                          <div className="flex h-20 w-20 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-50 to-teal-100">
                            <ILeaf size={40} />
                          </div>
                        )}
                      </td>
                      <td className="max-w-xs px-4 py-2">
                        <div className="truncate text-base font-bold text-gray-800">{p.name}</div>
                        {p.manufacturer && (
                          <div className="truncate text-sm text-gray-600">{p.manufacturer}</div>
                        )}
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
                      <td className="px-4 py-2 text-right text-sm font-bold tabular-nums text-[#007e42]">
                        {fmt(p.price)}
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

      {modalOpen && (
        <ProductFormModal
          product={editing}
          categories={categories.filter((c) => c.isActive)}
          manufacturers={manufacturers.filter((m) => m.isActive)}
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

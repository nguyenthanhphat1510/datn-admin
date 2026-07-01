'use client';

import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  createProduct,
  updateProduct,
  uploadProductImages,
} from '@/lib/products-api';
import type { Product } from '@/types/product';
import type { Category } from '@/types/category';
import type { Manufacturer } from '@/types/manufacturer';
import type { Subcategory } from '@/types/subcategory';
import { IClose } from '@/components/icons';
import FormField from '@/components/ui/FormField';
import SelectMenu from '@/components/ui/SelectMenu';
import ImageUploader from './ImageUploader';

// Định dạng số có dấu chấm ngăn cách hàng nghìn (vd: 149000 -> "149.000")
function formatThousands(value: number | undefined | null): string {
  if (value == null || Number.isNaN(value)) return '';
  return value.toLocaleString('vi-VN');
}

// Bỏ mọi ký tự không phải chữ số để lấy lại số thật (vd: "149.000" -> 149000)
function parseThousands(raw: string): number | undefined {
  const digits = raw.replace(/\D/g, '');
  if (digits === '') return undefined;
  return Number(digits);
}

const productSchema = z.object({
  name: z
    .string()
    .min(1, 'Tên sản phẩm không được để trống')
    .max(200, 'Tên tối đa 200 ký tự'),
  description: z.string().optional(),
  price: z.number({ message: 'Giá phải là số' }).min(0, 'Giá không được âm'),
  // Để trống = không giảm giá. Ô rỗng cho ra NaN, coi như "không giảm".
  salePrice: z
    .number({ message: 'Giá khuyến mãi phải là số' })
    .min(0, 'Giá khuyến mãi không được âm')
    .optional(),
  stock: z
    .number({ message: 'Tồn kho phải là số' })
    .int('Tồn kho phải là số nguyên')
    .min(0, 'Tồn kho không được âm'),
  categoryId: z.string().min(1, 'Hãy chọn danh mục'),
  subcategoryId: z.string().min(1, 'Hãy chọn danh mục con'),
  manufacturer: z.string().min(1, 'Hãy chọn nhà sản xuất'),
  usageInstructions: z.string().optional(),
  ingredients: z.string().optional(),
}).refine(
  (data) => data.salePrice == null || data.salePrice < data.price,
  {
    message: 'Giá khuyến mãi phải nhỏ hơn giá gốc',
    path: ['salePrice'],
  },
);

type FormValues = z.input<typeof productSchema>;

interface Props {
  product: Product | null;
  categories: Category[];
  manufacturers: Manufacturer[];
  subcategories: Subcategory[];
  onClose: () => void;
  onSaved: () => void;
}

export default function ProductFormModal({
  product,
  categories,
  manufacturers,
  subcategories,
  onClose,
  onSaved,
}: Props) {
  const isEdit = !!product;
  const [pendingFiles, setPendingFiles] = useState<File[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: product
      ? {
          name: product.name,
          description: product.description ?? '',
          price: product.price,
          salePrice: product.salePrice ?? undefined,
          stock: product.stock,
          categoryId: product.categoryId,
          subcategoryId: product.subcategoryId ?? '',
          manufacturer: product.manufacturer ?? '',
          usageInstructions: product.usageInstructions ?? '',
          ingredients: product.ingredients ?? '',
        }
      : {
          name: '',
          description: '',
          price: undefined,
          stock: undefined,
          categoryId: categories[0]?._id ?? '',
          subcategoryId: '',
          manufacturer: manufacturers[0]?._id ?? '',
          usageInstructions: '',
          ingredients: '',
        },
  });

  // Danh mục con phải thuộc danh mục đang chọn → lọc theo categoryId hiện tại
  const selectedCategoryId = watch('categoryId');
  const filteredSubcategories = subcategories.filter(
    (s) => s.categoryId === selectedCategoryId,
  );

  const onSubmit = async (values: FormValues) => {
    setSubmitting(true);
    setSubmitError(null);
    try {
      // Ô giá khuyến mãi rỗng -> NaN -> gửi null để backend hiểu "không giảm giá"
      const hasSale =
        values.salePrice != null && !Number.isNaN(values.salePrice);

      const payload = {
        ...values,
        salePrice: hasSale ? values.salePrice : null,
      };

      let savedId: string;
      if (isEdit && product) {
        const updated = await updateProduct(product._id, payload);
        savedId = updated._id;
      } else {
        const created = await createProduct(payload);
        savedId = created._id;
      }

      if (pendingFiles.length > 0) {
        try {
          await uploadProductImages(savedId, pendingFiles);
        } catch (uploadErr) {
          console.error(uploadErr);
          alert(
            'Lưu sản phẩm thành công nhưng upload ảnh thất bại. Mở lại để upload tiếp.',
          );
        }
      }

      onSaved();
    } catch (err: unknown) {
      console.error(err);
      const msg =
        (err as { response?: { data?: { message?: string | string[] } } })?.response?.data
          ?.message;
      setSubmitError(
        Array.isArray(msg) ? msg.join(', ') : msg ?? 'Lưu sản phẩm thất bại',
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="relative flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl border border-gray-300 bg-white shadow-2xl animate-scale-up">
        <div
          className="flex items-center justify-between px-6 py-4 text-white"
          style={{ background: 'linear-gradient(135deg, #007e42 0%, #0a9d52 100%)' }}
        >
          <div>
            <div className="text-[10px] font-bold uppercase tracking-widest text-emerald-100/90">
              {isEdit ? 'Cập nhật' : 'Thêm mới'}
            </div>
            <h2 className="text-lg font-extrabold">
              {isEdit ? product?.name : 'Sản phẩm mới'}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-white/15 text-white transition hover:bg-white/25"
          >
            <IClose />
          </button>
        </div>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex flex-1 flex-col overflow-y-auto"
        >
          <div className="grid grid-cols-1 gap-4 px-6 py-5 md:grid-cols-2">
            <FormField label="Tên sản phẩm *" error={errors.name?.message} colSpan={2}>
              <input
                {...register('name')}
                placeholder="Vd: Phân NPK 16-16-8"
                className="h-10 w-full rounded-lg border border-gray-300 bg-white px-3 text-sm text-gray-700 outline-none focus:border-[#007e42] focus:ring-1 focus:ring-[#007e42]"
              />
            </FormField>

            <FormField label="Giá (đồng) *" error={errors.price?.message}>
              <Controller
                control={control}
                name="price"
                render={({ field }) => (
                  <div className="relative">
                    <input
                      type="text"
                      inputMode="numeric"
                      placeholder="Vd: 180.000"
                      value={formatThousands(field.value)}
                      onChange={(e) => field.onChange(parseThousands(e.target.value))}
                      className="h-10 w-full rounded-lg border border-gray-300 bg-white pl-3 pr-7 text-sm text-gray-700 outline-none focus:border-[#007e42] focus:ring-1 focus:ring-[#007e42]"
                    />
                    <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-gray-400">
                      ₫
                    </span>
                  </div>
                )}
              />
            </FormField>

            <FormField
              label="Giá khuyến mãi"
              error={errors.salePrice?.message}
              hint="Để trống nếu không giảm giá"
            >
              <Controller
                control={control}
                name="salePrice"
                render={({ field }) => (
                  <div className="relative">
                    <input
                      type="text"
                      inputMode="numeric"
                      placeholder="Vd: 149.000"
                      value={formatThousands(field.value)}
                      onChange={(e) => field.onChange(parseThousands(e.target.value))}
                      className="h-10 w-full rounded-lg border border-gray-300 bg-white pl-3 pr-7 text-sm text-gray-700 outline-none focus:border-[#007e42] focus:ring-1 focus:ring-[#007e42]"
                    />
                    <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-gray-400">
                      ₫
                    </span>
                  </div>
                )}
              />
            </FormField>

            <FormField label="Tồn kho *" error={errors.stock?.message}>
              <Controller
                control={control}
                name="stock"
                render={({ field }) => (
                  <input
                    type="text"
                    inputMode="numeric"
                    placeholder="Vd: 100"
                    value={formatThousands(field.value)}
                    onChange={(e) => field.onChange(parseThousands(e.target.value))}
                    className="h-10 w-full rounded-lg border border-gray-300 bg-white px-3 text-sm text-gray-700 outline-none focus:border-[#007e42] focus:ring-1 focus:ring-[#007e42]"
                  />
                )}
              />
            </FormField>

            <FormField label="Danh mục *" error={errors.categoryId?.message}>
              {categories.length === 0 ? (
                <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-700">
                  Chưa có danh mục. Hãy tạo danh mục trước ở trang Danh mục.
                </div>
              ) : (
                <Controller
                  control={control}
                  name="categoryId"
                  render={({ field }) => (
                    <SelectMenu
                      value={field.value ?? ''}
                      onChange={(v) => {
                        field.onChange(v);
                        // Đổi danh mục → reset danh mục con (con cũ có thể không
                        // còn thuộc danh mục mới)
                        setValue('subcategoryId', '', { shouldValidate: true });
                      }}
                      placeholder="Chọn danh mục"
                      options={categories.map((c) => ({
                        value: c._id,
                        label: c.name,
                      }))}
                    />
                  )}
                />
              )}
            </FormField>

            <FormField label="Danh mục con *" error={errors.subcategoryId?.message}>
              {filteredSubcategories.length === 0 ? (
                <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-700">
                  Danh mục này chưa có danh mục con. Hãy tạo trước ở trang Danh mục con.
                </div>
              ) : (
                <Controller
                  control={control}
                  name="subcategoryId"
                  render={({ field }) => (
                    <SelectMenu
                      value={field.value ?? ''}
                      onChange={field.onChange}
                      placeholder="Chọn danh mục con"
                      options={filteredSubcategories.map((s) => ({
                        value: s._id,
                        label: s.name,
                      }))}
                    />
                  )}
                />
              )}
            </FormField>

            <FormField label="Nhà sản xuất *" error={errors.manufacturer?.message}>
              {manufacturers.length === 0 ? (
                <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-700">
                  Chưa có nhà sản xuất. Hãy tạo trước ở trang Nhà sản xuất.
                </div>
              ) : (
                <Controller
                  control={control}
                  name="manufacturer"
                  render={({ field }) => (
                    <SelectMenu
                      value={field.value ?? ''}
                      onChange={field.onChange}
                      placeholder="Chọn nhà sản xuất"
                      options={manufacturers.map((m) => ({
                        value: m._id,
                        label: m.name,
                      }))}
                    />
                  )}
                />
              )}
            </FormField>

            <FormField label="Mô tả" error={errors.description?.message} colSpan={2}>
              <textarea
                rows={3}
                {...register('description')}
                placeholder="Mô tả ngắn về sản phẩm..."
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 outline-none focus:border-[#007e42] focus:ring-1 focus:ring-[#007e42]"
              />
            </FormField>

            <FormField
              label="Hướng dẫn sử dụng"
              error={errors.usageInstructions?.message}
              colSpan={2}
            >
              <textarea
                rows={3}
                {...register('usageInstructions')}
                placeholder="Cách dùng, liều lượng, lưu ý..."
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 outline-none focus:border-[#007e42] focus:ring-1 focus:ring-[#007e42]"
              />
            </FormField>

            <FormField
              label="Thành phần / hoạt chất"
              error={errors.ingredients?.message}
              hint="Thuốc: hoạt chất + hàm lượng. Phân bón: công thức NPK. Để trống nếu không có"
              colSpan={2}
            >
              <textarea
                rows={3}
                {...register('ingredients')}
                placeholder="Vd: Tricyclazole 75% WP  —  hoặc  —  N 16% - P2O5 16% - K2O 8%"
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 outline-none focus:border-[#007e42] focus:ring-1 focus:ring-[#007e42]"
              />
            </FormField>

            <div className="md:col-span-2">
              <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-gray-500">
                Ảnh sản phẩm
              </label>
              <ImageUploader
                productId={product?._id}
                existingImages={product?.images ?? []}
                pendingFiles={pendingFiles}
                onPendingFilesChange={setPendingFiles}
                onExistingChanged={onSaved}
              />
              <p className="mt-1.5 text-xs text-gray-400">
                Tối đa 5 ảnh / lần, mỗi ảnh ≤ 5MB. Định dạng: JPEG / PNG / WebP / GIF.
              </p>
            </div>
          </div>

          {submitError && (
            <div className="border-t border-red-100 bg-red-50 px-6 py-3 text-sm text-red-600">
              {submitError}
            </div>
          )}

          <div className="flex justify-end gap-2 border-t border-gray-300 bg-gray-50/60 px-6 py-4">
            <button
              type="button"
              onClick={onClose}
              className="h-10 rounded-lg border border-gray-300 bg-white px-4 text-sm font-semibold text-gray-700 transition hover:border-[#007e42]/30 hover:text-[#007e42]"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={submitting || categories.length === 0 || manufacturers.length === 0}
              className="h-10 rounded-lg px-4 text-sm font-semibold text-white shadow-sm transition hover:shadow-md disabled:opacity-60"
              style={{ background: 'linear-gradient(135deg, #007e42 0%, #0a9d52 100%)' }}
            >
              {submitting ? 'Đang lưu...' : isEdit ? 'Cập nhật' : 'Tạo mới'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

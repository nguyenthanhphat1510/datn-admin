'use client';

import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { createDisease, updateDisease } from '@/lib/diseases-api';
import { listProducts } from '@/lib/products-api';
import type { Disease } from '@/types/disease';
import type { Product } from '@/types/product';
import { IClose } from '@/components/icons';
import FormField from '@/components/ui/FormField';

const diseaseSchema = z.object({
  name: z
    .string()
    .min(1, 'Tên bệnh không được để trống')
    .max(100, 'Tên tối đa 100 ký tự'),
  slug: z
    .string()
    .max(120)
    .regex(/^[a-z0-9-]*$/, 'Slug chỉ chứa chữ thường, số và dấu gạch ngang')
    .optional()
    .or(z.literal('')),
  description: z.string().max(2000).optional().or(z.literal('')),
  isActive: z.boolean().optional(),
});

type FormValues = z.infer<typeof diseaseSchema>;

/** Sinh slug client-side để preview, BE sẽ sinh lại nếu trống */
function slugifyClient(input: string): string {
  return input
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/đ/g, 'd')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

interface Props {
  disease: Disease | null;
  onClose: () => void;
  onSaved: () => void;
}

export default function DiseaseFormModal({ disease, onClose, onSaved }: Props) {
  const isEdit = !!disease;
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Triệu chứng: quản lý dạng chip + input riêng (ngoài react-hook-form)
  const [symptoms, setSymptoms] = useState<string[]>(disease?.symptoms ?? []);
  const [symptomInput, setSymptomInput] = useState('');

  // Thuốc gợi ý: danh sách product để chọn + tập id đã chọn
  const [products, setProducts] = useState<Product[]>([]);
  const [productSearch, setProductSearch] = useState('');
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>(
    disease?.recommendedProductIds ?? [],
  );

  // Tải danh sách sản phẩm (đang hiện) để chọn làm thuốc gợi ý
  useEffect(() => {
    listProducts({ limit: 1000, isActive: true })
      .then((res) => setProducts(res.data))
      .catch((err) => console.error('Không tải được danh sách sản phẩm', err));
  }, []);

  const {
    register,
    handleSubmit,
    setValue,
    getValues,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(diseaseSchema),
    defaultValues: disease
      ? {
          name: disease.name,
          slug: disease.slug,
          description: disease.description ?? '',
          isActive: disease.isActive,
        }
      : {
          name: '',
          slug: '',
          description: '',
          isActive: true,
        },
  });

  const nameValue = watch('name');

  // Auto-fill slug khi user blur khỏi name nếu slug đang trống
  const handleNameBlur = () => {
    const currentSlug = getValues('slug');
    if (!currentSlug && nameValue) {
      setValue('slug', slugifyClient(nameValue), { shouldValidate: true });
    }
  };

  // ── Triệu chứng ──
  const addSymptom = () => {
    const v = symptomInput.trim();
    if (!v) return;
    if (!symptoms.includes(v)) setSymptoms((prev) => [...prev, v]);
    setSymptomInput('');
  };

  const handleSymptomKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addSymptom();
    }
  };

  const removeSymptom = (s: string) =>
    setSymptoms((prev) => prev.filter((x) => x !== s));

  // ── Thuốc gợi ý ──
  const toggleProduct = (id: string) =>
    setSelectedProductIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );

  const filteredProducts = useMemo(() => {
    const q = productSearch.trim().toLowerCase();
    if (!q) return products;
    return products.filter((p) => p.name.toLowerCase().includes(q));
  }, [products, productSearch]);

  const onSubmit = async (values: FormValues) => {
    setSubmitting(true);
    setSubmitError(null);
    try {
      const payload = {
        name: values.name,
        slug: values.slug?.trim() || undefined,
        description: values.description?.trim() || undefined,
        symptoms,
        recommendedProductIds: selectedProductIds,
        isActive: values.isActive,
      };

      if (isEdit && disease) {
        await updateDisease(disease._id, payload);
      } else {
        await createDisease(payload);
      }
      onSaved();
    } catch (err: unknown) {
      console.error(err);
      const msg =
        (err as { response?: { data?: { message?: string | string[] } } })?.response?.data
          ?.message;
      setSubmitError(
        Array.isArray(msg) ? msg.join(', ') : msg ?? 'Lưu bệnh thất bại',
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

      <div className="relative flex max-h-[90vh] w-full max-w-xl flex-col overflow-hidden rounded-2xl border border-gray-300 bg-white shadow-2xl animate-scale-up">
        <div
          className="flex items-center justify-between px-6 py-4 text-white"
          style={{ background: 'linear-gradient(135deg, #007e42 0%, #0a9d52 100%)' }}
        >
          <div>
            <div className="text-[10px] font-bold uppercase tracking-widest text-emerald-100/90">
              {isEdit ? 'Cập nhật' : 'Thêm mới'}
            </div>
            <h2 className="text-lg font-extrabold">
              {isEdit ? disease?.name : 'Bệnh mới'}
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
          <div className="grid grid-cols-1 gap-4 px-6 py-5">
            <FormField label="Tên bệnh *" error={errors.name?.message}>
              <input
                {...register('name', { onBlur: handleNameBlur })}
                placeholder="Vd: Đạo ôn lá"
                className="h-10 w-full rounded-lg border border-gray-300 bg-white px-3 text-sm text-gray-700 outline-none focus:border-[#007e42] focus:ring-1 focus:ring-[#007e42]"
              />
            </FormField>

            <FormField label="Slug (URL friendly)" error={errors.slug?.message}>
              <input
                {...register('slug')}
                placeholder="Tự động sinh từ tên nếu để trống"
                className="h-10 w-full rounded-lg border border-gray-300 bg-white px-3 font-mono text-sm text-gray-700 outline-none focus:border-[#007e42] focus:ring-1 focus:ring-[#007e42]"
              />
              <p className="mt-1 text-[11px] text-gray-400">
                Chỉ chữ thường, số và dấu gạch ngang. Vd:{' '}
                <code className="rounded bg-gray-100 px-1">dao-on-la</code>
              </p>
            </FormField>

            {/* Triệu chứng — chip input */}
            <FormField label="Triệu chứng">
              <div className="rounded-lg border border-gray-300 bg-white px-2.5 py-2 focus-within:border-[#007e42] focus-within:ring-1 focus-within:ring-[#007e42]">
                {symptoms.length > 0 && (
                  <div className="mb-2 flex flex-wrap gap-1.5">
                    {symptoms.map((s) => (
                      <span
                        key={s}
                        className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-700"
                      >
                        {s}
                        <button
                          type="button"
                          onClick={() => removeSymptom(s)}
                          className="text-amber-400 transition hover:text-amber-700"
                          aria-label={`Xóa ${s}`}
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                )}
                <input
                  value={symptomInput}
                  onChange={(e) => setSymptomInput(e.target.value)}
                  onKeyDown={handleSymptomKeyDown}
                  onBlur={addSymptom}
                  placeholder="Nhập triệu chứng rồi Enter (vd: lá có vết hình thoi)"
                  className="w-full bg-transparent text-sm text-gray-700 outline-none"
                />
              </div>
              <p className="mt-1 text-[11px] text-gray-400">
                Nhấn Enter hoặc dấu phẩy để thêm. Dùng cho chatbot chẩn đoán.
              </p>
            </FormField>

            <FormField label="Mô tả / nguyên nhân" error={errors.description?.message}>
              <textarea
                rows={3}
                {...register('description')}
                placeholder="Mô tả về bệnh, nguyên nhân (tùy chọn)..."
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 outline-none focus:border-[#007e42] focus:ring-1 focus:ring-[#007e42]"
              />
            </FormField>

            {/* Thuốc gợi ý — multi-select */}
            <FormField label={`Thuốc gợi ý (${selectedProductIds.length} đã chọn)`}>
              <input
                value={productSearch}
                onChange={(e) => setProductSearch(e.target.value)}
                placeholder="Tìm sản phẩm theo tên..."
                className="mb-2 h-9 w-full rounded-lg border border-gray-300 bg-white px-3 text-sm text-gray-700 outline-none focus:border-[#007e42] focus:ring-1 focus:ring-[#007e42]"
              />
              <div className="max-h-40 overflow-y-auto rounded-lg border border-gray-300 bg-white">
                {filteredProducts.length === 0 ? (
                  <p className="px-3 py-3 text-center text-xs text-gray-400">
                    {products.length === 0
                      ? 'Đang tải sản phẩm...'
                      : 'Không tìm thấy sản phẩm'}
                  </p>
                ) : (
                  filteredProducts.map((p) => (
                    <label
                      key={p._id}
                      className="flex cursor-pointer items-center gap-2.5 border-b border-gray-100 px-3 py-2 text-sm text-gray-700 transition last:border-b-0 hover:bg-emerald-50/50"
                    >
                      <input
                        type="checkbox"
                        checked={selectedProductIds.includes(p._id)}
                        onChange={() => toggleProduct(p._id)}
                        className="h-4 w-4 rounded border-gray-300 text-[#007e42] focus:ring-[#007e42]"
                      />
                      <span className="flex-1 truncate">{p.name}</span>
                    </label>
                  ))
                )}
              </div>
            </FormField>

            <label className="flex cursor-pointer items-center gap-2.5 rounded-lg border border-gray-300 bg-emerald-50/40 px-3.5 py-2.5 text-sm text-gray-700 transition hover:border-[#007e42]/30 hover:bg-emerald-50">
              <input
                type="checkbox"
                {...register('isActive')}
                className="h-4 w-4 rounded border-gray-300 text-[#007e42] focus:ring-[#007e42]"
              />
              <span className="font-medium">Đang sử dụng (chatbot tra được)</span>
            </label>
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
              disabled={submitting}
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

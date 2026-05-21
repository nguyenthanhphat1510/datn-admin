'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { createSubcategory, updateSubcategory } from '@/lib/subcategories-api';
import type { Subcategory } from '@/types/subcategory';
import type { Category } from '@/types/category';
import { IClose } from '@/components/icons';
import FormField from '@/components/ui/FormField';

const subcategorySchema = z.object({
  name: z
    .string()
    .min(1, 'Tên danh mục con không được để trống')
    .max(100, 'Tên tối đa 100 ký tự'),
  categoryId: z.string().min(1, 'Vui lòng chọn danh mục cha'),
  slug: z
    .string()
    .max(120)
    .regex(/^[a-z0-9-]*$/, 'Slug chỉ chứa chữ thường, số và dấu gạch ngang')
    .optional()
    .or(z.literal('')),
  description: z.string().max(500).optional().or(z.literal('')),
  isActive: z.boolean().optional(),
});

type FormValues = z.infer<typeof subcategorySchema>;

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
  subcategory: Subcategory | null;
  categories: Category[];
  onClose: () => void;
  onSaved: () => void;
}

export default function SubcategoryFormModal({
  subcategory,
  categories,
  onClose,
  onSaved,
}: Props) {
  const isEdit = !!subcategory;
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    getValues,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(subcategorySchema),
    defaultValues: subcategory
      ? {
          name: subcategory.name,
          categoryId: subcategory.categoryId,
          slug: subcategory.slug,
          description: subcategory.description ?? '',
          isActive: subcategory.isActive,
        }
      : {
          name: '',
          categoryId: '',
          slug: '',
          description: '',
          isActive: true,
        },
  });

  const nameValue = watch('name');

  const handleNameBlur = () => {
    const currentSlug = getValues('slug');
    if (!currentSlug && nameValue) {
      setValue('slug', slugifyClient(nameValue), { shouldValidate: true });
    }
  };

  const onSubmit = async (values: FormValues) => {
    setSubmitting(true);
    setSubmitError(null);
    try {
      const payload = {
        name: values.name,
        categoryId: values.categoryId,
        slug: values.slug?.trim() || undefined,
        description: values.description?.trim() || undefined,
        isActive: values.isActive,
      };

      if (isEdit && subcategory) {
        await updateSubcategory(subcategory._id, payload);
      } else {
        await createSubcategory(payload);
      }
      onSaved();
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string | string[] } } })?.response?.data
          ?.message;
      setSubmitError(
        Array.isArray(msg) ? msg.join(', ') : msg ?? 'Lưu danh mục con thất bại',
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm" onClick={onClose} />

      <div className="relative flex max-h-[90vh] w-full max-w-xl flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-2xl animate-scale-up">
        <div
          className="flex items-center justify-between px-6 py-4 text-white"
          style={{ background: 'linear-gradient(135deg, #007e42 0%, #0a9d52 100%)' }}
        >
          <div>
            <div className="text-[10px] font-bold uppercase tracking-widest text-emerald-100/90">
              {isEdit ? 'Cập nhật' : 'Thêm mới'}
            </div>
            <h2 className="text-lg font-extrabold">
              {isEdit ? subcategory?.name : 'Danh mục con mới'}
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

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-1 flex-col overflow-y-auto">
          <div className="grid grid-cols-1 gap-4 px-6 py-5">
            {/* Danh mục cha */}
            <FormField label="Danh mục cha *" error={errors.categoryId?.message}>
              <select
                {...register('categoryId')}
                className="h-10 w-full rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-700 outline-none focus:border-[#007e42] focus:ring-1 focus:ring-[#007e42]"
              >
                <option value="">-- Chọn danh mục cha --</option>
                {categories
                  .filter((c) => c.isActive)
                  .map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.name}
                    </option>
                  ))}
              </select>
            </FormField>

            {/* Tên */}
            <FormField label="Tên danh mục con *" error={errors.name?.message}>
              <input
                {...register('name', { onBlur: handleNameBlur })}
                placeholder="Vd: Thuốc trừ sâu"
                className="h-10 w-full rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-700 outline-none focus:border-[#007e42] focus:ring-1 focus:ring-[#007e42]"
              />
            </FormField>

            {/* Slug */}
            <FormField label="Slug (URL friendly)" error={errors.slug?.message}>
              <input
                {...register('slug')}
                placeholder="Tự động sinh từ tên nếu để trống"
                className="h-10 w-full rounded-lg border border-gray-200 bg-white px-3 font-mono text-sm text-gray-700 outline-none focus:border-[#007e42] focus:ring-1 focus:ring-[#007e42]"
              />
              <p className="mt-1 text-[11px] text-gray-400">
                Chỉ chữ thường, số và dấu gạch ngang. Vd:{' '}
                <code className="rounded bg-gray-100 px-1">thuoc-tru-sau</code>
              </p>
            </FormField>

            {/* Mô tả */}
            <FormField label="Mô tả" error={errors.description?.message}>
              <textarea
                rows={3}
                {...register('description')}
                placeholder="Mô tả ngắn về danh mục con (tùy chọn)..."
                className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 outline-none focus:border-[#007e42] focus:ring-1 focus:ring-[#007e42]"
              />
            </FormField>

            {/* isActive */}
            <label className="flex cursor-pointer items-center gap-2.5 rounded-lg border border-gray-200 bg-emerald-50/40 px-3.5 py-2.5 text-sm text-gray-700 transition hover:border-[#007e42]/30 hover:bg-emerald-50">
              <input
                type="checkbox"
                {...register('isActive')}
                className="h-4 w-4 rounded border-gray-300 text-[#007e42] focus:ring-[#007e42]"
              />
              <span className="font-medium">Hiện danh mục con trên cửa hàng</span>
            </label>
          </div>

          {submitError && (
            <div className="border-t border-red-100 bg-red-50 px-6 py-3 text-sm text-red-600">
              {submitError}
            </div>
          )}

          <div className="flex justify-end gap-2 border-t border-gray-100 bg-gray-50/60 px-6 py-4">
            <button
              type="button"
              onClick={onClose}
              className="h-10 rounded-lg border border-gray-200 bg-white px-4 text-sm font-semibold text-gray-700 transition hover:border-[#007e42]/30 hover:text-[#007e42]"
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

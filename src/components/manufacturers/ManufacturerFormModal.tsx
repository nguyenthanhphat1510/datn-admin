'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  createManufacturer,
  deleteManufacturerLogo,
  updateManufacturer,
  uploadManufacturerLogo,
} from '@/lib/manufacturers-api';
import type { Manufacturer } from '@/types/manufacturer';
import { IClose, ILeaf, ITrash } from '@/components/icons';
import FormField from '@/components/ui/FormField';

const manufacturerSchema = z.object({
  name: z
    .string()
    .min(1, 'Tên nhà sản xuất không được để trống')
    .max(100, 'Tên tối đa 100 ký tự'),
  slug: z
    .string()
    .max(120)
    .regex(/^[a-z0-9-]*$/, 'Slug chỉ chứa chữ thường, số và dấu gạch ngang')
    .optional()
    .or(z.literal('')),
  description: z.string().max(500).optional().or(z.literal('')),
  isActive: z.boolean().optional(),
});

type FormValues = z.infer<typeof manufacturerSchema>;

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
  manufacturer: Manufacturer | null;
  onClose: () => void;
  onSaved: () => void;
}

export default function ManufacturerFormModal({ manufacturer, onClose, onSaved }: Props) {
  const isEdit = !!manufacturer;
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const [pendingLogo, setPendingLogo] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(
    manufacturer?.logo?.url ?? null,
  );
  const [existingLogoCleared, setExistingLogoCleared] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    getValues,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(manufacturerSchema),
    defaultValues: manufacturer
      ? {
          name: manufacturer.name,
          slug: manufacturer.slug,
          description: manufacturer.description ?? '',
          isActive: manufacturer.isActive,
        }
      : {
          name: '',
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

  const handleFilePick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPendingLogo(file);
    setLogoPreview(URL.createObjectURL(file));
    setExistingLogoCleared(false);
  };

  const handleClearLogo = () => {
    setPendingLogo(null);
    setLogoPreview(null);
    setExistingLogoCleared(true);
  };

  const onSubmit = async (values: FormValues) => {
    setSubmitting(true);
    setSubmitError(null);
    try {
      const payload = {
        name: values.name,
        slug: values.slug?.trim() || undefined,
        description: values.description?.trim() || undefined,
        isActive: values.isActive,
      };

      let savedId: string;
      if (isEdit && manufacturer) {
        const updated = await updateManufacturer(manufacturer._id, payload);
        savedId = updated._id;
      } else {
        const created = await createManufacturer(payload);
        savedId = created._id;
      }

      if (pendingLogo) {
        try {
          await uploadManufacturerLogo(savedId, pendingLogo);
        } catch (uploadErr) {
          console.error(uploadErr);
          alert('Lưu thành công nhưng upload logo thất bại. Mở lại để thử lại.');
        }
      } else if (existingLogoCleared && isEdit && manufacturer?.logo?.publicId) {
        try {
          await deleteManufacturerLogo(savedId);
        } catch (delErr) {
          console.error(delErr);
        }
      }

      onSaved();
    } catch (err: unknown) {
      console.error(err);
      const msg =
        (err as { response?: { data?: { message?: string | string[] } } })?.response?.data
          ?.message;
      setSubmitError(
        Array.isArray(msg) ? msg.join(', ') : msg ?? 'Lưu nhà sản xuất thất bại',
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
              {isEdit ? manufacturer?.name : 'Nhà sản xuất mới'}
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
            <FormField label="Logo">
              <div className="flex items-center gap-4">
                <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-lg border border-gray-300 bg-gray-50">
                  {logoPreview ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={logoPreview}
                      alt="Logo preview"
                      className="h-full w-full object-contain"
                    />
                  ) : (
                    <ILeaf size={28} />
                  )}
                </div>
                <div className="flex flex-col gap-2">
                  <label className="inline-flex h-9 cursor-pointer items-center gap-2 self-start rounded-lg border border-gray-300 bg-white px-3 text-sm font-semibold text-gray-700 transition hover:border-[#007e42]/30 hover:text-[#007e42]">
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleFilePick}
                    />
                    {logoPreview ? 'Đổi logo' : 'Tải logo lên'}
                  </label>
                  {logoPreview && (
                    <button
                      type="button"
                      onClick={handleClearLogo}
                      className="inline-flex h-9 items-center gap-2 self-start rounded-lg border border-red-200 bg-white px-3 text-sm font-semibold text-red-600 transition hover:bg-red-50"
                    >
                      <ITrash />
                      Bỏ logo
                    </button>
                  )}
                  <p className="text-[11px] text-gray-400">
                    PNG/JPG/WEBP, tối đa 2MB.
                  </p>
                </div>
              </div>
            </FormField>

            <FormField label="Tên nhà sản xuất *" error={errors.name?.message}>
              <input
                {...register('name', { onBlur: handleNameBlur })}
                placeholder="Vd: Bayer"
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
                <code className="rounded bg-gray-100 px-1">bayer</code>
              </p>
            </FormField>

            <FormField label="Mô tả" error={errors.description?.message}>
              <textarea
                rows={3}
                {...register('description')}
                placeholder="Mô tả ngắn về nhà sản xuất (tùy chọn)..."
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 outline-none focus:border-[#007e42] focus:ring-1 focus:ring-[#007e42]"
              />
            </FormField>

            <label className="flex cursor-pointer items-center gap-2.5 rounded-lg border border-gray-300 bg-emerald-50/40 px-3.5 py-2.5 text-sm text-gray-700 transition hover:border-[#007e42]/30 hover:bg-emerald-50">
              <input
                type="checkbox"
                {...register('isActive')}
                className="h-4 w-4 rounded border-gray-300 text-[#007e42] focus:ring-[#007e42]"
              />
              <span className="font-medium">
                Hiện nhà sản xuất trên cửa hàng (khách thấy được)
              </span>
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

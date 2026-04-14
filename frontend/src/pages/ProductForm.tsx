import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { getProduct, createProduct, updateProduct } from '../api/products';
import type { ProductRequest } from '../types';

export function ProductForm() {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const isEdit = !!id;
  const navigate = useNavigate();
  const qc = useQueryClient();

  const { data: product } = useQuery({
    queryKey: ['product', id],
    queryFn: () => getProduct(Number(id)),
    enabled: isEdit,
  });

  const { register, handleSubmit, reset, formState: { errors } } = useForm<ProductRequest>({
    defaultValues: { unit: 'szt', lowStockThreshold: 0 },
  });

  useEffect(() => {
    if (product) reset(product);
  }, [product, reset]);

  const mutation = useMutation({
    mutationFn: (data: ProductRequest) =>
      isEdit ? updateProduct(Number(id), data) : createProduct(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['products'] });
      navigate('/products');
    },
  });

  return (
    <div style={{ maxWidth: 560 }}>
      <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 28 }}>
        {isEdit ? t('productForm.editTitle') : t('productForm.newTitle')}
      </h1>

      <form onSubmit={handleSubmit(data => mutation.mutate(data))} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <Field label={t('productForm.name')}>
          <input style={inputStyle} {...register('name', { required: true })} />
          {errors.name && <span style={errStyle}>{t('productForm.required')}</span>}
        </Field>

        <Field label={t('productForm.sku')}>
          <input style={inputStyle} {...register('sku', { required: true })} />
          {errors.sku && <span style={errStyle}>{t('productForm.required')}</span>}
        </Field>

        <Field label={t('productForm.category')}>
          <input style={inputStyle} {...register('category')} />
        </Field>

        <Field label={t('productForm.unit')}>
          <input style={inputStyle} {...register('unit', { required: true })} placeholder="szt, kg, m..." />
        </Field>

        <Field label={t('productForm.price')}>
          <input style={inputStyle} type="number" step="0.01" min="0" {...register('price', { valueAsNumber: true })} />
        </Field>

        <Field label={t('productForm.threshold')}>
          <input style={inputStyle} type="number" min="0" {...register('lowStockThreshold', { valueAsNumber: true })} />
        </Field>

        {mutation.isError && (
          <div style={{ color: '#dc2626', fontSize: 14 }}>
            {(mutation.error as any)?.response?.data || t('productForm.error')}
          </div>
        )}

        <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
          <button type="submit" style={btnPrimary} disabled={mutation.isPending}>
            {mutation.isPending ? t('productForm.saving') : t('productForm.save')}
          </button>
          <button type="button" style={btnSecondary} onClick={() => navigate('/products')}>
            {t('productForm.cancel')}
          </button>
        </div>
      </form>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label style={{ display: 'flex', flexDirection: 'column', gap: 4, fontSize: 14, fontWeight: 500 }}>
      {label}
      {children}
    </label>
  );
}

const inputStyle: React.CSSProperties = {
  padding: '8px 12px', border: '1px solid #e2e8f0', borderRadius: 8, fontSize: 14,
  outline: 'none', width: '100%', boxSizing: 'border-box',
};
const errStyle: React.CSSProperties = { color: '#dc2626', fontSize: 12 };
const btnPrimary: React.CSSProperties = {
  background: '#0ea5e9', color: '#fff', padding: '8px 20px', borderRadius: 8,
  border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: 14,
};
const btnSecondary: React.CSSProperties = {
  background: '#f1f5f9', color: '#334155', padding: '8px 20px', borderRadius: 8,
  border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: 14,
};

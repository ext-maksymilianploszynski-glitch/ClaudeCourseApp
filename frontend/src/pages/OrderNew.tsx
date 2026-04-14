import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createOrder } from '../api/orders';
import type { OrderRequest } from '../types';

export function OrderNew() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { register, handleSubmit } = useForm<OrderRequest>({ defaultValues: { type: 'Incoming' } });

  const mutation = useMutation({
    mutationFn: createOrder,
    onSuccess: (order) => {
      qc.invalidateQueries({ queryKey: ['orders'] });
      navigate(`/orders/${order.id}`);
    },
  });

  return (
    <div style={{ maxWidth: 480 }}>
      <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 28 }}>Nowe zamowienie</h1>

      <form onSubmit={handleSubmit(data => mutation.mutate(data))} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <label style={labelStyle}>
          Typ zamowienia *
          <select style={inputStyle} {...register('type', { required: true })}>
            <option value="Incoming">Przyjecie (dostawa)</option>
            <option value="Outgoing">Wydanie (wysylka)</option>
          </select>
        </label>

        <label style={labelStyle}>
          Notatki / nr referencyjny
          <textarea style={{ ...inputStyle, resize: 'vertical', minHeight: 80 }} {...register('notes')} />
        </label>

        <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
          <button type="submit" style={btnPrimary} disabled={mutation.isPending}>
            {mutation.isPending ? 'Tworzenie...' : 'Utworz zamowienie'}
          </button>
          <button type="button" style={btnSecondary} onClick={() => navigate('/orders')}>
            Anuluj
          </button>
        </div>
      </form>
    </div>
  );
}

const labelStyle: React.CSSProperties = { display: 'flex', flexDirection: 'column', gap: 4, fontSize: 14, fontWeight: 500 };
const inputStyle: React.CSSProperties = {
  padding: '8px 12px', border: '1px solid #e2e8f0', borderRadius: 8, fontSize: 14, outline: 'none',
};
const btnPrimary: React.CSSProperties = {
  background: '#0ea5e9', color: '#fff', padding: '8px 20px', borderRadius: 8,
  border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: 14,
};
const btnSecondary: React.CSSProperties = {
  background: '#f1f5f9', color: '#334155', padding: '8px 20px', borderRadius: 8,
  border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: 14,
};

import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getOrder, confirmOrder, completeOrder, addOrderItem, deleteOrderItem } from '../api/orders';
import { getProducts } from '../api/products';
import { orderTypeBadge, orderStatusBadge } from '../components/Badge';

export function OrderDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const qc = useQueryClient();

  const orderId = Number(id);

  const { data: order, isLoading } = useQuery({
    queryKey: ['order', orderId],
    queryFn: () => getOrder(orderId),
  });

  const { data: products = [] } = useQuery({ queryKey: ['products'], queryFn: getProducts });

  const [newItem, setNewItem] = useState({ productId: 0, quantity: 1, unitPrice: 0 });
  const [addError, setAddError] = useState('');

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ['order', orderId] });
    qc.invalidateQueries({ queryKey: ['orders'] });
    qc.invalidateQueries({ queryKey: ['products'] });
  };

  const confirmMutation = useMutation({ mutationFn: () => confirmOrder(orderId), onSuccess: invalidate });
  const completeMutation = useMutation({
    mutationFn: () => completeOrder(orderId),
    onSuccess: invalidate,
    onError: (e: any) => alert(e?.response?.data || 'Blad'),
  });

  const addItemMutation = useMutation({
    mutationFn: () => addOrderItem(orderId, { ...newItem }),
    onSuccess: () => { invalidate(); setNewItem({ productId: 0, quantity: 1, unitPrice: 0 }); setAddError(''); },
    onError: (e: any) => setAddError(e?.response?.data || 'Blad'),
  });

  const deleteItemMutation = useMutation({
    mutationFn: (itemId: number) => deleteOrderItem(orderId, itemId),
    onSuccess: invalidate,
  });

  if (isLoading) return <p>Ladowanie...</p>;
  if (!order) return <p>Nie znaleziono zamowienia.</p>;

  const isDraft = order.status === 'Draft';
  const isConfirmed = order.status === 'Confirmed';

  const handleProductChange = (productId: number) => {
    const product = products.find(p => p.id === productId);
    setNewItem(prev => ({ ...prev, productId, unitPrice: product?.price ?? 0 }));
  };

  return (
    <div style={{ maxWidth: 800 }}>
      <button onClick={() => navigate('/orders')} style={btnBack}>&larr; Zamowienia</button>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700 }}>Zamowienie #{order.id}</h1>
          <div style={{ display: 'flex', gap: 8, marginTop: 6 }}>
            {orderTypeBadge(order.type)}
            {orderStatusBadge(order.status)}
          </div>
          {order.notes && <p style={{ color: '#64748b', marginTop: 8 }}>{order.notes}</p>}
          <p style={{ fontSize: 13, color: '#94a3b8', marginTop: 4 }}>
            Utworzone: {new Date(order.createdAt).toLocaleString('pl-PL')}
            {order.completedAt && ` · Zrealizowane: ${new Date(order.completedAt).toLocaleString('pl-PL')}`}
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {isDraft && (
            <button onClick={() => confirmMutation.mutate()} style={btnConfirm} disabled={confirmMutation.isPending}>
              Potwierdz
            </button>
          )}
          {isConfirmed && (
            <button onClick={() => completeMutation.mutate()} style={btnComplete} disabled={completeMutation.isPending}>
              Zrealizuj
            </button>
          )}
        </div>
      </div>

      <table style={tableStyle}>
        <thead>
          <tr style={{ background: '#f8fafc' }}>
            <th style={th}>Produkt</th>
            <th style={th}>SKU</th>
            <th style={th}>Ilosc</th>
            <th style={th}>Cena jedn.</th>
            <th style={th}>Suma</th>
            {isDraft && <th style={th}>Akcje</th>}
          </tr>
        </thead>
        <tbody>
          {order.items.map(item => (
            <tr key={item.id}>
              <td style={td}>{item.productName}</td>
              <td style={{ ...td, fontFamily: 'monospace', fontSize: 13 }}>{item.productSKU}</td>
              <td style={td}>{item.quantity}</td>
              <td style={td}>{item.unitPrice.toFixed(2)} zl</td>
              <td style={{ ...td, fontWeight: 600 }}>{item.subtotal.toFixed(2)} zl</td>
              {isDraft && (
                <td style={td}>
                  <button
                    onClick={() => deleteItemMutation.mutate(item.id)}
                    style={{ background: '#fee2e2', color: '#dc2626', border: 'none', borderRadius: 6, padding: '3px 10px', cursor: 'pointer', fontSize: 13 }}
                  >
                    Usun
                  </button>
                </td>
              )}
            </tr>
          ))}

          {isDraft && (
            <tr style={{ background: '#f0fdf4' }}>
              <td style={td} colSpan={isDraft ? 5 : 4}>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                  <select
                    style={{ ...inputSm, minWidth: 180 }}
                    value={newItem.productId}
                    onChange={e => handleProductChange(Number(e.target.value))}
                  >
                    <option value={0}>Wybierz produkt</option>
                    {products.map(p => (
                      <option key={p.id} value={p.id}>{p.name} ({p.sku})</option>
                    ))}
                  </select>
                  <input
                    style={{ ...inputSm, width: 80 }}
                    type="number" min={1} placeholder="Ilosc"
                    value={newItem.quantity}
                    onChange={e => setNewItem(prev => ({ ...prev, quantity: Number(e.target.value) }))}
                  />
                  <input
                    style={{ ...inputSm, width: 100 }}
                    type="number" min={0} step="0.01" placeholder="Cena"
                    value={newItem.unitPrice}
                    onChange={e => setNewItem(prev => ({ ...prev, unitPrice: Number(e.target.value) }))}
                  />
                  <button
                    onClick={() => {
                      if (!newItem.productId) { setAddError('Wybierz produkt'); return; }
                      addItemMutation.mutate();
                    }}
                    style={{ background: '#16a34a', color: '#fff', border: 'none', borderRadius: 6, padding: '5px 14px', cursor: 'pointer', fontWeight: 600 }}
                  >
                    + Dodaj
                  </button>
                  {addError && <span style={{ color: '#dc2626', fontSize: 13 }}>{addError}</span>}
                </div>
              </td>
              {isDraft && <td style={td} />}
            </tr>
          )}

          {order.items.length === 0 && !isDraft && (
            <tr><td colSpan={5} style={{ ...td, textAlign: 'center', color: '#94a3b8' }}>Brak pozycji</td></tr>
          )}
        </tbody>
        {order.items.length > 0 && (
          <tfoot>
            <tr style={{ background: '#f8fafc' }}>
              <td colSpan={isDraft ? 4 : 3} style={{ ...td, textAlign: 'right', fontWeight: 600 }}>Razem:</td>
              <td style={{ ...td, fontWeight: 700 }}>
                {order.items.reduce((s, i) => s + i.subtotal, 0).toFixed(2)} zl
              </td>
              {isDraft && <td style={td} />}
            </tr>
          </tfoot>
        )}
      </table>
    </div>
  );
}

const tableStyle: React.CSSProperties = {
  width: '100%', borderCollapse: 'collapse', background: '#fff',
  borderRadius: 10, overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.07)',
};
const th: React.CSSProperties = { textAlign: 'left', padding: '10px 16px', fontSize: 13, fontWeight: 600, borderBottom: '1px solid #e2e8f0' };
const td: React.CSSProperties = { padding: '10px 16px', borderTop: '1px solid #f1f5f9', fontSize: 14 };
const btnBack: React.CSSProperties = {
  background: 'none', border: 'none', cursor: 'pointer', color: '#64748b',
  fontSize: 14, marginBottom: 16, padding: 0,
};
const btnConfirm: React.CSSProperties = {
  background: '#f59e0b', color: '#fff', border: 'none', borderRadius: 8,
  padding: '8px 16px', cursor: 'pointer', fontWeight: 600,
};
const btnComplete: React.CSSProperties = {
  background: '#16a34a', color: '#fff', border: 'none', borderRadius: 8,
  padding: '8px 16px', cursor: 'pointer', fontWeight: 600,
};
const inputSm: React.CSSProperties = {
  padding: '5px 10px', border: '1px solid #e2e8f0', borderRadius: 6, fontSize: 13,
};

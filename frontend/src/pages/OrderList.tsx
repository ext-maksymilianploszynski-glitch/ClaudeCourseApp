import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { getOrders, deleteOrder } from '../api/orders';
import { orderTypeBadge, orderStatusBadge } from '../components/Badge';
import type { OrderType, OrderStatus } from '../types';

export function OrderList() {
  const qc = useQueryClient();
  const [typeFilter, setTypeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const { data: orders = [], isLoading } = useQuery({
    queryKey: ['orders', typeFilter, statusFilter],
    queryFn: () => getOrders({
      type: typeFilter || undefined,
      status: statusFilter || undefined,
    }),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteOrder,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['orders'] }),
  });

  const handleDelete = (id: number) => {
    if (confirm(`Usunac zamowienie #${id}?`)) deleteMutation.mutate(id);
  };

  if (isLoading) return <p>Ladowanie...</p>;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700 }}>Zamowienia</h1>
        <Link to="/orders/new" style={btnPrimary}>+ Nowe zamowienie</Link>
      </div>

      <div style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
        <select style={selectStyle} value={typeFilter} onChange={e => setTypeFilter(e.target.value)}>
          <option value="">Wszystkie typy</option>
          <option value="Incoming">Przyjecie</option>
          <option value="Outgoing">Wydanie</option>
        </select>
        <select style={selectStyle} value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
          <option value="">Wszystkie statusy</option>
          <option value="Draft">Draft</option>
          <option value="Confirmed">Potwierdzone</option>
          <option value="Completed">Zrealizowane</option>
        </select>
      </div>

      <table style={tableStyle}>
        <thead>
          <tr style={{ background: '#f8fafc' }}>
            <th style={th}>ID</th>
            <th style={th}>Typ</th>
            <th style={th}>Status</th>
            <th style={th}>Notatki</th>
            <th style={th}>Data</th>
            <th style={th}>Pozycje</th>
            <th style={th}>Akcje</th>
          </tr>
        </thead>
        <tbody>
          {orders.map(o => (
            <tr key={o.id}>
              <td style={{ ...td, fontWeight: 600 }}>#{o.id}</td>
              <td style={td}>{orderTypeBadge(o.type)}</td>
              <td style={td}>{orderStatusBadge(o.status)}</td>
              <td style={td}>{o.notes ?? '—'}</td>
              <td style={td}>{new Date(o.createdAt).toLocaleDateString('pl-PL')}</td>
              <td style={td}>{o.itemCount}</td>
              <td style={td}>
                <Link to={`/orders/${o.id}`} style={btnSmall}>Szczegoly</Link>
                {' '}
                {o.status === 'Draft' && (
                  <button
                    onClick={() => handleDelete(o.id)}
                    style={{ ...btnSmall, background: '#fee2e2', color: '#dc2626', border: 'none', cursor: 'pointer' }}
                  >
                    Usun
                  </button>
                )}
              </td>
            </tr>
          ))}
          {orders.length === 0 && (
            <tr><td colSpan={7} style={{ ...td, textAlign: 'center', color: '#94a3b8' }}>Brak zamowien</td></tr>
          )}
        </tbody>
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
const btnPrimary: React.CSSProperties = {
  background: '#0ea5e9', color: '#fff', padding: '8px 18px', borderRadius: 8,
  textDecoration: 'none', fontWeight: 600, fontSize: 14,
};
const btnSmall: React.CSSProperties = {
  background: '#f1f5f9', color: '#334155', padding: '4px 10px', borderRadius: 6,
  textDecoration: 'none', fontSize: 13, fontWeight: 500,
};
const selectStyle: React.CSSProperties = {
  padding: '7px 12px', border: '1px solid #e2e8f0', borderRadius: 8, fontSize: 14,
};

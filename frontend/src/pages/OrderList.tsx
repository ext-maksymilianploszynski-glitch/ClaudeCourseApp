import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { getOrders, deleteOrder } from '../api/orders';
import { orderTypeBadge, orderStatusBadge } from '../components/Badge';
import type { OrderType, OrderStatus } from '../types';

export function OrderList() {
  const { t, i18n } = useTranslation();
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
    if (confirm(t('orders.confirmDelete', { id }))) deleteMutation.mutate(id);
  };

  const dateLocale = i18n.language === 'en' ? 'en-US' : 'pl-PL';

  if (isLoading) return <p>{t('orders.loading')}</p>;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700 }}>{t('orders.title')}</h1>
        <Link to="/orders/new" style={btnPrimary}>{t('orders.newOrder')}</Link>
      </div>

      <div style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
        <select style={selectStyle} value={typeFilter} onChange={e => setTypeFilter(e.target.value)}>
          <option value="">{t('orders.allTypes')}</option>
          <option value="Incoming">{t('orders.incoming')}</option>
          <option value="Outgoing">{t('orders.outgoing')}</option>
        </select>
        <select style={selectStyle} value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
          <option value="">{t('orders.allStatuses')}</option>
          <option value="Draft">{t('orders.draft')}</option>
          <option value="Confirmed">{t('orders.confirmed')}</option>
          <option value="Completed">{t('orders.completed')}</option>
        </select>
      </div>

      <table style={tableStyle}>
        <thead>
          <tr style={{ background: '#f8fafc' }}>
            <th style={th}>{t('orders.colId')}</th>
            <th style={th}>{t('orders.colType')}</th>
            <th style={th}>{t('orders.colStatus')}</th>
            <th style={th}>{t('orders.colNotes')}</th>
            <th style={th}>{t('orders.colDate')}</th>
            <th style={th}>{t('orders.colItems')}</th>
            <th style={th}>{t('orders.colActions')}</th>
          </tr>
        </thead>
        <tbody>
          {orders.map(o => (
            <tr key={o.id}>
              <td style={{ ...td, fontWeight: 600 }}>#{o.id}</td>
              <td style={td}>{orderTypeBadge(o.type)}</td>
              <td style={td}>{orderStatusBadge(o.status)}</td>
              <td style={td}>{o.notes ?? '—'}</td>
              <td style={td}>{new Date(o.createdAt).toLocaleDateString(dateLocale)}</td>
              <td style={td}>{o.itemCount}</td>
              <td style={td}>
                <Link to={`/orders/${o.id}`} style={btnSmall}>{t('orders.details')}</Link>
                {' '}
                {o.status === 'Draft' && (
                  <button
                    onClick={() => handleDelete(o.id)}
                    style={{ ...btnSmall, background: '#fee2e2', color: '#dc2626', border: 'none', cursor: 'pointer' }}
                  >
                    {t('orders.delete')}
                  </button>
                )}
              </td>
            </tr>
          ))}
          {orders.length === 0 && (
            <tr><td colSpan={7} style={{ ...td, textAlign: 'center', color: '#94a3b8' }}>{t('orders.noOrders')}</td></tr>
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

import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { getProducts } from '../api/products';
import { getOrders } from '../api/orders';
import type { OrderStatus } from '../types';

export function Dashboard() {
  const { t } = useTranslation();
  const { data: products = [] } = useQuery({ queryKey: ['products'], queryFn: getProducts });
  const { data: orders = [] } = useQuery({ queryKey: ['orders'], queryFn: () => getOrders() });

  const lowStock = products.filter(p => p.isLowStock);
  const byStatus = (s: OrderStatus) => orders.filter(o => o.status === s).length;

  const cardStyle: React.CSSProperties = {
    background: '#fff', borderRadius: 12, padding: '20px 28px',
    boxShadow: '0 1px 4px rgba(0,0,0,0.08)', minWidth: 160,
  };

  return (
    <div>
      <h1 style={{ marginBottom: 24, fontSize: 24, fontWeight: 700 }}>{t('dashboard.title')}</h1>

      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginBottom: 40 }}>
        <div style={cardStyle}>
          <div style={{ fontSize: 13, color: '#64748b' }}>{t('dashboard.products')}</div>
          <div style={{ fontSize: 32, fontWeight: 700 }}>{products.length}</div>
        </div>
        <div style={cardStyle}>
          <div style={{ fontSize: 13, color: '#64748b' }}>{t('dashboard.lowStock')}</div>
          <div style={{ fontSize: 32, fontWeight: 700, color: lowStock.length > 0 ? '#dc2626' : '#16a34a' }}>
            {lowStock.length}
          </div>
        </div>
        <div style={cardStyle}>
          <div style={{ fontSize: 13, color: '#64748b' }}>{t('dashboard.ordersDraft')}</div>
          <div style={{ fontSize: 32, fontWeight: 700 }}>{byStatus('Draft')}</div>
        </div>
        <div style={cardStyle}>
          <div style={{ fontSize: 13, color: '#64748b' }}>{t('dashboard.confirmed')}</div>
          <div style={{ fontSize: 32, fontWeight: 700, color: '#d97706' }}>{byStatus('Confirmed')}</div>
        </div>
        <div style={cardStyle}>
          <div style={{ fontSize: 13, color: '#64748b' }}>{t('dashboard.completed')}</div>
          <div style={{ fontSize: 32, fontWeight: 700, color: '#16a34a' }}>{byStatus('Completed')}</div>
        </div>
      </div>

      {lowStock.length > 0 && (
        <div>
          <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 12, color: '#dc2626' }}>
            {t('dashboard.lowStockAlert')}
          </h2>
          <table style={{ width: '100%', borderCollapse: 'collapse', background: '#fff', borderRadius: 10, overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.07)' }}>
            <thead>
              <tr style={{ background: '#fee2e2' }}>
                <th style={th}>{t('dashboard.colName')}</th>
                <th style={th}>{t('dashboard.colSku')}</th>
                <th style={th}>{t('dashboard.colStock')}</th>
                <th style={th}>{t('dashboard.colThreshold')}</th>
              </tr>
            </thead>
            <tbody>
              {lowStock.map(p => (
                <tr key={p.id}>
                  <td style={td}><Link to={`/products/${p.id}/edit`}>{p.name}</Link></td>
                  <td style={td}>{p.sku}</td>
                  <td style={{ ...td, color: '#dc2626', fontWeight: 700 }}>{p.currentStock} {p.unit}</td>
                  <td style={td}>{p.lowStockThreshold}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

const th: React.CSSProperties = { textAlign: 'left', padding: '10px 16px', fontSize: 13, fontWeight: 600 };
const td: React.CSSProperties = { padding: '10px 16px', borderTop: '1px solid #f1f5f9' };

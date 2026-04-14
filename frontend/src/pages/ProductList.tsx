import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { getProducts, deleteProduct } from '../api/products';
import { Badge } from '../components/Badge';

export function ProductList() {
  const qc = useQueryClient();
  const { data: products = [], isLoading } = useQuery({ queryKey: ['products'], queryFn: getProducts });

  const deleteMutation = useMutation({
    mutationFn: deleteProduct,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['products'] }),
  });

  const handleDelete = (id: number, name: string) => {
    if (confirm(`Usunac produkt "${name}"?`)) deleteMutation.mutate(id);
  };

  if (isLoading) return <p>Ladowanie...</p>;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700 }}>Produkty</h1>
        <Link to="/products/new" style={btnPrimary}>+ Dodaj produkt</Link>
      </div>

      <table style={tableStyle}>
        <thead>
          <tr style={{ background: '#f8fafc' }}>
            <th style={th}>Nazwa</th>
            <th style={th}>SKU</th>
            <th style={th}>Kategoria</th>
            <th style={th}>Jednostka</th>
            <th style={th}>Cena</th>
            <th style={th}>Stan</th>
            <th style={th}>Status</th>
            <th style={th}>Akcje</th>
          </tr>
        </thead>
        <tbody>
          {products.map(p => (
            <tr key={p.id} style={{ background: p.isLowStock ? '#fff7f7' : undefined }}>
              <td style={td}>{p.name}</td>
              <td style={{ ...td, fontFamily: 'monospace', fontSize: 13 }}>{p.sku}</td>
              <td style={td}>{p.category ?? '—'}</td>
              <td style={td}>{p.unit}</td>
              <td style={td}>{p.price != null ? `${p.price.toFixed(2)} zl` : '—'}</td>
              <td style={{ ...td, fontWeight: 600, color: p.isLowStock ? '#dc2626' : undefined }}>
                {p.currentStock}
              </td>
              <td style={td}>
                {p.isLowStock
                  ? <Badge text="Niski stan" variant="red" />
                  : <Badge text="OK" variant="green" />}
              </td>
              <td style={td}>
                <Link to={`/products/${p.id}/edit`} style={btnSmall}>Edytuj</Link>
                {' '}
                <button
                  onClick={() => handleDelete(p.id, p.name)}
                  style={{ ...btnSmall, background: '#fee2e2', color: '#dc2626', border: 'none', cursor: 'pointer' }}
                >
                  Usun
                </button>
              </td>
            </tr>
          ))}
          {products.length === 0 && (
            <tr><td colSpan={8} style={{ ...td, textAlign: 'center', color: '#94a3b8' }}>Brak produktow</td></tr>
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

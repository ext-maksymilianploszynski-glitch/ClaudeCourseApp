import { NavLink, Outlet } from 'react-router-dom';

export function Layout() {
  const navStyle: React.CSSProperties = {
    background: '#1e293b', color: '#f8fafc', padding: '0 24px',
    display: 'flex', alignItems: 'center', gap: 8, height: 56,
  };
  const linkStyle = ({ isActive }: { isActive: boolean }): React.CSSProperties => ({
    color: isActive ? '#38bdf8' : '#cbd5e1',
    textDecoration: 'none', padding: '4px 12px', borderRadius: 6,
    background: isActive ? 'rgba(56,189,248,0.1)' : 'transparent',
    fontWeight: 500,
  });

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc' }}>
      <nav style={navStyle}>
        <span style={{ fontWeight: 700, fontSize: 18, marginRight: 24, color: '#f8fafc' }}>
          Magazyn
        </span>
        <NavLink to="/" style={linkStyle} end>Dashboard</NavLink>
        <NavLink to="/products" style={linkStyle}>Produkty</NavLink>
        <NavLink to="/orders" style={linkStyle}>Zamowienia</NavLink>
      </nav>
      <main style={{ padding: 32, maxWidth: 1100, margin: '0 auto' }}>
        <Outlet />
      </main>
    </div>
  );
}

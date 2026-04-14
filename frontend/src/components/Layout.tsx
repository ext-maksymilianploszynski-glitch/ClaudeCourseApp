import { NavLink, Outlet } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export function Layout() {
  const { t, i18n } = useTranslation();

  const toggleLang = () => {
    const next = i18n.language === 'pl' ? 'en' : 'pl';
    i18n.changeLanguage(next);
    localStorage.setItem('lang', next);
  };

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
  const langBtnStyle: React.CSSProperties = {
    marginLeft: 'auto', background: 'rgba(255,255,255,0.1)', border: 'none',
    color: '#f8fafc', borderRadius: 6, padding: '4px 12px', cursor: 'pointer',
    fontWeight: 600, fontSize: 13,
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc' }}>
      <nav style={navStyle}>
        <span style={{ fontWeight: 700, fontSize: 18, marginRight: 24, color: '#f8fafc' }}>
          {t('nav.brand')}
        </span>
        <NavLink to="/" style={linkStyle} end>{t('nav.dashboard')}</NavLink>
        <NavLink to="/products" style={linkStyle}>{t('nav.products')}</NavLink>
        <NavLink to="/orders" style={linkStyle}>{t('nav.orders')}</NavLink>
        <button style={langBtnStyle} onClick={toggleLang}>
          {i18n.language === 'pl' ? 'EN' : 'PL'}
        </button>
      </nav>
      <main style={{ padding: 32, maxWidth: 1100, margin: '0 auto' }}>
        <Outlet />
      </main>
    </div>
  );
}

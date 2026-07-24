import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';

const LANGUAGES = [
  { code: 'uz', label: "UZ" },
  { code: 'en', label: 'EN' },
  { code: 'ru', label: 'RU' },
];

function Header() {
  const { authenticated, user, logout } = useAuth();
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    setMenuOpen(false);
    navigate('/');
  };

  const closeMenu = () => setMenuOpen(false);

return (
    <header className="site-header">
      <div className="header-inner">
        <Link to="/" className="brand" onClick={closeMenu}>
          <img src="/logo-header.png" alt="Makon360" />
        </Link>

        {/* Mobilda doim ko'rinadigan qism: login bo'lmasa "Kirish", bo'lsa - hech narsa (menyuda ko'rinadi) */}
        <div className="mobile-header-actions">
          {!authenticated && (
            <Link to="/login" className="mobile-login-link" onClick={closeMenu}>
              {t('header.login')}
            </Link>
          )}
          <button
            className="hamburger-btn"
            onClick={() => setMenuOpen((prev) => !prev)}
            aria-label="menu"
          >
            {menuOpen ? '✕' : '☰'}
          </button>
        </div>

        <nav className={menuOpen ? 'nav-open' : ''}>
          <Link to="/catalog" onClick={closeMenu}>{t('header.catalog')}</Link>
          <Link to="/favorites" onClick={closeMenu}>{t('header.favorites')}</Link>
          {user?.is_agent && <Link to="/create-listing" onClick={closeMenu}>{t('header.addListing')}</Link>}

          <select
            className="lang-select"
            value={i18n.resolvedLanguage}
            onChange={(e) => i18n.changeLanguage(e.target.value)}
          >
            {LANGUAGES.map((lang) => (
              <option key={lang.code} value={lang.code}>{lang.label}</option>
            ))}
          </select>

          {authenticated ? (
            <>
              <span className="nav-username">👤 {user?.username}</span>
              <button className="btn btn-secondary" onClick={handleLogout}>{t('header.logout')}</button>
            </>
          ) : (
            <>
              <Link to="/login" className="desktop-only-login" onClick={closeMenu}>{t('header.login')}</Link>
              <Link to="/register" className="btn btn-primary" onClick={closeMenu}>{t('header.register')}</Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}

export default Header;
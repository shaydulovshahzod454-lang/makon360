import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useTranslation } from 'react-i18next';

const LANGUAGES = [
  { code: 'uz', label: "UZ" },
  { code: 'en', label: 'EN' },
  { code: 'ru', label: 'RU' },
];

function Header() {
  const { authenticated, user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [menuOpen]);

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
          <button
            type="button"
            className="theme-toggle-btn mobile-only-control"
            onClick={toggleTheme}
            aria-label={theme === 'dark' ? t('header.switchToLight') : t('header.switchToDark')}
          >
            {theme === 'dark' ? (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="5" />
                <line x1="12" y1="1" x2="12" y2="3" />
                <line x1="12" y1="21" x2="12" y2="23" />
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                <line x1="1" y1="12" x2="3" y2="12" />
                <line x1="21" y1="12" x2="23" y2="12" />
                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
                <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
              </svg>
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
              </svg>
            )}
          </button>

          <select
            className="lang-select mobile-only-control"
            value={i18n.resolvedLanguage}
            onChange={(e) => i18n.changeLanguage(e.target.value)}
          >
            {LANGUAGES.map((lang) => (
              <option key={lang.code} value={lang.code}>{lang.label}</option>
            ))}
          </select>

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

        <nav className={menuOpen ? 'nav-open mobile-nav-overlay' : ''}>
          {menuOpen && (
            <button className="mobile-nav-close" onClick={closeMenu} aria-label="close">✕</button>
          )}
          <Link to="/catalog" onClick={closeMenu} style={{ '--i': 0 }}>{t('header.catalog')}</Link>
          <Link to="/calculator" onClick={closeMenu} style={{ '--i': 1 }}>{t('header.calculator')}</Link>
          <Link to="/favorites" onClick={closeMenu} style={{ '--i': 2 }}>{t('header.favorites')}</Link>
          {user?.is_agent && <Link to="/create-listing" onClick={closeMenu} style={{ '--i': 3 }}>{t('header.addListing')}</Link>}

          {/* Desktopda shu yerda ko'rinadi (mobilda CSS orqali yashiriladi,
              chunki mobil versiyasi mobile-header-actions ichida, pastda) */}
          <button
            type="button"
            className="theme-toggle-btn desktop-only-control"
            onClick={toggleTheme}
            aria-label={theme === 'dark' ? t('header.switchToLight') : t('header.switchToDark')}
          >
            {theme === 'dark' ? (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="5" />
                <line x1="12" y1="1" x2="12" y2="3" />
                <line x1="12" y1="21" x2="12" y2="23" />
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                <line x1="1" y1="12" x2="3" y2="12" />
                <line x1="21" y1="12" x2="23" y2="12" />
                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
                <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
              </svg>
            ) : (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
              </svg>
            )}
          </button>

          <select
            className="lang-select desktop-only-control"
            value={i18n.resolvedLanguage}
            onChange={(e) => i18n.changeLanguage(e.target.value)}
          >
            {LANGUAGES.map((lang) => (
              <option key={lang.code} value={lang.code}>{lang.label}</option>
            ))}
          </select>

          {authenticated ? (
            <>
              <span className="nav-username" style={{ '--i': 4 }}>👤 {user?.username}</span>
              <button className="btn btn-secondary" onClick={handleLogout} style={{ '--i': 5 }}>{t('header.logout')}</button>
            </>
          ) : (
            <>
              <Link to="/login" className="desktop-only-login" onClick={closeMenu} style={{ '--i': 4 }}>{t('header.login')}</Link>
              <Link to="/register" className="btn btn-primary" onClick={closeMenu} style={{ '--i': 5 }}>{t('header.register')}</Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}

export default Header;
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

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="site-header">
      <div className="header-inner">
        <Link to="/" className="brand">{t('header.brand')}</Link>
        <nav>
          <Link to="/catalog">{t('header.catalog')}</Link>
          <Link to="/favorites">{t('header.favorites')}</Link>
          {user?.is_agent && <Link to="/create-listing">{t('header.addListing')}</Link>}

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
            <button className="btn btn-secondary" onClick={handleLogout}>{t('header.logout')}</button>
          ) : (
            <>
              <Link to="/login">{t('header.login')}</Link>
              <Link to="/register" className="btn btn-primary">{t('header.register')}</Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}

export default Header;
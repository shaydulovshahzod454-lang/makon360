import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';

function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await login(username, password);
      navigate('/');
    } catch (err) {
      setError(t('auth.loginError'));
    }
  };

  return (
    <div className="form-page fade-up">
      <div className="form-card">
        <h2>{t('auth.loginTitle')}</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-field">
            <label className="field-label">{t('auth.username')}</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
          <div className="form-field">
            <label className="field-label">{t('auth.password')}</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          {error && <p className="error-text">{error}</p>}
          <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>{t('auth.loginButton')}</button>
        </form>
        <p className="form-footer-note">
          {t('auth.noAccount')} <Link to="/register">{t('auth.registerLink')}</Link>
        </p>
      </div>
    </div>
  );
}

export default LoginPage;
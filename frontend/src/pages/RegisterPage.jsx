import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { register } from '../services/auth';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';

function RegisterPage() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await register(username, email, password);
      // Ro'yxatdan o'tgandan so'ng avtomatik login qilamiz
      await login(username, password);
      navigate('/');
    } catch (err) {
      console.error(err);
      if (err.response?.data) {
        // Backend'dan kelgan xato xabarlarini ko'rsatish (masalan "username band" yoki "parol juda oddiy")
        const messages = Object.values(err.response.data).flat().join(' ');
        setError(messages || t('auth.registerError'));
      } else {
        setError(t('auth.registerError'));
      }
    }
  };

  return (
    <div className="form-page fade-up">
      <div className="form-card">
        <h2>{t('auth.registerTitle')}</h2>
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
            <label className="field-label">{t('auth.email')}</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
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
          <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>{t('auth.registerButton')}</button>
        </form>
        <p className="form-footer-note">
          {t('auth.haveAccount')} <Link to="/login">{t('auth.loginButton')}</Link>
        </p>
      </div>
    </div>
  );
}

export default RegisterPage;
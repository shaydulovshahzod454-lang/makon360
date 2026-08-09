import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import api from '../services/api';

function FeedbackForm() {
  const { t } = useTranslation();
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [status, setStatus] = useState('idle'); // idle | submitting | success | error

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('submitting');
    try {
      await api.post('/feedback/', form);
      setStatus('success');
      setForm({ name: '', email: '', message: '' });
    } catch (err) {
      console.error(err);
      setStatus('error');
    }
  };

  return (
    <footer className="feedback-footer">
      <div className="feedback-inner">
        <div className="feedback-badge">TEST REJIMI</div>
        <h3>{t('feedback.title')}</h3>
        <p>{t('feedback.subtitle')}</p>

        {status === 'success' ? (
          <div className="feedback-success">✓ {t('feedback.successMessage')}</div>
        ) : (
          <form onSubmit={handleSubmit} className="feedback-form">
            <div className="feedback-row">
              <input
                type="text"
                name="name"
                placeholder={t('feedback.namePlaceholder')}
                value={form.name}
                onChange={handleChange}
                required
              />
              <input
                type="email"
                name="email"
                placeholder={t('feedback.emailPlaceholder')}
                value={form.email}
                onChange={handleChange}
                required
              />
            </div>
            <textarea
              name="message"
              placeholder={t('feedback.messagePlaceholder')}
              value={form.message}
              onChange={handleChange}
              required
            />
            {status === 'error' && (
              <p className="feedback-error-text">{t('feedback.errorMessage')}</p>
            )}
            <button type="submit" className="btn btn-primary" disabled={status === 'submitting'}>
              {status === 'submitting' && <span className="btn-spinner" />}
              {t('feedback.submitButton')}
            </button>
          </form>
        )}

        <div className="feedback-copyright">© {new Date().getFullYear()} Makon360</div>
      </div>
    </footer>
  );
}

export default FeedbackForm;
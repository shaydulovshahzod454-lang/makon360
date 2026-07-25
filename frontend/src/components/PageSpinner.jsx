import { useTranslation } from 'react-i18next';

function PageSpinner() {
  const { t } = useTranslation();
  return (
    <div className="page-spinner-wrap">
      <div className="page-spinner" />
      <p style={{ margin: 0 }}>{t('home.loading')}</p>
    </div>
  );
}

export default PageSpinner;
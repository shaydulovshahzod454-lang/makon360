import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

function VirtualTourSection({ previewListing }) {
  const { t } = useTranslation();

  return (
    <section className="tour-section">
      <div className="tour-text">
        <div className="tour-eyebrow">360°</div>
        <h2>{t('tour.title')}</h2>
        <p>{t('tour.subtitle')}</p>
        <Link to="/catalog" className="btn btn-primary">
          {t('tour.cta')} →
        </Link>
      </div>

      <div className="tour-preview">
        {previewListing?.main_image ? (
          <Link to={`/listing/${previewListing.id}`} className="tour-preview-link">
            <img src={previewListing.main_image} alt={previewListing.title} loading="lazy" />
            <div className="tour-drag-hint">↻ {t('tour.dragHint')}</div>
          </Link>
        ) : (
          <div className="tour-preview-placeholder">
            <span>360°</span>
          </div>
        )}
      </div>
    </section>
  );
}

export default VirtualTourSection;
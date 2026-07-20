import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

function ListingGrid({ listings, authenticated, onToggleFavorite, staggerAnim = true }) {
  const { t } = useTranslation();

  if (listings.length === 0) {
    return <p>{t('home.noResults')}</p>;
  }

  return (
    <div className={`listing-grid ${staggerAnim ? 'stagger' : ''}`}>
      {listings.map((listing) => (
        <Link key={listing.id} to={`/listing/${listing.id}`} className="listing-card card">
          <button
            className="favorite-btn"
            onClick={(e) => onToggleFavorite(e, listing.id)}
            title={listing.is_favorited ? t('home.removeFromFavorites') : t('home.addToFavorites')}
          >
            {listing.is_favorited ? '❤️' : '🤍'}
          </button>
          <div className="image-wrap">
            {listing.main_image && <img src={listing.main_image} alt={listing.title} />}
            <span className="badge-360">360°</span>
            <span className="badge-price">${listing.price}</span>
          </div>
          <div className="card-body">
            <h3>{listing.title}</h3>
            <p className="address">{listing.address}</p>
          </div>
        </Link>
      ))}
    </div>
  );
}

export default ListingGrid;
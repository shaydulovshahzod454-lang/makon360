import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { useTranslation } from 'react-i18next';

function FavoritesPage() {
  const { t } = useTranslation();
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadFavorites = () => {
    setLoading(true);
    api.get('/favorites/')
      .then((res) => setFavorites(res.data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadFavorites();
  }, []);

  const handleRemove = async (e, listingId) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      await api.post(`/listings/${listingId}/toggle_favorite/`);
      // Ro'yxatdan darhol olib tashlaymiz (qayta so'rov yubormasdan)
      setFavorites((prev) => prev.filter((f) => f.listing_detail.id !== listingId));
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <p>{t('home.loading')}</p>;

  return (
    <div className="page-container" style={{ paddingTop: '40px' }}>
      <h1 className="fade-up">{t('favoritesPage.title')}</h1>

      {favorites.length === 0 ? (
        <p className="fade-up" style={{ animationDelay: '0.1s' }}>{t('favoritesPage.empty')}</p>
      ) : (
        <div className="listing-grid stagger">
          {favorites.map((fav) => (
            <Link key={fav.id} to={`/listing/${fav.listing_detail.id}`} className="listing-card card">
              <button
                className="favorite-btn"
                onClick={(e) => handleRemove(e, fav.listing_detail.id)}
                title={t('home.removeFromFavorites')}
              >
                ❤️
              </button>
              <div className="image-wrap">
                {fav.listing_detail.main_image && (
                  <img src={fav.listing_detail.main_image} alt={fav.listing_detail.title} />
                )}
                <span className="badge-360">360°</span>
                <span className="badge-price">${fav.listing_detail.price}</span>
              </div>
              <div className="card-body">
                <h3>{fav.listing_detail.title}</h3>
                <p className="address">{fav.listing_detail.address}</p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

export default FavoritesPage;
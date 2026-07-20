import { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import FilterBar from '../components/FilterBar';

function FavoritesPage() {
  const { t } = useTranslation();
  const { authenticated } = useAuth();
  const [favorites, setFavorites] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  const [filters, setFilters] = useState({
    search: '', category: '', minPrice: '', maxPrice: '', ordering: '',
  });

  const loadFavorites = () => {
    setLoading(true);
    api.get('/favorites/')
      .then((res) => setFavorites(res.data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (authenticated) {
      loadFavorites();
      api.get('/categories/').then((res) => setCategories(res.data));
    } else {
      setLoading(false);
    }
  }, [authenticated]);

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

  // Sevimlilar ro'yxati kichik bo'lgani uchun, filtrlashni backend'ga
  // qayta so'rov yubormasdan, to'g'ridan-to'g'ri shu yerda (frontendda) qilamiz
  const filteredFavorites = useMemo(() => {
    let result = [...favorites];

    if (filters.search) {
      const q = filters.search.toLowerCase();
      result = result.filter((f) =>
        f.listing_detail.title.toLowerCase().includes(q) ||
        f.listing_detail.address.toLowerCase().includes(q)
      );
    }
    if (filters.category) {
      result = result.filter((f) => f.listing_detail.category?.id === Number(filters.category));
    }
    if (filters.minPrice) {
      result = result.filter((f) => Number(f.listing_detail.price) >= Number(filters.minPrice));
    }
    if (filters.maxPrice) {
      result = result.filter((f) => Number(f.listing_detail.price) <= Number(filters.maxPrice));
    }
    if (filters.ordering === 'price') {
      result.sort((a, b) => Number(a.listing_detail.price) - Number(b.listing_detail.price));
    } else if (filters.ordering === '-price') {
      result.sort((a, b) => Number(b.listing_detail.price) - Number(a.listing_detail.price));
    } else if (filters.ordering === '-created_at') {
      result.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    }

    return result;
  }, [favorites, filters]);

  if (!authenticated) {
    return (
      <div className="page-container" style={{ paddingTop: '40px' }}>
        <h1 className="fade-up">{t('favoritesPage.title')}</h1>
        <div className="auth-alert fade-up">
          <span>⚠️ {t('favoritesPage.loginRequired')}</span>
          <Link to="/login">{t('listingDetail.login')}</Link>
        </div>
      </div>
    );
  }

  if (loading) return <p>{t('home.loading')}</p>;

  return (
    <div className="page-container" style={{ paddingTop: '40px' }}>
      <h1 className="fade-up">{t('favoritesPage.title')}</h1>

      {favorites.length > 0 && (
        <div className="fade-up" style={{ animationDelay: '0.08s' }}>
          <FilterBar filters={filters} setFilters={setFilters} categories={categories} />
        </div>
      )}

      {favorites.length === 0 ? (
        <p className="fade-up" style={{ animationDelay: '0.1s' }}>{t('favoritesPage.empty')}</p>
      ) : filteredFavorites.length === 0 ? (
        <p>{t('home.noResults')}</p>
      ) : (
        <div className="listing-grid stagger">
          {filteredFavorites.map((fav) => (
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
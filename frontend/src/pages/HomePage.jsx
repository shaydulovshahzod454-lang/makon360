import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';
import FilterBar from '../components/FilterBar';
import ListingGrid from '../components/ListingGrid';
import PageSpinner from '../components/PageSpinner';

function AnimatedHeading({ text }) {
  const words = text.split(' ');
  return (
    <h1>
      {words.map((word, i) => (
        <span
          key={i}
          className="word fade-up"
          style={{ animationDelay: `${0.05 + i * 0.09}s`, marginRight: '0.28em' }}
        >
          {word}
        </span>
      ))}
    </h1>
  );
}

const LATEST_COUNT = 6;

function HomePage() {
  const { authenticated } = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [listings, setListings] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  const [filters, setFilters] = useState({
    search: '', category: '', minPrice: '', maxPrice: '', ordering: '',
  });

  useEffect(() => {
    api.get('/categories/').then((res) => setCategories(res.data));
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(true);
      const params = { ordering: filters.ordering || '-created_at', page_size: LATEST_COUNT };
      if (filters.search) params.search = filters.search;
      if (filters.category) params.category = filters.category;
      if (filters.minPrice) params.min_price = filters.minPrice;
      if (filters.maxPrice) params.max_price = filters.maxPrice;

      api.get('/listings/', { params })
        .then((res) => setListings(res.data.results))
        .catch((err) => console.error('Xatolik:', err))
        .finally(() => setLoading(false));
    }, 400);

    return () => clearTimeout(timer);
  }, [filters, authenticated]);

  const handleToggleFavorite = async (e, listingId) => {
    e.preventDefault();
    e.stopPropagation();

    if (!authenticated) {
      navigate('/login');
      return;
    }

    try {
      const res = await api.post(`/listings/${listingId}/toggle_favorite/`);
      setListings((prev) =>
        prev.map((l) => (l.id === listingId ? { ...l, is_favorited: res.data.is_favorited } : l))
      );
    } catch (err) {
      console.error(err);
    }
  };

  const goToCatalog = () => {
    // Joriy filterlarni Katalog sahifasiga URL orqali uzatamiz, shunda
    // foydalanuvchi bosh sahifada boshlagan qidiruvini davom ettiradi
    const params = new URLSearchParams();
    if (filters.search) params.set('search', filters.search);
    if (filters.category) params.set('category', filters.category);
    if (filters.minPrice) params.set('minPrice', filters.minPrice);
    if (filters.maxPrice) params.set('maxPrice', filters.maxPrice);
    if (filters.ordering) params.set('ordering', filters.ordering);
    navigate(`/catalog?${params.toString()}`);
  };

  return (
    <div>
      <Helmet>
        <title>Makon360 — Ko'chmas mulkni 360° virtual tur orqali ko'ring</title>
        <meta name="description" content="O'zbekistondagi uy, kvartira va ofislarni 360° virtual tur orqali uydan chiqmasdan ko'ring. Ishonchli agentliklar tomonidan joylashtirilgan e'lonlar." />
        <link rel="canonical" href="https://makon360.online/" />
      </Helmet>
      <div className="hero">
        <AnimatedHeading text={t('home.title')} />
        <p className="fade-up" style={{ animationDelay: '0.5s' }}>
          {t('home.heroSubtitle')}
        </p>
      </div>

      <div className="page-container">
        <FilterBar filters={filters} setFilters={setFilters} categories={categories} />

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px' }}>
          <h2 style={{ margin: 0, fontSize: '22px' }}>{t('home.latestTitle')}</h2>
        </div>

        {loading ? (
          <PageSpinner />
        ) : (
          <ListingGrid listings={listings} authenticated={authenticated} onToggleFavorite={handleToggleFavorite} />
        )}

        <div style={{ textAlign: 'center', marginTop: '36px' }}>
          <button className="btn btn-primary" onClick={goToCatalog}>
            {t('home.viewMore')}
          </button>
        </div>
      </div>
    </div>
  );
}

export default HomePage;
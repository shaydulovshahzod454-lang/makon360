import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';
import FilterBar from '../components/FilterBar';
import ListingGrid from '../components/ListingGrid';
import PageSpinner from '../components/PageSpinner';

function CatalogPage() {
  const { authenticated } = useAuth();
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [listings, setListings] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [nextPageUrl, setNextPageUrl] = useState(null);
  const [loadingMore, setLoadingMore] = useState(false);

  // Bosh sahifadan "Ko'proq ko'rish" orqali kelganda, URL query orqali
  // uzatilgan filter qiymatlarini boshlang'ich holat sifatida olamiz
  const [filters, setFilters] = useState({
    search: searchParams.get('search') || '',
    category: searchParams.get('category') || '',
    minPrice: searchParams.get('minPrice') || '',
    maxPrice: searchParams.get('maxPrice') || '',
    ordering: searchParams.get('ordering') || '',
  });

  useEffect(() => {
    api.get('/categories/').then((res) => setCategories(res.data));
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(true);
      const params = {};
      if (filters.search) params.search = filters.search;
      if (filters.category) params.category = filters.category;
      if (filters.minPrice) params.min_price = filters.minPrice;
      if (filters.maxPrice) params.max_price = filters.maxPrice;
      if (filters.ordering) params.ordering = filters.ordering;

      api.get('/listings/', { params })
        .then((res) => {
          setListings(res.data.results);
          setNextPageUrl(res.data.next);
        })
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

  const loadMore = async () => {
    if (!nextPageUrl) return;
    setLoadingMore(true);
    try {
      const res = await api.get(nextPageUrl);
      setListings((prev) => [...prev, ...res.data.results]);
      setNextPageUrl(res.data.next);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingMore(false);
    }
  };

  return (
    <div className="page-container" style={{ paddingTop: '32px' }}>
      <Helmet>
        <title>Katalog — Barcha e'lonlar | Makon360</title>
        <meta name="description" content="Makon360 katalogida barcha ko'chmas mulk e'lonlarini ko'ring, narx va toifa bo'yicha filtrlang." />
        <link rel="canonical" href="https://makon360.online/catalog" />
      </Helmet>
      <h1 className="fade-up">{t('catalog.title')}</h1>

      <div className="fade-up" style={{ animationDelay: '0.08s' }}>
        <FilterBar filters={filters} setFilters={setFilters} categories={categories} />
      </div>

      {loading ? (
        <PageSpinner />
      ) : (
        <>
          <ListingGrid listings={listings} authenticated={authenticated} onToggleFavorite={handleToggleFavorite} />
          {nextPageUrl && (
            <div style={{ textAlign: 'center', marginTop: '28px' }}>
              <button className="btn btn-secondary" onClick={loadMore} disabled={loadingMore}>
                {loadingMore && <span className="btn-spinner" />}
                {t('catalog.loadMore')}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default CatalogPage;
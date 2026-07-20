import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';
import FilterBar from '../components/FilterBar';
import ListingGrid from '../components/ListingGrid';

function CatalogPage() {
  const { authenticated } = useAuth();
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();

  const [listings, setListings] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

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
    setLoading(true);
    const params = {};
    if (filters.search) params.search = filters.search;
    if (filters.category) params.category = filters.category;
    if (filters.minPrice) params.min_price = filters.minPrice;
    if (filters.maxPrice) params.max_price = filters.maxPrice;
    if (filters.ordering) params.ordering = filters.ordering;

    api.get('/listings/', { params })
      .then((res) => setListings(res.data))
      .catch((err) => console.error('Xatolik:', err))
      .finally(() => setLoading(false));
  }, [filters]);

  const handleToggleFavorite = async (e, listingId) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      const res = await api.post(`/listings/${listingId}/toggle_favorite/`);
      setListings((prev) =>
        prev.map((l) => (l.id === listingId ? { ...l, is_favorited: res.data.is_favorited } : l))
      );
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="page-container" style={{ paddingTop: '32px' }}>
      <h1 className="fade-up">{t('catalog.title')}</h1>

      <div className="fade-up" style={{ animationDelay: '0.08s' }}>
        <FilterBar filters={filters} setFilters={setFilters} categories={categories} />
      </div>

      {loading ? (
        <p>{t('home.loading')}</p>
      ) : (
        <ListingGrid listings={listings} authenticated={authenticated} onToggleFavorite={handleToggleFavorite} />
      )}
    </div>
  );
}

export default CatalogPage;
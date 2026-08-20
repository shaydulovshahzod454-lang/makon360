import { useTranslation } from 'react-i18next';

function FilterBar({ filters, setFilters, categories }) {
  const { t } = useTranslation();
  const { search, category, minPrice, maxPrice, ordering } = filters;

  const update = (key, value) => setFilters((prev) => ({ ...prev, [key]: value }));

  return (
    <div className="filter-bar">
      <input
        type="text"
        className="search-input"
        placeholder={t('home.searchPlaceholder')}
        value={search}
        onChange={(e) => update('search', e.target.value)}
      />
      <select value={category} onChange={(e) => update('category', e.target.value)} aria-label={t('createListing.category')}>
        <option value="">{t('home.allCategories')}</option>
        {categories.map((c) => (
          <option key={c.id} value={c.id}>{c.name}</option>
        ))}
      </select>
      <input
        type="number"
        className="price-input"
        placeholder={t('home.minPrice')}
        value={minPrice}
        onChange={(e) => update('minPrice', e.target.value)}
      />
      <input
        type="number"
        className="price-input"
        placeholder={t('home.maxPrice')}
        value={maxPrice}
        onChange={(e) => update('maxPrice', e.target.value)}
      />
      <select value={ordering} onChange={(e) => update('ordering', e.target.value)} aria-label="Sort">
        <option value="">{t('home.sortLabel')}</option>
        <option value="price">{t('home.sortCheap')}</option>
        <option value="-price">{t('home.sortExpensive')}</option>
        <option value="-created_at">{t('home.sortNewest')}</option>
      </select>
    </div>
  );
}

export default FilterBar;
import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';

import { api } from '../api/client.js';
import Alert from '../components/Alert.jsx';
import Icon from '../components/Icon.jsx';
import Loader, { EmptyState } from '../components/Loader.jsx';
import ProductCard from '../components/ProductCard.jsx';
import { useAsync } from '../hooks/useAsync.js';

const CATEGORIES = ['Coffee', 'Tea', 'Pastries', 'Cold Drinks', 'Desserts'];

const SORTS = [
  { value: 'featured', label: 'Featured' },
  { value: 'price-asc', label: 'Price: Low to High' },
  { value: 'price-desc', label: 'Price: High to Low' },
  { value: 'name-asc', label: 'Name: A to Z' },
  { value: 'name-desc', label: 'Name: Z to A' }
];

export default function MenuPage() {
  const [params, setParams] = useSearchParams();
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('featured');

  const activeCategory = params.get('category') || 'All';
  const { data, loading, error, reload } = useAsync(() => api.get('/menu'), []);
  const menu = data?.data || [];

  const visible = useMemo(() => {
    const term = search.trim().toLowerCase();

    const filtered = menu.filter((item) => {
      const matchesCategory = activeCategory === 'All' || item.category === activeCategory;
      const matchesTerm =
        !term ||
        item.name.toLowerCase().includes(term) ||
        (item.description || '').toLowerCase().includes(term) ||
        (item.category || '').toLowerCase().includes(term);

      return matchesCategory && matchesTerm;
    });

    const sorted = [...filtered];

    switch (sort) {
      case 'price-asc':
        sorted.sort((a, b) => a.price - b.price);
        break;
      case 'price-desc':
        sorted.sort((a, b) => b.price - a.price);
        break;
      case 'name-asc':
        sorted.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'name-desc':
        sorted.sort((a, b) => b.name.localeCompare(a.name));
        break;
      default:
        sorted.sort((a, b) => Number(b.available !== false) - Number(a.available !== false));
    }

    return sorted;
  }, [menu, activeCategory, search, sort]);

  function selectCategory(category) {
    if (category === 'All') {
      params.delete('category');
    } else {
      params.set('category', category);
    }
    setParams(params, { replace: true });
  }

  return (
    <div className="page container">
      <div className="section-head section-head--left" style={{ maxWidth: 'none' }}>
        <span className="eyebrow">Our menu</span>
        <h1>Freshly made, just for you</h1>
        <p>Browse our full range of coffee, teas, pastries and desserts. Prices are in Maloti (M).</p>
      </div>

      <div className="menu-toolbar">
        <div className="toolbar-row">
          <div className="chip-row">
            <button
              type="button"
              className={`chip${activeCategory === 'All' ? ' is-active' : ''}`}
              onClick={() => selectCategory('All')}
            >
              All Items
            </button>
            {CATEGORIES.map((category) => (
              <button
                key={category}
                type="button"
                className={`chip${activeCategory === category ? ' is-active' : ''}`}
                onClick={() => selectCategory(category)}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        <div className="toolbar-row">
          <label className="search-box">
            <span className="sr-only">Search the menu</span>
            <Icon name="search" size={17} />
            <input
              type="search"
              className="input"
              placeholder="Search for a product…"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </label>

          <div className="row">
            <span className="results-count">
              {visible.length} item{visible.length === 1 ? '' : 's'}
            </span>
            <label className="sr-only" htmlFor="menu-sort">
              Sort menu items
            </label>
            <select
              id="menu-sort"
              className="select select--auto"
              value={sort}
              onChange={(event) => setSort(event.target.value)}
            >
              {SORTS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {loading && <Loader label="Loading the menu…" />}

      {error && (
        <div className="stack">
          <Alert variant="error">{error.message}</Alert>
          <button type="button" className="btn btn--outline btn--sm" onClick={reload}>
            <Icon name="refresh" size={16} /> Try again
          </button>
        </div>
      )}

      {!loading && !error && visible.length === 0 && (
        <EmptyState
          icon="🔍"
          title="No items found"
          description="Try a different category or search term."
          action={
            <button
              type="button"
              className="btn btn--primary btn--sm"
              onClick={() => {
                setSearch('');
                selectCategory('All');
              }}
            >
              Clear filters
            </button>
          }
        />
      )}

      {!loading && !error && visible.length > 0 && (
        <div className="grid-auto">
          {visible.map((item) => (
            <ProductCard key={item.id} item={item} />
          ))}
        </div>
      )}
    </div>
  );
}

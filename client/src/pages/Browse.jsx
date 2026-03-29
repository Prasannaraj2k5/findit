import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { itemsAPI } from '../services/api';
import ItemCard from '../components/items/ItemCard';
import CampusMap from '../components/items/CampusMap';
import { CATEGORIES, LOCATIONS } from '../utils/constants';
import {
  Search, Filter, X, ChevronDown, SlidersHorizontal,
  Package, Loader2, Map, LayoutGrid
} from 'lucide-react';

export default function Browse() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'map'

  const [filters, setFilters] = useState({
    search: searchParams.get('search') || '',
    type: searchParams.get('type') || '',
    category: searchParams.get('category') || '',
    status: searchParams.get('status') || 'active',
    location: searchParams.get('location') || '',
    sort: '-createdAt',
  });

  const fetchItems = useCallback(async (pageNum = 1, append = false) => {
    try {
      setLoading(true);
      const params = {
        page: pageNum,
        limit: 12,
        ...filters,
      };
      // Remove empty params
      Object.keys(params).forEach(key => {
        if (!params[key]) delete params[key];
      });

      const { data } = await itemsAPI.getAll(params);
      setItems(prev => append ? [...prev, ...data.items] : data.items);
      setTotal(data.total);
      setHasMore(data.hasMore);
    } catch (error) {
      console.error('Failed to fetch items:', error);
      setItems([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    setPage(1);
    fetchItems(1);
  }, [fetchItems]);

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    const newParams = new URLSearchParams(searchParams);
    if (value) newParams.set(key, value);
    else newParams.delete(key);
    setSearchParams(newParams);
  };

  const clearFilters = () => {
    setFilters({ search: '', type: '', category: '', status: 'active', location: '', sort: '-createdAt' });
    setSearchParams({});
  };

  const loadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchItems(nextPage, true);
  };

  const activeFilterCount = [filters.type, filters.category, filters.location]
    .filter(Boolean).length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8 animate-fade-in">
        <h1 className="text-3xl font-bold mb-2">
          Browse <span className="bg-gradient-to-r from-browse-500 to-browse-700 bg-clip-text text-transparent">Items</span>
        </h1>
        <p className="text-surface-500 dark:text-surface-400">
          Search and filter through all reported lost and found items
        </p>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6 animate-slide-in-up" style={{ animationDelay: '0.05s', opacity: 0 }}>
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" />
          <input
            type="text"
            placeholder="Search by title, description, location..."
            className="input-field pl-10 pr-4"
            value={filters.search}
            onChange={(e) => handleFilterChange('search', e.target.value)}
          />
        </div>

        {/* Type Toggle */}
        <div className="flex rounded-xl border border-surface-200 dark:border-surface-700 overflow-hidden">
          {[
            { value: '', label: 'All' },
            { value: 'lost', label: '🔍 Lost' },
            { value: 'found', label: '📌 Found' },
          ].map(({ value, label }) => (
            <button
              key={value}
              onClick={() => handleFilterChange('type', value)}
              className={`px-4 py-2.5 text-sm font-medium transition-all ${
                filters.type === value
                  ? 'bg-primary-500 text-white'
                  : 'text-surface-600 hover:bg-surface-50 dark:text-surface-400 dark:hover:bg-surface-800'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* View Mode Toggle */}
        <div className="flex rounded-xl border border-surface-200 dark:border-surface-700 overflow-hidden">
          <button
            onClick={() => setViewMode('grid')}
            className={`px-3 py-2.5 transition-all ${viewMode === 'grid' ? 'bg-primary-500 text-white' : 'text-surface-500 hover:bg-surface-50'}`}
            title="Grid View"
          >
            <LayoutGrid className="w-4 h-4" />
          </button>
          <button
            onClick={() => setViewMode('map')}
            className={`px-3 py-2.5 transition-all ${viewMode === 'map' ? 'bg-primary-500 text-white' : 'text-surface-500 hover:bg-surface-50'}`}
            title="Map View"
          >
            <Map className="w-4 h-4" />
          </button>
        </div>

        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`btn btn-secondary relative ${showFilters ? 'border-primary-500 text-primary-600' : ''}`}
        >
          <SlidersHorizontal className="w-4 h-4" />
          Filters
          {activeFilterCount > 0 && (
            <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-primary-500 text-white text-[10px] flex items-center justify-center font-bold">
              {activeFilterCount}
            </span>
          )}
        </button>
      </div>

      {/* Filter Panel */}
      {showFilters && (
        <div className="card p-5 mb-6 animate-fade-in">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">Filters</h3>
            <button onClick={clearFilters} className="text-sm text-primary-500 hover:text-primary-600 flex items-center gap-1">
              <X className="w-3.5 h-3.5" /> Clear all
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Category */}
            <div>
              <label className="block text-sm font-medium mb-1.5">Category</label>
              <select
                className="input-field"
                value={filters.category}
                onChange={(e) => handleFilterChange('category', e.target.value)}
              >
                <option value="">All Categories</option>
                {CATEGORIES.map(c => (
                  <option key={c.value} value={c.value}>{c.icon} {c.label}</option>
                ))}
              </select>
            </div>

            {/* Location */}
            <div>
              <label className="block text-sm font-medium mb-1.5">Location</label>
              <select
                className="input-field"
                value={filters.location}
                onChange={(e) => handleFilterChange('location', e.target.value)}
              >
                <option value="">All Locations</option>
                {LOCATIONS.map(l => (
                  <option key={l} value={l}>{l}</option>
                ))}
              </select>
            </div>

            {/* Sort */}
            <div>
              <label className="block text-sm font-medium mb-1.5">Sort By</label>
              <select
                className="input-field"
                value={filters.sort}
                onChange={(e) => handleFilterChange('sort', e.target.value)}
              >
                <option value="-createdAt">Newest First</option>
                <option value="createdAt">Oldest First</option>
                <option value="-dateLostOrFound">Date Lost/Found (Recent)</option>
                <option value="-views">Most Viewed</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Results count */}
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-surface-500">
          {loading ? 'Loading...' : `${total} item${total !== 1 ? 's' : ''} found`}
        </p>
      </div>

      {/* Map View */}
      {viewMode === 'map' && (
        <div className="mb-6">
          <CampusMap
            items={items}
            onLocationClick={(loc) => handleFilterChange('location', loc)}
          />
          <p className="text-xs text-surface-400 mt-2 text-center">
            Click a marker to filter items by location. Showing {items.length} items on map.
          </p>
        </div>
      )}

      {/* Items Grid */}
      {loading && items.length === 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="card overflow-hidden">
              <div className="skeleton h-48 rounded-none"></div>
              <div className="p-4 space-y-3">
                <div className="skeleton h-5 w-3/4"></div>
                <div className="skeleton h-4 w-full"></div>
                <div className="skeleton h-4 w-2/3"></div>
              </div>
            </div>
          ))}
        </div>
      ) : items.length > 0 ? (
        <>
          {(viewMode === 'grid' || viewMode === 'map') && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 stagger-children">
              {items.map(item => (
                <ItemCard key={item._id} item={item} />
              ))}
            </div>
          )}

          {hasMore && (
            <div className="text-center mt-8">
              <button onClick={loadMore} disabled={loading} className="btn btn-secondary px-8">
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Load More'}
              </button>
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-16">
          <Package className="w-16 h-16 mx-auto mb-4 text-surface-300 dark:text-surface-600" />
          <h3 className="text-lg font-semibold mb-2">No items found</h3>
          <p className="text-surface-500 dark:text-surface-400 mb-4">
            {filters.search || filters.category || filters.location
              ? 'Try adjusting your filters or search terms'
              : 'No items have been reported yet'}
          </p>
          <button onClick={clearFilters} className="btn btn-primary">Clear Filters</button>
        </div>
      )}
    </div>
  );
}

"use client";

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import apiClient from '../../lib/api-client';
import ProductCard from '../product/ProductCard';
import FilterSidebar from './FilterSidebar';
import SortToolbar from './SortToolbar';
import Pagination from './Pagination';
import Breadcrumbs from '../common/Breadcrumbs';
import CatalogHeroBanner from './CatalogHeroBanner';

const DEFAULT_CATEGORIES = [
  { id: 1, name: "Women's Fashion", slug: "women", products_count: 14 },
  { id: 2, name: "Men's Collection", slug: "men", products_count: 12 },
  { id: 3, name: "Watches & Timepieces", slug: "watches", products_count: 8 },
  { id: 4, name: "Handbags & Totes", slug: "handbags", products_count: 9 },
  { id: 5, name: "Fine Jewelry", slug: "jewelry", products_count: 6 },
  { id: 6, name: "Accessories", slug: "accessories", products_count: 11 },
];

const DEFAULT_BRANDS = [
  { id: 1, name: "Luxora Atelier", slug: "luxora" },
  { id: 2, name: "Aura Paris", slug: "aura-paris" },
  { id: 3, name: "Chronos & Co", slug: "chronos" },
  { id: 4, name: "Vera Leather", slug: "vera-leather" },
  { id: 5, name: "Maison Gold", slug: "maison-gold" },
];

const FALLBACK_PRODUCTS = [
  {
    id: 1,
    name: "Luxury Silk Evening Dress",
    slug: "luxury-silk-evening-dress",
    price: 380,
    compare_at_price: 450,
    rating: 4.9,
    category: { name: "Women's Fashion", slug: "women" },
    primary_image: "https://images.unsplash.com/photo-1566174053879-31528523f8ae?q=80&w=800&auto=format&fit=crop",
    is_featured: true,
  },
  {
    id: 2,
    name: "Classic Chronometer Watch",
    slug: "classic-chronometer-watch",
    price: 890,
    compare_at_price: null,
    rating: 5.0,
    category: { name: "Watches", slug: "watches" },
    primary_image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=800&auto=format&fit=crop",
    is_featured: true,
  },
  {
    id: 3,
    name: "Artisanal Leather Tote",
    slug: "artisanal-leather-tote",
    price: 275,
    compare_at_price: 320,
    rating: 4.8,
    category: { name: "Handbags", slug: "handbags" },
    primary_image: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?q=80&w=800&auto=format&fit=crop",
    is_featured: true,
  },
  {
    id: 4,
    name: "Designer Sunglasses Gold",
    slug: "designer-sunglasses-gold",
    price: 210,
    compare_at_price: null,
    rating: 4.7,
    category: { name: "Accessories", slug: "accessories" },
    primary_image: "https://images.unsplash.com/photo-1511499767150-a48a237f0083?q=80&w=800&auto=format&fit=crop",
    is_featured: true,
  },
  {
    id: 5,
    name: "Italian Leather Loafers",
    slug: "italian-leather-loafers",
    price: 490,
    compare_at_price: 540,
    rating: 4.9,
    category: { name: "Men's Footwear", slug: "men" },
    primary_image: "https://images.unsplash.com/photo-1614252235316-8c857d38b5f4?q=80&w=800&auto=format&fit=crop",
    is_featured: true,
  },
  {
    id: 6,
    name: "Cashmere Knit Sweater",
    slug: "cashmere-knit-sweater",
    price: 290,
    compare_at_price: null,
    rating: 4.8,
    category: { name: "Apparel", slug: "apparel" },
    primary_image: "https://images.unsplash.com/photo-1576566588028-4147f3842f27?q=80&w=800&auto=format&fit=crop",
    is_featured: true,
  },
  {
    id: 7,
    name: "Diamond Pendant Necklace",
    slug: "diamond-pendant-necklace",
    price: 1250,
    compare_at_price: 1400,
    rating: 5.0,
    category: { name: "Fine Jewelry", slug: "jewelry" },
    primary_image: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?q=80&w=800&auto=format&fit=crop",
    is_featured: true,
  },
  {
    id: 8,
    name: "Minimalist Leather Cardholder",
    slug: "minimalist-leather-cardholder",
    price: 110,
    compare_at_price: null,
    rating: 4.6,
    category: { name: "Accessories", slug: "accessories" },
    primary_image: "https://images.unsplash.com/photo-1627123424574-724758594e93?q=80&w=800&auto=format&fit=crop",
    is_featured: false,
  },
];

export default function CatalogLayout({
  pageTitle = "Catalog Collection",
  headerBanner = null,
  breadcrumbsItems = [],
  fixedCategory = null,
  fixedBrand = null,
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState(DEFAULT_CATEGORIES);
  const [brands, setBrands] = useState(DEFAULT_BRANDS);
  const [loading, setLoading] = useState(true);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(8);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'compact' | 'list'

  // Extract filter parameters from URL query strings
  const categoryFilter = fixedCategory || searchParams.get('category') || '';
  const brandFilter = fixedBrand || searchParams.get('brand') || '';
  const priceMinFilter = searchParams.get('price_min') || '';
  const priceMaxFilter = searchParams.get('price_max') || '';
  const sortFilter = searchParams.get('sort') || 'featured';
  const pageFilter = parseInt(searchParams.get('page') || '1', 10);
  const perPageFilter = searchParams.has('per_page') ? parseInt(searchParams.get('per_page'), 10) : null;
  const searchQuery = searchParams.get('search') || '';

  const activeFilters = {
    category: categoryFilter,
    brand: brandFilter,
    price_min: priceMinFilter,
    price_max: priceMaxFilter,
    sort: sortFilter,
    page: pageFilter,
    per_page: perPageFilter || itemsPerPage,
    search: searchQuery,
  };

  const updateUrlFilters = (newFilters) => {
    const params = new URLSearchParams(searchParams.toString());

    Object.entries(newFilters).forEach(([key, val]) => {
      if (val !== undefined && val !== null && val !== '') {
        params.set(key, val);
      } else {
        params.delete(key);
      }
    });

    const pathname = typeof window !== 'undefined' ? window.location.pathname : '/products';
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const handleFilterChange = (key, value) => {
    updateUrlFilters({ [key]: value, page: 1 });
  };

  const handleClearFilters = () => {
    const cleared = {
      category: fixedCategory || '',
      brand: fixedBrand || '',
      price_min: '',
      price_max: '',
      sort: 'featured',
      page: 1,
      per_page: '',
    };
    updateUrlFilters(cleared);
  };

  const handlePageChange = (newPage) => {
    updateUrlFilters({ page: newPage });
  };

  // Fetch Metadata (Categories & Brands) with Default Fallbacks
  useEffect(() => {
    const fetchMetadata = async () => {
      try {
        const [catRes, brandRes] = await Promise.allSettled([
          apiClient.get('/categories'),
          apiClient.get('/brands'),
        ]);

        if (catRes.status === 'fulfilled') {
          const list = catRes.value.data.data || catRes.value.data || [];
          if (Array.isArray(list) && list.length > 0) {
            setCategories(list);
          }
        }

        if (brandRes.status === 'fulfilled') {
          const list = brandRes.value.data.data || brandRes.value.data || [];
          if (Array.isArray(list) && list.length > 0) {
            setBrands(list);
          }
        }
      } catch (err) {
        console.warn('Catalog metadata fetch notice:', err);
      }
    };
    fetchMetadata();
  }, []);

  // Fetch Product Catalog Items
  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    const fetchProducts = async () => {
      try {
        const params = {
          ...(categoryFilter && { category: categoryFilter }),
          ...(brandFilter && { brand: brandFilter }),
          ...(priceMinFilter && { min_price: priceMinFilter, price_min: priceMinFilter }),
          ...(priceMaxFilter && { max_price: priceMaxFilter, price_max: priceMaxFilter }),
          ...(sortFilter && { sort_by: sortFilter, sort: sortFilter }),
          ...(pageFilter && { page: pageFilter }),
          ...(perPageFilter && { per_page: perPageFilter }),
          ...(searchQuery && { search: searchQuery }),
        };

        const res = await apiClient.get('/products', { params });
        if (!isMounted) return;

        const payload = res.data;
        if (payload && payload.success) {
          const items = payload.data || [];
          setProducts(items);
          if (payload.meta) {
            setTotalItems(payload.meta.total ?? items.length);
            setTotalPages(payload.meta.last_page ?? 1);
            if (payload.meta.per_page) {
              setItemsPerPage(payload.meta.per_page);
            }
          } else {
            setTotalItems(payload.total ?? items.length);
            setTotalPages(payload.last_page ?? 1);
          }
        }
      } catch (err) {
        console.warn('Catalog product fetch notice:', err);
        if (isMounted) {
          const effectivePerPage = perPageFilter || itemsPerPage || 8;
          setProducts(FALLBACK_PRODUCTS.slice(0, effectivePerPage));
          setTotalItems(FALLBACK_PRODUCTS.length);
          setTotalPages(Math.ceil(FALLBACK_PRODUCTS.length / effectivePerPage) || 1);
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchProducts();
    return () => {
      isMounted = false;
    };
  }, [categoryFilter, brandFilter, priceMinFilter, priceMaxFilter, sortFilter, pageFilter, perPageFilter, searchQuery]);

  return (
    <div className="bg-[#FAF9F6] min-h-screen text-stone-900 font-sans pb-16">
      
      {/* Header Collection Banner */}
      {headerBanner || (
        <CatalogHeroBanner
          title={pageTitle ? pageTitle.toUpperCase() : 'STORE CATALOG'}
          subtitle="Explore curated luxury timepieces, couture fashion, fine jewelry, and artisanal leather accessories."
        />
      )}

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        
        {/* Breadcrumb Navigation */}
        <div className="mb-6">
          <Breadcrumbs items={breadcrumbsItems} />
        </div>

        {/* Catalog Main Layout (Sidebar + Product Grid) */}
        <div className="flex flex-col lg:flex-row gap-8 items-start">
          
          {/* Desktop Filter Sidebar */}
          <FilterSidebar
            categories={categories}
            brands={brands}
            filters={activeFilters}
            onFilterChange={handleFilterChange}
            onClearFilters={handleClearFilters}
            isMobileOpen={isMobileFilterOpen}
            onCloseMobile={() => setIsMobileFilterOpen(false)}
          />

          {/* Main Product Catalog Display */}
          <main className="flex-1 w-full">
            
            {/* Sorting & Layout Toolbar */}
            <SortToolbar
              totalItems={totalItems}
              currentSort={sortFilter}
              onSortChange={(sort) => handleFilterChange('sort', sort)}
              searchQuery={searchQuery}
              onSearchChange={(query) => handleFilterChange('search', query)}
              itemsPerPage={perPageFilter || itemsPerPage}
              onItemsPerPageChange={(perPage) => handleFilterChange('per_page', perPage)}
              viewMode={viewMode}
              onViewModeChange={setViewMode}
              onOpenMobileFilter={() => setIsMobileFilterOpen(true)}
            />

            {/* Product Cards Grid */}
            {loading ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="bg-stone-200/60 animate-pulse rounded-2xl h-72" />
                ))}
              </div>
            ) : products.length > 0 ? (
              <div
                data-testid="catalog-product-grid"
                className={`grid gap-5 ${
                  viewMode === 'compact'
                    ? 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-5'
                    : viewMode === 'list'
                    ? 'grid-cols-1'
                    : 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4'
                }`}
              >
                {products.map((product) => (
                  <ProductCard key={product.id || product.slug} product={product} />
                ))}
              </div>
            ) : (
              <div className="bg-white border border-stone-200/80 rounded-2xl p-12 text-center space-y-3">
                <h3 className="font-serif text-xl font-bold text-stone-900">No Products Found</h3>
                <p className="text-xs text-stone-500 max-w-sm mx-auto">
                  We couldn't find any products matching your active filters. Try resetting your price range or category search.
                </p>
                <button
                  onClick={handleClearFilters}
                  className="mt-4 bg-stone-950 hover:bg-stone-900 text-white text-xs font-semibold py-2.5 px-6 rounded-xl transition-colors shadow"
                >
                  Reset All Filters
                </button>
              </div>
            )}

            {/* Pagination Controls */}
            <Pagination
              currentPage={pageFilter}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />

          </main>

        </div>

      </div>
    </div>
  );
}

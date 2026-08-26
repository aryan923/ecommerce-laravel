"use client";

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Search, X, Loader2 } from 'lucide-react';
import apiClient from '../../lib/api-client';
import { useCurrency } from '../../context/CurrencyContext';

export default function LiveSearch() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const dropdownRef = useRef(null);
  const router = useRouter();
  const { formatPrice } = useCurrency();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (!query.trim() || query.length < 2) {
      setResults([]);
      setIsOpen(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsLoading(true);
      try {
        const res = await apiClient.get(`/products?search=${encodeURIComponent(query)}&limit=5`);
        const data = res.data.data || res.data;
        const productsList = Array.isArray(data) ? data : data.data || [];
        setResults(productsList);
        setIsOpen(true);
      } catch (err) {
        console.warn('Live search notice:', err);
      } finally {
        setIsLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (query.trim()) {
      setIsOpen(false);
      router.push(`/products?search=${encodeURIComponent(query.trim())}`);
    }
  };

  return (
    <div className="relative w-full max-w-md" ref={dropdownRef}>
      <form onSubmit={handleSearchSubmit} className="relative flex items-center">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => query.trim().length >= 2 && setIsOpen(true)}
          placeholder="Search products, brands, categories..."
          aria-label="Search products, brands, categories"
          className="w-full bg-zinc-800/80 border border-zinc-700/80 text-white placeholder-zinc-400 text-xs rounded-full py-2.5 pl-10 pr-9 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
        />
        <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />

        {isLoading ? (
          <Loader2 className="w-4 h-4 text-indigo-400 animate-spin absolute right-3 top-1/2 -translate-y-1/2" />
        ) : query ? (
          <button
            type="button"
            onClick={() => {
              setQuery('');
              setResults([]);
              setIsOpen(false);
            }}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        ) : null}
      </form>

      {/* Auto-suggest Dropdown */}
      {isOpen && (
        <div
          data-testid="search-results-dropdown"
          className="absolute left-0 right-0 top-full mt-2 bg-zinc-900 border border-zinc-800 rounded-xl shadow-2xl overflow-hidden z-50 max-h-96 overflow-y-auto"
        >
          {results.length > 0 ? (
            <div className="py-2 divide-y divide-zinc-800/60">
              <div className="px-4 py-1.5 text-[10px] font-semibold text-zinc-500 uppercase tracking-wider">
                Matching Products
              </div>
              {results.map((product) => {
                const imageSrc = product.primary_image_url || product.image || '/placeholder.png';

                return (
                  <Link
                    key={product.id || product.slug}
                    href={`/products/${product.slug || product.id}`}
                    onClick={() => setIsOpen(false)}
                    className="flex items-center gap-3 px-4 py-2.5 hover:bg-zinc-800/60 transition-colors"
                  >
                    <div className="relative w-10 h-10 bg-zinc-800 rounded-md overflow-hidden shrink-0">
                      {imageSrc && imageSrc !== '/placeholder.png' ? (
                        <Image
                          src={imageSrc}
                          alt={product.name || 'Product'}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-zinc-800 flex items-center justify-center text-[10px] text-zinc-600">
                          N/A
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h5 className="text-xs font-medium text-zinc-100 truncate">
                        {product.name}
                      </h5>
                      <span className="text-[10px] text-zinc-400">
                        {product.category?.name || 'Catalog'}
                      </span>
                    </div>
                    <span className="text-xs font-bold text-indigo-400 shrink-0">
                      {formatPrice(product.price || 0)}
                    </span>
                  </Link>
                );
              })}

              <div className="p-2 text-center bg-zinc-900/80">
                <button
                  onClick={handleSearchSubmit}
                  className="text-xs text-indigo-400 hover:text-indigo-300 font-medium py-1"
                >
                  View all results for &quot;{query}&quot; →
                </button>
              </div>
            </div>
          ) : (
            <div className="p-6 text-center text-xs text-zinc-400">
              No products found for &quot;{query}&quot;
            </div>
          )}
        </div>
      )}
    </div>
  );
}

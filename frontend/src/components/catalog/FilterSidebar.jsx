"use client";

import React, { useState } from 'react';
import { X, RotateCcw, Filter, ChevronDown, Check } from 'lucide-react';
import { useCurrency } from '../../context/CurrencyContext';

export default function FilterSidebar({
  categories = [],
  brands = [],
  attributes = [],
  filters = {},
  onFilterChange = () => {},
  onClearFilters = () => {},
  isMobileOpen = false,
  onCloseMobile = () => {},
}) {
  const { activeCurrency } = useCurrency();
  const currencySymbol = activeCurrency?.symbol || '₹';
  const [openSections, setOpenSections] = useState({
    categories: true,
    price: true,
    brands: true,
    attributes: true,
  });

  const toggleSection = (section) => {
    setOpenSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  const activeCategory = filters.category || '';
  const activeBrand = filters.brand || '';
  const minPrice = filters.price_min || '';
  const maxPrice = filters.price_max || '';

  const handleCategorySelect = (slug) => {
    onFilterChange('category', activeCategory === slug ? '' : slug);
  };

  const handleBrandSelect = (slug) => {
    onFilterChange('brand', activeBrand === slug ? '' : slug);
  };

  const handlePriceChange = (min, max) => {
    onFilterChange('price_min', min);
    onFilterChange('price_max', max);
  };

  const hasActiveFilters = Boolean(activeCategory || activeBrand || minPrice || maxPrice);

  const content = (
    <div className="space-y-6 text-stone-900">
      
      {/* Sidebar Header & Clear All */}
      <div className="flex items-center justify-between pb-4 border-b border-stone-200/80">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-stone-700" />
          <h3 className="font-serif text-lg font-semibold text-stone-950">Filters</h3>
        </div>
        {hasActiveFilters && (
          <button
            onClick={onClearFilters}
            className="text-xs font-semibold text-amber-900 hover:text-amber-700 flex items-center gap-1 transition-colors"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset All</span>
          </button>
        )}
      </div>

      {/* Category Filter Section */}
      <div className="border-b border-stone-200/80 pb-5">
        <button
          onClick={() => toggleSection('categories')}
          className="w-full flex items-center justify-between py-1 text-sm font-semibold text-stone-900 hover:text-stone-950"
        >
          <span>Categories</span>
          <ChevronDown className={`w-4 h-4 text-stone-500 transition-transform ${openSections.categories ? 'rotate-180' : ''}`} />
        </button>

        {openSections.categories && (
          <div className="mt-3 space-y-2 max-h-56 overflow-y-auto pr-1">
            <button
              onClick={() => handleCategorySelect('')}
              className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center justify-between ${
                !activeCategory ? 'bg-stone-900 text-white font-semibold' : 'text-stone-700 hover:bg-stone-200/60'
              }`}
            >
              <span>All Categories</span>
            </button>
            {categories.map((cat) => {
              const isSelected = activeCategory === cat.slug;
              return (
                <button
                  key={cat.id || cat.slug}
                  onClick={() => handleCategorySelect(cat.slug)}
                  className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center justify-between ${
                    isSelected ? 'bg-stone-900 text-white font-semibold' : 'text-stone-700 hover:bg-stone-200/60'
                  }`}
                >
                  <span className="truncate">{cat.name}</span>
                  {cat.products_count !== undefined && (
                    <span className={`text-[10px] ${isSelected ? 'text-stone-300' : 'text-stone-400'}`}>
                      ({cat.products_count})
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Price Range Filter Section */}
      <div className="border-b border-stone-200/80 pb-5">
        <button
          onClick={() => toggleSection('price')}
          className="w-full flex items-center justify-between py-1 text-sm font-semibold text-stone-900 hover:text-stone-950"
        >
          <span>Price Range ({currencySymbol})</span>
          <ChevronDown className={`w-4 h-4 text-stone-500 transition-transform ${openSections.price ? 'rotate-180' : ''}`} />
        </button>

        {openSections.price && (
          <div className="mt-4 space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-stone-500 block mb-1">Min</label>
                <input
                  type="number"
                  placeholder="0"
                  value={minPrice}
                  onChange={(e) => handlePriceChange(e.target.value, maxPrice)}
                  className="w-full bg-white border border-stone-300 rounded-lg px-3 py-1.5 text-xs text-stone-900 focus:outline-none focus:border-stone-900"
                />
              </div>
              <span className="text-stone-400 self-end pb-2">-</span>
              <div className="flex-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-stone-500 block mb-1">Max</label>
                <input
                  type="number"
                  placeholder="1000"
                  value={maxPrice}
                  onChange={(e) => handlePriceChange(minPrice, e.target.value)}
                  className="w-full bg-white border border-stone-300 rounded-lg px-3 py-1.5 text-xs text-stone-900 focus:outline-none focus:border-stone-900"
                />
              </div>
            </div>

            {/* Quick Price Preset Buttons */}
            <div className="flex flex-wrap gap-1.5 pt-1">
              {[
                { label: `Under ${currencySymbol}500`, min: '0', max: '500' },
                { label: `${currencySymbol}500 - ${currencySymbol}2000`, min: '500', max: '2000' },
                { label: `${currencySymbol}2000+`, min: '2000', max: '' },
              ].map((preset, idx) => (
                <button
                  key={idx}
                  onClick={() => handlePriceChange(preset.min, preset.max)}
                  className="text-[11px] px-2.5 py-1 rounded-md bg-stone-200/80 hover:bg-stone-300 text-stone-800 font-medium transition-colors"
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Brand Checkboxes Filter Section */}
      {brands.length > 0 && (
        <div className="border-b border-stone-200/80 pb-5">
          <button
            onClick={() => toggleSection('brands')}
            className="w-full flex items-center justify-between py-1 text-sm font-semibold text-stone-900 hover:text-stone-950"
          >
            <span>Brands</span>
            <ChevronDown className={`w-4 h-4 text-stone-500 transition-transform ${openSections.brands ? 'rotate-180' : ''}`} />
          </button>

          {openSections.brands && (
            <div className="mt-3 space-y-2 max-h-48 overflow-y-auto pr-1">
              {brands.map((b) => {
                const isSelected = activeBrand === b.slug;
                return (
                  <label
                    key={b.id || b.slug}
                    onClick={() => handleBrandSelect(b.slug)}
                    className="flex items-center gap-2.5 text-xs text-stone-700 hover:text-stone-950 cursor-pointer select-none py-0.5"
                  >
                    <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${
                      isSelected ? 'bg-stone-900 border-stone-900 text-white' : 'border-stone-300 bg-white'
                    }`}>
                      {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                    </div>
                    <span className="truncate">{b.name}</span>
                  </label>
                );
              })}
            </div>
          )}
        </div>
      )}

    </div>
  );

  return (
    <>
      {/* Desktop Sidebar View */}
      <aside className="hidden lg:block w-64 shrink-0 pr-6">
        <div className="sticky top-24 bg-white/60 backdrop-blur-sm border border-stone-200/80 p-5 rounded-2xl shadow-sm">
          {content}
        </div>
      </aside>

      {/* Mobile Slide-over Drawer View */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
            onClick={onCloseMobile}
          />

          <div className="relative ml-auto w-full max-w-xs bg-[#FAF9F6] h-full shadow-2xl p-6 overflow-y-auto z-10 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-4 mb-4 border-b border-stone-200">
                <h3 className="font-serif text-lg font-bold text-stone-950">Filter Catalog</h3>
                <button
                  onClick={onCloseMobile}
                  className="p-1 rounded-lg text-stone-500 hover:text-stone-950 hover:bg-stone-200 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              {content}
            </div>

            <div className="pt-6 border-t border-stone-200">
              <button
                onClick={onCloseMobile}
                className="w-full bg-stone-950 hover:bg-stone-900 text-white py-3 rounded-xl font-semibold text-xs transition-colors shadow"
              >
                Apply Filters & View Results
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

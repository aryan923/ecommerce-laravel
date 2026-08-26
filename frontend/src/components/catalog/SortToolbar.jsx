"use client";

import React from 'react';
import { SlidersHorizontal, Grid3x3, LayoutGrid, List, Search, X } from 'lucide-react';

export default function SortToolbar({
  totalItems = 0,
  currentSort = 'featured',
  onSortChange = () => {},
  searchQuery = '',
  onSearchChange = () => {},
  itemsPerPage = 12,
  onItemsPerPageChange = () => {},
  viewMode = 'grid',
  onViewModeChange = () => {},
  onOpenMobileFilter = () => {},
}) {
  return (
    <div className="bg-white/80 backdrop-blur-sm border border-stone-200/80 rounded-2xl p-4 shadow-sm mb-6 flex flex-wrap items-center justify-between gap-4">
      
      {/* Left: Mobile Filter Toggle Button & Interactive Search Input */}
      <div className="flex items-center gap-3 flex-1 min-w-[240px]">
        <button
          onClick={onOpenMobileFilter}
          className="lg:hidden flex items-center gap-2 bg-stone-100 hover:bg-stone-200 text-stone-900 text-xs font-semibold py-2 px-3.5 rounded-xl border border-stone-300/80 transition-colors shrink-0"
        >
          <SlidersHorizontal className="w-4 h-4" />
          <span>Filters</span>
        </button>

        {/* Catalog Search Input Bar */}
        <div className="relative flex-1 max-w-xs">
          <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search products in catalog..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full bg-stone-50 border border-stone-300/80 rounded-xl pl-9 pr-8 py-2 text-xs text-stone-900 placeholder:text-stone-400 focus:outline-none focus:border-stone-950 transition-colors"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-950 p-0.5"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <span className="text-xs font-medium text-stone-500 hidden xl:inline shrink-0">
          <strong className="text-stone-950 font-bold">{totalItems}</strong> {totalItems === 1 ? 'product' : 'products'}
        </span>
      </div>

      {/* Right: Items Per Page, Sorting Selector & Grid/List View Toggles */}
      <div className="flex items-center gap-3 shrink-0">
        
        {/* Items Per Page Select Dropdown */}
        <div className="flex items-center gap-1.5">
          <label htmlFor="per-page-select" className="text-xs font-medium text-stone-500 hidden sm:inline">
            Show:
          </label>
          <select
            id="per-page-select"
            value={itemsPerPage}
            onChange={(e) => onItemsPerPageChange(Number(e.target.value))}
            className="bg-stone-50 border border-stone-300/80 text-stone-900 text-xs font-semibold rounded-xl py-2 px-2.5 focus:outline-none focus:border-stone-900 transition-colors cursor-pointer"
          >
            <option value={4}>4 / page</option>
            <option value={8}>8 / page</option>
            <option value={12}>12 / page</option>
            <option value={16}>16 / page</option>
            <option value={24}>24 / page</option>
          </select>
        </div>

        {/* Sort Select Dropdown */}
        <div className="flex items-center gap-2">
          <label htmlFor="sort-select" className="text-xs font-medium text-stone-500 hidden sm:inline">
            Sort by:
          </label>
          <select
            id="sort-select"
            value={currentSort}
            onChange={(e) => onSortChange(e.target.value)}
            className="bg-stone-50 border border-stone-300/80 text-stone-900 text-xs font-semibold rounded-xl py-2 px-3 focus:outline-none focus:border-stone-900 transition-colors cursor-pointer"
          >
            <option value="featured">Featured Collection</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
            <option value="latest">Newest Arrivals</option>
            <option value="rating">Highest Rated</option>
          </select>
        </div>

        {/* View Mode Toggle Buttons */}
        <div className="hidden sm:flex items-center gap-1 bg-stone-100 p-1 rounded-xl border border-stone-200">
          <button
            onClick={() => onViewModeChange('grid')}
            className={`p-1.5 rounded-lg transition-colors ${
              viewMode === 'grid' ? 'bg-white text-stone-950 shadow-sm' : 'text-stone-500 hover:text-stone-900'
            }`}
            title="Grid View (4 Columns)"
          >
            <Grid3x3 className="w-4 h-4" />
          </button>

          <button
            onClick={() => onViewModeChange('compact')}
            className={`p-1.5 rounded-lg transition-colors ${
              viewMode === 'compact' ? 'bg-white text-stone-950 shadow-sm' : 'text-stone-500 hover:text-stone-900'
            }`}
            title="Compact Grid View (5 Columns)"
          >
            <LayoutGrid className="w-4 h-4" />
          </button>

          <button
            onClick={() => onViewModeChange('list')}
            className={`p-1.5 rounded-lg transition-colors ${
              viewMode === 'list' ? 'bg-white text-stone-950 shadow-sm' : 'text-stone-500 hover:text-stone-900'
            }`}
            title="List View"
          >
            <List className="w-4 h-4" />
          </button>
        </div>

      </div>

    </div>
  );
}

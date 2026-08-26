"use client";

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { ChevronDown, ArrowRight, Sparkles, Grid } from 'lucide-react';
import apiClient from '../../lib/api-client';

export default function CategoryMenu() {
  const [categories, setCategories] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    let isMounted = true;
    const fetchCategories = async () => {
      try {
        const res = await apiClient.get('/categories');
        const data = res.data.data || res.data;
        const list = Array.isArray(data) ? data : data.data || [];
        
        // Remove duplicate category entries if any exist
        const uniqueMap = new Map();
        list.forEach((item) => {
          if (item && (item.slug || item.id)) {
            const key = item.slug || item.id;
            if (!uniqueMap.has(key)) {
              uniqueMap.set(key, item);
            }
          }
        });

        if (isMounted) {
          setCategories(Array.from(uniqueMap.values()));
        }
      } catch (err) {
        console.warn('Category fetch notice:', err);
      }
    };
    fetchCategories();
    return () => { isMounted = false; };
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        className="flex items-center gap-1.5 text-[12px] font-semibold tracking-widest text-stone-700 hover:text-stone-950 uppercase transition-colors py-2"
        aria-expanded={isOpen}
      >
        <span>Categories</span>
        <ChevronDown
          className={`w-3.5 h-3.5 text-stone-500 transition-transform duration-200 ${
            isOpen ? 'rotate-180 text-amber-800' : ''
          }`}
        />
      </button>

      {/* Modern Multi-Column Compact Mega Menu Dropdown */}
      {isOpen && (
        <div
          data-testid="category-menu-dropdown"
          className="absolute -left-12 sm:left-1/2 sm:-translate-x-1/2 top-full mt-2 w-[340px] sm:w-[480px] bg-white/95 backdrop-blur-md border border-stone-200/90 rounded-2xl shadow-2xl z-50 p-4 transition-all animate-in fade-in slide-in-from-top-2 duration-200"
        >
          {/* Header Banner Inside Dropdown */}
          <div className="flex items-center justify-between pb-3 mb-2 border-b border-stone-200/80 px-2">
            <div className="flex items-center gap-2 text-amber-900">
              <Grid className="w-4 h-4 text-amber-800" />
              <span className="text-[11px] font-bold tracking-[0.2em] uppercase">
                Shop Collections
              </span>
            </div>
            
            <Link
              href="/products"
              onClick={() => setIsOpen(false)}
              className="inline-flex items-center gap-1 text-[11px] font-bold text-stone-800 hover:text-amber-800 transition-colors"
            >
              <span>View All Catalog</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          {/* 2-Column Compact Category Grid */}
          {categories.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 max-h-[280px] overflow-y-auto pr-1 custom-scrollbar">
              {categories.map((cat) => (
                <Link
                  key={cat.id || cat.slug}
                  href={`/category/${cat.slug}`}
                  onClick={() => setIsOpen(false)}
                  className="group flex items-center justify-between px-3 py-2 text-xs font-medium text-stone-700 hover:text-stone-950 hover:bg-stone-100/80 rounded-xl transition-all"
                >
                  <div className="flex items-center gap-2 truncate">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-600/70 group-hover:bg-amber-800 group-hover:scale-125 transition-all shrink-0" />
                    <span className="truncate font-sans font-semibold group-hover:translate-x-0.5 transition-transform">
                      {cat.name}
                    </span>
                  </div>

                  <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 text-amber-800 transition-all shrink-0" />
                </Link>
              ))}
            </div>
          ) : (
            <div className="py-6 text-center text-xs text-stone-400 font-medium">
              Loading collections...
            </div>
          )}

          {/* Footer Quick Link */}
          <div className="mt-3 pt-2.5 border-t border-stone-200/80 text-center bg-stone-50/70 rounded-xl py-2 px-3 flex items-center justify-between">
            <span className="text-[11px] text-stone-500 font-normal">Curated Luxury Selection</span>
            <Link
              href="/products?featured=1"
              onClick={() => setIsOpen(false)}
              className="text-[11px] font-bold text-amber-900 hover:underline inline-flex items-center gap-1"
            >
              <Sparkles className="w-3 h-3 text-amber-700" />
              <span>Featured Items</span>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

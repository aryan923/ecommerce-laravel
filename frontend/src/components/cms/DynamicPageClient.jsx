"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Home, ChevronRight, FileText, AlertCircle, ArrowLeft, Clock } from 'lucide-react';
import { fetchPageBySlug } from '@/lib/cms-api';

export default function DynamicPageClient({ slug, initialData = null }) {
  const [page, setPage] = useState(initialData);
  const [loading, setLoading] = useState(!initialData);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (initialData) return;

    async function loadPage() {
      setLoading(true);
      setError(false);
      try {
        const data = await fetchPageBySlug(slug);
        if (data) {
          setPage(data);
        } else {
          setError(true);
        }
      } catch (err) {
        console.error('Dynamic page load error:', err);
        setError(true);
      } finally {
        setLoading(false);
      }
    }

    if (slug) {
      loadPage();
    }
  }, [slug, initialData]);

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="animate-pulse space-y-6">
          <div className="h-4 bg-stone-200 rounded w-1/4" />
          <div className="h-10 bg-stone-200 rounded w-3/4" />
          <div className="h-4 bg-stone-200 rounded w-1/3" />
          <div className="space-y-3 pt-6">
            <div className="h-4 bg-stone-200 rounded w-full" />
            <div className="h-4 bg-stone-200 rounded w-full" />
            <div className="h-4 bg-stone-200 rounded w-5/6" />
            <div className="h-4 bg-stone-200 rounded w-4/6" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !page) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-amber-100 text-amber-800 mb-6">
          <AlertCircle size={32} />
        </div>
        <h1 className="text-3xl font-bold text-stone-900 mb-3">Page Not Found</h1>
        <p className="text-stone-600 mb-8 max-w-md mx-auto">
          The requested CMS page could not be found or is currently unavailable.
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-stone-900 text-white font-semibold hover:bg-stone-800 transition-colors shadow-sm"
        >
          <ArrowLeft size={18} />
          <span>Return to Storefront Home</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Breadcrumb Navigation */}
      <nav aria-label="Breadcrumb" className="mb-6">
        <ol className="flex items-center gap-2 text-xs text-stone-500">
          <li>
            <Link href="/" className="hover:text-stone-900 flex items-center gap-1 transition-colors">
              <Home size={14} />
              <span>Home</span>
            </Link>
          </li>
          <ChevronRight size={12} />
          <li>
            <span className="text-stone-400">Pages</span>
          </li>
          <ChevronRight size={12} />
          <li>
            <span className="font-semibold text-stone-900 truncate max-w-[200px] inline-block align-bottom">
              {page.title}
            </span>
          </li>
        </ol>
      </nav>

      {/* Page Header Header */}
      <div className="border-b border-stone-200 pb-6 mb-8">
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-bold text-stone-950 tracking-tight mb-3">
          {page.title}
        </h1>

        {page.updated_at && (
          <div className="flex items-center gap-2 text-xs text-stone-500">
            <Clock size={14} />
            <span>Last Updated: {new Date(page.updated_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
          </div>
        )}
      </div>

      {/* Sanitized HTML Prose Content Body */}
      <article
        className="cms-prose-content prose prose-stone max-w-none prose-headings:font-serif prose-headings:font-bold prose-h1:text-3xl prose-h2:text-2xl prose-h3:text-xl prose-a:text-amber-800 prose-a:underline hover:prose-a:text-amber-900 prose-img:rounded-xl shadow-none"
        dangerouslySetInnerHTML={{ __html: page.content }}
      />
    </div>
  );
}

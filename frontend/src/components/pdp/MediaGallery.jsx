"use client";

import React, { useState } from 'react';
import { ZoomIn, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { normalizeImageUrl } from '../../lib/image-helper';

export default function MediaGallery({ images = [], productName = 'Product' }) {
  // Normalize images array to always contain valid absolute/relative URLs
  const imageList = (images && images.length > 0)
    ? images.map(img => {
        const rawUrl = typeof img === 'string' ? img : (img.url || img.image_url || img.path || img.src);
        return normalizeImageUrl(rawUrl);
      })
    : ['/placeholder.svg'];

  const [activeIndex, setActiveIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  const activeImage = imageList[activeIndex] || '/placeholder.svg';

  const handlePrev = (e) => {
    e?.stopPropagation();
    setActiveIndex((prev) => (prev === 0 ? imageList.length - 1 : prev - 1));
  };

  const handleNext = (e) => {
    e?.stopPropagation();
    setActiveIndex((prev) => (prev === imageList.length - 1 ? 0 : prev + 1));
  };

  return (
    <div data-testid="media-gallery" className="flex flex-col gap-4">
      {/* Main Display Image Container */}
      <div className="relative aspect-square w-full rounded-2xl bg-stone-100/90 border border-stone-200/80 overflow-hidden group shadow-sm">
        {activeImage ? (
          <img
            data-testid="main-image"
            src={activeImage}
            alt={`${productName} - Image ${activeIndex + 1}`}
            className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500 cursor-pointer"
            onClick={() => setIsLightboxOpen(true)}
            onError={(e) => {
              if (!e.currentTarget.dataset.fallback) {
                e.currentTarget.dataset.fallback = 'true';
                e.currentTarget.src = '/placeholder.svg';
              }
            }}
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-stone-400 p-6 text-center">
            <span className="text-sm font-semibold tracking-wider uppercase text-stone-400">Luxora Media</span>
            <span className="text-xs text-stone-400/80 mt-1">{productName}</span>
          </div>
        )}

        {/* Zoom Lightbox Trigger Button */}
        <button
          data-testid="image-zoom-btn"
          onClick={() => setIsLightboxOpen(true)}
          className="absolute bottom-3 right-3 p-2.5 rounded-full bg-white/90 backdrop-blur-md text-stone-700 hover:text-stone-950 hover:bg-white transition-all shadow-md z-10"
          title="Zoom image"
        >
          <ZoomIn className="w-4 h-4" />
        </button>

        {/* Image Nav Overlay Arrows (if > 1 image) */}
        {imageList.length > 1 && (
          <>
            <button
              onClick={handlePrev}
              className="absolute left-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/80 backdrop-blur-md text-stone-700 opacity-0 group-hover:opacity-100 hover:bg-white transition-all shadow-md z-10"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={handleNext}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/80 backdrop-blur-md text-stone-700 opacity-0 group-hover:opacity-100 hover:bg-white transition-all shadow-md z-10"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </>
        )}
      </div>

      {/* Thumbnails Row */}
      {imageList.length > 1 && (
        <div className="flex items-center gap-3 overflow-x-auto pb-1 scrollbar-none">
          {imageList.map((img, idx) => (
            <button
              key={idx}
              data-testid="thumbnail-image"
              onClick={() => setActiveIndex(idx)}
              className={`relative aspect-square w-16 sm:w-20 rounded-xl overflow-hidden border-2 transition-all shrink-0 ${
                activeIndex === idx
                  ? 'border-indigo-600 ring-2 ring-indigo-600/20 scale-105'
                  : 'border-stone-200 hover:border-stone-400 opacity-70 hover:opacity-100'
              }`}
            >
              <img
                src={img}
                alt={`${productName} thumbnail ${idx + 1}`}
                className="w-full h-full object-cover object-center"
                onError={(e) => {
                  if (!e.currentTarget.dataset.fallback) {
                    e.currentTarget.dataset.fallback = 'true';
                    e.currentTarget.src = '/placeholder.svg';
                  }
                }}
              />
            </button>
          ))}
        </div>
      )}

      {/* Lightbox Modal */}
      {isLightboxOpen && (
        <div
          data-testid="lightbox-modal"
          className="fixed inset-0 z-50 bg-stone-950/90 backdrop-blur-md flex items-center justify-center p-4 sm:p-8"
          onClick={() => setIsLightboxOpen(false)}
        >
          <div
            className="relative max-w-4xl max-h-[90vh] w-full h-full flex flex-col items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={() => setIsLightboxOpen(false)}
              className="absolute top-4 right-4 p-3 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors z-20"
              title="Close modal"
            >
              <X className="w-6 h-6" />
            </button>

            {/* Modal Image */}
            <div className="relative w-full h-full flex items-center justify-center p-4">
              <img
                src={activeImage}
                alt={productName}
                className="max-w-full max-h-[80vh] object-contain rounded-lg shadow-2xl"
                onError={(e) => {
                  if (!e.currentTarget.dataset.fallback) {
                    e.currentTarget.dataset.fallback = 'true';
                    e.currentTarget.src = '/placeholder.svg';
                  }
                }}
              />
            </div>

            {/* Navigation Controls inside Modal */}
            {imageList.length > 1 && (
              <>
                <button
                  onClick={handlePrev}
                  className="absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
                <button
                  onClick={handleNext}
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-stone-900/80 text-white/80 text-xs font-semibold px-4 py-1.5 rounded-full backdrop-blur-md">
                  {activeIndex + 1} / {imageList.length}
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

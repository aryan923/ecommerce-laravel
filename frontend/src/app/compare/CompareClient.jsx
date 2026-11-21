"use client";

import React, { useState } from 'react';
import CompareHeader from '../../components/compare/CompareHeader';
import CompareMatrix from '../../components/compare/CompareMatrix';
import EmptyCompare from '../../components/compare/EmptyCompare';
import { useCompare } from '../../context/CompareContext';

export default function CompareClient() {
  const { compareCount } = useCompare();
  const [highlightDiffs, setHighlightDiffs] = useState(false);

  return (
    <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-10 py-12">
      {compareCount > 0 ? (
        <div>
          <CompareHeader
            highlightDiffs={highlightDiffs}
            setHighlightDiffs={setHighlightDiffs}
          />
          <CompareMatrix highlightDiffs={highlightDiffs} />
        </div>
      ) : (
        <EmptyCompare />
      )}
    </div>
  );
}

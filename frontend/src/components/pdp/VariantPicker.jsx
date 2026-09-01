"use client";

import React, { useState, useMemo } from 'react';

export default function VariantPicker({
  variants = [],
  attributes = [],
  onSelectVariant,
  initialVariantId = null,
}) {
  // If no variants exist, render nothing
  if ((!variants || variants.length === 0) && (!attributes || attributes.length === 0)) {
    return null;
  }

  // Extract unique attribute types (e.g. Size, Color, Material)
  const attributeGroups = useMemo(() => {
    if (attributes && attributes.length > 0) {
      return attributes;
    }
    // Infer attribute groups from variants list if attributes prop is empty
    const groups = {};
    variants.forEach((v) => {
      if (v.attribute_values && Array.isArray(v.attribute_values)) {
        v.attribute_values.forEach((av) => {
          const name = av.attribute?.name || av.name || 'Option';
          if (!groups[name]) groups[name] = new Set();
          groups[name].add(av.value || av.val);
        });
      } else if (v.attributes && typeof v.attributes === 'object') {
        Object.entries(v.attributes).forEach(([name, val]) => {
          if (!groups[name]) groups[name] = new Set();
          groups[name].add(val);
        });
      } else if (v.option_name && v.option_value) {
        if (!groups[v.option_name]) groups[v.option_name] = new Set();
        groups[v.option_name].add(v.option_value);
      }
    });

    return Object.entries(groups).map(([name, valuesSet]) => ({
      name,
      values: Array.from(valuesSet),
    }));
  }, [variants, attributes]);

  // Selected option state map e.g. { Size: 'M', Color: 'Blue' }
  const [selectedOptions, setSelectedOptions] = useState(() => {
    const initialMap = {};
    if (attributeGroups && attributeGroups.length > 0) {
      attributeGroups.forEach((group) => {
        if (group.values && group.values.length > 0) {
          initialMap[group.name] = group.values[0];
        }
      });
    }
    return initialMap;
  });

  const [activeVariantId, setActiveVariantId] = useState(initialVariantId || variants[0]?.id);

  const handleSelectOption = (groupName, value) => {
    const updatedOptions = { ...selectedOptions, [groupName]: value };
    setSelectedOptions(updatedOptions);

    // Find matching variant
    const matchedVariant = variants.find((v) => {
      if (v.attributes && typeof v.attributes === 'object') {
        return Object.entries(updatedOptions).every(([name, val]) => v.attributes[name] === val);
      }
      if (v.attribute_values && Array.isArray(v.attribute_values)) {
        return Object.entries(updatedOptions).every(([name, val]) =>
          v.attribute_values.some((av) => (av.attribute?.name || av.name) === name && (av.value || av.val) === val)
        );
      }
      return false;
    }) || variants[0];

    if (matchedVariant) {
      setActiveVariantId(matchedVariant.id);
      if (onSelectVariant) {
        onSelectVariant(matchedVariant);
      }
    }
  };

  const handleSelectVariantDirect = (variant) => {
    setActiveVariantId(variant.id);
    if (onSelectVariant) {
      onSelectVariant(variant);
    }
  };

  return (
    <div data-testid="variant-picker" className="flex flex-col gap-4 border-t border-b border-stone-200/80 py-4 my-2">
      {/* Dynamic Attribute Groups */}
      {attributeGroups.map((group, gIdx) => (
        <div key={gIdx} className="flex flex-col gap-2">
          <div className="flex items-center justify-between text-xs font-semibold text-stone-900">
            <span>Select {group.name}:</span>
            <span data-testid="selected-variant-label" className="text-amber-800 font-bold">
              {selectedOptions[group.name] || (group.values && group.values[0])}
            </span>
          </div>

          <div className="flex flex-wrap gap-2">
            {group.values.map((val, vIdx) => {
              const isSelected = selectedOptions[group.name] === val;
              const isColor = group.name.toLowerCase() === 'color' || group.name.toLowerCase() === 'colour';

              return (
                <button
                  key={vIdx}
                  data-testid="variant-option"
                  type="button"
                  onClick={() => handleSelectOption(group.name, val)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all border flex items-center gap-2 ${
                    isSelected
                      ? 'border-amber-700 bg-amber-50 text-amber-900 ring-2 ring-amber-700/20 font-bold shadow-sm'
                      : 'border-stone-200 hover:border-stone-400 bg-white text-stone-700'
                  }`}
                >
                  {isColor && (
                    <span
                      className="w-3.5 h-3.5 rounded-full border border-stone-300 shadow-inner inline-block shrink-0"
                      style={{ backgroundColor: val.toLowerCase() }}
                    />
                  )}
                  <span>{val}</span>
                </button>
              );
            })}
          </div>
        </div>
      ))}

      {/* Fallback Direct Variant List (if attributeGroups was empty but variants exist) */}
      {attributeGroups.length === 0 && variants.length > 0 && (
        <div className="flex flex-col gap-2">
          <span className="text-xs font-semibold text-stone-900">Available Options:</span>
          <div className="flex flex-wrap gap-2">
            {variants.map((variant) => (
              <button
                key={variant.id}
                data-testid="variant-option"
                type="button"
                onClick={() => handleSelectVariantDirect(variant)}
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all border ${
                  activeVariantId === variant.id
                    ? 'border-amber-700 bg-amber-50 text-amber-900 ring-2 ring-amber-700/20 font-bold'
                    : 'border-stone-200 hover:border-stone-400 bg-white text-stone-700'
                }`}
              >
                {variant.title || variant.name || `Variant ${variant.id}`} - ${variant.price}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

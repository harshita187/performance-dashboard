"use client";

import { memo, useCallback } from "react";

interface FilterPanelProps {
  categories: string[];
  selectedCategories: string[];
  onCategoryToggle: (category: string) => void;
}

function FilterPanelComponent({
  categories,
  selectedCategories,
  onCategoryToggle,
}: FilterPanelProps) {
  const handleToggle = useCallback(
    (category: string) => {
      onCategoryToggle(category);
    },
    [onCategoryToggle]
  );

  return (
    <div className="filter-panel">
      <h3 className="filter-panel-title">Filter by Category</h3>
      <div className="filter-categories">
        {categories.map((category) => {
          const isSelected = selectedCategories.includes(category);
          return (
            <label key={category} className="filter-checkbox">
              <input
                type="checkbox"
                checked={isSelected}
                onChange={() => handleToggle(category)}
              />
              <span>{category}</span>
            </label>
          );
        })}
      </div>
    </div>
  );
}

export const FilterPanel = memo(FilterPanelComponent);

'use client';

import React from 'react';

interface FilterBarProps {
  searchQuery: string;
  onSearchChange: (val: string) => void;
  sort: string;
  onSortChange: (val: string) => void;
  onReset: () => void;
}

export default function FilterBar({
  searchQuery,
  onSearchChange,
  sort,
  onSortChange,
  onReset,
}: FilterBarProps) {
  return (
    <div className="filters-card-unified">
      <div className="filter-search-box">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="11" cy="11" r="8"></circle>
          <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
        </svg>
        <input
          type="text"
          id="filter-search-input"
          placeholder="Search servers by name, tag, or language..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>

      <div className="filter-controls-group">
        <div className="select-wrapper">
          <select
            id="sort-select"
            className="styled-filter-select"
            value={sort}
            onChange={(e) => onSortChange(e.target.value)}
          >
            <option value="votes">Most Votes</option>
            <option value="players">Most Players</option>
            <option value="uptime">Best Uptime</option>
          </select>
        </div>
        <button
          type="button"
          className="btn-filter-reset"
          id="btn-reset-filters"
          onClick={onReset}
        >
          RESET
        </button>
      </div>
    </div>
  );
}

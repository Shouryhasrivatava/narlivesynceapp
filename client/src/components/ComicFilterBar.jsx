import React from 'react';
import { LayoutGrid, List, SlidersHorizontal, Sparkles } from 'lucide-react';
import { soundFx } from '../utils/audio';

export const categories = [
  { id: 'All', label: 'ALL ISSUES', icon: '⚡' },
  { id: 'Scoop', label: 'DAILY SCOOP', icon: '📰' },
  { id: 'Hero Log', label: 'HERO LOGS', icon: '🕸️' },
  { id: 'Villain Alert', label: 'VILLAIN ALERT', icon: '🚨' },
  { id: 'Tech & Gear', label: 'TECH & GEAR', icon: '🧪' },
  { id: 'Multiverse', label: 'MULTIVERSE', icon: '🌌' },
];

export const ComicFilterBar = ({
  activeCategory,
  onSelectCategory,
  activeSort,
  onSelectSort,
  viewMode,
  onToggleViewMode,
  totalPosts
}) => {
  return (
    <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 mb-6 pb-4 border-b-3 border-spidey-black">
      {/* Category Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-none">
        {categories.map((cat) => {
          const isActive = activeCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => {
                soundFx.playPop();
                onSelectCategory(cat.id);
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 font-headline text-sm md:text-base border-3 border-spidey-black whitespace-nowrap transition-all select-none ${
                isActive
                  ? 'bg-spidey-red text-white shadow-comic -translate-y-1 rotate-[-1deg]'
                  : 'bg-white text-spidey-black hover:bg-yellow-100 shadow-comic-sm'
              }`}
            >
              <span>{cat.icon}</span>
              <span>{cat.label}</span>
            </button>
          );
        })}
      </div>

      {/* Sorting & Layout Toggle */}
      <div className="flex items-center justify-between sm:justify-end gap-3">
        {/* Sort selector */}
        <div className="flex items-center gap-2 bg-white px-2 py-1 border-3 border-spidey-black shadow-comic-sm">
          <SlidersHorizontal className="w-4 h-4 text-spidey-black" />
          <select
            value={activeSort}
            onChange={(e) => {
              soundFx.playPop();
              onSelectSort(e.target.value);
            }}
            aria-label="Sort issues by"
            className="font-headline text-sm text-spidey-black bg-transparent focus:outline-none cursor-pointer uppercase"
          >
            <option value="latest">LATEST STORIES</option>
            <option value="popular">TOP RATED / POPULAR</option>
            <option value="oldest">EARLIEST ARCHIVES</option>
          </select>
        </div>

        {/* View Toggle */}
        <div className="flex items-center border-3 border-spidey-black bg-white shadow-comic-sm">
          <button
            onClick={() => {
              soundFx.playPop();
              onToggleViewMode('grid');
            }}
            title="Comic Panels Grid View"
            aria-label="Comic Panels Grid View"
            className={`p-1.5 transition-colors ${
              viewMode === 'grid'
                ? 'bg-spidey-yellow text-spidey-black'
                : 'text-gray-500 hover:text-black'
            }`}
          >
            <LayoutGrid className="w-5 h-5 stroke-[2.5]" />
          </button>
          <div className="w-[2px] h-6 bg-black" />
          <button
            onClick={() => {
              soundFx.playPop();
              onToggleViewMode('list');
            }}
            title="Newspaper List View"
            aria-label="Newspaper List View"
            className={`p-1.5 transition-colors ${
              viewMode === 'list'
                ? 'bg-spidey-yellow text-spidey-black'
                : 'text-gray-500 hover:text-black'
            }`}
          >
            <List className="w-5 h-5 stroke-[2.5]" />
          </button>
        </div>
      </div>
    </div>
  );
};

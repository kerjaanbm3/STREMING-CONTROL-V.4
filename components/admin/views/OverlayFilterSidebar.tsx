import React, { useState } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';

const FilterSection = ({ title, options, defaultOpen = true }: { title: string, options: string[], defaultOpen?: boolean }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const [showAll, setShowAll] = useState(false);

  const displayOptions = showAll ? options : options.slice(0, 10);

  return (
    <div className="flex flex-col border-b border-zinc-800/60">
      <div className="flex w-full items-center gap-2 py-2">
        <h3 className="flex min-w-0 flex-1">
          <button 
            type="button" 
            onClick={() => setIsOpen(!isOpen)}
            className="flex w-full cursor-pointer items-center gap-2 text-left leading-[1.6] font-semibold hover:opacity-80 active:opacity-60 text-sm text-zinc-200"
          >
            <span className="inline-flex h-5 w-5 shrink-0 items-center justify-center opacity-80">
              {/* Using simple dot or icon for section */}
              <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
            </span>
            <span className="min-w-0 flex-1 truncate">{title}</span>
            {isOpen ? <ChevronDown className="h-4 w-4 opacity-80" /> : <ChevronRight className="h-4 w-4 opacity-80" />}
          </button>
        </h3>
      </div>
      
      {isOpen && (
        <div className="flex flex-col pt-1 pb-3">
          {displayOptions.map((opt, i) => (
            <button key={i} type="button" className="text-zinc-300 flex w-full cursor-pointer items-center gap-3 text-left py-1 text-sm leading-[1.6] font-normal opacity-90 hover:opacity-100 hover:bg-zinc-800/50 px-2 rounded">
              <span className="inline-flex h-4 w-4 shrink-0 items-center justify-center border border-zinc-700 rounded-sm"></span>
              <span className="truncate">{opt}</span>
            </button>
          ))}
          {options.length > 10 && (
            <button 
              type="button" 
              onClick={() => setShowAll(!showAll)}
              className="text-blue-400 flex cursor-pointer items-center gap-2 self-start hover:opacity-80 mt-1 text-xs font-bold px-2"
            >
              {showAll ? 'Less' : 'More...'}
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export const OverlayFilterSidebar = () => {
  return (
    <div className="w-64 h-full flex-shrink-0 flex flex-col select-none bg-[#0d0d11] border-r border-[#1e1e24] p-4 hidden md:flex">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-white text-lg font-bold">Filters</h2>
      </div>
      <div className="flex flex-1 flex-col overflow-y-auto pr-2 custom-scrollbar">
        <FilterSection 
          title="Category" 
          options={['Sport', 'Podcast', 'Game', 'Weather', 'News', 'Holiday', 'Business & Finance', 'Art & Design', 'Education', 'Spiritual']} 
        />
        <FilterSection 
          title="Features" 
          options={['Custom Fonts']} 
        />
        <FilterSection 
          title="Type" 
          options={['Baseline', 'Bug', 'Camera Border', 'Counter', 'Fullscreen', 'Image Loop', 'Lower Third', 'Package', 'Panel', 'Scoreboard', 'Ticker', 'Live', 'Countdown', 'Title Bar', 'Effects', 'Talking Points', 'Matchup', 'Lineup', 'Leaderboard', 'Schedule', 'Statistics']} 
          defaultOpen={false}
        />
        <FilterSection 
          title="Layout" 
          options={['Landscape (16:9)', 'Portrait (9:16)', 'Square (1:1)']} 
          defaultOpen={false}
        />
        <FilterSection 
          title="Theme" 
          options={['Standard', 'Bold', 'Champion', 'Fresh', 'Olympic', 'Pyrite', 'Air', 'Clean', 'Glide', 'Sociable', 'Headline', 'Slant', 'Lithium', 'Lunar', 'Nitrogen']} 
          defaultOpen={false}
        />
        <FilterSection 
          title="Data Source" 
          options={['Crypto.com', 'Google Sheet', 'Manual', 'National Weather Service', 'RSS', 'Scorebird', 'Streams Charts', 'YouTube', 'weatherapi.com']} 
          defaultOpen={false}
        />
      </div>
    </div>
  );
};

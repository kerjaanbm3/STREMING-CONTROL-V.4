import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';

interface AccordionSectionProps {
  title: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}

export function AccordionSection({ title, defaultOpen = true, children }: AccordionSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <section className="w-full rounded-lg border border-[#23232b] shadow-sm text-zinc-100 overflow-visible mb-6 bg-[#121216]">
      <div 
        className="w-full flex items-stretch gap-3 bg-[#1a1a24] transition-colors duration-150 cursor-pointer hover:bg-[#23232b] pl-2.5 sm:pl-3 py-2 min-h-[52px] rounded-t-lg border-b border-[#23232b]"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex-1 min-w-0 min-h-9 flex flex-wrap items-center gap-x-3 gap-y-1.5 py-0.5">
          <span className="flex flex-1 items-center gap-2 min-w-24 overflow-hidden select-none font-medium">
            <span className="truncate min-w-0">{title}</span>
          </span>
        </div>
        <div className="flex items-center shrink-0 min-h-9">
          <button 
            type="button" 
            className="shrink-0 cursor-pointer px-3 self-stretch flex items-center justify-center focus:outline-none"
          >
            <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
          </button>
        </div>
      </div>
      
      {isOpen && (
        <div className="overflow-hidden rounded-b-lg bg-[#121216] p-3 grid items-center grid-cols-[auto_1fr] gap-3 md:gap-4">
          {children}
        </div>
      )}
    </section>
  );
}

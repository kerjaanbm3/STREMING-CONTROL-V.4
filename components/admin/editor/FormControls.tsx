import React from 'react';
import { ChevronDown, FolderOpen } from 'lucide-react';

interface BaseControlProps {
  label: string;
}

export function TextInputControl({ label, value = '', onChange }: BaseControlProps & { value?: string, onChange?: (val: string) => void }) {
  return (
    <div className="grid grid-cols-[auto_1fr] items-center gap-3 md:gap-4 col-span-2">
      <div className="relative block max-w-[45cqw] @md:max-w-[30cqw] min-w-0">
        <label className="text-sm font-medium text-zinc-400 truncate block w-full">
          {label}
        </label>
      </div>
      <div className="min-w-0">
        <input 
          className="rounded-md border px-3 py-[9px] text-base leading-5 transition-colors border-[#30303d] bg-[#1a1a24] text-zinc-100 hover:bg-[#23232b] hover:border-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full" 
          type="text" 
          value={value}
          onChange={(e) => onChange?.(e.target.value)}
        />
      </div>
    </div>
  );
}

export function ColorPickerControl({ label, value = '#ffffff', onChange }: BaseControlProps & { value?: string, onChange?: (val: string) => void }) {
  return (
    <div className="grid grid-cols-[auto_1fr] items-center gap-3 md:gap-4 col-span-2">
      <div className="relative block max-w-[45cqw] @md:max-w-[30cqw] min-w-0">
        <label className="text-sm font-medium text-zinc-400 truncate block w-full">
          {label}
        </label>
      </div>
      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <div className="relative flex overflow-hidden rounded-md border border-[#30303d] w-10 h-10 shrink-0">
            <input 
              type="color"
              className="absolute -inset-2 w-14 h-14 cursor-pointer"
              value={value}
              onChange={(e) => onChange?.(e.target.value)}
              title="Open color picker"
            />
          </div>
          <input 
            className="rounded-md border px-3 py-[9px] text-base leading-5 transition-colors border-[#30303d] bg-[#1a1a24] text-zinc-100 hover:bg-[#23232b] hover:border-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500 flex-1 min-w-0" 
            type="text" 
            value={value}
            onChange={(e) => onChange?.(e.target.value)}
          />
        </div>
      </div>
    </div>
  );
}

export function ToggleControl({ label, checked = false, onChange }: BaseControlProps & { checked?: boolean, onChange?: (val: boolean) => void }) {
  return (
    <div className="grid grid-cols-[auto_1fr] items-center gap-3 md:gap-4 col-span-2">
      <div className="relative block max-w-[45cqw] @md:max-w-[30cqw] min-w-0">
        <label className="text-sm font-medium text-zinc-400 truncate block w-full">
          {label}
        </label>
      </div>
      <div className="min-w-0">
        <button 
          type="button" 
          onClick={() => onChange?.(!checked)}
          className={`relative flex items-center justify-center overflow-hidden h-9 w-20 rounded-lg p-2 gap-2 cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${checked ? 'bg-gradient-to-br from-orange-500 to-amber-500' : 'bg-[#30303d]'}`}
        >
          <span className="relative z-10 font-bold text-white leading-none whitespace-nowrap text-xs">
            {checked ? 'ON' : 'OFF'}
          </span>
          <span className={`absolute top-1/2 -translate-y-[45%] z-10 block h-5 w-2 rounded-full transition-all duration-200 ease-in-out ${checked ? 'bg-orange-600 left-1.5 translate-x-[3.75rem]' : 'bg-white/30 left-1.5'}`} />
        </button>
      </div>
    </div>
  );
}

export function SelectControl({ label, value, options = [], onChange }: BaseControlProps & { value?: string, options?: string[], onChange?: (val: string) => void }) {
  return (
    <div className="grid grid-cols-[auto_1fr] items-center gap-3 md:gap-4 col-span-2">
      <div className="relative block max-w-[45cqw] @md:max-w-[30cqw] min-w-0">
        <label className="text-sm font-medium text-zinc-400 truncate block w-full">
          {label}
        </label>
      </div>
      <div className="min-w-0">
        <div className="relative">
          <select 
            value={value}
            onChange={(e) => onChange?.(e.target.value)}
            className="group rounded-md border px-3 py-[9px] text-base leading-5 transition-colors border-[#30303d] bg-[#1a1a24] text-zinc-100 hover:bg-[#23232b] hover:border-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full relative text-left shadow-sm cursor-pointer appearance-none"
          >
            <option value={value || ''}>{value || 'Select...'}</option>
            {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
          </select>
          <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center text-zinc-500 pr-3">
            <ChevronDown className="w-4 h-4 transition-transform duration-200" />
          </span>
        </div>
      </div>
    </div>
  );
}

export function NumberControl({ label, value = 0, onChange }: BaseControlProps & { value?: number, onChange?: (val: number) => void }) {
  return (
    <div className="grid grid-cols-[auto_1fr] items-center gap-3 md:gap-4 col-span-2">
      <div className="relative block max-w-[45cqw] @md:max-w-[30cqw] min-w-0">
        <label className="text-sm font-medium text-zinc-400 truncate block w-full">
          {label}
        </label>
      </div>
      <div className="min-w-0">
        <div className="inline-flex items-center gap-2">
          <button 
            type="button" 
            onClick={() => onChange?.(value - 1)}
            className="inline-flex items-center justify-center w-10 h-10 rounded-full shrink-0 cursor-pointer select-none transition-colors bg-[#1a1a24] border border-[#30303d] text-zinc-100 hover:bg-[#23232b] hover:border-zinc-500 text-lg"
          >
            −
          </button>
          <div className="inline-flex items-center h-10 rounded-md border px-3 text-base border-[#30303d] bg-[#1a1a24] text-zinc-100 max-w-24 focus-within:ring-2 focus-within:ring-blue-500">
            <input 
              className="flex-1 min-w-0 bg-transparent text-center outline-none border-none w-full"
              type="text" 
              value={value}
              onChange={(e) => onChange?.(Number(e.target.value) || 0)}
            />
          </div>
          <button 
            type="button" 
            onClick={() => onChange?.(value + 1)}
            className="inline-flex items-center justify-center w-10 h-10 rounded-full shrink-0 cursor-pointer select-none transition-colors bg-[#1a1a24] border border-[#30303d] text-zinc-100 hover:bg-[#23232b] hover:border-zinc-500 text-lg"
          >
            +
          </button>
        </div>
      </div>
    </div>
  );
}

export function ImageControl({ label, fileName }: BaseControlProps & { fileName?: string }) {
  return (
    <div className="grid grid-cols-[auto_1fr] items-center gap-3 md:gap-4 col-span-2">
      <div className="relative block max-w-[45cqw] @md:max-w-[30cqw] min-w-0">
        <label className="text-sm font-medium text-zinc-400 truncate block w-full">
          {label}
        </label>
      </div>
      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <div className="flex-1 min-w-0">
            <button className="inline-flex items-center justify-start gap-2 text-sm font-medium transition-colors rounded-md border border-[#30303d] bg-[#1a1a24] text-zinc-100 hover:bg-[#23232b] hover:border-zinc-500 h-10 px-3 w-full truncate cursor-pointer">
              <span className="truncate">{fileName || 'Choose image...'}</span>
            </button>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button className="flex h-10 w-10 items-center justify-center rounded-md border transition-all bg-[#1a1a24] border-[#30303d] text-zinc-400 hover:bg-[#23232b] hover:text-white cursor-pointer" title="Browse images">
              <FolderOpen className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

import React from 'react';
import {
  Monitor,
  Camera,
  Gamepad2,
  KeyRound,
  CircleHelp,
  Settings,
  ChevronUp,
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/router';

interface EditorHeaderProps {
  title: string;
}

export function EditorHeader({ title }: EditorHeaderProps) {
  const router = useRouter();
  
  return (
    <div className="h-[70px] shrink-0 px-4 bg-[#121216] border-b border-[#23232b] select-none relative flex items-center overflow-visible z-50">
      {/* Back button or Logo placeholder */}
      <button 
        onClick={() => router.push('/admin')}
        className="text-zinc-400 hover:text-white transition-colors mr-4"
        title="Back to Dashboard"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-arrow-left"><path d="m12 19-7-7 7-7"/><path d="M19 12H5"/></svg>
      </button>
      
      {/* Branding */}
      <div className="flex items-center">
        <div className="w-[30px] h-[30px] bg-blue-600 rounded flex items-center justify-center font-bold text-white text-xs">
          ST
        </div>
      </div>
      
      {/* Title */}
      <div className="text-zinc-100 text-[16px] ml-4 mr-2.5 text-ellipsis whitespace-nowrap overflow-hidden">
        {title}
      </div>
      
      <span className="mx-auto">&nbsp;</span>
      
      {/* Actions (Desktop) */}
      <div className="hidden md:flex items-center">
        
        {/* Copy Output URL */}
        <div className="relative inline-block" title="Copy Output URL">
          <button className="border-none cursor-pointer transition-colors text-xs rounded-full w-10 h-10 flex items-center justify-center focus:outline-none bg-[#1a1a24] text-zinc-400 hover:bg-zinc-800 hover:text-white ml-1.5">
            <Monitor className="w-5 h-5" />
          </button>
        </div>
        
        {/* Output Settings */}
        <div className="relative inline-block ml-2">
          <button className="focus:outline-none bg-[#1a1a24] border border-[#30303d] text-zinc-300 px-4 py-2 rounded-full text-[13px] font-medium cursor-pointer transition-colors hover:bg-zinc-800 hover:text-white whitespace-nowrap">
            Output settings
          </button>
        </div>
        
        {/* Generate Screenshot */}
        <div className="relative inline-block ml-1.5" title="Generate Screenshot">
          <button className="border-none cursor-pointer transition-colors text-xs rounded-full w-10 h-10 flex items-center justify-center focus:outline-none bg-[#1a1a24] text-zinc-400 hover:bg-zinc-800 hover:text-white">
            <Camera className="w-5 h-5" />
          </button>
        </div>
        
        <div className="w-px h-5 bg-[#30303d] mx-2"></div>
        
        {/* Copy Control URL */}
        <div className="relative inline-block" title="Copy Control URL">
          <button className="border-none cursor-pointer transition-colors text-xs rounded-full w-10 h-10 flex items-center justify-center focus:outline-none bg-[#1a1a24] text-zinc-400 hover:bg-zinc-800 hover:text-white">
            <Gamepad2 className="w-5 h-5" />
          </button>
        </div>
        
        <div className="w-px h-5 bg-[#30303d] mx-2"></div>
        
        <div className="flex gap-2">
          {/* Copy Token */}
          <div className="relative inline-block" title="Copy Token">
            <button className="border-none cursor-pointer transition-colors text-xs rounded-full w-10 h-10 flex items-center justify-center focus:outline-none bg-[#1a1a24] text-zinc-400 hover:bg-zinc-800 hover:text-white">
              <KeyRound className="w-5 h-5" />
            </button>
          </div>
          
          {/* Help */}
          <div className="relative inline-block" title="Open help">
            <button className="border-none cursor-pointer transition-colors text-xs rounded-full w-10 h-10 flex items-center justify-center focus:outline-none bg-[#1a1a24] text-zinc-400 hover:bg-zinc-800 hover:text-white">
              <CircleHelp className="w-5 h-5" />
            </button>
          </div>
        </div>
        
        <div className="w-px h-5 bg-[#30303d] mx-2"></div>
        
        {/* Settings */}
        <div className="relative inline-block mr-1.5" title="Settings">
          <button className="border-none cursor-pointer transition-colors text-xs rounded-full w-10 h-10 flex items-center justify-center focus:outline-none bg-[#1a1a24] text-zinc-400 hover:bg-zinc-800 hover:text-white">
            <Settings className="w-5 h-5" />
          </button>
        </div>
        
        {/* Hide Preview */}
        <div className="relative inline-block" title="Hide Preview">
          <button className="border-none cursor-pointer transition-colors text-xs rounded-full w-10 h-10 flex items-center justify-center focus:outline-none bg-[#1a1a24] text-zinc-400 hover:bg-zinc-800 hover:text-white">
            <ChevronUp className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}

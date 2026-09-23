import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { EditorHeader } from '@/components/admin/editor/EditorHeader';
import { AccordionSection } from '@/components/admin/editor/AccordionSection';
import { 
  TextInputControl, 
  ColorPickerControl, 
  ToggleControl, 
  SelectControl, 
  NumberControl, 
  ImageControl 
} from '@/components/admin/editor/FormControls';
import { ChevronLeft, ChevronRight, ChevronUp, List } from 'lucide-react';

export default function OverlayEditor() {
  const router = useRouter();
  const { id } = router.query;
  const [activeTab, setActiveTab] = useState<'info' | 'customize'>('customize');
  
  // Dummy overlay state to simulate loading data
  const [overlayData, setOverlayData] = useState<any>(null);

  // Editor configuration state
  const [settings, setSettings] = useState({
    color1: '#f5f5f5',
    textColor1: '#0e0e0e',
    color2: '#e1e6ec',
    textColor2: '#0e0e0e',
    numThrows: '10 Throws',
    switchPlayer: false,
    logosActive: true,
    glossEffect: true,
    p1Name: 'WILLIAMS',
    p1Color: '#004697',
    p1LogoBase: '#002960',
    p1LogoFit: 'Contain',
    p2Name: 'JONES',
    p2Color: '#810000',
    p2LogoBase: '#4d0000',
    p2LogoFit: 'Contain',
    hPos: -0.1,
    vPos: -5,
    width: 75,
    height: 20
  });

  const updateSetting = (key: keyof typeof settings, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  useEffect(() => {
    if (id) {
      fetch('/api/overlays')
        .then(res => res.json())
        .then(data => {
            if (data.success && data.overlays) {
                const found = data.overlays.find((o: any) => o.id === id);
                if (found) {
                    setOverlayData({
                        id: found.id,
                        title: found.title,
                        url: found.path, 
                    });
                } else {
                    setOverlayData({
                        id,
                        title: "Overlay Details",
                        url: "/placeholder-preview",
                    });
                }
            }
        })
        .catch(err => console.error(err));
    }
  }, [id]);

  // Post message to iframe whenever settings change
  useEffect(() => {
    const iframe = document.getElementById('preview-iframe') as HTMLIFrameElement;
    if (iframe && iframe.contentWindow) {
      iframe.contentWindow.postMessage({
        type: 'UPDATE_OVERLAY_SETTINGS',
        payload: settings
      }, '*');
    }
  }, [settings]);

  // Resize logic
  const [iframeHeight, setIframeHeight] = useState(400);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      
      const newHeight = Math.max(100, Math.min(e.clientY - 60, window.innerHeight - 200));
      setIframeHeight(newHeight);
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      document.body.style.cursor = 'default';
    };

    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = 'ns-resize';
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging]);

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  if (!overlayData) {
    return <div className="min-h-screen bg-black flex items-center justify-center text-white">Loading...</div>;
  }

  return (
    <div className="h-dvh overflow-hidden bg-black flex flex-col font-sans">
      <Head>
        <title>{overlayData.title} - Editor</title>
      </Head>

      {/* Top Header */}
      <EditorHeader title={overlayData.title} />

      {/* Main Split Content */}
      <main className="relative flex-1 flex flex-col min-h-0">
        {/* Top Pane: Iframe Preview */}
        <div 
          style={{ height: iframeHeight }}
          className="relative shrink-0 bg-black flex items-center justify-center select-none overflow-hidden"
        >
          {isDragging && <div className="absolute inset-0 z-50 pointer-events-auto cursor-ns-resize" />}
          <iframe 
            id="preview-iframe"
            src={overlayData.url}
            className="absolute inset-0 w-full h-full border-0 transition-opacity duration-300 opacity-100" 
            title="Preview"
          />
        </div>

        {/* Resizer handle */}
        <div 
          onMouseDown={handleMouseDown}
          className="relative h-4 -mt-1.5 cursor-ns-resize z-10 group transition-colors duration-200 flex items-center justify-center select-none"
        >
          <div className={`absolute left-0 right-0 top-1/2 -translate-y-1/2 h-1 transition-colors duration-200 ${isDragging ? 'bg-purple-500/50' : 'bg-zinc-800/30 group-hover:bg-purple-500/50'}`}></div>
          <div className={`w-8 h-0.5 rounded-full transition-colors duration-200 relative z-10 ${isDragging ? 'bg-orange-500' : 'bg-zinc-600 group-hover:bg-orange-500'}`}></div>
        </div>

        {/* Bottom Pane: Tabs & Form */}
        <div className="flex-1 flex flex-col min-h-0 bg-[#0c0c0e] border-t border-[#23232b]">
          
          {/* Tabs Header */}
          <div className="flex items-center justify-between bg-[#121216] px-3 shrink-0">
            <button className="text-zinc-500 hover:text-white transition-colors p-2 disabled:opacity-40" disabled>
              <ChevronLeft className="w-4 h-4" />
            </button>
            <div className="flex justify-center flex-1 overflow-hidden">
              <div className="flex gap-1 overflow-x-auto overflow-y-hidden w-full no-scrollbar items-center justify-center">
                
                <button 
                  onClick={() => setActiveTab('info')}
                  className={`relative px-[22px] py-[13px] text-[13px] leading-5 whitespace-nowrap transition-colors group outline-none ${activeTab === 'info' ? 'text-white' : 'text-zinc-400 hover:text-white'}`}
                >
                  <span>Axe Throwing Scoreboard</span>
                  {activeTab === 'info' && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 transition-opacity opacity-100 bg-gradient-to-r from-orange-500 to-amber-400" />
                  )}
                  {activeTab !== 'info' && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 transition-opacity opacity-0 group-hover:opacity-100 bg-[#30303d]" />
                  )}
                </button>
                
                <button 
                  onClick={() => setActiveTab('customize')}
                  className={`relative px-[22px] py-[13px] text-[13px] leading-5 whitespace-nowrap transition-colors group outline-none ${activeTab === 'customize' ? 'text-white' : 'text-zinc-400 hover:text-white'}`}
                >
                  <span>Customize</span>
                  {activeTab === 'customize' && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 transition-opacity opacity-100 bg-gradient-to-r from-orange-500 to-amber-400" />
                  )}
                  {activeTab !== 'customize' && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 transition-opacity opacity-0 group-hover:opacity-100 bg-[#30303d]" />
                  )}
                </button>
                
              </div>
            </div>
            <button className="text-zinc-500 hover:text-white transition-colors p-2 disabled:opacity-40" disabled>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Tab Content Area */}
          <div className="flex-1 overflow-y-auto no-scrollbar relative">
            
            {activeTab === 'customize' && (
              <div className="px-4 md:px-6 flex flex-col items-center">
                <div className="w-full max-w-2xl py-4 md:py-6 flex flex-col">
                  
                  {/* Customize Header */}
                  <div className="sticky top-0 z-20 bg-[#0c0c0e] flex items-center pt-2 pb-3 mb-2">
                    <div className="flex-1"></div>
                    <h2 className="text-lg font-semibold text-white">Customize Overlay</h2>
                    <div className="flex-1 flex justify-end">
                      <button className="border border-[#30303d] text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors rounded-full w-10 h-10 flex items-center justify-center bg-[#1a1a24]">
                        <ChevronUp className="w-5 h-5" />
                      </button>
                    </div>
                  </div>

                  {/* Accordions */}
                  <div className="flex-1 pb-10">
                    <AccordionSection title="Color Palette">
                      <ColorPickerControl label="Color 1" value={settings.color1} onChange={(val) => updateSetting('color1', val)} />
                      <ColorPickerControl label="Text Color 1" value={settings.textColor1} onChange={(val) => updateSetting('textColor1', val)} />
                      <ColorPickerControl label="Color 2" value={settings.color2} onChange={(val) => updateSetting('color2', val)} />
                      <ColorPickerControl label="Text Color 2" value={settings.textColor2} onChange={(val) => updateSetting('textColor2', val)} />
                    </AccordionSection>

                    <AccordionSection title="General">
                      <SelectControl label="Number of Throws" value={settings.numThrows} options={['5 Throws', '10 Throws', '15 Throws']} onChange={(val) => updateSetting('numThrows', val)} />
                      <ToggleControl label="Switch Player" checked={settings.switchPlayer} onChange={(val) => updateSetting('switchPlayer', val)} />
                      <ToggleControl label="Logos Active" checked={settings.logosActive} onChange={(val) => updateSetting('logosActive', val)} />
                      <ToggleControl label="Gloss Effect" checked={settings.glossEffect} onChange={(val) => updateSetting('glossEffect', val)} />
                    </AccordionSection>

                    <AccordionSection title="Player 1" defaultOpen={false}>
                      <TextInputControl label="Name" value={settings.p1Name} onChange={(val) => updateSetting('p1Name', val)} />
                      <ColorPickerControl label="Color" value={settings.p1Color} onChange={(val) => updateSetting('p1Color', val)} />
                      <ImageControl label="Logo" fileName="UK flag-button-round.png" />
                      <ColorPickerControl label="Logo Base" value={settings.p1LogoBase} onChange={(val) => updateSetting('p1LogoBase', val)} />
                      <SelectControl label="Logo Fit" value={settings.p1LogoFit} options={['Contain', 'Cover', 'Fill']} onChange={(val) => updateSetting('p1LogoFit', val)} />
                    </AccordionSection>
                    
                    <AccordionSection title="Player 2" defaultOpen={false}>
                      <TextInputControl label="Name" value={settings.p2Name} onChange={(val) => updateSetting('p2Name', val)} />
                      <ColorPickerControl label="Color" value={settings.p2Color} onChange={(val) => updateSetting('p2Color', val)} />
                      <ImageControl label="Logo" fileName="USA flag-button-round.png" />
                      <ColorPickerControl label="Logo Base" value={settings.p2LogoBase} onChange={(val) => updateSetting('p2LogoBase', val)} />
                      <SelectControl label="Logo Fit" value={settings.p2LogoFit} options={['Contain', 'Cover', 'Fill']} onChange={(val) => updateSetting('p2LogoFit', val)} />
                    </AccordionSection>

                    <AccordionSection title="Layout" defaultOpen={false}>
                      <NumberControl label="Horizontal Position" value={settings.hPos} onChange={(val) => updateSetting('hPos', val)} />
                      <NumberControl label="Vertical Position" value={settings.vPos} onChange={(val) => updateSetting('vPos', val)} />
                      <NumberControl label="Width" value={settings.width} onChange={(val) => updateSetting('width', val)} />
                      <NumberControl label="Height" value={settings.height} onChange={(val) => updateSetting('height', val)} />
                    </AccordionSection>
                  </div>

                </div>
              </div>
            )}
            
            {activeTab === 'info' && (
              <div className="px-4 md:px-6 flex flex-col items-center">
                <div className="w-full max-w-2xl py-4 md:py-6 flex flex-col">
                  <div className="sticky top-0 z-20 bg-[#0c0c0e] flex items-center justify-between pt-2 pb-3 mb-2">
                    <h2 className="text-lg font-semibold text-white">Axe Throwing Scoreboard</h2>
                    <div className="flex gap-2">
                      <ToggleControl label="" checked={true} />
                      <button className="border border-[#30303d] text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors rounded-full w-10 h-10 flex items-center justify-center bg-[#1a1a24]">
                        <ChevronUp className="w-5 h-5" />
                      </button>
                      <button className="border border-[#30303d] text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors rounded-full w-10 h-10 flex items-center justify-center bg-[#1a1a24]">
                        <List className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                  
                  <div className="flex-1 pb-10">
                     <AccordionSection title="Title">
                      <TextInputControl label="Title" value="TOTAL SCORE" />
                      <ToggleControl label="Rounds Won" checked={true} />
                    </AccordionSection>
                    <AccordionSection title="Player 1 Data">
                      <SelectControl label="Rounds" value="1" />
                      <SelectControl label="Throw 1" value="4" />
                      <SelectControl label="Throw 2" value="1" />
                    </AccordionSection>
                  </div>
                </div>
              </div>
            )}

          </div>
        </div>
      </main>

    </div>
  );
}

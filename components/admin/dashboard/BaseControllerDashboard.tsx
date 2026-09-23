import React, { useState, useEffect } from 'react';
import { GripVertical, X, ArrowRightLeft, Save, Trash2, ChevronLeft, ChevronRight, Edit3 } from 'lucide-react';

export interface CardDefinition {
  type: string;
  label: string;
  icon: React.ReactNode;
  render: () => React.ReactNode;
}

export interface LayoutItem {
  type: string;
  size: number; // 12, 6, 4, 3
}

export interface Template {
  id: string;
  name: string;
  layout: LayoutItem[];
}

interface BaseControllerDashboardProps {
  cards: CardDefinition[];
  storageKey: string;
  defaultLayout?: LayoutItem[];
}

export const BaseControllerDashboard: React.FC<BaseControllerDashboardProps> = ({
  cards,
  storageKey,
  defaultLayout = []
}) => {
  const [layout, setLayout] = useState<LayoutItem[]>(defaultLayout);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [templateName, setTemplateName] = useState('');
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragHoverIndex, setDragHoverIndex] = useState<number | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem(storageKey);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Backwards compatibility migration
        const migratedTemplates = parsed.map((t: any) => ({
          ...t,
          layout: t.layout.map((item: any) => 
            typeof item === 'string' ? { type: item, size: 12 } : { ...item, size: item.size === 1 || item.size === 2 ? (item.size === 1 ? 6 : 12) : item.size }
          )
        }));
        setTemplates(migratedTemplates);
      } catch (e) {
        console.error('Failed to parse templates', e);
      }
    }
  }, [storageKey]);

  const saveTemplatesToLocal = (newTemplates: Template[]) => {
    localStorage.setItem(storageKey, JSON.stringify(newTemplates));
    setTemplates(newTemplates);
  };

  const handleSaveTemplate = () => {
    if (!templateName.trim() || layout.length === 0) return;
    const newTemplate: Template = {
      id: Date.now().toString(),
      name: templateName,
      layout: [...layout],
    };
    saveTemplatesToLocal([...templates, newTemplate]);
    setTemplateName('');
  };

  const handleUpdateTemplate = (id: string) => {
    const updated = templates.map(t => {
      if (t.id === id) {
        return { ...t, layout: [...layout] };
      }
      return t;
    });
    saveTemplatesToLocal(updated);
  };

  const handleDeleteTemplate = (id: string) => {
    saveTemplatesToLocal(templates.filter(t => t.id !== id));
  };

  const addCard = (type: string) => {
    if (!layout.find(item => item.type === type)) {
      setLayout([...layout, { type, size: 12 }]);
    }
  };

  const removeCard = (index: number) => {
    const newLayout = [...layout];
    newLayout.splice(index, 1);
    setLayout(newLayout);
  };

  const toggleSize = (index: number) => {
    const newLayout = [...layout];
    const currentSize = newLayout[index].size;
    
    let nextSize = 12;
    if (currentSize === 12) nextSize = 6;
    else if (currentSize === 6) nextSize = 4;
    else if (currentSize === 4) nextSize = 3;
    else if (currentSize === 3) nextSize = 12;
    
    newLayout[index].size = nextSize;
    setLayout(newLayout);
  };

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
    setTimeout(() => {
      if (e.target instanceof HTMLElement) e.target.style.opacity = '0.4';
    }, 0);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;
    setDragHoverIndex(index);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragHoverIndex(null);
  };

  const handleDrop = (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault();
    setDragHoverIndex(null);
    if (draggedIndex === null || draggedIndex === targetIndex) {
      setDraggedIndex(null);
      return;
    }
    
    const newLayout = [...layout];
    const draggedItem = newLayout.splice(draggedIndex, 1)[0];
    newLayout.splice(targetIndex, 0, draggedItem);
    
    setLayout(newLayout);
    setDraggedIndex(null);
  };

  const handleDragEnd = (e: React.DragEvent) => {
    setDraggedIndex(null);
    if (e.target instanceof HTMLElement) e.target.style.opacity = '1';
  };

  return (
    <div className="relative min-h-full font-sans flex overflow-hidden">
      {/* MAIN DASHBOARD */}
      <div className={`flex-1 min-card p-3 bg-[#09090b]/90 border transition-all border-blue-500/30 rounded-xl space-y-4 ${isSidebarOpen ? 'mr-72' : ''}`}>
        
        {/* TEMPLATE CONTROLS */}
        <div className="bg-[#121620] p-3 rounded-lg border border-[#242e44] flex flex-wrap gap-4 items-center justify-between">
          <div className="flex items-center gap-2">
             <span className="text-xs font-bold text-slate-400">CONTROLLER LAYOUT</span>
          </div>
          <div className="flex items-center gap-2">
            <select 
              onChange={(e) => {
                if (e.target.value) {
                  const t = templates.find(t => t.id === e.target.value);
                  if (t) setLayout(t.layout);
                  e.target.value = '';
                }
              }}
              className="bg-[#0a0d14] text-xs font-bold text-slate-300 border border-[#1e2535] rounded px-2 py-1 outline-none focus:border-blue-500"
              defaultValue=""
            >
              <option value="" disabled>Load Template...</option>
              {templates.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>
            <div className="flex items-center gap-1">
              <input type="text" value={templateName} onChange={(e) => setTemplateName(e.target.value)} placeholder="Save name..." className="bg-[#0a0d14] text-xs text-white border border-[#1e2535] rounded px-2 py-1 w-28 outline-none focus:border-blue-500" />
              <button onClick={handleSaveTemplate} className="p-1 rounded bg-emerald-600/20 text-emerald-400 hover:bg-emerald-600/40 transition-colors" title="Save New Template"><Save className="w-4 h-4" /></button>
            </div>
          </div>
        </div>

        {/* DRAG AND DROP LAYOUT AREA */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 min-h-[300px]">
          {layout.length === 0 && (
            <div className="col-span-1 md:col-span-12 p-8 text-center text-slate-500 text-sm font-bold border border-dashed border-[#1e2535] rounded-xl">
              Layout kosong. Tambahkan card dari sidebar dikanan.
            </div>
          )}
          
          {layout.map((item, index) => {
            const cardDef = cards.find(c => c.type === item.type);
            if (!cardDef) return null;

            // Map sizes to explicit Tailwind classes
            const colSpanClass = {
              12: 'md:col-span-12',
              6: 'md:col-span-6',
              4: 'md:col-span-4',
              3: 'md:col-span-3',
            }[item.size] || 'md:col-span-12';

            const isHovered = dragHoverIndex === index;
            const hoverStyles = isHovered ? 'ring-2 ring-blue-500 scale-[1.02] shadow-2xl shadow-blue-500/20 z-10' : '';

            return (
              <div key={item.type} draggable onDragStart={(e) => handleDragStart(e, index)} onDragOver={(e) => handleDragOver(e, index)} onDragLeave={handleDragLeave} onDrop={(e) => handleDrop(e, index)} onDragEnd={handleDragEnd} className={`col-span-1 ${colSpanClass} studio-box p-4 rounded-lg bg-[#11151f] border border-[#1e2535] group cursor-grab active:cursor-grabbing transition-all duration-300 ${hoverStyles}`}>
                <div className="flex items-center justify-between mb-4 pb-2 border-b border-[#1e2535]">
                  <div className="flex items-center gap-2">
                    <div className="text-slate-500 group-hover:text-slate-300 transition-colors"><GripVertical className="w-4 h-4" /></div>
                    <h2 className="font-heading font-black text-sm text-slate-100 uppercase flex items-center gap-2">
                      {cardDef.icon}<span>{cardDef.label}</span>
                    </h2>
                  </div>
                  <div className="flex items-center gap-1">
                    <button onClick={() => toggleSize(index)} className="text-slate-500 hover:text-blue-400 transition-colors p-1" title="Cycle Size (100% -> 50% -> 33% -> 25%)"><ArrowRightLeft className="w-3.5 h-3.5" /></button>
                    <button onClick={() => removeCard(index)} className="text-slate-500 hover:text-red-400 transition-colors p-1" title="Remove Widget"><X className="w-4 h-4" /></button>
                  </div>
                </div>
                <div className="cursor-default" onDragStart={(e) => { e.preventDefault(); e.stopPropagation(); }}>
                  {cardDef.render()}
                </div>
              </div>
            );
          })}
        </div>
        
        {templates.length > 0 && (
          <div className="pt-2 flex flex-wrap gap-2">
            {templates.map(t => (
              <span key={t.id} className="text-[10px] flex items-center gap-1 bg-[#181d2a] px-2 py-0.5 rounded border border-[#1e2535] text-slate-400">
                {t.name} 
                <button onClick={() => handleUpdateTemplate(t.id)} className="hover:text-blue-400 ml-1 transition-colors" title="Update/Overwrite this template with current layout"><Edit3 className="w-3 h-3" /></button>
                <button onClick={() => handleDeleteTemplate(t.id)} className="hover:text-red-400 transition-colors" title="Delete template"><Trash2 className="w-3 h-3" /></button>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* FLOATING SIDEBAR TOGGLE BUTTON */}
      {!isSidebarOpen && (
        <button 
          onClick={() => setIsSidebarOpen(true)}
          className="absolute right-0 top-1/2 -translate-y-1/2 bg-blue-600 hover:bg-blue-500 text-white p-2 rounded-l-lg shadow-lg border-y border-l border-blue-500 transition-colors z-40"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
      )}

      {/* RIGHT SIDEBAR CATALOG */}
      <div className={`fixed right-0 top-[110px] bottom-6 w-72 bg-[#09090b] border-l border-[#1e2535] shadow-2xl transition-transform duration-300 z-30 ${isSidebarOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="p-4 border-b border-[#1e2535] flex items-center justify-between bg-[#0e1219]">
          <h3 className="font-heading font-black text-sm text-white uppercase tracking-wider">Widget Catalog</h3>
          <button onClick={() => setIsSidebarOpen(false)} className="text-slate-400 hover:text-white p-1 rounded hover:bg-white/10 transition-colors">
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
        <div className="p-4 space-y-3 overflow-y-auto h-[calc(100%-60px)] custom-scrollbar">
          {cards.map(card => {
            const isAdded = layout.some(item => item.type === card.type);
            return (
              <div key={card.type} className="bg-[#121620] p-3 rounded-lg border border-[#242e44] flex items-center justify-between">
                <div className="flex items-center gap-2 text-slate-300 text-xs font-bold">
                  {card.icon} {card.label}
                </div>
                <button
                  disabled={isAdded}
                  onClick={() => addCard(card.type)}
                  className={`p-1.5 rounded-md transition-colors ${
                    isAdded ? 'bg-[#181d2a] text-slate-600 cursor-not-allowed' : 'bg-blue-600/20 text-blue-400 border border-blue-500/40 hover:bg-blue-600/40'
                  }`}
                  title={isAdded ? 'Widget sudah ada di layar' : 'Tambahkan ke layar'}
                >
                  <span className="font-bold text-[10px]">+</span>
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

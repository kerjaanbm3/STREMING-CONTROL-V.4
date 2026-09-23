import React, { useRef } from 'react';
import { useSocket } from '@/hooks/useSocket';
import { Download, Upload, FileUp, X, FileText } from 'lucide-react';

interface DataImportExportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DataImportExportModal: React.FC<DataImportExportModalProps> = ({ isOpen, onClose }) => {
  const { triggerAlert } = useSocket();
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const fileContent = event.target?.result as string;
        
        const response = await fetch('/api/upload-overlay', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            fileName: file.name,
            fileContent
          })
        });

        const data = await response.json();

        if (data.success) {
          triggerAlert({
            type: 'CUSTOM',
            title: 'OVERLAY UPLOADED',
            subtitle: `Channel ${file.name} berhasil didaftarkan.`,
            durationMs: 4000
          });
          onClose();
          setTimeout(() => {
            window.location.reload();
          }, 1500);
        } else {
          triggerAlert({
            type: 'CUSTOM',
            title: 'UPLOAD FAILED',
            subtitle: data.message || 'Terjadi kesalahan.',
            durationMs: 4000
          });
        }
      } catch (error) {
        console.error('Error uploading file:', error);
        triggerAlert({
          type: 'CUSTOM',
          title: 'ERROR',
          subtitle: 'Gagal mengunggah file.',
          durationMs: 4000
        });
      }
    };
    reader.readAsText(file);
    
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleDownloadGuide = () => {
    const guideText = `============================================================
PANDUAN PEMBUATAN CUSTOM OVERLAY (REACT / TSX)
============================================================

1. Struktur File
Semua file overlay harus dibuat menggunakan format .tsx (TypeScript React).

2. Akses Data Real-time
Gunakan hook \`useSocket\` untuk mendapatkan state dari controller:
\`import { useSocket } from '@/hooks/useSocket';\`

Lalu di dalam komponen Anda:
\`const { state } = useSocket();\`

3. Background Transparan
Pastikan elemen terluar Anda tidak memiliki warna latar belakang (atau gunakan \`bg-transparent\`)
agar video dari OBS/vMix bisa terlihat.

4. Format UI & Animasi
Aplikasi ini sudah dilengkapi Tailwind CSS dan GSAP/Framer Motion. 
Gunakan library animasi tersebut untuk membuat transisi yang keren!`;
    
    // Membuat file teks (.txt) langsung di browser
    const blob = new Blob([guideText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'Panduan_Custom_Overlay.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-2xl bg-[#121216] border border-[#23232b] rounded-2xl p-5 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
        
        <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-blue-400">
              <Upload className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-heading font-black text-sm text-white uppercase">Import Custom Overlay Channels</h3>
              <p className="text-[11px] text-zinc-400 mt-0.5">Unduh panduan pembuatan, atau unggah file overlay React (.tsx) baru.</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 gap-3">
          <div className="p-3.5 rounded-xl bg-[#18181f] border border-zinc-800/80 flex flex-col justify-between space-y-2">
            <div>
              <div className="flex items-center gap-2 text-xs font-mono font-bold text-blue-400">
                <Download className="w-3.5 h-3.5" />
                <span>UNDUH PANDUAN</span>
              </div>
              <p className="text-[11px] text-zinc-400 mt-1">Dapatkan panduan teks (.txt) tentang cara membuat file .tsx untuk overlay custom.</p>
            </div>
            <button onClick={handleDownloadGuide} className="px-3 py-1.5 rounded-lg text-xs font-bold bg-[#20202a] hover:bg-[#282836] border border-zinc-700 text-zinc-200 flex items-center justify-center gap-1.5 transition-all cursor-pointer">
              <FileText className="w-3.5 h-3.5 text-blue-400" />
              <span>Unduh Guide .TXT</span>
            </button>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-[#18181f] border border-dashed border-zinc-700 space-y-3 text-center">
          <input 
            type="file" 
            accept=".tsx,.ts" 
            className="hidden" 
            ref={fileInputRef} 
            onChange={handleImport}
          />
          <div className="w-10 h-10 rounded-full bg-blue-600/10 border border-blue-500/20 text-blue-400 mx-auto flex items-center justify-center">
            <Upload className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs font-bold text-white block">Pilih file React komponen yang akan di-import (.TSX atau .TS)</span>
            <span className="text-[10px] font-mono text-zinc-500 mt-0.5 block">Pastikan file berisi komponen valid dan terhubung dengan useSocket.</span>
          </div>
          <button onClick={triggerFileInput} type="button" className="px-4 py-2 rounded-lg text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white shadow-sm transition-all cursor-pointer inline-flex items-center gap-2 mx-auto">
            <FileUp className="w-4 h-4" />
            <span>Pilih File .TSX</span>
          </button>
        </div>

        <div className="flex items-center justify-end gap-2 pt-3 border-t border-zinc-800">
          <button onClick={onClose} type="button" className="px-3 py-1.5 rounded-lg text-xs font-bold text-zinc-400 hover:text-white bg-[#18181e] hover:bg-[#22222a] border border-zinc-800 transition-colors cursor-pointer">
            Tutup
          </button>
        </div>
        
      </div>
    </div>
  );
};

import React, { useRef, useState } from 'react';
import * as XLSX from 'xlsx';
import { useSocket } from '@/hooks/useSocket';
import { Download, Upload, FileUp, X, FileText, FileSpreadsheet, AlertTriangle } from 'lucide-react';

interface EventImportExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportSuccess: () => void;
}

export const EventImportExportModal: React.FC<EventImportExportModalProps> = ({ isOpen, onClose, onImportSuccess }) => {
  const { triggerAlert } = useSocket();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // State for handling conflict resolution
  const [conflictData, setConflictData] = useState<{
    pendingPayload: any;
    message: string;
    existingEventId: string;
  } | null>(null);
  
  const [isUploading, setIsUploading] = useState(false);

  if (!isOpen) return null;

  const processImport = async (payload: any, action?: 'OVERWRITE' | 'CREATE_NEW') => {
    setIsUploading(true);
    try {
      const body = {
        ...payload,
        action // Only passed if resolving conflict
      };

      const response = await fetch('/api/events/import', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body)
      });

      const data = await response.json();

      if (response.status === 409 && data.error === 'EventConflict') {
        // Event exists, prompt user
        setConflictData({
          pendingPayload: payload,
          message: data.message,
          existingEventId: data.existingEventId
        });
      } else if (data.success) {
        triggerAlert({
          type: 'CUSTOM',
          title: 'EVENT IMPORTED',
          subtitle: `Event ${data.event.name} berhasil diimport.`,
          durationMs: 4000
        });
        setConflictData(null);
        onClose();
        onImportSuccess();
      } else {
        triggerAlert({
          type: 'CUSTOM',
          title: 'IMPORT FAILED',
          subtitle: data.error || 'Terjadi kesalahan.',
          durationMs: 4000
        });
        setConflictData(null);
      }
    } catch (error) {
      console.error('Error importing event:', error);
      triggerAlert({
        type: 'CUSTOM',
        title: 'ERROR',
        subtitle: 'Gagal mengimpor event.',
        durationMs: 4000
      });
      setConflictData(null);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const data = new Uint8Array(event.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        
        const payload: any = {
          eventData: {},
          teamsData: [],
          playersData: [],
          matchesData: []
        };

        // Parse Event Sheet
        if (workbook.Sheets['Event']) {
          const eventRows: any[] = XLSX.utils.sheet_to_json(workbook.Sheets['Event']);
          if (eventRows.length > 0) payload.eventData = eventRows[0];
        }

        // Parse Teams Sheet
        if (workbook.Sheets['Teams']) {
          payload.teamsData = XLSX.utils.sheet_to_json(workbook.Sheets['Teams']);
        }

        // Parse Players Sheet
        if (workbook.Sheets['Players']) {
          payload.playersData = XLSX.utils.sheet_to_json(workbook.Sheets['Players']);
        }

        // Parse Matches Sheet
        if (workbook.Sheets['Matches']) {
          payload.matchesData = XLSX.utils.sheet_to_json(workbook.Sheets['Matches']);
        }

        if (!payload.eventData || !payload.eventData.Name) {
           triggerAlert({
            type: 'CUSTOM',
            title: 'FORMAT SALAH',
            subtitle: 'Sheet "Event" atau kolom "Name" tidak ditemukan',
            durationMs: 4000
          });
          return;
        }

        // Map Title Case to proper keys for backend if needed, or backend can handle it
        payload.eventData = {
          name: payload.eventData.Name,
          category: payload.eventData.Category,
          subType: payload.eventData.SubType,
          bracketFormat: payload.eventData.BracketFormat,
          bracketSize: payload.eventData.BracketSize,
          location: payload.eventData.Location,
        };

        await processImport(payload);

      } catch (error) {
        console.error('Error parsing Excel:', error);
        triggerAlert({
          type: 'CUSTOM',
          title: 'ERROR',
          subtitle: 'Gagal membaca file Excel',
          durationMs: 4000
        });
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const handleDownloadTemplate = () => {
    const workbook = XLSX.utils.book_new();

    // 0. Guide Sheet
    const guideData = [
      {
        "PANDUAN PENGISIAN": "PENTING: Jangan ubah nama header (baris pertama) pada sheet manapun.",
        "KETERANGAN": "Jangan menghapus atau mengubah nama sheet (Event, Teams, Players, Matches)."
      },
      { "PANDUAN PENGISIAN": "1. SHEET: Event", "KETERANGAN": "" },
      { "PANDUAN PENGISIAN": "- Name", "KETERANGAN": "(Wajib) Nama acara (contoh: TURNAMEN BOLA TARKAM 2026)" },
      { "PANDUAN PENGISIAN": "- Category", "KETERANGAN": "SPORT, ESPORT, GENERAL, atau MULTI_EVENT" },
      { "PANDUAN PENGISIAN": "- SubType", "KETERANGAN": "FOOTBALL, FUTSAL, VOLLEYBALL, BADMINTON, BASKETBALL, MLBB, PUBG_MOBILE, FREE_FIRE, VALORANT, dll." },
      { "PANDUAN PENGISIAN": "- BracketFormat", "KETERANGAN": "SINGLE_ELIMINATION, DOUBLE_ELIMINATION, atau ROUND_ROBIN" },
      { "PANDUAN PENGISIAN": "- BracketSize", "KETERANGAN": "Jumlah tim dalam bracket (contoh: 8, 16, 32)" },
      { "PANDUAN PENGISIAN": "- Location", "KETERANGAN": "Tempat acara berlangsung" },
      { "PANDUAN PENGISIAN": "", "KETERANGAN": "" },
      { "PANDUAN PENGISIAN": "2. SHEET: Teams", "KETERANGAN": "" },
      { "PANDUAN PENGISIAN": "- ID", "KETERANGAN": "(Wajib) Kode unik tim. Harus persis sama dengan yang dipakai di sheet Players & Matches (contoh: TEAM_1, T01)." },
      { "PANDUAN PENGISIAN": "- Name", "KETERANGAN": "(Wajib) Nama lengkap tim." },
      { "PANDUAN PENGISIAN": "- Institution", "KETERANGAN": "Singkatan nama tim (contoh: GRD, RMD)." },
      { "PANDUAN PENGISIAN": "- LogoUrl", "KETERANGAN": "Link/URL gambar logo tim (opsional)." },
      { "PANDUAN PENGISIAN": "", "KETERANGAN": "" },
      { "PANDUAN PENGISIAN": "3. SHEET: Players", "KETERANGAN": "" },
      { "PANDUAN PENGISIAN": "- TeamID", "KETERANGAN": "(Wajib) Masukkan ID Tim yang ada di Sheet Teams (contoh: TEAM_1)." },
      { "PANDUAN PENGISIAN": "- Name", "KETERANGAN": "(Wajib) Nama asli pemain." },
      { "PANDUAN PENGISIAN": "- IGN", "KETERANGAN": "In-Game Name / Nickname pemain (Khusus Esports)." },
      { "PANDUAN PENGISIAN": "- Role", "KETERANGAN": "Posisi/Peran (contoh: Striker, Midlaner, Coach)." },
      { "PANDUAN PENGISIAN": "- Jersey", "KETERANGAN": "Nomor punggung pemain (Khusus Olahraga)." },
      { "PANDUAN PENGISIAN": "", "KETERANGAN": "" },
      { "PANDUAN PENGISIAN": "4. SHEET: Matches", "KETERANGAN": "" },
      { "PANDUAN PENGISIAN": "- MatchNumber", "KETERANGAN": "(Wajib) Nomor urut pertandingan (contoh: 1, 2, 3)." },
      { "PANDUAN PENGISIAN": "- Round", "KETERANGAN": "Nama babak (contoh: Quarter Final, Semi Final)." },
      { "PANDUAN PENGISIAN": "- TeamAID", "KETERANGAN": "Masukkan ID Tim A dari Sheet Teams (opsional jika belum ditentukan)." },
      { "PANDUAN PENGISIAN": "- TeamBID", "KETERANGAN": "Masukkan ID Tim B dari Sheet Teams (opsional jika belum ditentukan)." },
      { "PANDUAN PENGISIAN": "- BOSeries", "KETERANGAN": "Best Of Series (contoh: 1 untuk BO1, 3 untuk BO3)." },
      { "PANDUAN PENGISIAN": "- ScheduledTime", "KETERANGAN": "Waktu jadwal pertandingan (contoh: 2026-10-01 15:30)." }
    ];
    const wsGuide = XLSX.utils.json_to_sheet(guideData);
    wsGuide['!cols'] = [{ wch: 20 }, { wch: 100 }];
    XLSX.utils.book_append_sheet(workbook, wsGuide, 'Guide');

    // 1. Event Sheet
    const eventData = [
      {
        Name: 'TURNAMEN BOLA TARKAM 2026',
        Category: 'SPORT',
        SubType: 'FOOTBALL',
        BracketFormat: 'SINGLE_ELIMINATION',
        BracketSize: 8,
        Location: 'Stadion Utama'
      }
    ];
    const wsEvent = XLSX.utils.json_to_sheet(eventData);
    wsEvent['!cols'] = [{ wch: 35 }, { wch: 15 }, { wch: 15 }, { wch: 25 }, { wch: 15 }, { wch: 30 }];
    XLSX.utils.book_append_sheet(workbook, wsEvent, 'Event');

    // 2. Teams Sheet
    const teamsData = [
      { ID: 'TEAM_1', Name: 'Garuda FC', Institution: 'GRD', LogoUrl: '' },
      { ID: 'TEAM_2', Name: 'Elang FC', Institution: 'ELG', LogoUrl: '' },
    ];
    const wsTeams = XLSX.utils.json_to_sheet(teamsData);
    wsTeams['!cols'] = [{ wch: 15 }, { wch: 30 }, { wch: 15 }, { wch: 40 }];
    XLSX.utils.book_append_sheet(workbook, wsTeams, 'Teams');

    // 3. Players Sheet
    const playersData = [
      { TeamID: 'TEAM_1', Name: 'Budi Santoso', IGN: '', Role: 'Striker', Jersey: 9 },
      { TeamID: 'TEAM_1', Name: 'Andi Saputra', IGN: '', Role: 'Keeper', Jersey: 1 },
      { TeamID: 'TEAM_2', Name: 'Riko', IGN: '', Role: 'Striker', Jersey: 10 },
    ];
    const wsPlayers = XLSX.utils.json_to_sheet(playersData);
    wsPlayers['!cols'] = [{ wch: 15 }, { wch: 30 }, { wch: 20 }, { wch: 20 }, { wch: 10 }];
    XLSX.utils.book_append_sheet(workbook, wsPlayers, 'Players');

    // 4. Matches Sheet
    const matchesData = [
      { MatchNumber: 1, Round: 'Quarter Final', TeamAID: 'TEAM_1', TeamBID: 'TEAM_2', BOSeries: 1, ScheduledTime: '2026-10-01 15:30' }
    ];
    const wsMatches = XLSX.utils.json_to_sheet(matchesData);
    wsMatches['!cols'] = [{ wch: 15 }, { wch: 25 }, { wch: 15 }, { wch: 15 }, { wch: 15 }, { wch: 25 }];
    XLSX.utils.book_append_sheet(workbook, wsMatches, 'Matches');

    XLSX.writeFile(workbook, 'BM3_Event_Import_Template.xlsx');
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
            <div className="w-8 h-8 rounded-lg bg-emerald-600/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
              <FileSpreadsheet className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-heading font-black text-sm text-white uppercase">Import Event Data (Excel)</h3>
              <p className="text-[11px] text-zinc-400 mt-0.5">Unduh template, isi dengan data (Event, Teams, Players, Matches), lalu unggah.</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>

        {conflictData ? (
          // Conflict Resolution UI
          <div className="p-5 rounded-xl bg-[#1f1710] border border-amber-900/50 space-y-4 text-center">
            <div className="w-12 h-12 rounded-full bg-amber-600/20 border border-amber-500/30 text-amber-500 mx-auto flex items-center justify-center">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white mb-1">Peringatan: Nama Event Sudah Ada</h4>
              <p className="text-xs text-amber-200/70">{conflictData.message}</p>
              <p className="text-[11px] text-zinc-400 mt-2">
                "Timpa (Overwrite)" akan menghapus event lama berserta tim/pemainnya secara permanen.
                "Ganti Nama" akan membuat event baru dengan menambahkan kode unik di akhir namanya.
              </p>
            </div>
            <div className="flex justify-center gap-3 pt-3">
              <button 
                onClick={() => processImport(conflictData.pendingPayload, 'CREATE_NEW')}
                disabled={isUploading}
                className="px-4 py-2 rounded-lg text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white transition-all disabled:opacity-50"
              >
                Ganti Nama (Buat Baru)
              </button>
              <button 
                onClick={() => processImport(conflictData.pendingPayload, 'OVERWRITE')}
                disabled={isUploading}
                className="px-4 py-2 rounded-lg text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white transition-all disabled:opacity-50"
              >
                Timpa (Overwrite)
              </button>
            </div>
            <button 
              onClick={() => setConflictData(null)}
              className="text-[10px] text-zinc-500 hover:text-zinc-300 underline mt-2"
            >
              Batal Import
            </button>
          </div>
        ) : (
          // Default Upload UI
          <>
            <div className="grid grid-cols-1 gap-3">
              <div className="p-3.5 rounded-xl bg-[#18181f] border border-zinc-800/80 flex flex-col justify-between space-y-2">
                <div>
                  <div className="flex items-center gap-2 text-xs font-mono font-bold text-emerald-400">
                    <Download className="w-3.5 h-3.5" />
                    <span>TEMPLATE EXCEL & PANDUAN</span>
                  </div>
                  <p className="text-[11px] text-zinc-400 mt-1">Gunakan file template 5 Sheet ini (Panduan, Event, Teams, Players, Matches).</p>
                </div>
                <button onClick={handleDownloadTemplate} className="px-3 py-1.5 rounded-lg text-xs font-bold bg-[#20202a] hover:bg-[#282836] border border-zinc-700 text-zinc-200 flex items-center justify-center gap-1.5 transition-all cursor-pointer">
                  <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Unduh .XLSX</span>
                </button>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-[#18181f] border border-dashed border-zinc-700 space-y-3 text-center">
              <input 
                type="file" 
                accept=".xlsx,.xls" 
                className="hidden" 
                ref={fileInputRef} 
                onChange={handleImport}
              />
              <div className="w-10 h-10 rounded-full bg-emerald-600/10 border border-emerald-500/20 text-emerald-400 mx-auto flex items-center justify-center">
                <Upload className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs font-bold text-white block">Pilih File Excel yang sudah diisi</span>
                <span className="text-[10px] font-mono text-zinc-500 mt-0.5 block">Pastikan ke-4 Sheet tidak dihapus.</span>
              </div>
              <button onClick={triggerFileInput} type="button" disabled={isUploading} className="px-4 py-2 rounded-lg text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm transition-all cursor-pointer inline-flex items-center gap-2 mx-auto disabled:opacity-50">
                <FileUp className="w-4 h-4" />
                <span>{isUploading ? 'Mengimpor...' : 'Pilih File .XLSX'}</span>
              </button>
            </div>
          </>
        )}

        <div className="flex items-center justify-end gap-2 pt-3 border-t border-zinc-800">
          <button onClick={onClose} type="button" disabled={isUploading} className="px-3 py-1.5 rounded-lg text-xs font-bold text-zinc-400 hover:text-white bg-[#18181e] hover:bg-[#22222a] border border-zinc-800 transition-colors cursor-pointer disabled:opacity-50">
            Tutup
          </button>
        </div>
        
      </div>
    </div>
  );
};

import React, { useRef } from 'react';
import * as XLSX from 'xlsx';
import { useSocket } from '@/hooks/useSocket';
import { CloudDownload, Download } from 'lucide-react';

export const ExcelImportExport: React.FC = () => {
  const { updateState, triggerAlert } = useSocket();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = new Uint8Array(event.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        
        // Membaca Sheet pertama
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const jsonData: any[] = XLSX.utils.sheet_to_json(worksheet);
        
        if (jsonData.length >= 2) {
          // Baris 1 -> Team A, Baris 2 -> Team B
          const teamA = jsonData[0];
          const teamB = jsonData[1];
          
          updateState({
            teamA: {
              id: 'team_a',
              name: teamA['Name'] || 'Team A',
              institution: teamA['ShortName'] || 'TMA',
              logoUrl: teamA['LogoUrl'] || '',
            },
            teamB: {
              id: 'team_b',
              name: teamB['Name'] || 'Team B',
              institution: teamB['ShortName'] || 'TMB',
              logoUrl: teamB['LogoUrl'] || '',
            }
          });
          
          triggerAlert({
            type: 'CUSTOM',
            title: 'EXCEL IMPORTED',
            subtitle: 'Data Tim Berhasil Diperbarui',
            durationMs: 4000
          });
        } else {
           triggerAlert({
            type: 'CUSTOM',
            title: 'IMPORT GAGAL',
            subtitle: 'Format Excel tidak sesuai',
            durationMs: 4000
          });
        }
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
    
    // Reset input agar bisa upload file yang sama lagi
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleExport = () => {
    // Data contoh (Template Excel)
    const templateData = [
      { Name: 'Tim Garuda', ShortName: 'GRD', LogoUrl: 'https://upload.wikimedia.org/wikipedia/id/5/50/Lambang_Garuda_Pancasila.svg' },
      { Name: 'Tim Elang', ShortName: 'ELG', LogoUrl: '' }
    ];
    
    const worksheet = XLSX.utils.json_to_sheet(templateData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Teams');
    XLSX.writeFile(workbook, 'BM3_Teams_Template.xlsx');
  };

  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <div className="flex gap-2">
      <input 
        type="file" 
        accept=".xlsx, .xls" 
        className="hidden" 
        ref={fileInputRef} 
        onChange={handleImport} 
      />
      {/* Tombol Import yang diminta User */}
      <button 
        onClick={triggerFileInput}
        className="px-3 py-1.5 rounded-lg font-bold text-xs flex items-center gap-1.5 text-zinc-300 bg-[#18181e] border border-zinc-800 hover:bg-[#202028] hover:text-white transition-all shadow-sm"
      >
        <CloudDownload className="w-3.5 h-3.5" />
        Import Excel
      </button>
      
      {/* Tombol tambahan untuk Download Template */}
      <button 
        onClick={handleExport}
        className="px-3 py-1.5 rounded-lg font-bold text-xs flex items-center gap-1.5 text-zinc-300 bg-[#18181e] border border-zinc-800 hover:bg-[#202028] hover:text-white transition-all shadow-sm"
      >
        <Download className="w-3.5 h-3.5" />
        Template Excel
      </button>
    </div>
  );
};

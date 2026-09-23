import React, { useState } from 'react';
import { Radio, CheckCircle2, XCircle, X, ExternalLink, ShieldCheck, HelpCircle } from 'lucide-react';

interface ObsStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
  obsConnected: boolean;
}

export const ObsStatusModal: React.FC<ObsStatusModalProps> = ({
  isOpen,
  onClose,
  obsConnected,
}) => {
  const [address, setAddress] = useState('ws://127.0.0.1:4455');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isTutorialOpen, setIsTutorialOpen] = useState(false);

  if (!isOpen) return null;

  const handleConnect = async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      const res = await fetch('/api/obs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'connect', address, password }),
      });
      const data = await res.json();
      if (!data.success) {
        setErrorMsg('Connection to OBS WebSocket failed. Check your port & password in OBS.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Network error connecting to OBS');
    } finally {
      setLoading(false);
    }
  };

  const handleDisconnect = async () => {
    setLoading(true);
    try {
      await fetch('/api/obs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'disconnect' }),
      });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="glass-panel relative rounded-2xl w-full max-w-md border border-blue-500/40 p-5 md:p-6 shadow-2xl space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Radio className="w-5 h-5 text-blue-400" />
            <h3 className="font-heading font-extrabold text-base text-white">OBS Studio WebSocket Sync</h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsTutorialOpen(true)}
              className="px-2 py-1.5 rounded-lg bg-blue-900/30 text-blue-400 hover:bg-blue-600/30 hover:text-blue-300 transition-colors flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider"
              title="Cara Menghubungkan OBS"
            >
              <HelpCircle className="w-3.5 h-3.5" />
              <span>Tutorial</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-gray-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Tutorial Popup Overlay */}
        {isTutorialOpen && (
          <div className="absolute inset-0 bg-slate-950 z-10 rounded-2xl p-5 overflow-y-auto border border-blue-500/30 flex flex-col shadow-2xl">
            <div className="flex items-center justify-between mb-4 shrink-0">
              <h4 className="font-bold text-sm text-blue-400 flex items-center gap-2 uppercase tracking-wide">
                <HelpCircle className="w-4 h-4" /> Cara Menghubungkan WebSoket OBS
              </h4>
              <button
                onClick={() => setIsTutorialOpen(false)}
                className="p-1 rounded-md hover:bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="text-[11px] text-slate-300 space-y-4 flex-1">
              <div>
                <h5 className="font-bold text-white mb-1.5">1. Opsi Pengaturan Plugin (Plugin Settings)</h5>
                <ul className="list-disc pl-4 space-y-1">
                  <li><strong>Enable WebSocket server:</strong> Opsi utama untuk menyalakan atau mematikan server WebSocket. Jika diaktifkan, OBS dapat dihubungkan dan dikontrol oleh aplikasi/perangkat dari luar.</li>
                  <li><strong>Enable System Tray Alerts:</strong> Menampilkan notifikasi atau peringatan pada sistem (system tray komputer) terkait status WebSocket.</li>
                  <li><strong>Enable Debug Logging:</strong> Mengaktifkan pencatatan log teknis secara mendalam (debug) yang berguna untuk melacak error atau masalah koneksi.</li>
                </ul>
              </div>

              <div>
                <h5 className="font-bold text-white mb-1.5">2. Opsi Pengaturan Server (Server Settings)</h5>
                <ul className="list-disc pl-4 space-y-1">
                  <li><strong>Server Port:</strong> Jalur/port jaringan yang digunakan OBS untuk komunikasi data (default: 4455).</li>
                  <li><strong>Enable Authentication:</strong> Fitur keamanan untuk mengaktifkan proteksi kata sandi, sehingga tidak sembarang aplikasi luar bisa terhubung tanpa izin.</li>
                  <li><strong>Server Password & Generate Password:</strong> Kolom untuk menentukan kata sandi koneksi, serta tombol untuk membuat kata sandi acak secara otomatis.</li>
                  <li><strong>Show Connect Info:</strong> Menampilkan rincian informasi koneksi (seperti IP address dan port) dalam bentuk QR code atau teks untuk mempermudah penyambungan perangkat lain.</li>
                </ul>
              </div>

              <div>
                <h5 className="font-bold text-white mb-1.5">3. Monitoring Sesi Terhubung (Connected WebSocket Sessions)</h5>
                <p className="mb-1 text-slate-400">Tabel untuk memantau perangkat atau aplikasi yang sedang aktif terhubung ke OBS, yang memuat data:</p>
                <ul className="list-disc pl-4 space-y-1">
                  <li><strong>Remote Address:</strong> Alamat IP perangkat yang terhubung.</li>
                  <li><strong>Session Duration:</strong> Durasi lamanya koneksi terjalin.</li>
                  <li><strong>Messages In/Out:</strong> Jumlah data/perintah yang masuk dan keluar.</li>
                  <li><strong>Identified:</strong> Status verifikasi/otentikasi koneksi.</li>
                  <li><strong>Kick?:</strong> Fitur/tombol untuk memutuskan koneksi perangkat tertentu secara paksa.</li>
                </ul>
              </div>
            </div>
            <div className="pt-3 border-t border-slate-800 mt-3 text-right shrink-0">
              <button 
                onClick={() => setIsTutorialOpen(false)}
                className="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold"
              >
                Saya Mengerti
              </button>
            </div>
          </div>
        )}

        <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center gap-3">
          {obsConnected ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
          ) : (
            <XCircle className="w-5 h-5 text-rose-400 flex-shrink-0" />
          )}
          <div>
            <div className="font-bold text-xs text-white">
              {obsConnected ? 'OBS WebSocket Connected' : 'OBS Disconnected'}
            </div>
            <div className="text-[11px] text-gray-400">
              {obsConnected
                ? 'Score and timer values are directly pushing to OBS Text Sources.'
                : 'Enable WebSocket server in OBS Studio (Tools -> WebSocket Server Settings)'}
            </div>
          </div>
        </div>

        {errorMsg && (
          <div className="p-2.5 rounded-xl bg-rose-950/60 border border-rose-800/80 text-rose-300 text-xs">
            {errorMsg}
          </div>
        )}

        <div className="space-y-3">
          <div>
            <label className="block text-[11px] font-mono text-gray-400 mb-1">Server URL</label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500 font-mono"
            />
          </div>

          <div>
            <label className="block text-[11px] font-mono text-gray-400 mb-1">Server Password (Optional)</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500 font-mono"
              placeholder="••••••••"
            />
          </div>
        </div>

        <div className="pt-2 flex items-center justify-end gap-2">
          {obsConnected ? (
            <button
              onClick={handleDisconnect}
              disabled={loading}
              className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold font-heading"
            >
              {loading ? 'Disconnecting...' : 'Disconnect'}
            </button>
          ) : (
            <button
              onClick={handleConnect}
              disabled={loading}
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold font-heading shadow-md shadow-blue-600/30"
            >
              {loading ? 'Connecting...' : 'Connect to OBS'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

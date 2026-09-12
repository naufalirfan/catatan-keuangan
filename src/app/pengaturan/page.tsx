'use client';

import React, { useState, useEffect } from 'react';
import { useFinance } from '@/context/FinanceContext';
import { testAiConnection } from '@/lib/gemini';
import { 
  Settings, 
  Sparkles, 
  Key, 
  Globe, 
  Check, 
  AlertCircle, 
  ShieldCheck, 
  Download, 
  Upload, 
  RefreshCw, 
  Trash2, 
  LogOut, 
  ExternalLink,
  Eye,
  EyeOff,
  Cloud,
  CheckCircle2,
  Server,
  FileSpreadsheet
} from 'lucide-react';
import SuperAdminMemberManager from '@/components/SuperAdminMemberManager';

export default function PengaturanPage() {
  const { 
    user, 
    isSuperAdmin,
    logout, 
    aiConfig, 
    updateAiConfig, 
    googleClientId, 
    isCloudConnected,
    exportToJson,
    exportToCsv,
    exportToExcel,
    importFromJson,
    resetToDefault
  } = useFinance();

  // Local form state for AI settings
  const [provider, setProvider] = useState<'gemini' | 'custom'>(aiConfig.provider || 'custom');
  const [geminiApiKey, setGeminiApiKey] = useState(aiConfig.geminiApiKey || '');
  const [geminiModel, setGeminiModel] = useState(aiConfig.geminiModel || 'gemini-1.5-flash');
  const [customEndpoint, setCustomEndpoint] = useState(aiConfig.customEndpoint || 'https://9router.naufalputra.my.id/v1');
  const [customAuthToken, setCustomAuthToken] = useState(aiConfig.customAuthToken || '');
  const [customModel, setCustomModel] = useState(aiConfig.customModel || 'jaa');

  const [showGeminiKey, setShowGeminiKey] = useState(false);
  const [showCustomToken, setShowCustomToken] = useState(false);

  // Synchronize state when aiConfig loads or updates
  useEffect(() => {
    setProvider(aiConfig.provider || 'custom');
    setGeminiApiKey(aiConfig.geminiApiKey || '');
    setGeminiModel(aiConfig.geminiModel || 'gemini-1.5-flash');
    setCustomEndpoint(aiConfig.customEndpoint || 'https://9router.naufalputra.my.id/v1');
    setCustomAuthToken(aiConfig.customAuthToken || '');
    setCustomModel(aiConfig.customModel || 'jaa');
  }, [aiConfig]);


  // Test state
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleSaveAiSettings = () => {
    updateAiConfig({
      provider,
      geminiApiKey: geminiApiKey.trim(),
      geminiModel,
      customEndpoint: customEndpoint.trim(),
      customAuthToken: customAuthToken.trim(),
      customModel: customModel.trim(),
    });
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  const handleTestConnection = async () => {
    setIsTesting(true);
    setTestResult(null);

    const tempConfig = {
      provider,
      geminiApiKey: geminiApiKey.trim(),
      geminiModel,
      customEndpoint: customEndpoint.trim(),
      customAuthToken: customAuthToken.trim(),
      customModel: customModel.trim(),
    };

    const res = await testAiConnection(tempConfig);
    setTestResult(res);
    setIsTesting(false);
  };

  const handleFileImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const success = importFromJson(content);
      if (success) {
        alert('Data berhasil dipulihkan dari backup JSON!');
      } else {
        alert('Format file JSON tidak valid.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="max-w-md md:max-w-xl mx-auto px-4 py-5 space-y-5">
      
      {/* Page Header */}
      <div>
        <h1 className="text-xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
          <span className="p-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
            <Settings className="w-5 h-5" />
          </span>
          Pengaturan Aplikasi
        </h1>
        <p className="text-xs text-slate-400 mt-0.5">
          Kelola token AI, akun Google, dan cadangan data
        </p>
      </div>

      {/* Member View vs Superadmin Configuration Box */}
      {!isSuperAdmin ? (
        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-600 text-white shadow-sm shadow-emerald-500/20">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                Layanan AI Cerdas Aktif ✨
              </h2>
              <p className="text-[11px] text-slate-400">
                Disediakan dan dikonfigurasi langsung oleh Superadmin
              </p>
            </div>
          </div>

          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
            Anda dapat langsung menggunakan seluruh fitur <strong>Input AI</strong> (ketik bebas bahasa Indonesia, suara, dan scan foto struk belanja) tanpa perlu repot mendaftar atau memasukkan API key sendiri.
          </p>

          <div className="flex items-center gap-2 p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/60 dark:border-emerald-800/60 text-emerald-700 dark:text-emerald-300 text-xs font-semibold">
            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
            <span>AI Ready: Nikmati kemudahan pencatatan instan!</span>
          </div>
        </div>
      ) : (
        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-600 text-white shadow-sm shadow-emerald-500/20">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                    Konfigurasi AI (Gemini & Custom)
                  </h2>
                  <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 text-[10px] font-bold border border-amber-300 dark:border-amber-700">
                    👑 Khusus Superadmin
                  </span>
                </div>
                <p className="text-[11px] text-slate-400">
                  Pilih sumber kecerdasan buatan untuk seluruh anggota/member
                </p>
              </div>
            </div>
          </div>

        {/* Provider Switcher */}
        <div className="grid grid-cols-2 gap-1.5 p-1 bg-slate-100 dark:bg-slate-800/80 rounded-2xl text-xs font-semibold">
          <button
            type="button"
            onClick={() => setProvider('gemini')}
            className={`py-2 rounded-xl flex items-center justify-center gap-1.5 transition-all ${
              provider === 'gemini'
                ? 'bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-400 shadow-sm font-bold'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            Google Gemini (Resmi)
          </button>

          <button
            type="button"
            onClick={() => setProvider('custom')}
            className={`py-2 rounded-xl flex items-center justify-center gap-1.5 transition-all ${
              provider === 'custom'
                ? 'bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-400 shadow-sm font-bold'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <Server className="w-3.5 h-3.5" />
            Custom Endpoint & Token
          </button>
        </div>

        {/* Gemini Provider Fields */}
        {provider === 'gemini' ? (
          <div className="space-y-3 pt-1">
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <label className="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                  <Key className="w-3.5 h-3.5 text-emerald-500" />
                  Gemini API Key
                </label>
                <a
                  href="https://aistudio.google.com/app/apikey"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[11px] text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-0.5"
                >
                  Dapatkan Gratis <ExternalLink className="w-3 h-3" />
                </a>
              </div>

              <div className="relative">
                <input
                  type={showGeminiKey ? 'text' : 'password'}
                  value={geminiApiKey}
                  onChange={(e) => setGeminiApiKey(e.target.value)}
                  placeholder="Contoh: AIzaSyD..."
                  className="w-full px-3 py-2.5 pr-10 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs font-mono text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
                <button
                  type="button"
                  onClick={() => setShowGeminiKey(!showGeminiKey)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showGeminiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <p className="text-[10px] text-slate-400">
                API Key disimpan secara privat di perangkat Anda.
              </p>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Model Gemini
              </label>
              <select
                value={geminiModel}
                onChange={(e) => setGeminiModel(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
              >
                <option value="gemini-1.5-flash">Gemini 1.5 Flash (Sangat Cepat & Gratis)</option>
                <option value="gemini-2.0-flash">Gemini 2.0 Flash (Generasi Terbaru)</option>
                <option value="gemini-1.5-pro">Gemini 1.5 Pro (Akurasi Tinggi)</option>
              </select>
            </div>
          </div>
        ) : (
          /* Custom Endpoint Fields */
          <div className="space-y-3 pt-1">
            <div className="flex items-center justify-between pb-0.5 flex-wrap gap-1.5">
              <span className="text-[11px] font-medium text-slate-500">Preset Rekomendasi:</span>
              <div className="flex gap-1.5">
                <button
                  type="button"
                  onClick={() => {
                    setCustomEndpoint('https://9router.naufalputra.my.id/v1');
                    setCustomModel('jaa');
                  }}
                  className="px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800/80 text-[11px] font-bold text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 transition-colors flex items-center gap-1"
                >
                  ⚡ JAA (Fast)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setCustomEndpoint('https://9router.naufalputra.my.id/v1');
                    setCustomModel('joo');
                  }}
                  className="px-2.5 py-1 rounded-lg bg-cyan-50 dark:bg-cyan-950/50 border border-cyan-200 dark:border-cyan-800/80 text-[11px] font-bold text-cyan-600 dark:text-cyan-400 hover:bg-cyan-100 dark:hover:bg-cyan-900/50 transition-colors flex items-center gap-1"
                >
                  🚀 JOO (Smart)
                </button>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                <Globe className="w-3.5 h-3.5 text-cyan-500" />
                Custom Endpoint URL
              </label>
              <input
                type="url"
                value={customEndpoint}
                onChange={(e) => setCustomEndpoint(e.target.value)}
                placeholder="https://api.openai.com/v1/chat/completions atau proxy Anda"
                className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs font-mono text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <p className="text-[10px] text-slate-400">
                Mendukung standar OpenAI / OpenRouter / Groq / Ollama / Proxy kustom.
              </p>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                <Key className="w-3.5 h-3.5 text-cyan-500" />
                Custom Bearer Token / API Key
              </label>
              <div className="relative">
                <input
                  type={showCustomToken ? 'text' : 'password'}
                  value={customAuthToken}
                  onChange={(e) => setCustomAuthToken(e.target.value)}
                  placeholder="Bearer token atau authorization key..."
                  className="w-full px-3 py-2.5 pr-10 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs font-mono text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
                <button
                  type="button"
                  onClick={() => setShowCustomToken(!showCustomToken)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showCustomToken ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Custom Model Identifier
              </label>
              <input
                type="text"
                value={customModel}
                onChange={(e) => setCustomModel(e.target.value)}
                placeholder="Contoh: gpt-4o-mini, deepseek-chat, llama-3.3-70b"
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs font-mono text-slate-900 dark:text-white"
              />
            </div>
          </div>
        )}

        {/* Test Connection Output */}
        {testResult && (
          <div className={`p-3 rounded-2xl text-xs flex items-start gap-2 ${
            testResult.success 
              ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
              : 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800'
          }`}>
            {testResult.success ? <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" /> : <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />}
            <div>
              <p className="font-bold">{testResult.success ? 'Berhasil Terhubung' : 'Koneksi Gagal'}</p>
              <p className="text-[11px] mt-0.5">{testResult.message}</p>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2 pt-1">
          <button
            type="button"
            onClick={handleTestConnection}
            disabled={isTesting}
            className="flex-1 py-2.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isTesting ? 'animate-spin' : ''}`} />
            {isTesting ? 'Menguji...' : 'Tes Koneksi'}
          </button>

          <button
            type="button"
            onClick={handleSaveAiSettings}
            className="flex-1 py-2.5 px-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-emerald-500/20 transition-all active:scale-95"
          >
            <Check className="w-3.5 h-3.5" />
            {saveSuccess ? 'Tersimpan!' : 'Simpan Pengaturan'}
          </button>
        </div>

      </div>
      )}

      {/* Account & OAuth Status Card */}
      <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-3">
        <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
          <ShieldCheck className="w-4 h-4 text-emerald-500" />
          Akun & Google OAuth
        </h2>

        {user && (
          <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50">
            <div className="flex items-center gap-3">
              {user.picture ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={user.picture}
                  alt={user.name}
                  className="w-10 h-10 rounded-full border border-emerald-500/50 object-cover"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-emerald-600 text-white font-bold text-sm flex items-center justify-center">
                  {user.name.charAt(0)}
                </div>
              )}
              <div>
                <p className="text-xs font-bold text-slate-900 dark:text-white">
                  {user.name}
                </p>
                <p className="text-[11px] text-slate-400">
                  {user.email}
                </p>
              </div>
            </div>

            <button
              onClick={logout}
              title="Keluar"
              className="p-2 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        )}

        <div className="text-[11px] text-slate-400 space-y-1">
          <div className="flex justify-between">
            <span>Google Client ID:</span>
            <span className="font-mono text-[10px] text-slate-500 truncate max-w-[180px]">
              {googleClientId || 'Belum diatur'}
            </span>
          </div>
          <div className="flex justify-between">
            <span>Cloud Database (Supabase):</span>
            <span className={`font-semibold ${isCloudConnected ? 'text-emerald-500' : 'text-slate-400'}`}>
              {isCloudConnected ? 'Terhubung (Cloud Sync)' : 'Mode Lokal (Offline)'}
            </span>
          </div>
        </div>
      </div>

      {/* Superadmin Member Management */}
      {isSuperAdmin && <SuperAdminMemberManager />}

      {/* Backup & Restore Data Card */}
      <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-3">
        <h2 className="text-sm font-bold text-slate-900 dark:text-white">
          Cadangan & Pemulihan Data
        </h2>

        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={exportToExcel}
            className="p-3 rounded-2xl bg-gradient-to-br from-emerald-500/10 via-teal-500/10 to-amber-500/10 hover:from-emerald-500/20 hover:to-amber-500/20 border border-emerald-500/30 text-left transition-all"
          >
            <div className="flex items-center justify-between mb-1">
              <FileSpreadsheet className="w-4 h-4 text-emerald-500" />
              <span className="text-[9px] font-black px-1.5 py-0.2 rounded bg-amber-500 text-slate-950">PRO</span>
            </div>
            <span className="text-xs font-bold text-slate-900 dark:text-slate-100 block">
              Ekspor Excel (.xlsx)
            </span>
            <span className="text-[10px] text-slate-500 dark:text-slate-400">
              Laporan rapi siap cetak
            </span>
          </button>

          <button
            onClick={exportToCsv}
            className="p-3 rounded-2xl bg-slate-50 hover:bg-slate-100 dark:bg-slate-800/60 dark:hover:bg-slate-800 border border-slate-200/60 dark:border-slate-700 text-left transition-colors"
          >
            <Download className="w-4 h-4 text-slate-500 mb-1" />
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
              Ekspor CSV
            </span>
            <span className="text-[10px] text-slate-400">
              Format data tabel standar
            </span>
          </button>

          <button
            onClick={exportToJson}
            className="p-3 rounded-2xl bg-slate-50 hover:bg-slate-100 dark:bg-slate-800/60 dark:hover:bg-slate-800 border border-slate-200/60 dark:border-slate-700 text-left transition-colors"
          >
            <Download className="w-4 h-4 text-blue-500 mb-1" />
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
              Cadangkan (JSON)
            </span>
            <span className="text-[10px] text-slate-400">
              Download seluruh data
            </span>
          </button>

          <label className="p-3 rounded-2xl bg-slate-50 hover:bg-slate-100 dark:bg-slate-800/60 dark:hover:bg-slate-800 border border-slate-200/60 dark:border-slate-700 text-left cursor-pointer transition-colors block">
            <Upload className="w-4 h-4 text-cyan-500 mb-1" />
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
              Pulihkan (JSON)
            </span>
            <span className="text-[10px] text-slate-400">
              Unggah file backup
            </span>
            <input
              type="file"
              accept=".json"
              onChange={handleFileImport}
              className="hidden"
            />
          </label>
        </div>

        <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
          <button
            onClick={resetToDefault}
            className="w-full py-2.5 px-3 rounded-xl text-xs font-semibold text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors flex items-center justify-center gap-1.5"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Reset Data ke Contoh Bawaan
          </button>
        </div>
      </div>

    </div>
  );
}

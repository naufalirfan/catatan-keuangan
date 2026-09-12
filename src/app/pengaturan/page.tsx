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
  FileSpreadsheet,
  Activity,
  Search,
  Plus,
  ListFilter,
  X,
  Loader2,
  Database
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
    importFromCkbakFile,
    loadNaufalBackupData,
    resetToDefault
  } = useFinance();

  // Local form state for AI settings
  const [provider, setProvider] = useState<'gemini' | 'custom'>(aiConfig.provider || 'custom');
  const [geminiKeys, setGeminiKeys] = useState<string[]>(() => {
    if (Array.isArray(aiConfig.geminiApiKeys) && aiConfig.geminiApiKeys.length > 0) {
      return aiConfig.geminiApiKeys;
    }
    return aiConfig.geminiApiKey ? [aiConfig.geminiApiKey] : [''];
  });
  const [showGeminiKeys, setShowGeminiKeys] = useState<Record<number, boolean>>({});
  const [geminiKeyStatuses, setGeminiKeyStatuses] = useState<
    Record<number, { status: 'online' | 'offline' | 'warning'; latencyMs?: number; modelsCount?: number; topModel?: string; message: string }>
  >({});
  const [isCheckingGeminiKeys, setIsCheckingGeminiKeys] = useState(false);
  const [checkingGeminiIndex, setCheckingGeminiIndex] = useState<number | null>(null);
  const [availableGeminiModels, setAvailableGeminiModels] = useState<string[]>([]);
  const [geminiModel, setGeminiModel] = useState(aiConfig.geminiModel || 'gemini-flash-latest');
  const [customEndpoint, setCustomEndpoint] = useState(aiConfig.customEndpoint || 'https://9router.naufalputra.my.id/v1');
  const [customAuthToken, setCustomAuthToken] = useState(aiConfig.customAuthToken || '');
  const [customModel, setCustomModel] = useState(aiConfig.customModel || 'joo');
  const [customFallbackModel, setCustomFallbackModel] = useState(aiConfig.customFallbackModel || 'jaa');

  const [showCustomToken, setShowCustomToken] = useState(false);
  const [isFetchingLiveModels, setIsFetchingLiveModels] = useState(false);

  // Auto fetch live models from Google if models change in the future
  const fetchLiveGeminiModels = async (keysToQuery?: string[]) => {
    const activeKeys = (keysToQuery || geminiKeys).map((k) => k.trim()).filter(Boolean);
    if (activeKeys.length === 0) return;

    setIsFetchingLiveModels(true);
    try {
      const res = await fetch('/api/ai-models', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'check-gemini-keys',
          keys: [activeKeys[0]],
        }),
      });
      const data = await res.json();
      if (Array.isArray(data.results) && Array.isArray(data.results[0]?.models) && data.results[0].models.length > 0) {
        const liveModels: string[] = data.results[0].models;
        setAvailableGeminiModels(liveModels);
        setGeminiModel((prev) => {
          if (!liveModels.includes(prev)) {
            const best = liveModels.find((m) => m === 'gemini-flash-latest') || 
                         liveModels.find((m) => m.includes('flash')) || 
                         liveModels[0];
            return best || 'gemini-flash-latest';
          }
          return prev;
        });
      }
    } catch {} finally {
      setIsFetchingLiveModels(false);
    }
  };

  // Synchronize state when aiConfig loads or updates
  useEffect(() => {
    setProvider(aiConfig.provider || 'custom');
    const keys = Array.isArray(aiConfig.geminiApiKeys) && aiConfig.geminiApiKeys.length > 0
      ? aiConfig.geminiApiKeys
      : (aiConfig.geminiApiKey ? [aiConfig.geminiApiKey] : ['']);
    setGeminiKeys(keys);

    // Auto-migrate legacy deprecated names to the evergreen gemini-flash-latest
    const rawModel = aiConfig.geminiModel || 'gemini-flash-latest';
    const cleanModel = (rawModel === 'gemini-1.5-flash' || rawModel === 'gemini-2.0-flash' || rawModel === 'gemini-2.5-flash' || rawModel === 'gemini-2.5-pro')
      ? 'gemini-flash-latest'
      : rawModel;
    setGeminiModel(cleanModel);

    setCustomEndpoint(aiConfig.customEndpoint || 'https://9router.naufalputra.my.id/v1');
    setCustomAuthToken(aiConfig.customAuthToken || '');
    setCustomModel(aiConfig.customModel || 'joo');
    setCustomFallbackModel(aiConfig.customFallbackModel || 'jaa');

    // Auto-fetch live models from Google
    if (keys[0]?.trim()) {
      fetchLiveGeminiModels(keys);
    }
  }, [aiConfig]);


  // Test state
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isImporting, setIsImporting] = useState(false);

  // Model status checker state
  const [modelStatuses, setModelStatuses] = useState<
    Record<string, { model: string; status: 'online' | 'offline' | 'warning'; latencyMs?: number; message: string }>
  >({});
  const [isCheckingModels, setIsCheckingModels] = useState(false);

  // Available models list state from server
  const [availableModels, setAvailableModels] = useState<string[]>([]);
  const [isLoadingAvailable, setIsLoadingAvailable] = useState(false);
  const [showModelPicker, setShowModelPicker] = useState(false);
  const [modelSearchQuery, setModelSearchQuery] = useState('');

  const checkModelsHealth = async () => {
    setIsCheckingModels(true);
    const modelsToCheck = [
      customModel.trim(),
      ...customFallbackModel.split(',').map((m) => m.trim()).filter(Boolean),
    ].filter((val, idx, arr) => val && arr.indexOf(val) === idx);

    if (modelsToCheck.length === 0) {
      setIsCheckingModels(false);
      return;
    }

    try {
      const res = await fetch('/api/ai-models', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'check-models-status',
          endpoint: customEndpoint.trim(),
          token: customAuthToken.trim(),
          models: modelsToCheck,
        }),
      });
      const data = await res.json();
      if (Array.isArray(data.results)) {
        const map: Record<string, { model: string; status: 'online' | 'offline' | 'warning'; latencyMs?: number; message: string }> = {};
        data.results.forEach((r: { model: string; status: 'online' | 'offline' | 'warning'; latencyMs?: number; message: string }) => {
          map[r.model] = r;
        });
        setModelStatuses(map);
      }
    } catch {}
    setIsCheckingModels(false);
  };

  const fetchAvailableModels = async () => {
    setIsLoadingAvailable(true);
    try {
      const res = await fetch('/api/ai-models', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'fetch-available-models',
          endpoint: customEndpoint.trim(),
          token: customAuthToken.trim(),
        }),
      });
      const data = await res.json();
      if (Array.isArray(data.models) && data.models.length > 0) {
        setAvailableModels(data.models);
        setShowModelPicker(true);
      } else {
        alert(data.error || 'Tidak ditemukan model atau endpoint tidak merespons.');
      }
    } catch {
      alert('Gagal menghubungi endpoint untuk mengambil daftar model.');
    }
    setIsLoadingAvailable(false);
  };

  const handleSelectAsPrimary = (modelName: string) => {
    setCustomModel(modelName);
  };

  const handleAddAsFallback = (modelName: string) => {
    const current = customFallbackModel.split(',').map((m) => m.trim()).filter(Boolean);
    if (!current.includes(modelName)) {
      current.push(modelName);
      setCustomFallbackModel(current.join(', '));
    }
  };

  const handleAddGeminiKey = () => {
    setGeminiKeys((prev) => [...prev, '']);
  };

  const handleRemoveGeminiKey = (index: number) => {
    setGeminiKeys((prev) => {
      const next = prev.filter((_, i) => i !== index);
      return next.length > 0 ? next : [''];
    });
    setGeminiKeyStatuses((prev) => {
      const next = { ...prev };
      delete next[index];
      return next;
    });
  };

  const handleGeminiKeyChange = (index: number, val: string) => {
    setGeminiKeys((prev) => {
      const next = [...prev];
      next[index] = val;
      return next;
    });
    if (geminiKeyStatuses[index]) {
      setGeminiKeyStatuses((prev) => {
        const next = { ...prev };
        delete next[index];
        return next;
      });
    }
  };

  const toggleShowGeminiKey = (index: number) => {
    setShowGeminiKeys((prev) => ({ ...prev, [index]: !prev[index] }));
  };

  const checkSingleGeminiKey = async (index: number) => {
    const key = geminiKeys[index]?.trim();
    if (!key) {
      alert('Masukkan Gemini API Key terlebih dahulu.');
      return;
    }

    setCheckingGeminiIndex(index);
    try {
      const res = await fetch('/api/ai-models', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'check-gemini-keys',
          keys: [key],
        }),
      });
      const data = await res.json();
      if (Array.isArray(data.results) && data.results[0]) {
        const r = data.results[0];
        setGeminiKeyStatuses((prev) => ({
          ...prev,
          [index]: {
            status: r.status,
            latencyMs: r.latencyMs,
            modelsCount: r.modelsCount,
            topModel: r.topModel,
            message: r.message,
          },
        }));

        if (Array.isArray(r.models) && r.models.length > 0) {
          setAvailableGeminiModels((prev) => Array.from(new Set([...prev, ...r.models])));
          if (!r.models.includes(geminiModel)) {
            const best = r.models.find((m: string) => m === 'gemini-flash-latest') || r.models.find((m: string) => m.includes('flash')) || r.models[0];
            if (best) setGeminiModel(best);
          }
        }
      }
    } catch {
      setGeminiKeyStatuses((prev) => ({
        ...prev,
        [index]: {
          status: 'offline',
          message: 'Gagal menghubungi server untuk verifikasi key',
        },
      }));
    } finally {
      setCheckingGeminiIndex(null);
    }
  };

  const checkAllGeminiKeys = async () => {
    const validIndexes: number[] = [];
    const keysToTest: string[] = [];

    geminiKeys.forEach((k, idx) => {
      if (k.trim()) {
        validIndexes.push(idx);
        keysToTest.push(k.trim());
      }
    });

    if (keysToTest.length === 0) {
      alert('Tidak ada Gemini API Key yang terisi untuk diuji.');
      return;
    }

    setIsCheckingGeminiKeys(true);
    try {
      const res = await fetch('/api/ai-models', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'check-gemini-keys',
          keys: keysToTest,
        }),
      });
      const data = await res.json();
      if (Array.isArray(data.results)) {
        const nextStatuses = { ...geminiKeyStatuses };
        const allDiscovered: string[] = [];
        data.results.forEach((r: { status: 'online' | 'offline' | 'warning'; latencyMs?: number; modelsCount?: number; topModel?: string; message: string; models?: string[] }, i: number) => {
          const originalIdx = validIndexes[i];
          if (originalIdx !== undefined) {
            nextStatuses[originalIdx] = {
              status: r.status,
              latencyMs: r.latencyMs,
              modelsCount: r.modelsCount,
              topModel: r.topModel,
              message: r.message,
            };
          }
          if (Array.isArray(r.models)) {
            allDiscovered.push(...r.models);
          }
        });
        setGeminiKeyStatuses(nextStatuses);

        if (allDiscovered.length > 0) {
          const unique = Array.from(new Set(allDiscovered));
          setAvailableGeminiModels(unique);
          if (!unique.includes(geminiModel)) {
            const best = unique.find((m: string) => m === 'gemini-flash-latest') || unique.find((m: string) => m.includes('flash')) || unique[0];
            if (best) setGeminiModel(best);
          }
        }
      }
    } catch {
      alert('Terjadi kesalahan saat memeriksa Gemini API Keys.');
    } finally {
      setIsCheckingGeminiKeys(false);
    }
  };

  const handleSaveAiSettings = () => {
    const cleanedKeys = geminiKeys.map((k) => k.trim()).filter(Boolean);
    updateAiConfig({
      provider,
      geminiApiKey: cleanedKeys[0] || '',
      geminiApiKeys: cleanedKeys,
      geminiModel,
      customEndpoint: customEndpoint.trim(),
      customAuthToken: customAuthToken.trim(),
      customModel: customModel.trim(),
      customFallbackModel: customFallbackModel.trim(),
    });
    setSaveSuccess(true);
    setTestResult({
      success: true,
      message:
        provider === 'gemini'
          ? `Pengaturan disimpan! AI sekarang AKTIF menggunakan Google Gemini (${geminiModel}) dengan ${cleanedKeys.length} token terdaftar.`
          : `Pengaturan disimpan! AI sekarang AKTIF menggunakan Custom Endpoint (${customModel || 'jaa'}).`,
    });
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleTestConnection = async () => {
    setIsTesting(true);
    setTestResult(null);

    const cleanedKeys = geminiKeys.map((k) => k.trim()).filter(Boolean);
    const tempConfig = {
      provider,
      geminiApiKey: cleanedKeys[0] || '',
      geminiApiKeys: cleanedKeys,
      geminiModel,
      customEndpoint: customEndpoint.trim(),
      customAuthToken: customAuthToken.trim(),
      customModel: customModel.trim(),
      customFallbackModel: customFallbackModel.trim(),
    };

    // Jalankan test AI sekaligus cek status kesehatan token / model
    const [res] = await Promise.all([
      testAiConnection(tempConfig),
      provider === 'gemini' ? checkAllGeminiKeys() : checkModelsHealth(),
    ]);

    if (res.success && res.usedModel && provider === 'gemini') {
      setGeminiModel(res.usedModel);
      updateAiConfig({ geminiModel: res.usedModel });
    }

    setTestResult(res);
    setIsTesting(false);
  };

  const handleFileImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const lowerName = file.name.toLowerCase();

    if (lowerName.endsWith('.ckbak')) {
      setIsImporting(true);
      try {
        const res = await importFromCkbakFile(file);
        alert(res.message);
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Gagal memproses file .ckbak';
        alert(msg);
      } finally {
        setIsImporting(false);
        e.target.value = '';
      }
      return;
    }

    if (lowerName.endsWith('.json')) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target?.result as string;
        const success = importFromJson(content);
        if (success) {
          alert('Data berhasil dipulihkan dari backup JSON!');
        } else {
          alert('Format file JSON tidak valid.');
        }
        e.target.value = '';
      };
      reader.readAsText(file);
      return;
    }

    alert('Format file tidak didukung. Harap pilih file cadangan .json atau .ckbak.');
    e.target.value = '';
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
            onClick={() => {
              setProvider('gemini');
              setTestResult(null);
            }}
            className={`py-2 px-2 rounded-xl flex items-center justify-center gap-1.5 transition-all relative ${
              provider === 'gemini'
                ? 'bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-400 shadow-sm font-bold'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">Google Gemini (Resmi)</span>
            {aiConfig.provider === 'gemini' && (
              <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 font-extrabold border border-emerald-300 dark:border-emerald-700 shrink-0">
                Aktif
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => {
              setProvider('custom');
              setTestResult(null);
            }}
            className={`py-2 px-2 rounded-xl flex items-center justify-center gap-1.5 transition-all relative ${
              provider === 'custom'
                ? 'bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-400 shadow-sm font-bold'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <Server className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">Custom Endpoint</span>
            {aiConfig.provider === 'custom' && (
              <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 font-extrabold border border-emerald-300 dark:border-emerald-700 shrink-0">
                Aktif
              </span>
            )}
          </button>
        </div>

        {/* Gemini Provider Fields */}
        {provider === 'gemini' ? (
          <div className="space-y-4 pt-1">
            {/* Header with Title and "Tes Semua Token" */}
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                  <Key className="w-3.5 h-3.5 text-emerald-500" />
                  Daftar Gemini API Key (Multi-Token)
                </label>
                <p className="text-[10px] text-slate-400">
                  Mendukung banyak token. Jika Token 1 kena limit 429, otomatis berganti ke Token cadangan berikutnya.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={checkAllGeminiKeys}
                  disabled={isCheckingGeminiKeys || geminiKeys.every((k) => !k.trim())}
                  className="px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 text-[11px] font-semibold text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 transition-colors flex items-center gap-1 disabled:opacity-50"
                  title="Uji semua API Key yang telah dimasukkan"
                >
                  {isCheckingGeminiKeys ? (
                    <Loader2 className="w-3 h-3 animate-spin text-emerald-600" />
                  ) : (
                    <Activity className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                  )}
                  Tes Semua Token
                </button>
                <a
                  href="https://aistudio.google.com/app/apikey"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[11px] text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-0.5"
                >
                  Dapatkan Key Gratis <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>

            {/* List of Token Inputs */}
            <div className="space-y-2.5">
              {geminiKeys.map((keyVal, idx) => {
                const statusInfo = geminiKeyStatuses[idx];
                const isThisChecking = checkingGeminiIndex === idx;
                const isPrimary = idx === 0;

                return (
                  <div
                    key={idx}
                    className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/40 space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          isPrimary
                            ? 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800'
                            : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700'
                        }`}>
                          {isPrimary ? '🔑 Token #1 (Utama)' : `🔁 Token #${idx + 1} (Cadangan / Fallback)`}
                        </span>

                        {/* Status Badge */}
                        {statusInfo && (
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold ${
                            statusInfo.status === 'online'
                              ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800'
                              : statusInfo.status === 'warning'
                              ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-300 dark:border-amber-800'
                              : 'bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-300 dark:border-rose-800'
                          }`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${
                              statusInfo.status === 'online'
                                ? 'bg-emerald-500 animate-pulse'
                                : statusInfo.status === 'warning'
                                ? 'bg-amber-500'
                                : 'bg-rose-500'
                            }`} />
                            {statusInfo.status === 'online'
                              ? `Online (${statusInfo.latencyMs}ms)`
                              : statusInfo.status === 'warning'
                              ? 'Perhatian'
                              : 'Tidak Aktif / Error'}
                          </span>
                        )}
                      </div>

                      {/* Action buttons on the right */}
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => checkSingleGeminiKey(idx)}
                          disabled={isThisChecking || !keyVal.trim()}
                          className="px-2 py-1 rounded-md bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[10px] font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors flex items-center gap-1 disabled:opacity-40"
                          title="Tes hanya token ini"
                        >
                          {isThisChecking ? (
                            <Loader2 className="w-2.5 h-2.5 animate-spin text-emerald-500" />
                          ) : (
                            <CheckCircle2 className="w-2.5 h-2.5 text-emerald-500" />
                          )}
                          Tes Token
                        </button>

                        {geminiKeys.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveGeminiKey(idx)}
                            className="p-1 rounded-md text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors"
                            title="Hapus token ini"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="relative">
                      <input
                        type={showGeminiKeys[idx] ? 'text' : 'password'}
                        value={keyVal}
                        onChange={(e) => handleGeminiKeyChange(idx, e.target.value)}
                        placeholder={`Masukkan Gemini API Key #${idx + 1} (AIzaSy...)`}
                        className="w-full px-3 py-2 pr-10 rounded-xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs font-mono text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                      <button
                        type="button"
                        onClick={() => toggleShowGeminiKey(idx)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                        title={showGeminiKeys[idx] ? 'Sembunyikan' : 'Lihat'}
                      >
                        {showGeminiKeys[idx] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>

                    {/* Status diagnostic message if tested */}
                    {statusInfo && (
                      <p className={`text-[10px] font-medium ${
                        statusInfo.status === 'online'
                          ? 'text-emerald-600 dark:text-emerald-400'
                          : statusInfo.status === 'warning'
                          ? 'text-amber-600 dark:text-amber-400'
                          : 'text-rose-600 dark:text-rose-400'
                      }`}>
                        {statusInfo.status === 'online' ? '✓ ' : '✕ '}
                        {statusInfo.message}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Button to Add More Gemini API Keys */}
            <button
              type="button"
              onClick={handleAddGeminiKey}
              className="w-full py-2.5 px-3 rounded-xl border border-dashed border-emerald-300 dark:border-emerald-800 hover:border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              Tambah Token Gemini Cadangan (Fallback)
            </button>

            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Model Gemini (Auto-Fetch Aktif & Gratis)
                </label>
                <button
                  type="button"
                  onClick={() => fetchLiveGeminiModels()}
                  disabled={isFetchingLiveModels || geminiKeys.every((k) => !k.trim())}
                  className="text-[11px] text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1 font-medium disabled:opacity-50"
                  title="Ambil ulang daftar model terbaru dari server Google"
                >
                  <RefreshCw className={`w-3 h-3 ${isFetchingLiveModels ? 'animate-spin' : ''}`} />
                  Auto-Refresh Model
                </button>
              </div>

              <select
                value={geminiModel}
                onChange={(e) => setGeminiModel(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs font-mono text-slate-900 dark:text-white"
              >
                {availableGeminiModels.length > 0 ? (
                  availableGeminiModels.map((m) => (
                    <option key={m} value={m}>
                      {m} {m === geminiModel ? '★ (Aktif)' : ''}
                    </option>
                  ))
                ) : (
                  <>
                    <option value="gemini-flash-latest">gemini-flash-latest ★ (Paling Stabil & Gratis - Rekomendasi)</option>
                    <option value="gemini-flash-lite-latest">gemini-flash-lite-latest (Ultra Cepat & Ringan)</option>
                    <option value="gemini-3-flash-preview">gemini-3-flash-preview (Generasi Terbaru)</option>
                    <option value="gemini-3.1-flash-lite">gemini-3.1-flash-lite</option>
                    <option value="gemini-pro-latest">gemini-pro-latest (Akurasi Maksimal)</option>
                  </>
                )}
              </select>
            </div>

            <p className="text-[10px] text-amber-600 dark:text-amber-400">
              💡 <b>Tips Penting</b>: Pastikan membuat API Key melalui <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="underline font-bold">Google AI Studio</a> (bukan Google Cloud Console biasa) agar model Gemini 1.5 Flash langsung aktif gratis tanpa perlu setel project Cloud. Anda bisa menambahkan beberapa API Key dari akun Google yang berbeda untuk kuota gratis berlipat ganda!
            </p>
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

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Custom Model Identifier (Model Utama)
                </label>
                {/* Status Badge Model Utama */}
                {modelStatuses[customModel.trim()] && (
                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold ${
                    modelStatuses[customModel.trim()].status === 'online'
                      ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800'
                      : 'bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-300 dark:border-rose-800'
                  }`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${
                      modelStatuses[customModel.trim()].status === 'online' ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'
                    }`} />
                    {modelStatuses[customModel.trim()].status === 'online' ? '🟢 Online' : '🔴 Mati/Offline'}
                    {modelStatuses[customModel.trim()].latencyMs ? ` (${modelStatuses[customModel.trim()].latencyMs}ms)` : ''}
                  </span>
                )}
              </div>
              <input
                type="text"
                value={customModel}
                onChange={(e) => setCustomModel(e.target.value)}
                placeholder="Contoh: joo, gpt-4o-mini, deepseek-chat"
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs font-mono text-slate-900 dark:text-white"
              />
              {modelStatuses[customModel.trim()]?.status === 'offline' && (
                <p className="text-[10px] text-rose-500 font-medium">
                  ⚠️ {modelStatuses[customModel.trim()].message}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                  Fallback Models (Cadangan Otomatis)
                </label>
                <span className="text-[10px] text-slate-400">Pisahkan dengan koma</span>
              </div>
              <input
                type="text"
                value={customFallbackModel}
                onChange={(e) => setCustomFallbackModel(e.target.value)}
                placeholder="Contoh: jaa, af/google/gemini-2.5-flash"
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs font-mono text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />

              {/* Status List untuk Model Fallback */}
              <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                {customFallbackModel
                  .split(',')
                  .map((m) => m.trim())
                  .filter(Boolean)
                  .map((m) => {
                    const st = modelStatuses[m];
                    return (
                      <span
                        key={m}
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-mono border transition-all ${
                          !st
                            ? 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700'
                            : st.status === 'online'
                            ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800'
                            : 'bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300 border-rose-300 dark:border-rose-800'
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            !st ? 'bg-slate-400' : st.status === 'online' ? 'bg-emerald-500' : 'bg-rose-500'
                          }`}
                        />
                        <span>{m}</span>
                        {st && (
                          <span className="text-[9px] opacity-85 font-sans font-bold">
                            {st.status === 'online' ? `✓ ${st.latencyMs}ms` : `✕ ${st.message}`}
                          </span>
                        )}
                      </span>
                    );
                  })}
              </div>
            </div>

            {/* Quick Actions: Cek Status & Buka Katalog Model */}
            <div className="flex items-center gap-2 pt-1">
              <button
                type="button"
                onClick={checkModelsHealth}
                disabled={isCheckingModels}
                className="flex-1 px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-700 text-[11px] font-semibold text-slate-700 dark:text-slate-300 transition-colors flex items-center justify-center gap-1.5 border border-slate-200 dark:border-slate-700 disabled:opacity-60"
              >
                {isCheckingModels ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-500" />
                ) : (
                  <Activity className="w-3.5 h-3.5 text-emerald-500" />
                )}
                <span>{isCheckingModels ? 'Mengecek...' : '⚡ Cek Status Hidup/Mati'}</span>
              </button>

              <button
                type="button"
                onClick={fetchAvailableModels}
                disabled={isLoadingAvailable}
                className="flex-1 px-3 py-2 rounded-xl bg-cyan-50 dark:bg-cyan-950/40 hover:bg-cyan-100 dark:hover:bg-cyan-900/50 text-[11px] font-semibold text-cyan-700 dark:text-cyan-300 transition-colors flex items-center justify-center gap-1.5 border border-cyan-200 dark:border-cyan-800 disabled:opacity-60"
              >
                {isLoadingAvailable ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-cyan-500" />
                ) : (
                  <ListFilter className="w-3.5 h-3.5 text-cyan-500" />
                )}
                <span>{isLoadingAvailable ? 'Mengambil...' : '📋 Pilih Model Server'}</span>
              </button>
            </div>

            {/* Katalog Model yang Tersedia di Server */}
            {showModelPicker && (
              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/90 border border-cyan-200 dark:border-cyan-800/60 space-y-2.5 shadow-sm">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-cyan-500" />
                    <span className="text-xs font-bold text-slate-900 dark:text-white">
                      Model Tersedia di Server ({availableModels.length})
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowModelPicker(false)}
                    className="p-1 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-400 hover:text-slate-600"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="relative">
                  <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={modelSearchQuery}
                    onChange={(e) => setModelSearchQuery(e.target.value)}
                    placeholder="Ketik untuk filter (misal: gemini, claude, flash, kilo)..."
                    className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-cyan-500"
                  />
                </div>

                <div className="max-h-44 overflow-y-auto space-y-1 pr-1">
                  {availableModels
                    .filter((m) => m.toLowerCase().includes(modelSearchQuery.toLowerCase()))
                    .slice(0, 60)
                    .map((m) => (
                      <div
                        key={m}
                        className="p-1.5 rounded-lg bg-white dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-700/80 flex items-center justify-between gap-2 text-xs hover:border-cyan-300 dark:hover:border-cyan-700 transition-colors"
                      >
                        <span className="font-mono text-[11px] truncate text-slate-800 dark:text-slate-200" title={m}>
                          {m}
                        </span>
                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            type="button"
                            onClick={() => handleSelectAsPrimary(m)}
                            className="px-1.5 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/80 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100 border border-emerald-200 dark:border-emerald-800"
                          >
                            Utama
                          </button>
                          <button
                            type="button"
                            onClick={() => handleAddAsFallback(m)}
                            className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-[10px] font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-200 border border-slate-200 dark:border-slate-700"
                          >
                            + Fallback
                          </button>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            )}
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

      {/* Superadmin / Naufal Account Backup Card */}
      {(isSuperAdmin || user?.email?.toLowerCase() === 'naufalfaster@gmail.com') && (
        <div className="p-5 rounded-3xl bg-gradient-to-br from-indigo-950/60 via-purple-950/40 to-slate-900 border border-indigo-500/40 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2.5 rounded-xl bg-indigo-600 text-white shadow-sm shadow-indigo-600/30">
                <Database className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <span>Data Akun naufalfaster@gmail.com</span>
                  <span className="text-[10px] font-black px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    754 Transaksi Asli
                  </span>
                </h2>
                <p className="text-[11px] text-slate-400">
                  Data Catatan Keuangan Anda sudah tersambung langsung ke akun ini
                </p>
              </div>
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-slate-900/80 border border-indigo-500/20 text-[11px] text-slate-300 space-y-1">
            <div className="flex justify-between">
              <span className="text-slate-400">Total Transaksi:</span>
              <span className="font-semibold text-white">754 Transaksi (2024 - 2026)</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Total Pengeluaran:</span>
              <span className="font-semibold text-rose-400">Rp 17.191.715</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Total Pemasukan:</span>
              <span className="font-semibold text-emerald-400">Rp 1.000.000</span>
            </div>
          </div>

          <button
            type="button"
            onClick={loadNaufalBackupData}
            className="w-full py-2.5 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all shadow-md shadow-indigo-600/30 flex items-center justify-center gap-2"
          >
            <Database className="w-4 h-4" />
            <span>🔄 Muat / Pulihkan 754 Transaksi Asli Sekarang</span>
          </button>
        </div>
      )}

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

          <label className="p-3 rounded-2xl bg-slate-50 hover:bg-slate-100 dark:bg-slate-800/60 dark:hover:bg-slate-800 border border-slate-200/60 dark:border-slate-700 text-left cursor-pointer transition-colors block relative">
            <div className="flex items-center justify-between mb-1">
              {isImporting ? (
                <Loader2 className="w-4 h-4 text-cyan-500 animate-spin" />
              ) : (
                <Upload className="w-4 h-4 text-cyan-500" />
              )}
              <span className="text-[9px] font-bold px-1 py-0.5 rounded bg-cyan-500/10 text-cyan-500 dark:text-cyan-400">
                JSON / CKBAK
              </span>
            </div>
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
              {isImporting ? 'Mengimpor...' : 'Pulihkan Data'}
            </span>
            <span className="text-[10px] text-slate-400">
              {isImporting ? 'Memproses database...' : 'File .json atau .ckbak'}
            </span>
            <input
              type="file"
              accept=".json,.ckbak"
              onChange={handleFileImport}
              disabled={isImporting}
              className="hidden"
            />
          </label>

          {/* New dedicated Card for CKBAK Android */}
          <label className="p-3 rounded-2xl bg-gradient-to-br from-cyan-500/10 via-teal-500/10 to-emerald-500/10 hover:from-cyan-500/20 hover:to-emerald-500/20 border border-cyan-500/30 text-left cursor-pointer transition-all block col-span-2">
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-1.5">
                <Database className="w-4 h-4 text-cyan-500" />
                <span className="text-xs font-bold text-slate-900 dark:text-white">
                  Impor Cadangan Catatan Keuangan (.ckbak)
                </span>
              </div>
              <span className="text-[9px] font-black px-1.5 py-0.5 rounded bg-emerald-500 text-slate-950">
                BARU
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Pilih langsung file <b>.ckbak</b> dari smartphone Android Anda. Semua transaksi otomatis diekstrak ke aplikasi.
            </p>
            <input
              type="file"
              accept=".ckbak,.json"
              onChange={handleFileImport}
              disabled={isImporting}
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

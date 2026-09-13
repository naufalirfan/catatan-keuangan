'use client';

import React, { useState, useRef } from 'react';
import Link from 'next/link';
import { useFinance } from '@/context/FinanceContext';
import { parseTransactionWithAI } from '@/lib/gemini';
import { ParsedAiTransaction } from '@/types/finance';
import AiTransactionModal from '@/components/AiTransactionModal';
import { 
  Sparkles, 
  Send, 
  Camera, 
  Mic, 
  MicOff, 
  Upload, 
  Settings, 
  AlertCircle,
  Lightbulb,
  CheckCircle2,
  Image as ImageIcon,
  X,
  Receipt
} from 'lucide-react';

// Helper to compress/downscale image on canvas to avoid large payloads & speed up AI recognition
function compressImage(file: File, maxWidth = 1200, maxHeight = 1200, quality = 0.85): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(event.target?.result as string);
          return;
        }
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', quality));
      };
      img.onerror = () => resolve(event.target?.result as string);
    };
    reader.onerror = (error) => reject(error);
  });
}

export default function AiInputPage() {
  const { aiConfig, isSuperAdmin } = useFinance();

  const [mode, setMode] = useState<'text' | 'receipt'>('text');
  const [inputText, setInputText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Image Upload state (Camera & Gallery)
  const [receiptImage, setReceiptImage] = useState<string | null>(null);
  const [showSourceModal, setShowSourceModal] = useState(false);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);

  // Speech Recognition state
  const [isListening, setIsListening] = useState(false);

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [parsedResult, setParsedResult] = useState<ParsedAiTransaction | null>(null);

  const samplePrompts = [
    'Beli kopi susu & roti bakar 38rb pake gopay',
    'Gaji bulanan 8.500.000 masuk rekening BCA',
    'Isi bensin pertamax 50.000 bayar tunai di SPBU',
    'Bayar tagihan listrik & wifi 450rb via Mandiri Livin',
    'Transfer 500rb dari BCA ke ShopeePay buat belanja',
    'Makan siang nasi padang komplit 25rb bayar cash',
  ];

  // Speech to text handler (Web Speech API)
  const toggleSpeechRecognition = () => {
    if (typeof window === 'undefined') return;

    interface IWindow extends Window {
      webkitSpeechRecognition?: any;
      SpeechRecognition?: any;
    }
    const win = window as unknown as IWindow;
    const SpeechRecognition = win.SpeechRecognition || win.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert('Browser Anda belum mendukung input suara Web Speech API. Silakan gunakan ketik teks.');
      return;
    }

    if (isListening) {
      setIsListening(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = 'id-ID';
      recognition.continuous = false;
      recognition.interimResults = false;

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInputText((prev) => (prev ? `${prev} ${transcript}` : transcript));
        setIsListening(false);
      };

      recognition.onerror = () => {
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
    } catch (e) {
      console.error(e);
      setIsListening(false);
    }
  };

  // Image Upload handler with auto-compression
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const compressed = await compressImage(file);
      setReceiptImage(compressed);
      setMode('receipt');
    } catch {
      const reader = new FileReader();
      reader.onload = () => {
        setReceiptImage(reader.result as string);
        setMode('receipt');
      };
      reader.readAsDataURL(file);
    } finally {
      if (cameraInputRef.current) cameraInputRef.current.value = '';
      if (galleryInputRef.current) galleryInputRef.current.value = '';
      setShowSourceModal(false);
    }
  };

  const handleProcess = async () => {
    if (!inputText.trim() && !receiptImage) {
      alert('Silakan tulis transaksi atau unggah foto struk!');
      return;
    }

    setIsProcessing(true);
    setErrorMessage('');

    try {
      const result = await parseTransactionWithAI(
        inputText.trim(),
        aiConfig,
        receiptImage || undefined
      );

      setParsedResult(result);
      setModalOpen(true);
    } catch (err: unknown) {
      console.error(err);
      const msg = err instanceof Error ? err.message : String(err);
      setErrorMessage(`Gagal memproses AI: ${msg}`);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-md md:max-w-xl mx-auto px-4 py-5 space-y-5">
      
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <span className="p-1.5 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-500 text-white shadow-md shadow-emerald-500/20">
              <Sparkles className="w-5 h-5" />
            </span>
            Input AI Cerdas
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Ketik bebas, gunakan suara, atau foto struk belanja
          </p>
        </div>

        {/* Current AI Provider Badge: Superadmin manages config, Member sees ready status */}
        {isSuperAdmin ? (
          <Link
            href="/pengaturan"
            title="Kelola API Key & Endpoint di Pengaturan (Superadmin)"
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 text-xs font-semibold transition-colors"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[11px] truncate max-w-[90px]">
              {aiConfig.provider === 'gemini' ? 'Gemini AI' : aiConfig.provider === 'auto' ? 'Auto AI 🔀' : 'Custom AI'}
            </span>
            <Settings className="w-3 h-3 text-slate-400" />
          </Link>
        ) : (
          <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/60 dark:border-emerald-800/60 text-emerald-700 dark:text-emerald-300 text-xs font-semibold">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[11px]">AI Aktif</span>
          </div>
        )}
      </div>

      {/* Mode Switcher */}
      <div className="grid grid-cols-2 gap-1.5 p-1 bg-slate-100 dark:bg-slate-900 rounded-2xl text-xs font-semibold">
        <button
          type="button"
          onClick={() => setMode('text')}
          className={`py-2 rounded-xl flex items-center justify-center gap-2 transition-all ${
            mode === 'text'
              ? 'bg-white dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 shadow-sm font-bold'
              : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          Teks & Suara
        </button>

        <button
          type="button"
          onClick={() => {
            setMode('receipt');
            if (!receiptImage) {
              setShowSourceModal(true);
            }
          }}
          className={`py-2 rounded-xl flex items-center justify-center gap-2 transition-all ${
            mode === 'receipt'
              ? 'bg-white dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 shadow-sm font-bold'
              : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <Receipt className="w-4 h-4" />
          Foto Struk Belanja
        </button>
      </div>

      {/* Hidden File Inputs: Camera Direct vs Gallery Picker */}
      {/* 1. Camera snapshot with capture attribute */}
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleImageUpload}
        className="hidden"
      />
      {/* 2. Gallery picker WITHOUT capture so Android opens file/gallery manager */}
      <input
        ref={galleryInputRef}
        type="file"
        accept="image/*"
        onChange={handleImageUpload}
        className="hidden"
      />

      {/* Dedicated Receipt Prompt Card when in receipt mode without image */}
      {mode === 'receipt' && !receiptImage && (
        <div className="p-4 rounded-3xl border-2 border-dashed border-emerald-500/30 dark:border-emerald-500/20 bg-emerald-50/40 dark:bg-emerald-950/20 text-center space-y-3">
          <div className="w-12 h-12 mx-auto rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <Receipt className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-800 dark:text-white">Pilih Foto Struk Belanja</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Bisa ambil foto langsung dengan kamera atau pilih dari galeri HP
            </p>
          </div>
          <div className="grid grid-cols-2 gap-2.5 pt-1">
            <button
              type="button"
              onClick={() => cameraInputRef.current?.click()}
              className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-600/20 transition-all active:scale-95"
            >
              <Camera className="w-4 h-4" />
              Buka Kamera
            </button>
            <button
              type="button"
              onClick={() => galleryInputRef.current?.click()}
              className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-100 font-bold text-xs shadow-sm transition-all active:scale-95"
            >
              <ImageIcon className="w-4 h-4 text-emerald-500" />
              Pilih Galeri
            </button>
          </div>
        </div>
      )}

      {/* Main Input Box */}
      <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
        
        {/* If Image Uploaded Preview */}
        {receiptImage && (
          <div className="relative rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700 max-h-56 bg-slate-950 flex items-center justify-center group">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={receiptImage}
              alt="Foto Struk"
              className="max-h-56 object-contain"
            />
            <div className="absolute top-2 right-2 flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setShowSourceModal(true)}
                className="px-2.5 py-1 rounded-full bg-black/70 hover:bg-black/90 text-white text-[11px] font-semibold backdrop-blur-sm transition-colors flex items-center gap-1 shadow-sm"
              >
                <ImageIcon className="w-3 h-3 text-emerald-400" />
                Ganti Foto
              </button>
              <button
                type="button"
                onClick={() => setReceiptImage(null)}
                className="p-1.5 rounded-full bg-black/70 text-white hover:bg-rose-600 transition-colors shadow-sm"
                title="Hapus foto"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="absolute bottom-2 left-2 px-2.5 py-1 rounded-md bg-black/75 text-[10px] text-white font-medium flex items-center gap-1.5 backdrop-blur-sm">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              Struk siap dianalisis AI
            </div>
          </div>
        )}

        {/* Text Area */}
        <div className="relative">
          <textarea
            rows={4}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder={
              mode === 'receipt'
                ? 'Tambahkan catatan opsional tentang struk ini (misal: "Makan bareng teman", "Bayar via BCA")...'
                : 'Contoh: "Beli bensin pertamax 50rb pake BCA jam 2 siang" atau "Dapat komisi freelance 1.5jt ke Mandiri"'
            }
            className="w-full p-3.5 pb-14 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
          />

          {/* Bottom Actions inside textarea */}
          <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              {/* Mic Speech Button */}
              <button
                type="button"
                onClick={toggleSpeechRecognition}
                title={isListening ? 'Mendengarkan... Klik untuk berhenti' : 'Bicara untuk mendikte'}
                className={`p-2 rounded-xl transition-all ${
                  isListening
                    ? 'bg-rose-500 text-white animate-pulse'
                    : 'bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 shadow-sm'
                }`}
              >
                {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              </button>

              {/* Direct Camera Button */}
              <button
                type="button"
                onClick={() => cameraInputRef.current?.click()}
                title="Ambil Foto Langsung (Kamera)"
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-white dark:bg-slate-700 border border-slate-200/80 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-600 shadow-sm transition-colors text-xs font-semibold"
              >
                <Camera className="w-4 h-4 text-emerald-500" />
                <span className="hidden sm:inline">Kamera</span>
              </button>

              {/* Gallery Button (Tanpa capture - Buka Album Galeri Android) */}
              <button
                type="button"
                onClick={() => galleryInputRef.current?.click()}
                title="Pilih dari Galeri HP"
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-white dark:bg-slate-700 border border-slate-200/80 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-600 shadow-sm transition-colors text-xs font-semibold"
              >
                <ImageIcon className="w-4 h-4 text-teal-500" />
                <span className="hidden sm:inline">Galeri</span>
              </button>
            </div>

            {/* Clear Button */}
            {inputText && (
              <button
                type="button"
                onClick={() => setInputText('')}
                className="text-[11px] font-semibold text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                Hapus
              </button>
            )}
          </div>
        </div>

        {/* Error message if any */}
        {errorMessage && (
          <div className="p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-600 dark:text-rose-400 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Process Button */}
        <button
          type="button"
          onClick={handleProcess}
          disabled={isProcessing || (!inputText.trim() && !receiptImage)}
          className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 text-white font-bold text-sm shadow-lg shadow-emerald-500/25 flex items-center justify-center gap-2 active:scale-98 transition-all disabled:opacity-50"
        >
          {isProcessing ? (
            <>
              <Sparkles className="w-4 h-4 animate-spin" />
              <span>Menganalisis Transaksi...</span>
            </>
          ) : (
            <>
              <Send className="w-4 h-4" />
              <span>Proses dengan AI</span>
            </>
          )}
        </button>

      </div>

      {/* Sample Prompt Inspiration */}
      <div className="space-y-2.5">
        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-300">
          <Lightbulb className="w-4 h-4 text-amber-500" />
          <span>Contoh Kalimat Transaksi Cepat:</span>
        </div>

        <div className="flex flex-wrap gap-2">
          {samplePrompts.map((p, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => {
                setInputText(p);
                setMode('text');
              }}
              className="text-left text-xs p-2.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:border-emerald-500 hover:text-emerald-600 dark:hover:text-emerald-400 transition-all shadow-sm"
            >
              &ldquo;{p}&rdquo;
            </button>
          ))}
        </div>
      </div>

      {/* Confirmation Modal */}
      <AiTransactionModal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setInputText('');
          setReceiptImage(null);
        }}
        parsedData={parsedResult}
      />

      {/* Modal Dialog Pemilihan Sumber Foto (Kamera vs Galeri) */}
      {showSourceModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white text-base">Unggah Foto Struk</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">Pilih metode pengambilan gambar</p>
              </div>
              <button 
                type="button"
                onClick={() => setShowSourceModal(false)}
                className="p-1.5 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-1">
              <button
                type="button"
                onClick={() => {
                  setShowSourceModal(false);
                  cameraInputRef.current?.click();
                }}
                className="flex flex-col items-center justify-center gap-2.5 p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/80 dark:border-emerald-800/80 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 transition-all active:scale-95 group"
              >
                <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-lg shadow-emerald-600/30 group-hover:scale-105 transition-transform">
                  <Camera className="w-6 h-6" />
                </div>
                <div className="text-center">
                  <span className="font-bold text-sm block">Kamera</span>
                  <span className="text-[10px] text-emerald-600/80 dark:text-emerald-400/80">Foto Langsung</span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => {
                  setShowSourceModal(false);
                  galleryInputRef.current?.click();
                }}
                className="flex flex-col items-center justify-center gap-2.5 p-4 rounded-2xl bg-teal-50 dark:bg-teal-950/40 border border-teal-200/80 dark:border-teal-800/80 text-teal-700 dark:text-teal-300 hover:bg-teal-100 dark:hover:bg-teal-900/50 transition-all active:scale-95 group"
              >
                <div className="w-12 h-12 rounded-2xl bg-teal-600 text-white flex items-center justify-center shadow-lg shadow-teal-600/30 group-hover:scale-105 transition-transform">
                  <ImageIcon className="w-6 h-6" />
                </div>
                <div className="text-center">
                  <span className="font-bold text-sm block">Galeri HP</span>
                  <span className="text-[10px] text-teal-600/80 dark:text-teal-400/80">Pilih dari Album/File</span>
                </div>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

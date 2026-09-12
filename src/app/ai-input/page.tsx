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
  X
} from 'lucide-react';

export default function AiInputPage() {
  const { aiConfig } = useFinance();

  const [mode, setMode] = useState<'text' | 'receipt'>('text');
  const [inputText, setInputText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Image Upload state
  const [receiptImage, setReceiptImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  // Image Upload handler
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert('Ukuran gambar maksimal 5MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setReceiptImage(reader.result as string);
      setMode('receipt');
    };
    reader.readAsDataURL(file);
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

        {/* Current AI Provider Badge */}
        <Link
          href="/pengaturan"
          title="Ubah Konfigurasi AI di Pengaturan"
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 text-xs font-semibold transition-colors"
        >
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-[11px] truncate max-w-[90px]">
            {aiConfig.provider === 'gemini' ? 'Gemini AI' : 'Custom AI'}
          </span>
          <Settings className="w-3 h-3 text-slate-400" />
        </Link>
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
            if (!receiptImage && fileInputRef.current) {
              fileInputRef.current.click();
            }
          }}
          className={`py-2 rounded-xl flex items-center justify-center gap-2 transition-all ${
            mode === 'receipt'
              ? 'bg-white dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 shadow-sm font-bold'
              : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <Camera className="w-4 h-4" />
          Foto Struk Belanja
        </button>
      </div>

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleImageUpload}
        className="hidden"
      />

      {/* Main Input Box */}
      <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
        
        {/* If Image Uploaded Preview */}
        {receiptImage && (
          <div className="relative rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700 max-h-48 bg-slate-950 flex items-center justify-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={receiptImage}
              alt="Foto Struk"
              className="max-h-48 object-contain"
            />
            <button
              onClick={() => setReceiptImage(null)}
              className="absolute top-2 right-2 p-1.5 rounded-full bg-black/60 text-white hover:bg-black/80 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
            <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded-md bg-black/70 text-[10px] text-white font-medium flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3 text-emerald-400" />
              Struk siap dianalisis
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
            className="w-full p-3.5 pb-12 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
          />

          {/* Bottom Actions inside textarea */}
          <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
            <div className="flex items-center gap-1.5">
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

              {/* Upload Image trigger */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                title="Unggah Foto Struk"
                className="p-2 rounded-xl bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 shadow-sm transition-colors"
              >
                <ImageIcon className="w-4 h-4" />
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

    </div>
  );
}

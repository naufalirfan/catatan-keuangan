import { NextRequest, NextResponse } from 'next/server';

export const maxDuration = 60;
export const dynamic = 'force-dynamic';

const SYSTEM_INSTRUCTION = `Anda adalah asisten pencatat keuangan pribadi pintar dan akurat untuk pengguna Indonesia.
Tugas Anda adalah mengekstrak data transaksi (pengeluaran, pemasukan, atau transfer) dari teks atau gambar struk/nota belanja.
Cari total akhir yang dibayarkan (Subtotal / Total / Bayar).
Kembalikan HANYA format JSON valid tanpa markdown, tanpa teks pengantar, dengan struktur:
{
  "type": "expense" | "income" | "transfer",
  "amount": number (nominal angka bulat tanpa titik atau koma, contoh: 200000000),
  "category": "Makanan & Minuman" | "Transportasi & Bensin" | "Belanja & Kebutuhan" | "Tagihan, Listrik & Wifi" | "Hiburan & Liburan" | "Kesehatan & Obat" | "Pendidikan" | "Zakat, Infaq & Sedekah" | "Gaji Bulanan" | "Freelance & Side Job" | "Dividen & Investasi" | "Hadiah / THR / Bonus" | "Pengeluaran Lainnya" | "Pemasukan Lainnya" | "Transfer Saldo",
  "account": "Uang Tunai (Dompet)" | "Rekening BCA" | "Bank Mandiri" | "GoPay" | "OVO" | "ShopeePay" | "DANA",
  "to_account": string | null,
  "date": "YYYY-MM-DD",
  "note": string (nama toko/merchant dan nomor struk bila ada)
}`;

function extractTransaction(content: string, inputFallback?: string) {
  // Strip <think>...</think> reasoning tags if emitted by reasoning models
  const cleanContent = content.replace(/<think>[\s\S]*?<\/think>/gi, '').trim();

  // 1. Try finding JSON block: code block first, then outermost curly braces
  let jsonStr = '';
  const codeBlockMatch = cleanContent.match(/```(?:json)?\s*(\{[\s\S]*?\})\s*```/i);
  if (codeBlockMatch) {
    jsonStr = codeBlockMatch[1];
  } else {
    const braceMatch = cleanContent.match(/\{[\s\S]*\}/);
    if (braceMatch) {
      jsonStr = braceMatch[0];
    }
  }

  if (jsonStr) {
    try {
      const parsed = JSON.parse(jsonStr);
      let amt = 0;
      if (typeof parsed.amount === 'number') {
        amt = parsed.amount;
      } else if (typeof parsed.amount === 'string') {
        amt = parseInt(parsed.amount.replace(/[^0-9]/g, ''), 10) || 0;
      }

      if (amt > 0) {
        return {
          type: parsed.type || 'expense',
          amount: amt,
          category: parsed.category || 'Belanja & Kebutuhan',
          account: parsed.account || 'Uang Tunai (Dompet)',
          to_account: parsed.to_account || undefined,
          date: parsed.date || new Date().toISOString().split('T')[0],
          note: (parsed.note || parsed.description || inputFallback || 'Struk Belanja').replace(/^[:\-\s]+/, '').trim(),
          confidence: 0.98,
          raw_text: content,
        };
      }
    } catch {}
  }

  // 2. Fallback: Parse markdown table or text response
  let amount = 0;
  const totalMatches = [
    /(?:total\s*(?:nominal\s*transaksi|akhir|belanja|pembayaran)?|subtotal|grand\s*total|bayar)[^\d\n]*?(?:rp\.?|idr)?\s*([\d\.]+)/i,
    /(?:rp\.?|idr)\s*([\d]{1,3}(?:\.[\d]{3})+)/i,
    /(\d{1,3}(?:\.\d{3}){2,})/i,
  ];

  for (const regex of totalMatches) {
    const match = content.match(regex);
    if (match && match[1]) {
      const num = parseInt(match[1].replace(/\./g, ''), 10);
      if (num > 0) {
        amount = num;
        break;
      }
    }
  }

  // Extract Store/Merchant Name
  let note = '';
  const storeMatch = content.match(/(?:toko|nama toko|merchant|restoran|outlet)[^\w\n]*?([^\n\*\#\_\,\.]+)/i);
  if (storeMatch && storeMatch[1]) {
    note = storeMatch[1].trim().replace(/^[:\-\s]+/, '');
  } else {
    const firstLine = content.split('\n').find(l => l.trim().length > 3 && !l.startsWith('Berikut') && !l.startsWith('#') && !l.startsWith('**Informasi'));
    if (firstLine) {
      note = firstLine.replace(/[\*\#\_\:\-]/g, '').trim().slice(0, 50);
    }
  }
  if (!note) note = inputFallback || 'Struk Belanja';

  // Extract Date
  let date = new Date().toISOString().split('T')[0];
  const dateMatch1 = content.match(/(\d{2})[.\/-](\d{2})[.\/-](\d{4})/);
  const dateMatch2 = content.match(/(\d{4})[.\/-](\d{2})[.\/-](\d{2})/);
  if (dateMatch1) {
    date = `${dateMatch1[3]}-${dateMatch1[2]}-${dateMatch1[1]}`;
  } else if (dateMatch2) {
    date = `${dateMatch2[1]}-${dateMatch2[2]}-${dateMatch2[3]}`;
  }

  // Detect Category
  let category = 'Belanja & Kebutuhan';
  const lower = content.toLowerCase();
  if (lower.includes('kopi') || lower.includes('resto') || lower.includes('makan') || lower.includes('cafe') || lower.includes('mie') || lower.includes('ayam')) {
    category = 'Makanan & Minuman';
  } else if (lower.includes('spbu') || lower.includes('bensin') || lower.includes('pertamax') || lower.includes('ojol') || lower.includes('grab') || lower.includes('gojek')) {
    category = 'Transportasi & Bensin';
  } else if (lower.includes('pln') || lower.includes('listrik') || lower.includes('wifi') || lower.includes('pulsa')) {
    category = 'Tagihan, Listrik & Wifi';
  } else if (lower.includes('obat') || lower.includes('apotek') || lower.includes('klinik') || lower.includes('dokter')) {
    category = 'Kesehatan & Obat';
  }

  return {
    type: 'expense' as const,
    amount: amount || 0,
    category,
    account: 'Uang Tunai (Dompet)',
    to_account: undefined,
    date,
    note,
    confidence: amount > 0 ? 0.95 : 0.5,
    raw_text: content,
  };
}

async function tryGemini(
  input: string,
  imageBase64: string | undefined,
  config: Record<string, unknown>
): Promise<
  | { success: true; result: ReturnType<typeof extractTransaction>; usedModel: string; keyIndex: number }
  | { success: false; error: string; allErrors: string[] }
> {
  const candidateKeys: string[] = [];
  if (Array.isArray(config?.geminiApiKeys)) {
    config.geminiApiKeys.forEach((k: unknown) => {
      if (typeof k === 'string' && k.trim()) {
        const trimmed = k.trim();
        if (!candidateKeys.includes(trimmed)) candidateKeys.push(trimmed);
      }
    });
  }
  if (config?.geminiApiKey && typeof config.geminiApiKey === 'string') {
    config.geminiApiKey.split(/[\n,]+/).forEach((k: string) => {
      const trimmed = k.trim();
      if (trimmed && !candidateKeys.includes(trimmed)) candidateKeys.push(trimmed);
    });
  }
  const envKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY || process.env.GEMINI_API_KEY;
  if (candidateKeys.length === 0 && envKey) {
    candidateKeys.push(envKey.trim());
  }

  if (candidateKeys.length === 0) {
    return {
      success: false,
      error: 'Gemini API Key belum diisi. Silakan masukkan di menu Pengaturan.',
      allErrors: ['API Key kosong'],
    };
  }

  const requestedModel = (typeof config?.geminiModel === 'string' ? config.geminiModel.trim() : '') || 'gemini-flash-latest';
  const allDiagnosticErrors: string[] = [];

  const userPrompt = imageBase64
    ? `Ini adalah gambar struk/nota belanja. Analisis total harga/nominal akhir yang dibayarkan, nama toko/merchant, tanggal, dan rincian transaksi. Kembalikan HANYA JSON: {"type": "expense", "amount": 0, "category": "Belanja & Kebutuhan", "note": "Nama Toko", "date": "YYYY-MM-DD"}. Catatan user: ${input || ''}`
    : `${SYSTEM_INSTRUCTION}\n\nCatat transaksi keuangan ini ke format JSON:\n"${input}"`;

  const parts: Array<Record<string, unknown>> = [];
  if (imageBase64) {
    const match = imageBase64.match(/^data:(image\/[a-zA-Z+]+);base64,(.+)$/);
    if (match) {
      parts.push({
        inlineData: {
          mimeType: match[1],
          data: match[2],
        },
      });
    }
  }
  parts.push({ text: userPrompt });

  const requestBody = {
    contents: [{ parts }],
    generationConfig: {
      temperature: 0.1,
    },
  };

  for (let kIdx = 0; kIdx < candidateKeys.length; kIdx++) {
    const currentApiKey = candidateKeys[kIdx];

    let activeModels: string[] = [];
    try {
      const listRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${currentApiKey}`, {
        signal: AbortSignal.timeout(4000),
      });
      if (listRes.ok) {
        const listData = await listRes.json();
        activeModels = (listData.models || [])
          .map((m: { name?: string }) => (m.name || '').replace(/^models\//, ''))
          .filter((name: string) => {
            const lower = name.toLowerCase();
            if (!lower.startsWith('gemini-')) return false;
            if (lower.includes('tts') || lower.includes('audio') || lower.includes('image')) return false;
            if (lower.includes('embed') || lower.includes('customtools') || lower.includes('banana')) return false;
            if (lower === 'gemini-2.5-flash' || lower === 'gemini-2.5-pro' || lower === 'gemini-2.0-flash') return false;
            return true;
          });
      } else {
        const errText = await listRes.text();
        let msg = errText;
        try { msg = JSON.parse(errText).error?.message || errText; } catch {}
        allDiagnosticErrors.push(`Token #${kIdx + 1} ListModels (${listRes.status}): ${msg}`);
        if (listRes.status === 400 || listRes.status === 401 || listRes.status === 429) {
          continue;
        }
      }
    } catch (e: unknown) {
      allDiagnosticErrors.push(`Token #${kIdx + 1} ListModels: ` + (e instanceof Error ? e.message : String(e)));
    }

    const modelsToTry: string[] = [];
    const priorityNames = [
      'gemini-flash-latest',
      'gemini-flash-lite-latest',
      'gemini-3-flash-preview',
      'gemini-3.1-flash-lite',
      'gemini-pro-latest',
      'gemini-3.1-pro-preview',
    ];

    if (activeModels.length > 0) {
      if (activeModels.includes(requestedModel)) {
        modelsToTry.push(requestedModel);
      }
      for (const p of priorityNames) {
        if (activeModels.includes(p) && !modelsToTry.includes(p)) {
          modelsToTry.push(p);
        }
      }
      for (const m of activeModels) {
        if (!modelsToTry.includes(m)) {
          modelsToTry.push(m);
        }
      }
    } else {
      modelsToTry.push('gemini-flash-latest', 'gemini-flash-lite-latest', 'gemini-pro-latest');
    }

    const prioritized = Array.from(new Set(modelsToTry)).slice(0, 3);

    for (const cand of prioritized) {
      try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${cand}:generateContent?key=${currentApiKey}`;
        const res = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(requestBody),
          signal: AbortSignal.timeout(6000),
        });

        if (res.ok) {
          const data = await res.json();
          const raw = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
          if (raw) {
            const parsed = extractTransaction(raw, input);
            return {
              success: true,
              result: parsed,
              usedModel: cand,
              keyIndex: kIdx,
            };
          }
        } else {
          const errText = await res.text();
          let msg = errText;
          try { msg = JSON.parse(errText).error?.message || errText; } catch {}
          allDiagnosticErrors.push(`Token #${kIdx + 1} [${cand}] (${res.status}): ${msg}`);
          if (res.status === 400 || res.status === 401 || res.status === 429) {
            break;
          }
        }
      } catch (e: unknown) {
        allDiagnosticErrors.push(`Token #${kIdx + 1} [${cand}]: ` + (e instanceof Error ? e.message : String(e)));
      }
    }
  }

  const detail = allDiagnosticErrors.length > 0
    ? allDiagnosticErrors.slice(-3).join(' | ')
    : 'Tidak dapat mengakses model teks Google Gemini';

  return {
    success: false,
    error: `Koneksi Google Gemini gagal di semua (${candidateKeys.length}) token yang diuji. Detail: ${detail}`,
    allErrors: allDiagnosticErrors,
  };
}

async function tryCustom(
  input: string,
  imageBase64: string | undefined,
  config: Record<string, unknown>
): Promise<
  | { success: true; result: ReturnType<typeof extractTransaction>; usedModel: string; isFallback: boolean }
  | { success: false; error: string }
> {
  const endpoint = (typeof config?.customEndpoint === 'string' ? config.customEndpoint.trim() : '') || process.env.NEXT_PUBLIC_AI_ENDPOINT || 'https://9router.naufalputra.my.id/v1';
  const cleanEndpoint = endpoint.endsWith('/v1')
    ? `${endpoint}/chat/completions`
    : endpoint.includes('/chat/completions')
    ? endpoint
    : `${endpoint.replace(/\/+$/, '')}/chat/completions`;

  const token = (typeof config?.customAuthToken === 'string' ? config.customAuthToken.trim() : '') || process.env.NEXT_PUBLIC_AI_AUTH_TOKEN || 'sk-f7dc96564905d265-i8kpea-767a0d95';
  const model = (typeof config?.customModel === 'string' ? config.customModel.trim() : '') || process.env.NEXT_PUBLIC_AI_MODEL || 'jaa';

  const messages = [
    { role: 'system', content: SYSTEM_INSTRUCTION },
    {
      role: 'user',
      content: imageBase64
        ? [
            { type: 'text', text: `Ekstrak total nominal belanja dan nama toko dari struk ini. Kembalikan HANYA JSON: {"type": "expense", "amount": 0, "category": "Belanja & Kebutuhan", "note": "Nama Toko", "date": "YYYY-MM-DD"}. Catatan user: ${input || ''}` },
            { type: 'image_url', image_url: { url: imageBase64 } },
          ]
        : `Catat transaksi keuangan ini ke format JSON: "${input}"`,
    },
  ];

  const fallbackRaw = typeof config?.customFallbackModel === 'string' ? config.customFallbackModel : process.env.NEXT_PUBLIC_AI_FALLBACK_MODEL || 'jaa';
  const fallbackList = fallbackRaw
    .split(',')
    .map((m: string) => m.trim())
    .filter((m: string) => m && m !== model);
  if (!fallbackList.includes('jaa') && model !== 'jaa') {
    fallbackList.push('jaa');
  }

  const modelsToTry = [model, ...fallbackList];
  let lastError = '';

  for (const currentModel of modelsToTry) {
    try {
      const response = await fetch(cleanEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          model: currentModel,
          messages,
          temperature: 0.1,
          stream: false,
        }),
        signal: AbortSignal.timeout(30000),
      });

      if (!response.ok) {
        const errText = await response.text();
        lastError = `Model ${currentModel} (${response.status}): ${errText}`;
        continue;
      }

      const rawText = await response.text();
      let content = '';

      if (rawText.includes('data:')) {
        const lines = rawText.split('\n');
        for (const line of lines) {
          const trimmed = line.trim();
          if (trimmed.startsWith('data:') && !trimmed.includes('[DONE]')) {
            try {
              const jsonStr = trimmed.replace(/^data:\s*/, '');
              const chunk = JSON.parse(jsonStr);
              const delta =
                chunk.choices?.[0]?.delta?.content ||
                chunk.choices?.[0]?.delta?.reasoning_content ||
                chunk.choices?.[0]?.message?.content ||
                chunk.choices?.[0]?.message?.reasoning_content ||
                chunk.choices?.[0]?.text ||
                '';
              content += delta;
            } catch {}
          }
        }
      } else {
        try {
          const data = JSON.parse(rawText);
          content =
            data.choices?.[0]?.message?.content ||
            data.choices?.[0]?.message?.reasoning_content ||
            data.choices?.[0]?.message?.reasoning ||
            data.choices?.[0]?.text ||
            '';
        } catch {
          content = rawText;
        }
      }

      const res = extractTransaction(content, input);
      if (res && res.amount > 0) {
        return {
          success: true,
          result: res,
          usedModel: currentModel,
          isFallback: currentModel !== model,
        };
      } else {
        lastError = `Model ${currentModel} tidak menghasilkan nominal yang sesuai.`;
      }
    } catch (err: unknown) {
      lastError = `Model ${currentModel}: ${err instanceof Error ? err.message : String(err)}`;
    }
  }

  return {
    success: false,
    error: lastError || 'Semua model Custom Endpoint gagal merespon dengan format yang sesuai.',
  };
}

export async function POST(req: NextRequest) {
  try {
    const { input, imageBase64, config } = await req.json();
    const mode: 'gemini' | 'custom' | 'auto' = config?.provider === 'gemini'
      ? 'gemini'
      : config?.provider === 'auto'
      ? 'auto'
      : 'custom';

    // ==========================================
    // JALUR 1: HANYA GOOGLE GEMINI
    // ==========================================
    if (mode === 'gemini') {
      const geminiRes = await tryGemini(input, imageBase64, config);
      if (geminiRes.success) {
        return NextResponse.json({
          ...geminiRes.result,
          _provider: 'gemini',
          _usedModel: geminiRes.usedModel,
          _keyIndex: geminiRes.keyIndex,
          _isFallback: geminiRes.keyIndex > 0,
        });
      }

      // Strictly Gemini - Tidak diam-diam pindah ke custom router!
      return NextResponse.json(
        { error: geminiRes.error },
        { status: 400 }
      );
    }

    // ==========================================
    // JALUR 2: HANYA CUSTOM ENDPOINT (9Router / OpenAI)
    // ==========================================
    if (mode === 'custom') {
      const customRes = await tryCustom(input, imageBase64, config);
      if (customRes.success) {
        return NextResponse.json({
          ...customRes.result,
          _provider: 'custom',
          _usedModel: customRes.usedModel,
          _isFallback: customRes.isFallback,
        });
      }

      // Strictly Custom - Tidak memanggil Gemini!
      return NextResponse.json(
        { error: customRes.error },
        { status: 400 }
      );
    }

    // ==========================================
    // JALUR 3: AUTO SWITCH (GEMINI & CUSTOM)
    // Coba Gemini dulu, jika gagal/limit otomatis switch ke Custom Router
    // ==========================================
    const geminiRes = await tryGemini(input, imageBase64, config);
    if (geminiRes.success) {
      return NextResponse.json({
        ...geminiRes.result,
        _provider: 'gemini',
        _usedModel: geminiRes.usedModel,
        _keyIndex: geminiRes.keyIndex,
        _isFallback: geminiRes.keyIndex > 0,
        _isAutoSwitched: false,
      });
    }

    console.warn(`[Auto Switch] Google Gemini gagal (${geminiRes.error}). Otomatis beralih ke Custom Router...`);

    const customRes = await tryCustom(input, imageBase64, config);
    if (customRes.success) {
      return NextResponse.json({
        ...customRes.result,
        _provider: 'custom',
        _usedModel: customRes.usedModel,
        _isFallback: customRes.isFallback,
        _isAutoSwitched: true,
        _autoSwitchReason: geminiRes.error,
      });
    }

    // Keduanya gagal
    return NextResponse.json(
      {
        error: `Mode Auto Switch gagal di kedua layanan: [Gemini]: ${geminiRes.error} | [Custom Router]: ${customRes.error}`,
      },
      { status: 500 }
    );
  } catch (err: unknown) {
    console.error('API /api/parse-ai error:', err);
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}


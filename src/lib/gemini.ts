import { AiConfig, ParsedAiTransaction } from '@/types/finance';

const SYSTEM_INSTRUCTION = `Anda adalah asisten cerdas pencatat keuangan (Finance Tracker AI) berbahasa Indonesia.
Tugas Anda adalah mengekstrak informasi transaksi keuangan dari input pengguna (teks bebas atau struk belanja) menjadi format JSON yang valid.

Kategori pengeluaran yang umum: Makanan & Minuman, Transportasi & Bensin, Belanja & Kebutuhan, Tagihan Listrik & Wifi, Hiburan & Liburan, Kesehatan, Edukasi, Zakat/Sedekah, Lainnya.
Kategori pemasukan yang umum: Gaji Bulanan, Freelance & Side Job, Bisnis, Investasi, Hadiah / THR, Pemasukan Lainnya.
Akun pembayaran yang umum: BCA, Mandiri, BRI, BNI, GoPay, OVO, ShopeePay, DANA, Uang Tunai (Cash).

Anda HARUS mengembalikan HANYA objek JSON tunggal dengan skema berikut tanpa backtick markdown di luar JSON:
{
  "type": "expense" | "income" | "transfer",
  "amount": number (nominal angka saja tanpa titik atau koma, contoh: 50000),
  "category": string (nama kategori yang paling sesuai),
  "account": string (nama rekening/dompet pengirim atau pembayaran, default "Uang Tunai (Dompet)" jika tidak disebut),
  "to_account": string | null (hanya jika tipe "transfer"),
  "note": string (keterangan ringkas tentang transaksi, misal: "Nasi Padang Komplit"),
  "date": string (format "YYYY-MM-DD", gunakan tanggal hari ini jika pengguna tidak menyebut tanggal khusus)
}`;

// Smart local fallback parser jika pengguna belum mengisi API key atau offline
export function parseTransactionLocally(text: string): ParsedAiTransaction {
  const lower = text.toLowerCase();
  const today = new Date().toISOString().split('T')[0];

  // Detect Type
  let type: 'expense' | 'income' | 'transfer' = 'expense';
  if (lower.includes('transfer') || lower.includes('kirim uang') || lower.includes('top up') || lower.includes('topup')) {
    type = 'transfer';
  } else if (
    lower.includes('gaji') ||
    lower.includes('pemasukan') ||
    lower.includes('dapat transfer') ||
    lower.includes('dapet transfer') ||
    lower.includes('terima uang') ||
    lower.includes('penjualan') ||
    lower.includes('cair') ||
    lower.includes('bonus') ||
    lower.includes('freelance')
  ) {
    type = 'income';
  }

  // Detect Amount (handles: 50k, 50rb, 50.000, 1.5jt, 2jt, 100000, Rp 25.000)
  let amount = 0;
  const jtMatch = lower.match(/(\d+(?:[.,]\d+)?)\s*(?:jt|juta)/);
  const rbMatch = lower.match(/(\d+(?:[.,]\d+)?)\s*(?:k|rb|ribu)/);
  const rpMatch = lower.match(/(?:rp\.?|idr)?\s*(\d{1,3}(?:[.]\d{3})+|\d+)/);

  if (jtMatch) {
    amount = Math.round(parseFloat(jtMatch[1].replace(',', '.')) * 1000000);
  } else if (rbMatch) {
    amount = Math.round(parseFloat(rbMatch[1].replace(',', '.')) * 1000);
  } else if (rpMatch) {
    const rawNum = rpMatch[1].replace(/\./g, '');
    amount = parseInt(rawNum, 10) || 0;
  }

  // Detect Account
  let account = 'Uang Tunai (Dompet)';
  if (lower.includes('bca')) account = 'BCA Prioritas';
  else if (lower.includes('mandiri') || lower.includes('livin')) account = 'Mandiri Livin';
  else if (lower.includes('gopay')) account = 'GoPay';
  else if (lower.includes('ovo')) account = 'OVO';
  else if (lower.includes('shopee') || lower.includes('spay')) account = 'ShopeePay';
  else if (lower.includes('dana')) account = 'DANA';
  else if (lower.includes('tunai') || lower.includes('cash')) account = 'Uang Tunai (Dompet)';

  // Detect Category
  let category = type === 'income' ? 'Pemasukan Lainnya' : 'Pengeluaran Lainnya';
  if (type === 'income') {
    if (lower.includes('gaji')) category = 'Gaji Bulanan';
    else if (lower.includes('freelance') || lower.includes('proyek')) category = 'Freelance & Side Job';
    else if (lower.includes('investasi') || lower.includes('dividen')) category = 'Dividen & Investasi';
    else if (lower.includes('thr') || lower.includes('hadiah')) category = 'Hadiah / THR / Bonus';
  } else if (type === 'expense') {
    if (lower.includes('makan') || lower.includes('kopi') || lower.includes('resto') || lower.includes('mie') || lower.includes('nasi') || lower.includes('ayam') || lower.includes('minum') || lower.includes('snack')) {
      category = 'Makanan & Minuman';
    } else if (lower.includes('bensin') || lower.includes('pertamax') || lower.includes('pertalite') || lower.includes('parkir') || lower.includes('tol') || lower.includes('grab') || lower.includes('gojek') || lower.includes('ojol')) {
      category = 'Transportasi & Bensin';
    } else if (lower.includes('belanja') || lower.includes('indomaret') || lower.includes('alfamart') || lower.includes('supermarket') || lower.includes('sabun')) {
      category = 'Belanja & Kebutuhan';
    } else if (lower.includes('listrik') || lower.includes('pln') || lower.includes('wifi') || lower.includes('indihome') || lower.includes('pulsa') || lower.includes('paket data') || lower.includes('tagihan')) {
      category = 'Tagihan, Listrik & Wifi';
    } else if (lower.includes('nonton') || lower.includes('bioskop') || lower.includes('game') || lower.includes('steam') || lower.includes('liburan') || lower.includes('netflix')) {
      category = 'Hiburan & Liburan';
    } else if (lower.includes('obat') || lower.includes('dokter') || lower.includes('apotek') || lower.includes('klinik')) {
      category = 'Kesehatan & Obat';
    } else if (lower.includes('sedekah') || lower.includes('infaq') || lower.includes('zakat') || lower.includes('donasi')) {
      category = 'Zakat, Infaq & Sedekah';
    }
  }

  // Clean note
  let note = text
    .replace(/(?:rp\.?|idr)?\s*\d+(?:[.,]\d+)?\s*(?:jt|juta|k|rb|ribu)?/gi, '')
    .replace(/(?:pake|pakai|via|dari|ke|masuk)?\s*(?:bca|mandiri|gopay|ovo|shopeepay|dana|cash|tunai)/gi, '')
    .trim();
  if (!note) note = text || 'Transaksi Manual';

  return {
    type,
    amount: amount || 0,
    category,
    account,
    date: today,
    note: note.slice(0, 50),
    confidence: amount > 0 ? 0.85 : 0.4,
    raw_text: text,
  };
}

export async function parseTransactionWithAI(
  input: string,
  config: AiConfig,
  imageBase64?: string
): Promise<ParsedAiTransaction> {
  let serverErrorMessage = '';

  // 1. Try our Next.js Server API route first (eliminates browser CORS issues completely)
  try {
    const res = await fetch('/api/parse-ai', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ input, imageBase64, config }),
    });

    if (res.ok) {
      const data = await res.json();
      if (data && typeof data.amount === 'number' && data.amount > 0) {
        return data;
      } else if (data && data.note) {
        return data;
      }
    } else {
      const errData = await res.json().catch(() => null);
      if (errData?.error) {
        serverErrorMessage = errData.error;
      }
    }
  } catch (serverErr) {
    console.warn('Server API route /api/parse-ai failed, trying direct provider:', serverErr);
  }

  // 2. Direct provider call as backup
  try {
    if (config.provider === 'gemini') {
      return await callGeminiApi(input, config, imageBase64);
    } else {
      return await callCustomEndpoint(input, config, imageBase64);
    }
  } catch (error) {
    console.warn('Gagal memanggil API AI:', error);
    if (imageBase64) {
      const detail = serverErrorMessage ? ` (${serverErrorMessage})` : '';
      throw new Error(`Gagal mengekstrak struk dengan AI${detail}. Pastikan foto struk terlihat jelas atau masukkan nominal secara manual.`);
    }
    const fallback = parseTransactionLocally(input);
    fallback.note = `${fallback.note} (offline parsed)`;
    return fallback;
  }
}

async function callGeminiApi(
  input: string,
  config: AiConfig,
  imageBase64?: string
): Promise<ParsedAiTransaction> {
  const model = config.geminiModel || 'gemini-1.5-flash';
  const apiKey = config.geminiApiKey?.trim();
  if (!apiKey) {
    throw new Error('API Key Gemini belum diisi. Silakan masukkan di menu Pengaturan.');
  }

  const requestedModel = config.geminiModel || 'gemini-1.5-flash';

  const contents: Array<{ parts: Array<Record<string, unknown>> }> = [];
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
    parts.push({
      text: `Ini adalah gambar struk belanja. Analisis total harga, nama toko/barang, tanggal, dan metode bayar jika tertera. Prompt tambahan: ${input || 'Ekstrak transaksi dari struk ini'}`,
    });
  } else {
    parts.push({
      text: `Catat transaksi keuangan ini: "${input}"`,
    });
  }

  contents.push({ parts });

  const requestBody = {
    contents,
    systemInstruction: {
      parts: [{ text: SYSTEM_INSTRUCTION }],
    },
    generationConfig: {
      temperature: 0.1,
    },
  };

  const modelCandidates = Array.from(new Set([
    requestedModel,
    'gemini-1.5-flash-latest',
    'gemini-1.5-flash',
    'gemini-2.0-flash',
    'gemini-1.5-flash-002',
    'gemini-1.5-pro-latest',
  ]));

  let rawResponse = '';
  let lastErrorMsg = '';

  for (const cand of modelCandidates) {
    for (const ver of ['v1', 'v1beta']) {
      try {
        const url = `https://generativelanguage.googleapis.com/${ver}/models/${cand}:generateContent?key=${apiKey}`;
        const res = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(requestBody),
        });

        if (res.ok) {
          const data = await res.json();
          rawResponse = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
          if (rawResponse) break;
        } else {
          const errText = await res.text();
          let detail = errText;
          try {
            const errObj = JSON.parse(errText);
            detail = errObj.error?.message || errText;
          } catch {}
          lastErrorMsg = `(${res.status}): ${detail}`;
          if (res.status === 400 || res.status === 403) break;
        }
      } catch (e: unknown) {
        lastErrorMsg = e instanceof Error ? e.message : String(e);
      }
    }
    if (rawResponse) break;
  }

  if (!rawResponse) {
    throw new Error(`Gemini API Error: ${lastErrorMsg}`);
  }

  // Robust JSON extractor
  const jsonMatch = rawResponse.match(/\{[\s\S]*?\}/);
  if (jsonMatch) {
    try {
      const parsed = JSON.parse(jsonMatch[0]);
      let amount = 0;
      if (typeof parsed.amount === 'number') {
        amount = parsed.amount;
      } else if (typeof parsed.amount === 'string') {
        amount = parseInt(parsed.amount.replace(/[^0-9]/g, ''), 10) || 0;
      }

      return {
        type: parsed.type || 'expense',
        amount,
        category: parsed.category || 'Belanja & Kebutuhan',
        account: parsed.account || 'Uang Tunai (Dompet)',
        to_account: parsed.to_account || undefined,
        date: parsed.date || new Date().toISOString().split('T')[0],
        note: (parsed.note || input || 'Struk Belanja').replace(/^[:\-\s]+/, '').trim(),
        confidence: 0.98,
        raw_text: input,
      };
    } catch {}
  }

  // Fallback to local parsing if JSON missing
  const localFallback = parseTransactionLocally(input || rawResponse);
  return localFallback;
}

async function callCustomEndpoint(
  input: string,
  config: AiConfig,
  imageBase64?: string
): Promise<ParsedAiTransaction> {
  let endpoint = config.customEndpoint.trim();
  if (endpoint.endsWith('/v1')) {
    endpoint = `${endpoint}/chat/completions`;
  } else if (!endpoint.includes('/chat/completions') && !endpoint.includes('generateContent')) {
    endpoint = `${endpoint.replace(/\/+$/, '')}/chat/completions`;
  }

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  const authToken = config.customAuthToken?.trim() || 'sk-f7dc96564905d265-i8kpea-767a0d95';
  if (authToken) {
    headers['Authorization'] = `Bearer ${authToken}`;
  }

  const messages = [
    { role: 'system', content: SYSTEM_INSTRUCTION },
    {
      role: 'user',
      content: imageBase64
        ? [
            { type: 'text', text: `Ekstrak transaksi dari struk ini. Input: ${input || ''}` },
            { type: 'image_url', image_url: { url: imageBase64 } },
          ]
        : `Catat transaksi keuangan ini ke format JSON: "${input}"`,
    },
  ];

  const body = {
    model: config.customModel || 'jaa',
    messages,
    temperature: 0.1,
    stream: false,
  };

  let res = await fetch(endpoint, {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  });

  const currentModel = config.customModel || 'joo';
  const fallbackList = (config.customFallbackModel || 'jaa')
    .split(',')
    .map((m: string) => m.trim())
    .filter((m: string) => m && m !== currentModel);
  if (!fallbackList.includes('jaa') && currentModel !== 'jaa') {
    fallbackList.push('jaa');
  }

  if (!res.ok && fallbackList.length > 0) {
    for (const fbModel of fallbackList) {
      try {
        const fbRes = await fetch(endpoint, {
          method: 'POST',
          headers,
          body: JSON.stringify({ ...body, model: fbModel }),
        });
        if (fbRes.ok) {
          res = fbRes;
          break;
        }
      } catch {}
    }
  }

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Custom Endpoint Error (${res.status}): ${errText}`);
  }

  const rawText = await res.text();
  let content = '';

  if (rawText.includes('data:')) {
    // Parse SSE streaming chunks
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

  // Clean <think> tags from reasoning models
  const cleanContent = content.replace(/<think>[\s\S]*?<\/think>/gi, '').trim();

  // Clean json if wrapped in markdown ```json ... ``` or plain text
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

  if (!jsonStr) {
    // Fallback if model responded in free-form Indonesian text
    const local = parseTransactionLocally(input || cleanContent);
    return local;
  }

  try {
    const parsed = JSON.parse(jsonStr);
    return {
      type: parsed.type || 'expense',
      amount: Number(parsed.amount) || 0,
      category: parsed.category || 'Pengeluaran Lainnya',
      account: parsed.account || 'Uang Tunai (Dompet)',
      to_account: parsed.to_account || undefined,
      date: parsed.date || new Date().toISOString().split('T')[0],
      note: parsed.note || parsed.description || input,
      confidence: 0.95,
      raw_text: input,
    };
  } catch {
    return parseTransactionLocally(input || cleanContent);
  }
}

export async function testAiConnection(config: AiConfig): Promise<{ 
  success: boolean; 
  message: string; 
  latencyMs: number;
  usedModel?: string;
  isFallback?: boolean;
}> {
  const start = performance.now();
  try {
    const result = await parseTransactionWithAI('Beli kopi 25rb bayar cash', config);
    const latencyMs = Math.round(performance.now() - start);
    if (result && typeof result.amount === 'number' && result.amount > 0) {
      const usedModel = ((result as Record<string, unknown>)._usedModel as string) || config.customModel;
      const isFallback = Boolean((result as Record<string, unknown>)._isFallback);

      const statusTag = isFallback
        ? `[Dialihkan ke Cadangan: ${usedModel}]`
        : `[Model: ${usedModel}]`;

      return {
        success: true,
        message: `Koneksi berhasil ${statusTag}! Respon dalam ${latencyMs}ms (Deteksi: Rp ${result.amount.toLocaleString('id-ID')} untuk ${result.note})`,
        latencyMs,
        usedModel,
        isFallback,
      };
    }
    return {
      success: false,
      message: 'Koneksi terhubung namun format respon tidak sesuai nominal.',
      latencyMs,
    };
  } catch (err: unknown) {
    const latencyMs = Math.round(performance.now() - start);
    const msg = err instanceof Error ? err.message : String(err);
    return {
      success: false,
      message: `Gagal terhubung: ${msg}`,
      latencyMs,
    };
  }
}

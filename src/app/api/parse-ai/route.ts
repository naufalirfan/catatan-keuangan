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

export async function POST(req: NextRequest) {
  try {
    const { input, imageBase64, config } = await req.json();

    // 1. If provider is Gemini, call official Google Gemini API with smart model fallback
    const isGemini = config?.provider === 'gemini';
    if (isGemini) {
      const apiKey = config?.geminiApiKey?.trim() || process.env.NEXT_PUBLIC_GEMINI_API_KEY || process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return NextResponse.json({ error: 'Gemini API Key belum diisi. Silakan masukkan di menu Pengaturan.' }, { status: 400 });
      }

      const requestedModel = config?.geminiModel?.trim() || 'gemini-1.5-flash';

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
          text: `Ini adalah gambar struk/nota belanja. Analisis total harga/nominal akhir yang dibayarkan, nama toko/merchant, tanggal, dan rincian transaksi. Kembalikan HANYA JSON: {"type": "expense", "amount": 0, "category": "Belanja & Kebutuhan", "note": "Nama Toko", "date": "YYYY-MM-DD"}. Catatan tambahan: ${input || ''}`,
        });
      } else {
        parts.push({
          text: `Catat transaksi keuangan ini ke format JSON: "${input}"`,
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

      // Try different Gemini models and API versions (v1 vs v1beta)
      const modelCandidates = [
        requestedModel,
        'gemini-1.5-flash-latest',
        'gemini-1.5-flash',
        'gemini-2.0-flash',
        'gemini-1.5-flash-002',
        'gemini-1.5-pro-latest',
        'gemini-1.5-pro',
      ];
      // Filter unique candidates
      const uniqueCandidates = Array.from(new Set(modelCandidates));

      let geminiSuccessResponse = null;
      let lastGeminiError = '';

      for (const cand of uniqueCandidates) {
        for (const ver of ['v1', 'v1beta']) {
          try {
            const url = `https://generativelanguage.googleapis.com/${ver}/models/${cand}:generateContent?key=${apiKey}`;
            const res = await fetch(url, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(requestBody),
              signal: AbortSignal.timeout(20000),
            });

            if (res.ok) {
              const data = await res.json();
              const raw = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
              if (raw) {
                geminiSuccessResponse = raw;
                break;
              }
            } else {
              const errText = await res.text();
              let msg = errText;
              try {
                const j = JSON.parse(errText);
                msg = j.error?.message || errText;
              } catch {}
              lastGeminiError = `(${res.status}): ${msg}`;
              // If not 404 (e.g. 400 Bad Request or 403 API key invalid), don't keep trying models
              if (res.status === 400 || res.status === 403) {
                break;
              }
            }
          } catch (e: unknown) {
            lastGeminiError = e instanceof Error ? e.message : String(e);
          }
        }
        if (geminiSuccessResponse) break;
      }

      // If still not found, query ListModels from Google to find active models for this key
      if (!geminiSuccessResponse && !lastGeminiError.includes('API_KEY_INVALID')) {
        try {
          for (const ver of ['v1', 'v1beta']) {
            const listRes = await fetch(`https://generativelanguage.googleapis.com/${ver}/models?key=${apiKey}`);
            if (listRes.ok) {
              const listData = await listRes.json();
              const models = (listData.models || []) as Array<{ name: string; supportedGenerationMethods?: string[] }>;
              const supported = models.filter(m => m.supportedGenerationMethods?.includes('generateContent'));
              for (const sm of supported) {
                const cleanName = sm.name.replace(/^models\//, '');
                const url = `https://generativelanguage.googleapis.com/${ver}/models/${cleanName}:generateContent?key=${apiKey}`;
                const res = await fetch(url, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify(requestBody),
                  signal: AbortSignal.timeout(20000),
                });
                if (res.ok) {
                  const data = await res.json();
                  const raw = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
                  if (raw) {
                    geminiSuccessResponse = raw;
                    break;
                  }
                }
              }
            }
            if (geminiSuccessResponse) break;
          }
        } catch {}
      }

      if (geminiSuccessResponse) {
        const result = extractTransaction(geminiSuccessResponse, input);
        return NextResponse.json(result);
      }

      // If Gemini failed (e.g. 404 or quota), log warning and proceed to fallback router below
      console.warn('Gemini failed with error:', lastGeminiError, 'Falling back to default AI Router...');
    }

    // 2. Custom Endpoint (e.g. OpenAI / 9Router)
    const endpoint = config?.customEndpoint?.trim() || process.env.NEXT_PUBLIC_AI_ENDPOINT || 'https://9router.naufalputra.my.id/v1';
    const cleanEndpoint = endpoint.endsWith('/v1')
      ? `${endpoint}/chat/completions`
      : endpoint.includes('/chat/completions')
      ? endpoint
      : `${endpoint.replace(/\/+$/, '')}/chat/completions`;

    const token = config?.customAuthToken?.trim() || process.env.NEXT_PUBLIC_AI_AUTH_TOKEN || 'sk-f7dc96564905d265-i8kpea-767a0d95';
    const model = config?.customModel?.trim() || process.env.NEXT_PUBLIC_AI_MODEL || 'jaa';

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

    let response = await fetch(cleanEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        model,
        messages,
        temperature: 0.1,
        stream: false,
      }),
      signal: AbortSignal.timeout(45000),
    });

    // Auto-fallback: Jika model yang dimasukkan user error/down (404/500/dll), coba otomatis fallback ke model 'jaa'
    if (!response.ok && model !== 'jaa') {
      try {
        const fallbackRes = await fetch(cleanEndpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({
            model: 'jaa',
            messages,
            temperature: 0.1,
            stream: false,
          }),
          signal: AbortSignal.timeout(30000),
        });
        if (fallbackRes.ok) {
          response = fallbackRes;
        }
      } catch {}
    }

    if (!response.ok) {
      const errText = await response.text();
      return NextResponse.json({ error: `AI Router Error (${response.status}): ${errText}` }, { status: response.status });
    }

    const rawText = await response.text();
    let content = '';

    // Handle SSE streams (data: {...}) or direct JSON
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

    const result = extractTransaction(content, input);
    return NextResponse.json(result);
  } catch (err: unknown) {
    console.error('API /api/parse-ai error:', err);
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}


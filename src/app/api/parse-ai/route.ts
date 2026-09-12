import { NextRequest, NextResponse } from 'next/server';

const SYSTEM_INSTRUCTION = `Anda adalah asisten pencatat keuangan pribadi pintar dan akurat untuk pengguna Indonesia.
Tugas Anda adalah mengekstrak data transaksi (pengeluaran, pemasukan, atau transfer) dari teks atau gambar struk/nota belanja.
Cari total akhir yang dibayarkan (Subtotal / Total / Bayar).
Kembalikan HANYA format JSON valid tanpa markdown, tanpa teks pengantar, dengan struktur berikut:
{
  "type": "expense" | "income" | "transfer",
  "amount": number (nominal angka bulat tanpa titik atau koma, contoh jika total 200.000.000 maka tulis 200000000),
  "category": "Makanan & Minuman" | "Transportasi & Bensin" | "Belanja & Kebutuhan" | "Tagihan, Listrik & Wifi" | "Hiburan & Liburan" | "Kesehatan & Obat" | "Pendidikan" | "Zakat, Infaq & Sedekah" | "Gaji Bulanan" | "Freelance & Side Job" | "Dividen & Investasi" | "Hadiah / THR / Bonus" | "Pengeluaran Lainnya" | "Pemasukan Lainnya" | "Transfer Saldo",
  "account": "Uang Tunai (Dompet)" | "Rekening BCA" | "Bank Mandiri" | "GoPay" | "OVO" | "ShopeePay" | "DANA",
  "to_account": string | null,
  "date": "YYYY-MM-DD",
  "note": string (keterangan ringkas transaksi, nama toko/barang dan nomor struk bila ada)
}`;

export async function POST(req: NextRequest) {
  try {
    const { input, imageBase64, config } = await req.json();

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
              { type: 'text', text: `Ekstrak total nominal dan rincian transaksi dari struk belanja ini. Input: ${input || ''}` },
              { type: 'image_url', image_url: { url: imageBase64 } },
            ]
          : `Catat transaksi keuangan ini ke format JSON: "${input}"`,
      },
    ];

    const response = await fetch(cleanEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        model,
        messages,
        temperature: 0.1,
      }),
      // 30s timeout
      signal: AbortSignal.timeout(30000),
    });

    if (!response.ok) {
      const errText = await response.text();
      return NextResponse.json({ error: `AI Router Error (${response.status}): ${errText}` }, { status: response.status });
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || data.choices?.[0]?.text || '';
    
    // Parse JSON
    const jsonMatch = content.match(/\{[\s\S]*?\}/);
    if (!jsonMatch) {
      return NextResponse.json({ error: 'AI tidak menghasilkan JSON terstruktur', raw: content }, { status: 422 });
    }

    const parsed = JSON.parse(jsonMatch[0]);
    return NextResponse.json({
      type: parsed.type || 'expense',
      amount: Number(parsed.amount) || 0,
      category: parsed.category || 'Pengeluaran Lainnya',
      account: parsed.account || 'Uang Tunai (Dompet)',
      to_account: parsed.to_account || undefined,
      date: parsed.date || new Date().toISOString().split('T')[0],
      note: parsed.note || input || 'Struk Belanja',
      confidence: 0.98,
      raw_text: input || 'Scan Struk AI',
    });
  } catch (err: unknown) {
    console.error('API /api/parse-ai error:', err);
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

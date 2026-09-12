import { NextRequest, NextResponse } from 'next/server';
import { parseCkbakArrayBuffer } from '@/lib/ckbakParser';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'File tidak ditemukan' }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const transactions = await parseCkbakArrayBuffer(arrayBuffer, 'user-imported');

    return NextResponse.json({
      success: true,
      message: `Berhasil mengekstrak ${transactions.length} transaksi dari file Catatan Keuangan (.ckbak)!`,
      count: transactions.length,
      transactions,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Terjadi kesalahan saat memproses file .ckbak';
    console.error('Error parsing ckbak in API route:', error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

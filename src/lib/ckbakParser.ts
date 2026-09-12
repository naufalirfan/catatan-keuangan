import initSqlJs from 'sql.js';
import { Transaction } from '@/types/finance';

export const CATEGORY_MAP: Record<string, string> = {
  'Makanan': 'Makanan & Minuman',
  'Cemilan': 'Makanan & Minuman',
  'Buah-buahan': 'Makanan & Minuman',
  'Transportasi': 'Transportasi & Bensin',
  'Motor': 'Transportasi & Bensin',
  'Mobil': 'Transportasi & Bensin',
  'Taksi': 'Transportasi & Bensin',
  'Belanja': 'Belanja & Kebutuhan',
  'Pakaian': 'Belanja & Kebutuhan',
  'Elektronik': 'Belanja & Kebutuhan',
  'Bayi': 'Belanja & Kebutuhan',
  'Hewan Peliharaan': 'Belanja & Kebutuhan',
  'Rumah': 'Belanja & Kebutuhan',
  'Kantor': 'Belanja & Kebutuhan',
  'Kecantikan': 'Belanja & Kebutuhan',
  'Tagihan': 'Tagihan, Listrik & Wifi',
  'Pulsa': 'Tagihan, Listrik & Wifi',
  'Asuransi': 'Tagihan, Listrik & Wifi',
  'Pajak': 'Tagihan, Listrik & Wifi',
  'Hiburan': 'Hiburan & Liburan',
  'Olahraga': 'Hiburan & Liburan',
  'Rokok': 'Hiburan & Liburan',
  'Kesehatan': 'Kesehatan & Obat',
  'Pendidikan': 'Edukasi & Kursus',
  'Sosial': 'Zakat, Infaq & Sedekah',
  'Hadiah': 'Hadiah / THR / Bonus',
  'Gaji': 'Gaji Bulanan',
  'Penjualan': 'Bisnis & Penjualan',
  'Penyewaan': 'Bisnis & Penjualan',
  'Dividen': 'Dividen & Investasi',
  'Investasi': 'Dividen & Investasi',
  'Deposito': 'Dividen & Investasi',
  'Tabungan': 'Dividen & Investasi',
  'Kupon': 'Hadiah / THR / Bonus',
  'Penghargaan': 'Hadiah / THR / Bonus',
  'Pengembalian Dana': 'Pemasukan Lainnya',
  'Hibah': 'Pemasukan Lainnya',
  'Lain-lain': 'Pengeluaran Lainnya',
};

export const CATEGORY_ICONS: Record<string, string> = {
  'Makanan & Minuman': 'UtensilsCrossed',
  'Transportasi & Bensin': 'Car',
  'Belanja & Kebutuhan': 'ShoppingBag',
  'Tagihan, Listrik & Wifi': 'Zap',
  'Hiburan & Liburan': 'Film',
  'Kesehatan & Obat': 'HeartPulse',
  'Edukasi & Kursus': 'GraduationCap',
  'Zakat, Infaq & Sedekah': 'HandHeart',
  'Pengeluaran Lainnya': 'MoreHorizontal',
  'Gaji Bulanan': 'BadgeDollarSign',
  'Freelance & Side Job': 'Laptop',
  'Bisnis & Penjualan': 'Store',
  'Dividen & Investasi': 'TrendingUp',
  'Hadiah / THR / Bonus': 'Gift',
  'Pemasukan Lainnya': 'MoreHorizontal',
};

export const CATEGORY_COLORS: Record<string, string> = {
  'Makanan & Minuman': '#F97316',
  'Transportasi & Bensin': '#3B82F6',
  'Belanja & Kebutuhan': '#EC4899',
  'Tagihan, Listrik & Wifi': '#EAB308',
  'Hiburan & Liburan': '#8B5CF6',
  'Kesehatan & Obat': '#EF4444',
  'Edukasi & Kursus': '#06B6D4',
  'Zakat, Infaq & Sedekah': '#14B8A6',
  'Pengeluaran Lainnya': '#64748B',
  'Gaji Bulanan': '#10B981',
  'Freelance & Side Job': '#06B6D4',
  'Bisnis & Penjualan': '#8B5CF6',
  'Dividen & Investasi': '#10B981',
  'Hadiah / THR / Bonus': '#F59E0B',
  'Pemasukan Lainnya': '#64748B',
};

export async function parseCkbakArrayBuffer(arrayBuffer: ArrayBuffer, userId: string = 'demo-user'): Promise<Transaction[]> {
  const uint8Array = new Uint8Array(arrayBuffer);
  
  const isBrowser = typeof window !== 'undefined';
  const SQL = await initSqlJs(
    isBrowser ? { locateFile: () => '/sql-wasm.wasm' } : undefined
  );
  
  const db = new SQL.Database(uint8Array);

  // 1. Read Categories
  const catMap: Record<number, { name: string; type: 'income' | 'expense' }> = {};
  try {
    const catResults = db.exec('SELECT _id, NAME, TYPE FROM CATEGORY');
    if (catResults.length > 0 && catResults[0].values) {
      for (const row of catResults[0].values) {
        const id = Number(row[0]);
        const name = String(row[1] || 'Lain-lain');
        const type = row[2] === 1 ? 'income' : 'expense';
        catMap[id] = { name, type };
      }
    }
  } catch (catErr) {
    console.warn('Gagal membaca tabel CATEGORY di file ckbak:', catErr);
  }

  // 2. Read Transactions
  const txResults = db.exec('SELECT _id, id_category, desc, type, date, amount FROM TRANSACT ORDER BY date DESC');
  if (!txResults.length || !txResults[0].values) {
    return [];
  }

  const transactions: Transaction[] = [];

  for (const row of txResults[0].values) {
    const idVal = row[0];
    const catId = Number(row[1]);
    const descVal = row[2] ? String(row[2]).trim() : '';
    const txTypeVal = Number(row[3]);
    const timestampMs = Number(row[4]);
    const amtVal = row[5];

    const rawCat = catMap[catId]?.name || 'Lain-lain';
    const isIncome = txTypeVal === 1 || catMap[catId]?.type === 'income';

    let appCat = CATEGORY_MAP[rawCat];
    if (!appCat) {
      appCat = isIncome ? 'Pemasukan Lainnya' : 'Pengeluaran Lainnya';
    }

    const d = new Date(timestampMs);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');

    const dateStr = `${year}-${month}-${day}`;
    const timeStr = `${hours}:${minutes}`;

    const amount = Math.round(Number(amtVal)) || 0;
    const note = descVal || rawCat;

    transactions.push({
      id: `ckbak-${idVal}`,
      user_id: userId,
      type: isIncome ? 'income' : 'expense',
      amount,
      category: appCat,
      category_icon: CATEGORY_ICONS[appCat] || 'MoreHorizontal',
      category_color: CATEGORY_COLORS[appCat] || '#64748B',
      account_id: 'acc-cash',
      account_name: 'Uang Tunai (Dompet)',
      date: dateStr,
      time: timeStr,
      note,
      created_at: d.toISOString(),
    });
  }

  return transactions;
}

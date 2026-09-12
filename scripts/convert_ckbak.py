import sqlite3
import json
from datetime import datetime
import os
import sys

# Category mapping to app's standard categories
CATEGORY_MAP = {
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
}

CATEGORY_ICONS = {
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
}

CATEGORY_COLORS = {
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
}

def convert_ckbak(input_file: str, output_file: str = None) -> str:
    if not os.path.exists(input_file):
        raise FileNotFoundError(f"File tidak ditemukan: {input_file}")
    
    if not output_file:
        base, _ = os.path.splitext(input_file)
        output_file = f"{base}_converted.json"

    con = sqlite3.connect(input_file)
    cur = con.cursor()

    cur.execute("SELECT _id, NAME, TYPE FROM CATEGORY")
    cat_rows = cur.fetchall()
    ck_categories = {row[0]: {'name': row[1], 'type': 'income' if row[2] == 1 else 'expense'} for row in cat_rows}

    cur.execute("SELECT _id, id_category, desc, type, date, amount FROM TRANSACT ORDER BY date DESC")
    tx_rows = cur.fetchall()

    transactions = []
    for r in tx_rows:
        _id, cat_id, desc, tx_type, timestamp_ms, amt_str = r
        raw_cat = ck_categories.get(cat_id, {}).get('name', 'Lain-lain')
        is_income = (tx_type == 1) or (ck_categories.get(cat_id, {}).get('type') == 'income')
        
        app_cat = CATEGORY_MAP.get(raw_cat)
        if not app_cat:
            app_cat = 'Pemasukan Lainnya' if is_income else 'Pengeluaran Lainnya'
        
        dt = datetime.fromtimestamp(timestamp_ms / 1000.0)
        date_str = dt.strftime('%Y-%m-%d')
        time_str = dt.strftime('%H:%M')
        
        try:
            amount = int(float(amt_str))
        except (ValueError, TypeError):
            amount = 0

        clean_desc = (desc or '').strip()
        if not clean_desc:
            clean_desc = raw_cat

        transactions.append({
            'id': f'ckbak-{_id}',
            'user_id': 'demo-user',
            'type': 'income' if is_income else 'expense',
            'amount': amount,
            'category': app_cat,
            'category_icon': CATEGORY_ICONS.get(app_cat, 'MoreHorizontal'),
            'category_color': CATEGORY_COLORS.get(app_cat, '#64748B'),
            'account_id': 'acc-wallet',
            'account_name': 'Uang Tunai (Dompet)',
            'date': date_str,
            'time': time_str,
            'note': clean_desc,
            'created_at': dt.isoformat() + 'Z'
        })

    backup_data = {
        'version': '1.0',
        'export_date': datetime.now().isoformat(),
        'source': 'Catatan Keuangan CKBAK Converter',
        'total_transactions': len(transactions),
        'transactions': transactions,
    }

    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(backup_data, f, ensure_ascii=False, indent=2)

    return output_file

if __name__ == '__main__':
    in_file = sys.argv[1] if len(sys.argv) > 1 else r'C:\Users\user\Downloads\CK(13-09-2026-042530).ckbak'
    out_file = sys.argv[2] if len(sys.argv) > 2 else None
    out = convert_ckbak(in_file, out_file)
    print(f"Selesai! File tersimpan di: {out}")

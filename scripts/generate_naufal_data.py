import json
import os

with open(r'C:\Users\user\Downloads\Backup_Catatan_Keuangan_dari_CKBAK.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

txs = data['transactions']
for t in txs:
    t['account_id'] = 'acc-cash'
    t['account_name'] = 'Uang Tunai (Dompet)'

os.makedirs(r'd:\Naufal\AI\catatan-keuangan\src\data', exist_ok=True)
with open(r'd:\Naufal\AI\catatan-keuangan\src\data\naufalDefaultTransactions.ts', 'w', encoding='utf-8') as f:
    f.write('import { Transaction } from "@/types/finance";\n\n')
    f.write('export const NAUFAL_BACKUP_TRANSACTIONS: Transaction[] = ')
    json.dump(txs, f, ensure_ascii=False, indent=2)
    f.write(';\n')

print(f'Successfully wrote {len(txs)} transactions to src/data/naufalDefaultTransactions.ts')

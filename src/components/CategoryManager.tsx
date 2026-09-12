'use client';

import React, { useState } from 'react';
import { useFinance } from '@/context/FinanceContext';
import { Category } from '@/types/finance';
import CategoryIcon from './CategoryIcon';
import { 
  Tag, 
  Plus, 
  Pencil, 
  Trash2, 
  Check, 
  X, 
  RotateCcw,
  Sparkles,
  Layers
} from 'lucide-react';

const COLOR_PALETTE = [
  '#EF4444', // Red
  '#F97316', // Orange
  '#F59E0B', // Amber
  '#10B981', // Emerald
  '#14B8A6', // Teal
  '#06B6D4', // Cyan
  '#3B82F6', // Blue
  '#6366F1', // Indigo
  '#8B5CF6', // Purple
  '#EC4899', // Pink
  '#64748B', // Slate
  '#059669', // Dark Emerald
];

const AVAILABLE_ICONS = [
  'UtensilsCrossed',
  'Coffee',
  'Car',
  'ShoppingBag',
  'Zap',
  'Film',
  'Gamepad2',
  'HeartPulse',
  'GraduationCap',
  'HandHeart',
  'BadgeDollarSign',
  'Coins',
  'Wallet',
  'TrendingUp',
  'Laptop',
  'Store',
  'Briefcase',
  'Home',
  'Plane',
  'Dumbbell',
  'Gift',
  'Baby',
  'Dog',
  'Sparkles',
  'Smartphone',
  'Tag',
  'MoreHorizontal',
];

export default function CategoryManager() {
  const { categories, addCategory, updateCategory, deleteCategory, resetCategoriesToDefault } = useFinance();

  const [activeTab, setActiveTab] = useState<'expense' | 'income'>('expense');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  // Form states
  const [formName, setFormName] = useState('');
  const [formType, setFormType] = useState<'expense' | 'income'>('expense');
  const [formColor, setFormColor] = useState('#10B981');
  const [formIcon, setFormIcon] = useState('Tag');
  const [errorMessage, setErrorMessage] = useState('');

  const filteredCategories = categories.filter((c) => c.type === activeTab);
  const expenseCount = categories.filter((c) => c.type === 'expense').length;
  const incomeCount = categories.filter((c) => c.type === 'income').length;

  const handleOpenAdd = () => {
    setEditingCategory(null);
    setFormName('');
    setFormType(activeTab);
    setFormColor(activeTab === 'expense' ? '#EF4444' : '#10B981');
    setFormIcon(activeTab === 'expense' ? 'ShoppingBag' : 'BadgeDollarSign');
    setErrorMessage('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (cat: Category) => {
    setEditingCategory(cat);
    setFormName(cat.name);
    setFormType(cat.type);
    setFormColor(cat.color || '#3B82F6');
    setFormIcon(cat.icon || 'Tag');
    setErrorMessage('');
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanName = formName.trim();
    if (!cleanName) {
      setErrorMessage('Nama kategori tidak boleh kosong.');
      return;
    }

    // Check duplicate name in same type
    const isDuplicate = categories.some(
      (c) => c.type === formType && c.name.toLowerCase() === cleanName.toLowerCase() && c.id !== editingCategory?.id
    );
    if (isDuplicate) {
      setErrorMessage(`Kategori "${cleanName}" sudah ada untuk tipe ini.`);
      return;
    }

    if (editingCategory) {
      updateCategory(editingCategory.id, {
        name: cleanName,
        type: formType,
        color: formColor,
        icon: formIcon,
      });
    } else {
      addCategory({
        name: cleanName,
        type: formType,
        color: formColor,
        icon: formIcon,
      });
    }

    setIsModalOpen(false);
  };

  const handleDelete = (cat: Category) => {
    if (confirm(`Yakin ingin menghapus kategori "${cat.name}"?`)) {
      deleteCategory(cat.id);
    }
  };

  const handleReset = () => {
    if (confirm('Kembalikan seluruh daftar kategori ke konfigurasi awal? Kategori kustom akan terhapus.')) {
      resetCategoriesToDefault();
    }
  };

  return (
    <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400">
            <Tag className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
              Kelola Kategori Transaksi
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400">
                {categories.length} Total
              </span>
            </h2>
            <p className="text-[11px] text-slate-400">
              Sesuaikan nama, warna, dan ikon kategori pengeluaran & pemasukan
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleOpenAdd}
          className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-sm shadow-emerald-600/30 flex items-center gap-1.5"
        >
          <Plus className="w-3.5 h-3.5" />
          Tambah Kategori
        </button>
      </div>

      {/* Type Switcher Tabs */}
      <div className="flex bg-slate-100 dark:bg-slate-800/80 p-1 rounded-2xl">
        <button
          type="button"
          onClick={() => setActiveTab('expense')}
          className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
            activeTab === 'expense'
              ? 'bg-white dark:bg-slate-700 text-rose-600 dark:text-rose-400 shadow-sm'
              : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <span>Pengeluaran</span>
          <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-rose-100 text-rose-700 dark:bg-rose-950/50 dark:text-rose-400">
            {expenseCount}
          </span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('income')}
          className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
            activeTab === 'income'
              ? 'bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-400 shadow-sm'
              : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <span>Pemasukan</span>
          <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400">
            {incomeCount}
          </span>
        </button>
      </div>

      {/* Category List Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-[320px] overflow-y-auto pr-1">
        {filteredCategories.length === 0 ? (
          <div className="col-span-2 py-8 text-center text-slate-400 text-xs">
            Belum ada kategori untuk tipe ini. Klik &quot;Tambah Kategori&quot; di atas.
          </div>
        ) : (
          filteredCategories.map((cat) => (
            <div
              key={cat.id}
              className="flex items-center justify-between p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-800 hover:border-emerald-500/50 transition-colors group"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div
                  className="w-8 h-8 rounded-xl flex items-center justify-center text-white shrink-0 shadow-sm"
                  style={{ backgroundColor: cat.color }}
                >
                  <CategoryIcon name={cat.icon} className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
                    {cat.name}
                  </p>
                  <p className="text-[10px] text-slate-400 capitalize">
                    {cat.icon}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1 shrink-0">
                <button
                  type="button"
                  onClick={() => handleOpenEdit(cat)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 transition-colors"
                  title="Edit Kategori"
                >
                  <Pencil className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(cat)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                  title="Hapus Kategori"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Footer Actions */}
      <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800 text-[11px]">
        <span className="text-slate-400">
          Kategori baru langsung tersedia di input manual & Gemini AI.
        </span>
        <button
          type="button"
          onClick={handleReset}
          className="text-slate-400 hover:text-rose-500 transition-colors flex items-center gap-1 font-medium"
          title="Kembalikan semua kategori ke bawaan awal"
        >
          <RotateCcw className="w-3 h-3" />
          Reset Bawaan
        </button>
      </div>

      {/* Modal Tambah / Edit Kategori */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-sm rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-5 space-y-4 max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-500">
                  <Tag className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  {editingCategory ? 'Edit Kategori' : 'Tambah Kategori Baru'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Error message */}
            {errorMessage && (
              <div className="p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 text-rose-600 dark:text-rose-400 text-xs font-medium">
                {errorMessage}
              </div>
            )}

            <form onSubmit={handleSave} className="space-y-3.5">
              {/* Live Preview Card */}
              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700 flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-sm transition-transform"
                  style={{ backgroundColor: formColor }}
                >
                  <CategoryIcon name={formIcon} className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                    Pratinjau Kategori
                  </span>
                  <p className="text-xs font-extrabold text-slate-900 dark:text-white">
                    {formName.trim() || 'Nama Kategori'}
                  </p>
                  <span className={`text-[10px] font-bold ${formType === 'expense' ? 'text-rose-500' : 'text-emerald-500'}`}>
                    {formType === 'expense' ? 'Pengeluaran' : 'Pemasukan'}
                  </span>
                </div>
              </div>

              {/* Tipe Kategori */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Tipe Transaksi
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setFormType('expense')}
                    className={`py-2 rounded-xl text-xs font-bold border transition-all ${
                      formType === 'expense'
                        ? 'border-rose-500 bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 shadow-sm'
                        : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-500'
                    }`}
                  >
                    Pengeluaran
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormType('income')}
                    className={`py-2 rounded-xl text-xs font-bold border transition-all ${
                      formType === 'income'
                        ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 shadow-sm'
                        : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-500'
                    }`}
                  >
                    Pemasukan
                  </button>
                </div>
              </div>

              {/* Nama Kategori Input */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Nama Kategori
                </label>
                <input
                  type="text"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="Contoh: Kopi & Cafe, Investasi, dll."
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  autoFocus
                />
              </div>

              {/* Color Swatches */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Pilih Warna
                </label>
                <div className="grid grid-cols-6 gap-2">
                  {COLOR_PALETTE.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setFormColor(c)}
                      className="w-8 h-8 rounded-xl flex items-center justify-center text-white transition-transform hover:scale-110 shadow-sm"
                      style={{ backgroundColor: c }}
                    >
                      {formColor === c && <Check className="w-4 h-4 stroke-[3]" />}
                    </button>
                  ))}
                </div>
              </div>

              {/* Icon Picker */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Pilih Ikon
                </label>
                <div className="grid grid-cols-6 gap-1.5 max-h-36 overflow-y-auto p-1 border border-slate-200 dark:border-slate-800 rounded-2xl bg-slate-50/50 dark:bg-slate-800/40">
                  {AVAILABLE_ICONS.map((iconName) => {
                    const isSelected = formIcon === iconName;
                    return (
                      <button
                        key={iconName}
                        type="button"
                        onClick={() => setFormIcon(iconName)}
                        className={`p-2 rounded-xl flex items-center justify-center transition-all ${
                          isSelected
                            ? 'bg-emerald-600 text-white shadow-sm'
                            : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200/60 dark:hover:bg-slate-700'
                        }`}
                        title={iconName}
                      >
                        <CategoryIcon name={iconName} className="w-4 h-4" />
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Modal Buttons */}
              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-md shadow-emerald-600/30"
                >
                  {editingCategory ? 'Simpan Perubahan' : 'Tambah Kategori'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

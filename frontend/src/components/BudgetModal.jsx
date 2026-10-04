import { useEffect, useState } from 'react';
import { X, Pencil, Trash2 } from 'lucide-react';
import { api, rupiah } from '../lib/api';
import CategoryAvatar from './CategoryAvatar';

export function statusChip(status) {
  if (status === 'OVER_BUDGET') return { label: 'Melebihi Batas', cls: 'bg-red-50 text-red-500' };
  if (status === 'WARNING') return { label: 'Mendekati Batas', cls: 'bg-amber-50 text-amber-600' };
  return { label: 'Aman', cls: 'bg-mint-100 text-green-700' };
}

export function BudgetRow({ b, onEdit, onDelete }) {
  const chip = statusChip(b.status);
  return (
    <div className="py-3">
      <div className="flex items-center justify-between gap-2">
        <div className="flex min-w-0 items-center gap-3">
          <CategoryAvatar name={b.category_name} size={36} />
          <div className="min-w-0">
            <p className="truncate text-sm font-medium">{b.category_name}</p>
            <p className="num text-xs text-gray-400">
              {rupiah(b.spent)} / {rupiah(b.amount_limit)} Â· sisa {rupiah(Number(b.amount_limit) - Number(b.spent))}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <span className={`rounded-full px-2.5 py-1 text-[11px] font-medium ${chip.cls}`}>{chip.label}</span>
          <button onClick={onEdit} className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-50 hover:text-green-600" title="Ubah">
            <Pencil size={15} />
          </button>
          <button onClick={onDelete} className="rounded-lg p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-500" title="Hapus">
            <Trash2 size={15} />
          </button>
        </div>
      </div>
      <div className="mt-2 h-2 overflow-hidden rounded-full bg-gray-100">
        <div
          className={`h-full rounded-full ${b.status === 'OVER_BUDGET' ? 'bg-red-500' : b.status === 'WARNING' ? 'bg-amber-500' : 'bg-green-500'}`}
          style={{ width: `${Math.min(100, Number(b.usage_percentage))}%` }}
        />
      </div>
      <p className="num mt-1 text-right text-xs text-gray-400">{b.usage_percentage}% terpakai</p>
    </div>
  );
}

export default function BudgetModal({ onClose, onSaved, editing, month }) {
  const isEdit = !!editing;
  const [categoryId, setCategoryId] = useState(editing?.category_id || '');
  const [amount, setAmount] = useState(editing?.amount_limit ?? '');
  const [categories, setCategories] = useState([]);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    api
      .categories('?type=EXPENSE')
      .then((res) => setCategories(res.data))
      .catch((err) => setError(err.message));
  }, []);

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      if (isEdit) {
        await api.updateBudget(editing.id, { amount_limit: amount });
      } else {
        await api.createBudget({ category_id: categoryId, amount_limit: amount, month_year: `${month}-01` });
      }
      onSaved();
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center" role="dialog" aria-modal="true">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative max-h-[92vh] w-full overflow-y-auto rounded-t-2xl bg-white p-6 shadow-2xl sm:max-w-md sm:rounded-2xl">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-lg font-bold">{isEdit ? 'Ubah Budget' : `Set Budget â€” ${month}`}</h2>
          <button onClick={onClose} className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100" aria-label="Tutup">
            <X size={18} />
          </button>
        </div>
        {error && <p className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>}
        <form onSubmit={submit} className="space-y-4">
          {!isEdit && (
            <div>
              <label className="mb-1 block text-sm font-medium">Kategori Pengeluaran</label>
              <select
                required
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-green-600"
              >
                <option value="" disabled>Pilih kategori</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
              <p className="mt-1 text-xs text-gray-400">Budget hanya untuk kategori pengeluaran (BR-BUD-02).</p>
            </div>
          )}
          <div>
            <label className="mb-1 block text-sm font-medium">Batas Budget</label>
            <div className="flex items-center rounded-lg border border-gray-200 focus-within:border-green-600">
              <span className="pl-3 text-sm text-gray-400">Rp</span>
              <input
                type="number" min="1" step="any" required inputMode="decimal"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0"
                className="num w-full bg-transparent px-2 py-2.5 text-sm outline-none"
              />
            </div>
          </div>
          <div className="flex gap-2 pt-1">
            <button type="button" onClick={onClose} className="flex-1 rounded-lg border border-gray-200 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-50">Batal</button>
            <button type="submit" disabled={busy} className="flex-1 rounded-lg bg-green-600 py-2.5 text-sm font-semibold text-white hover:bg-green-700 disabled:opacity-60">
              {busy ? 'Menyimpanâ€¦' : 'Simpan Budget'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

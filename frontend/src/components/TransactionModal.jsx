import { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { api } from '../lib/api';

const TYPES = [
  { value: 'EXPENSE', label: 'Pengeluaran' },
  { value: 'INCOME', label: 'Pemasukan' },
];

export default function TransactionModal({ onClose, onSaved, editing }) {
  const [form, setForm] = useState({
    type: editing?.type || 'EXPENSE',
    amount: editing?.amount ?? '',
    category_id: editing?.category_id || '',
    date: editing?.date || new Date().toISOString().slice(0, 10),
    notes: editing?.notes || '',
  });
  const [categories, setCategories] = useState([]);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    api
      .categories()
      .then((res) => setCategories(res.data))
      .catch((err) => setError(err.message));
  }, []);

  const options = categories.filter((c) => c.type === form.type);

  const set = (patch) => {
    const next = { ...form, ...patch };
    if (patch.type && form.category_id) {
      const match = categories.find((c) => c.id === form.category_id && c.type === patch.type);
      if (!match) next.category_id = '';
    }
    setForm(next);
  };

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      if (editing) {
        await api.updateTransaction(editing.id, form);
      } else {
        await api.createTransaction(form);
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
          <h2 className="text-lg font-bold">{editing ? 'Ubah Transaksi' : 'Tambah Transaksi'}</h2>
          <button onClick={onClose} className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100" aria-label="Tutup">
            <X size={18} />
          </button>
        </div>

        {error && <p className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>}

        <form onSubmit={submit} className="space-y-4">
          <div className="grid grid-cols-2 gap-1 rounded-lg bg-gray-100 p-1">
            {TYPES.map((t) => (
              <button
                key={t.value}
                type="button"
                onClick={() => set({ type: t.value })}
                className={`rounded-md py-2 text-sm font-semibold transition ${
                  form.type === t.value ? 'bg-green-600 text-white shadow-sm' : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">Nominal</label>
            <div className="flex items-center rounded-lg border border-gray-200 focus-within:border-green-600">
              <span className="pl-3 text-sm text-gray-400">Rp</span>
              <input
                type="number"
                min="1"
                step="any"
                required
                inputMode="decimal"
                value={form.amount}
                onChange={(e) => set({ amount: e.target.value })}
                placeholder="0"
                className="num w-full bg-transparent px-2 py-2.5 text-sm outline-none"
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">Kategori</label>
            <select
              required
              value={form.category_id}
              onChange={(e) => set({ category_id: e.target.value })}
              className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-green-600"
            >
              <option value="" disabled>
                Pilih kategori
              </option>
              {options.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
            {options.length === 0 && (
              <p className="mt-1 text-xs text-gray-400">Belum ada kategori {form.type === 'INCOME' ? 'pemasukan' : 'pengeluaran'}.</p>
            )}
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">Tanggal</label>
            <input
              type="date"
              required
              value={form.date}
              onChange={(e) => set({ date: e.target.value })}
              className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-green-600"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">
              Catatan <span className="font-normal text-gray-400">(opsional)</span>
            </label>
            <input
              type="text"
              maxLength={1000}
              value={form.notes}
              onChange={(e) => set({ notes: e.target.value })}
              placeholder="Contoh: Makan siang"
              className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-green-600"
            />
          </div>

          <div className="flex gap-2 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-lg border border-gray-200 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-50"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={busy}
              className="flex-1 rounded-lg bg-green-600 py-2.5 text-sm font-semibold text-white hover:bg-green-700 disabled:opacity-60"
            >
              {busy ? 'Menyimpanâ€¦' : 'Simpan Transaksi'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

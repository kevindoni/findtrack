import { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { api } from '../lib/api';

export default function TodoModal({ onClose, onSaved, editing }) {
  const isEdit = !!editing;
  const [form, setForm] = useState({
    title: editing?.title || '',
    amount: editing?.amount ?? '',
    due_date: editing?.due_date || '',
    auto_expense: !!editing?.auto_expense,
  });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      const payload = {
        title: form.title,
        amount: form.amount === '' ? 0 : form.amount,
        due_date: form.due_date || null,
        auto_expense: form.auto_expense,
      };
      if (isEdit) {
        await api.updateTodo(editing.id, payload);
      } else {
        await api.createTodo(payload);
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
          <h2 className="text-lg font-bold">{isEdit ? 'Ubah To-Do' : 'Tambah To-Do'}</h2>
          <button onClick={onClose} className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100" aria-label="Tutup">
            <X size={18} />
          </button>
        </div>
        {error && <p className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>}
        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium">Judul To-Do</label>
            <input
              type="text"
              required
              maxLength={200}
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="Contoh: Bayar listrik"
              className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-green-600"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">
              Nominal <span className="font-normal text-gray-400">(boleh 0)</span>
            </label>
            <div className="flex items-center rounded-lg border border-gray-200 focus-within:border-green-600">
              <span className="pl-3 text-sm text-gray-400">Rp</span>
              <input
                type="number" min="0" step="any" inputMode="decimal"
                value={form.amount}
                onChange={(e) => setForm({ ...form, amount: e.target.value })}
                placeholder="0"
                className="num w-full bg-transparent px-2 py-2.5 text-sm outline-none"
              />
            </div>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">
              Tenggat <span className="font-normal text-gray-400">(opsional)</span>
            </label>
            <input
              type="date"
              value={form.due_date}
              onChange={(e) => setForm({ ...form, due_date: e.target.value })}
              className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-green-600"
            />
          </div>
          <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-gray-200 p-3.5 hover:bg-gray-50">
            <input
              type="checkbox"
              checked={form.auto_expense}
              onChange={(e) => setForm({ ...form, auto_expense: e.target.checked })}
              className="mt-0.5 h-4 w-4 accent-green-600"
            />
            <span className="text-sm">
              <span className="font-medium">Otomatis catat transaksi saat selesai</span>
              <span className="block text-xs text-gray-400">
                Saat dicentang selesai, pengeluaran senominal task dicatat otomatis ke kategori "Lainnya".
              </span>
            </span>
          </label>
          <div className="flex gap-2 pt-1">
            <button type="button" onClick={onClose} className="flex-1 rounded-lg border border-gray-200 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-50">Batal</button>
            <button type="submit" disabled={busy} className="flex-1 rounded-lg bg-green-600 py-2.5 text-sm font-semibold text-white hover:bg-green-700 disabled:opacity-60">
              {busy ? 'Menyimpanâ€¦' : 'Simpan To-Do'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

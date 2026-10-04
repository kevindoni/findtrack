import { useCallback, useEffect, useState } from 'react';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { api } from '../lib/api';
import CategoryAvatar from '../components/CategoryAvatar';

const TYPES = ['INCOME', 'EXPENSE'];
const TYPE_LABEL = { INCOME: 'Pemasukan', EXPENSE: 'Pengeluaran' };

export default function Kategori() {
  const [categories, setCategories] = useState(null);
  const [form, setForm] = useState({ name: '', type: 'EXPENSE' });
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const load = useCallback(() => {
    api
      .categories()
      .then((res) => setCategories(res.data))
      .catch((err) => setError(err.message));
  }, []);
  useEffect(load, [load]);

  const resetForm = () => {
    setEditingId(null);
    setForm({ name: '', type: 'EXPENSE' });
  };

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      if (editingId) {
        await api.updateCategory(editingId, form);
      } else {
        await api.createCategory(form);
      }
      resetForm();
      load();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  const startEdit = (c) => {
    setEditingId(c.id);
    setForm({ name: c.name, type: c.type });
    setError('');
  };

  const remove = async (c) => {
    if (!window.confirm(`Hapus kategori "${c.name}"?`)) return;
    setError('');
    try {
      await api.deleteCategory(c.id);
      if (editingId === c.id) resetForm();
      load();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="space-y-4">
      <header>
        <h1 className="text-2xl font-bold">Kategori</h1>
        <p className="text-sm text-gray-500">Kelola kategori pemasukan dan pengeluaran.</p>
      </header>

      {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>}

      <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
        <form onSubmit={submit} className="mb-4 flex flex-wrap gap-2">
          <input
            type="text"
            required
            maxLength={100}
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder={editingId ? 'Ubah nama kategori…' : 'Nama kategori baru…'}
            className="min-w-40 flex-1 rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-green-600"
          />
          <select
            value={form.type}
            onChange={(e) => setForm({ ...form, type: e.target.value })}
            className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:border-green-600"
          >
            {TYPES.map((t) => (
              <option key={t} value={t}>
                {TYPE_LABEL[t]}
              </option>
            ))}
          </select>
          <button
            type="submit"
            disabled={busy}
            className="flex items-center gap-1.5 rounded-lg bg-green-600 px-3.5 py-2 text-sm font-semibold text-white hover:bg-green-700 disabled:opacity-60"
          >
            {editingId ? 'Simpan' : (<><Plus size={15} /> Tambah</>)}
          </button>
          {editingId && (
            <button
              type="button"
              onClick={resetForm}
              className="rounded-lg border border-gray-200 px-3 py-2 text-sm font-semibold text-gray-500 hover:bg-gray-50"
            >
              Batal
            </button>
          )}
        </form>

        {categories === null ? (
          <p className="text-sm text-gray-400">Memuat…</p>
        ) : (
          <ul className="divide-y divide-gray-100">
            {categories.map((c) => (
              <li key={c.id} className="flex items-center gap-3 py-2.5">
                <CategoryAvatar name={c.name} size={34} />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{c.name}</p>
                </div>
                <span
                  className={`rounded-full px-2.5 py-1 text-[11px] font-medium ${
                    c.type === 'INCOME' ? 'bg-mint-100 text-green-700' : 'bg-red-50 text-red-500'
                  }`}
                >
                  {TYPE_LABEL[c.type]}
                </span>
                <button
                  onClick={() => startEdit(c)}
                  className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-50 hover:text-green-600"
                  title="Ubah"
                >
                  <Pencil size={15} />
                </button>
                <button
                  onClick={() => remove(c)}
                  className="rounded-lg p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-500"
                  title="Hapus"
                >
                  <Trash2 size={15} />
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

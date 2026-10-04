import { useCallback, useEffect, useState } from 'react';
import { Plus, Trash2, Pencil, Inbox } from 'lucide-react';
import { api, rupiah } from '../lib/api';
import TransactionModal from '../components/TransactionModal';
import CategoryAvatar from '../components/CategoryAvatar';

const TYPE_FILTERS = [
  { value: '', label: 'Semua' },
  { value: 'INCOME', label: 'Pemasukan' },
  { value: 'EXPENSE', label: 'Pengeluaran' },
];

export default function Transactions() {
  const [month, setMonth] = useState(new Date().toISOString().slice(0, 7));
  const [search, setSearch] = useState('');
  const [list, setList] = useState(null);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [type, setType] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [categories, setCategories] = useState([]);
  const [modal, setModal] = useState(null); // null | {editing}
  const [error, setError] = useState('');
  const limit = 20;

  const load = useCallback(() => {
    const params = new URLSearchParams();
    params.set('page', String(page));
    params.set('limit', String(limit));
    params.set('month', month);
    if (type) params.set('type', type);
    if (categoryId) params.set('category_id', categoryId);
    if (search) params.set('search', search);
    api
      .transactions(`?${params.toString()}`)
      .then((res) => {
        setList(res.data);
        setTotal(res.total);
      })
      .catch((err) => setError(err.message));
  }, [page, month, type, categoryId, search]);

  useEffect(load, [load]);
  useEffect(() => {
    api.categories().then((res) => setCategories(res.data)).catch(() => {});
  }, []);

  const remove = async (t) => {
    if (!window.confirm(`Hapus transaksi "${t.category_name} — ${rupiah(t.amount)}"?`)) return;
    try {
      await api.deleteTransaction(t.id);
      load();
    } catch (err) {
      setError(err.message);
    }
  };

  const totalPages = Math.max(1, Math.ceil(total / limit));
  const categoryName = (id) => categories.find((c) => c.id === id)?.name || '';

  return (
    <div className="space-y-4">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Transaksi</h1>
          <p className="text-sm text-gray-500">Riwayat pemasukan dan pengeluaranmu.</p>
        </div>
        <button
          onClick={() => setModal({ editing: null })}
          className="flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-green-700"
        >
          <Plus size={16} />
          Tambah Transaksi
        </button>
      </header>

      {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>}

      <div className="flex flex-wrap items-center gap-2">
        <div className="flex gap-1 rounded-lg bg-gray-100 p-1">
          {TYPE_FILTERS.map((f) => (
            <button
              key={f.value}
              onClick={() => {
                setType(f.value);
                setPage(1);
              }}
              className={`rounded-md px-3 py-1.5 text-xs font-semibold transition ${
                type === f.value ? 'bg-green-600 text-white' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
        <select
          value={categoryId}
          onChange={(e) => {
            setCategoryId(e.target.value);
            setPage(1);
          }}
          className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs text-gray-600 outline-none focus:border-green-600"
        >
          <option value="">Semua Kategori</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
        <input
          type="month"
          value={month}
          onChange={(e) => {
            setMonth(e.target.value);
            setPage(1);
          }}
          className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs text-gray-600 outline-none focus:border-green-600"
        />
        <input
          type="search"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          placeholder="Cari catatan/kategori…"
          className="min-w-40 rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs outline-none focus:border-green-600"
        />
      </div>

      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
        {list === null ? (
          <p className="p-6 text-sm text-gray-400">Memuat…</p>
        ) : list.length === 0 ? (
          <div className="p-10 text-center">
            <Inbox className="mx-auto h-10 w-10 text-gray-300" />
            <p className="mt-3 text-sm text-gray-400">Belum ada transaksi pada filter ini.</p>
          </div>
        ) : (
          <ul className="hidden divide-y divide-gray-100 md:block">
            {list.map((t) => (
              <li key={t.id} className="flex items-center gap-3 px-5 py-3">
                <CategoryAvatar name={t.category_name} size={38} />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">
                    {t.category_name}
                    {t.notes ? <span className="font-normal text-gray-400"> — {t.notes}</span> : null}
                  </p>
                  <p className="num text-xs text-gray-400">{t.date}</p>
                </div>
                <span
                  className={`num hidden text-sm font-semibold sm:block ${
                    t.type === 'INCOME' ? 'text-green-600' : 'text-red-500'
                  }`}
                >
                  {t.type === 'INCOME' ? '+' : '−'}
                  {rupiah(t.amount)}
                </span>
                <span
                  className={`hidden rounded-full px-2.5 py-1 text-[11px] font-medium lg:inline ${
                    t.type === 'INCOME' ? 'bg-mint-100 text-green-700' : 'bg-red-50 text-red-500'
                  }`}
                >
                  {t.type === 'INCOME' ? 'Pemasukan' : 'Pengeluaran'}
                </span>
                <div className="flex gap-1">
                  <button
                    onClick={() => setModal({ editing: t })}
                    className="rounded-lg p-2 text-gray-400 hover:bg-gray-50 hover:text-green-600"
                    title="Ubah"
                  >
                    <Pencil size={15} />
                  </button>
                  <button
                    onClick={() => remove(t)}
                    className="rounded-lg p-2 text-gray-400 hover:bg-red-50 hover:text-red-500"
                    title="Hapus"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}

        {/* Tampilan mobile: kartu */}
        {list !== null && list.length > 0 && (
          <ul className="divide-y divide-gray-100 md:hidden">
            {list.map((t) => (
              <li key={t.id} className="flex items-center gap-3 px-4 py-3">
                <CategoryAvatar name={t.category_name} size={38} />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">
                    {t.category_name}
                    {t.notes ? <span className="font-normal text-gray-400"> — {t.notes}</span> : null}
                  </p>
                  <p className="num text-xs text-gray-400">{t.date}</p>
                  <span
                    className={`num mt-0.5 inline-block text-sm font-semibold ${
                      t.type === 'INCOME' ? 'text-green-600' : 'text-red-500'
                    }`}
                  >
                    {t.type === 'INCOME' ? '+' : '−'}
                    {rupiah(t.amount)}
                  </span>
                </div>
                <div className="flex flex-col gap-1">
                  <button
                    onClick={() => setModal({ editing: t })}
                    className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-50 hover:text-green-600"
                    title="Ubah"
                  >
                    <Pencil size={15} />
                  </button>
                  <button
                    onClick={() => remove(t)}
                    className="rounded-lg p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-500"
                    title="Hapus"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {total > limit && (
        <div className="flex items-center justify-between text-sm text-gray-500">
          <button
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
            className="rounded-lg border border-gray-200 px-3 py-1.5 font-medium hover:bg-gray-50 disabled:opacity-40"
          >
            Sebelumnya
          </button>
          <span className="num">
            Halaman {page} dari {totalPages} · {total} transaksi
          </span>
          <button
            disabled={page >= totalPages}
            onClick={() => setPage((p) => p + 1)}
            className="rounded-lg border border-gray-200 px-3 py-1.5 font-medium hover:bg-gray-50 disabled:opacity-40"
          >
            Berikutnya
          </button>
        </div>
      )}

      {modal && (
        <TransactionModal
          editing={modal.editing}
          onClose={() => setModal(null)}
          onSaved={() => {
            load();
            setPage(1);
          }}
        />
      )}
    </div>
  );
}

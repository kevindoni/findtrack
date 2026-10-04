import { useCallback, useEffect, useState } from 'react';
import { Plus, Trash2, Inbox, Pencil } from 'lucide-react';
import { api, rupiah } from '../lib/api';
import TodoModal from '../components/TodoModal';
import { TodoAvatar } from '../components/CategoryAvatar';

const TABS = [
  { value: 'all', label: 'Semua' },
  { value: 'active', label: 'Aktif' },
  { value: 'completed', label: 'Selesai' },
];

const today = new Date().toISOString().slice(0, 10);

function badge(t) {
  if (t.is_completed) return { label: 'Selesai', cls: 'bg-gray-100 text-gray-500' };
  if (t.due_date && t.due_date < today) return { label: 'Terlambat', cls: 'bg-red-50 text-red-500' };
  return { label: 'Aktif', cls: 'bg-mint-100 text-green-700' };
}

export default function Todos() {
  const [rows, setRows] = useState(null);
  const [tab, setTab] = useState('all');
  const [modal, setModal] = useState(null); // null | {editing}
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');

  const load = useCallback(() => {
    api
      .todos()
      .then((res) => setRows(res.data))
      .catch((err) => setError(err.message));
  }, []);
  useEffect(load, [load]);

  const filtered = (rows || []).filter((t) =>
    tab === 'all' ? true : tab === 'active' ? !t.is_completed : t.is_completed
  );
  const activeCount = (rows || []).filter((t) => !t.is_completed).length;

  const complete = async (t) => {
    try {
      const res = await api.completeTodo(t.id);
      load();
      if (res.data.transaction_created) {
        setNotice(`Transaksi otomatis dicatat: ${rupiah(res.data.transaction.amount)} (pengeluaran).`);
        setTimeout(() => setNotice(''), 6000);
      }
    } catch (err) {
      setError(err.message);
    }
  };

  const remove = async (t) => {
    if (!window.confirm(`Hapus to-do "${t.title}"?`)) return;
    try {
      await api.deleteTodo(t.id);
      load();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="space-y-4">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Financial To-Do</h1>
          <p className="text-sm text-gray-500">Kelola tugas keuanganmu, jangan sampai terlewat.</p>
        </div>
        <button
          onClick={() => setModal({ editing: null })}
          className="flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-green-700"
        >
          <Plus size={16} />
          Tambah To-Do
        </button>
      </header>

      {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>}
      {notice && <p className="rounded-lg bg-mint-100 px-3 py-2 text-sm text-green-700">{notice}</p>}

      <div className="flex gap-1 rounded-lg bg-gray-100 p-1 sm:w-fit">
        {TABS.map((f) => (
          <button
            key={f.value}
            onClick={() => setTab(f.value)}
            className={`flex-1 whitespace-nowrap rounded-md px-3 py-1.5 text-xs font-semibold transition sm:flex-none ${
              tab === f.value ? 'bg-green-600 text-white' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {f.label}
            {f.value === 'active' && activeCount > 0 ? ` (${activeCount})` : ''}
          </button>
        ))}
      </div>

      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
        {rows === null ? (
          <p className="p-6 text-sm text-gray-400">Memuat…</p>
        ) : filtered.length === 0 ? (
          <div className="p-10 text-center">
            <Inbox className="mx-auto h-10 w-10 text-gray-300" />
            <p className="mt-3 text-sm text-gray-400">Tidak ada to-do pada tab ini.</p>
          </div>
        ) : (
          <ul className="divide-y divide-gray-100">
            {filtered.map((t) => {
              const b = badge(t);
              return (
                <li key={t.id} className="flex items-center gap-3 px-4 py-3.5 sm:px-5">
                  <input
                    type="checkbox"
                    checked={!!t.is_completed}
                    onChange={() => !t.is_completed && complete(t)}
                    title={t.is_completed ? 'Selesai' : 'Tandai selesai'}
                    className="h-5 w-5 shrink-0 accent-green-600"
                  />
                  <TodoAvatar title={t.title} size={36} />
                  <div className="min-w-0 flex-1">
                    <p className={`truncate text-sm font-medium ${t.is_completed ? 'text-gray-400 line-through' : ''}`}>
                      {t.title}
                    </p>
                    <p className="num text-xs text-gray-400">
                      {rupiah(t.amount)} · jatuh tempo {t.due_date ?? '—'}
                      {t.auto_expense && !t.is_completed ? ' · auto expense' : ''}
                      {t.is_completed ? ' · tercatat via auto expense' : ''}
                    </p>
                  </div>
                  <span className={`rounded-full px-2.5 py-1 text-[11px] font-medium ${b.cls}`}>{b.label}</span>
                  {!t.is_completed && (
                    <button
                      onClick={() => setModal({ editing: t })}
                      className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-50 hover:text-green-600"
                      title="Ubah"
                    >
                      <Pencil size={15} />
                    </button>
                  )}
                  <button
                    onClick={() => remove(t)}
                    className="rounded-lg p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-500"
                    title="Hapus"
                  >
                    <Trash2 size={15} />
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {modal && <TodoModal editing={modal.editing} onClose={() => setModal(null)} onSaved={load} />}
    </div>
  );
}

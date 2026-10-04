import { useCallback, useEffect, useState } from 'react';
import { Plus, Inbox } from 'lucide-react';
import { api, rupiah } from '../lib/api';
import BudgetModal, { BudgetRow } from '../components/BudgetModal';

export default function Budgets() {
  const [month, setMonth] = useState(new Date().toISOString().slice(0, 7));
  const [rows, setRows] = useState(null);
  const [modal, setModal] = useState(null); // null | {editing}
  const [error, setError] = useState('');

  const load = useCallback(() => {
    api
      .budgets(`?month=${month}`)
      .then((res) => setRows(res.data))
      .catch((err) => setError(err.message));
  }, [month]);
  useEffect(load, [load]);

  const remove = async (b) => {
    if (!window.confirm(`Hapus budget "${b.category_name}" untuk ${month}?`)) return;
    try {
      await api.deleteBudget(b.id);
      load();
    } catch (err) {
      setError(err.message);
    }
  };

  const totalLimit = (rows || []).reduce((a, b) => a + Number(b.amount_limit), 0);
  const totalSpent = (rows || []).reduce((a, b) => a + Number(b.spent), 0);
  const pct = totalLimit > 0 ? Math.round((totalSpent / totalLimit) * 100) : 0;

  return (
    <div className="space-y-4">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Budget Bulanan</h1>
          <p className="text-sm text-gray-500">Kendalikan pengeluaran per kategori.</p>
        </div>
        <div className="flex items-center gap-2">
          <input
            type="month"
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs text-gray-600 outline-none focus:border-green-600"
          />
          <button
            onClick={() => setModal({ editing: null })}
            className="flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-green-700"
          >
            <Plus size={16} />
            Set Budget
          </button>
        </div>
      </header>

      {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>}

      <section className="grid grid-cols-3 gap-2 sm:gap-4">
        <div className="rounded-2xl border border-gray-200 bg-white p-3 shadow-sm sm:p-5">
          <p className="text-xs text-gray-500">Total Budget</p>
          <p className="num whitespace-nowrap text-sm font-bold sm:text-lg">{rupiah(totalLimit)}</p>
        </div>
        <div className="rounded-2xl border border-gray-200 bg-white p-3 shadow-sm sm:p-5">
          <p className="text-xs text-gray-500">Terpakai</p>
          <p className="num whitespace-nowrap text-sm font-bold sm:text-lg">{rupiah(totalSpent)}</p>
          {totalLimit > 0 && (
            <p className={`text-xs font-medium ${pct >= 100 ? 'text-red-500' : pct >= 80 ? 'text-amber-500' : 'text-green-600'}`}>
              {pct}% terpakai
            </p>
          )}
        </div>
        <div className="rounded-2xl border border-gray-200 bg-white p-3 shadow-sm sm:p-5">
          <p className="text-xs text-gray-500">Sisa</p>
          <p className={`num whitespace-nowrap text-sm font-bold sm:text-lg ${totalLimit > 0 && totalSpent > totalLimit ? 'text-red-500' : ''}`}>
            {rupiah(totalLimit - totalSpent)}
          </p>
        </div>
      </section>

      <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
        <h2 className="mb-2 font-semibold">Budget per Kategori</h2>
        {rows === null ? (
          <p className="text-sm text-gray-400">Memuat…</p>
        ) : rows.length === 0 ? (
          <div className="p-6 text-center">
            <Inbox className="mx-auto h-10 w-10 text-gray-300" />
            <p className="mt-3 text-sm text-gray-400">Belum ada budget bulan ini. Tekan "Set Budget" untuk mulai.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {rows.map((b) => (
              <BudgetRow
                key={b.id}
                b={b}
                onEdit={() => setModal({ editing: b })}
                onDelete={() => remove(b)}
              />
            ))}
          </div>
        )}
      </div>

      {modal && (
        <BudgetModal
          editing={modal.editing}
          month={month}
          onClose={() => setModal(null)}
          onSaved={load}
        />
      )}
    </div>
  );
}

import { useEffect, useState } from 'react';
import { Wallet, ArrowDownCircle, ArrowUpCircle, Target } from 'lucide-react';
import { api, rupiah } from '../lib/api';
import CategoryAvatar, { TodoAvatar } from '../components/CategoryAvatar';
import { LineSummary, DonutByCategory } from '../components/Charts';

const STATUS_COLOR = {
  OK: 'bg-green-500',
  WARNING: 'bg-amber-500',
  OVER_BUDGET: 'bg-red-500',
};

function StatCard({ label, value, hint, hintColor = 'text-green-600', icon }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-gray-200 bg-white p-3.5 shadow-sm sm:gap-4 sm:p-5">
      <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-mint-100 sm:size-11">{icon}</span>
      <div className="min-w-0">
        <p className="truncate text-xs text-gray-500">{label}</p>
        <p className="num whitespace-nowrap text-[13px] font-bold leading-snug sm:text-base xl:text-lg">{value}</p>
        {hint && <p className={`truncate text-xs font-medium ${hintColor}`}>{hint}</p>}
      </div>
    </div>
  );
}

export default function Dashboard() {
  const [summary, setSummary] = useState(null);
  const [error, setError] = useState('');
  const [month, setMonth] = useState(new Date().toISOString().slice(0, 7));

  useEffect(() => {
    api
      .summary(month)
      .then((res) => setSummary(res.data))
      .catch((err) => setError(err.message));
  }, [month]);

  if (error) return <p className="text-red-600">{error}</p>;
  if (!summary) return <p className="text-gray-400">Memuat ringkasan…</p>;

  const { balance, total_income, total_expense, budget, budgets, recent, todos } = summary;

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Halo!</h1>
          <p className="text-sm text-gray-500">Semangat terus mengelola keuanganmu!</p>
        </div>
        <input
          type="month"
          value={month}
          onChange={(e) => setMonth(e.target.value)}
          className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs text-gray-600 outline-none focus:border-green-600"
        />
      </header>

      <section className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
        <StatCard label="Saldo Total" value={rupiah(balance)} icon={<Wallet className="h-5 w-5 text-green-700" />} />
        <StatCard label="Pemasukan" value={rupiah(total_income)} hint="bulan ini" icon={<ArrowDownCircle className="h-5 w-5 text-blue-600" />} />
        <StatCard label="Pengeluaran" value={rupiah(total_expense)} hint="bulan ini" hintColor="text-red-500" icon={<ArrowUpCircle className="h-5 w-5 text-red-500" />} />
        <StatCard
          label="Sisa Budget"
          value={rupiah(budget.sisa)}
          hint={budget.total_limit > 0 ? `${budget.total_limit_pct}% terpakai` : 'belum ada budget'}
          hintColor={budget.total_limit_pct >= 100 ? 'text-red-500' : budget.total_limit_pct >= 80 ? 'text-amber-500' : 'text-green-600'}
          icon={<Target className="h-5 w-5 text-purple-600" />}
        />
      </section>

      <section className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <h2 className="mb-4 font-semibold">Ringkasan Keuangan — 6 Bulan Terakhir</h2>
          <div className="h-56">
            <LineSummary series={summary.series} />
          </div>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <h2 className="mb-4 font-semibold">Pengeluaran per Kategori</h2>
          {summary.expense_by_category.length === 0 ? (
            <p className="text-sm text-gray-400">Belum ada pengeluaran bulan ini.</p>
          ) : (
            <div className="h-56">
              <DonutByCategory
                items={summary.expense_by_category}
                total={summary.expense_by_category.reduce((a, b) => a + b.total, 0)}
              />
            </div>
          )}
        </div>
      </section>

      <section className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <h2 className="mb-4 font-semibold">Budget Bulanan</h2>
          {budgets.length === 0 && <p className="text-sm text-gray-400">Belum ada budget bulan ini.</p>}
          <div className="space-y-4">
            {budgets.map((b) => (
              <div key={b.id}>
                <div className="mb-1 flex items-baseline justify-between text-sm">
                  <span className="font-medium">{b.category_name}</span>
                  <span className="num text-gray-500">
                    {rupiah(b.spent)} / {rupiah(b.amount_limit)}
                  </span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-gray-100">
                  <div
                    className={`h-full rounded-full ${STATUS_COLOR[b.status]}`}
                    style={{ width: `${Math.min(100, Number(b.usage_percentage))}%` }}
                  />
                </div>
                <p className="mt-1 text-xs text-gray-400">
                  {b.usage_percentage}% —{' '}
                  {b.status === 'OVER_BUDGET' ? 'melebihi batas!' : b.status === 'WARNING' ? 'mendekati batas' : 'aman'}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <h2 className="mb-4 font-semibold">Transaksi Terbaru</h2>
          {recent.length === 0 && <p className="text-sm text-gray-400">Belum ada transaksi.</p>}
          <ul className="divide-y divide-gray-100">
            {recent.map((t) => (
              <li key={t.id} className="flex items-center gap-3 py-2.5">
                <CategoryAvatar name={t.category_name} size={34} />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium">{t.category_name}</p>
                  <p className="num text-xs text-gray-400">{t.date}</p>
                </div>
                <span className={`num text-sm font-semibold ${t.type === 'INCOME' ? 'text-green-600' : 'text-red-500'}`}>
                  {t.type === 'INCOME' ? '+' : '−'}
                  {rupiah(t.amount)}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
        <h2 className="mb-4 font-semibold">Financial To-Do Terdekat</h2>
        {todos.length === 0 && <p className="text-sm text-gray-400">Tidak ada to-do aktif.</p>}
        <ul className="divide-y divide-gray-100">
            {todos.map((td) => (
              <li key={td.id} className="flex items-center gap-3 py-2.5">
                <TodoAvatar title={td.title} size={34} />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium">{td.title}</p>
                  <p className="num text-xs text-gray-400">
                    {rupiah(td.amount)} · jatuh tempo {td.due_date ?? '—'}
                    {td.auto_expense ? ' · auto expense' : ''}
                  </p>
                </div>
                <span className="rounded-full bg-mint-100 px-2.5 py-1 text-xs font-medium text-green-700">Aktif</span>
              </li>
            ))}
        </ul>
      </section>
    </div>
  );
}

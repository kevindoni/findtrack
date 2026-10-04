import { Link } from 'react-router-dom';
import { Wallet, Target, ListChecks, LayoutDashboard, LogIn } from 'lucide-react';

const FEATURES = [
  { icon: Wallet, color: '#22C55E', title: 'Catat Transaksi', desc: 'Mudah & cepat, pemasukan maupun pengeluaran.' },
  { icon: Target, color: '#F97316', title: 'Atur Budget', desc: 'Terkontrol per kategori, ada peringatan otomatis.' },
  { icon: ListChecks, color: '#3B82F6', title: 'Selesaikan To-Do', desc: 'Tugas keuangan otomatis tercatat.' },
  { icon: LayoutDashboard, color: '#8B5CF6', title: 'Pantau Dashboard', desc: 'Saldo, budget, dan to-do dalam satu tempat.' },
];

export default function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-mint-100 via-page to-mint-50">
      <header className="mx-auto flex max-w-5xl items-center justify-between px-5 py-5">
        <div className="flex items-center gap-2">
          <span className="grid size-9 place-items-center rounded-lg bg-green-600 text-lg font-black text-white">F</span>
          <span className="text-xl font-black tracking-wide text-pine-900">FINTRACK</span>
        </div>
        <Link
          to="/auth/login"
          className="flex items-center gap-1.5 rounded-lg border border-green-600 px-4 py-2 text-sm font-semibold text-green-700 hover:bg-green-600 hover:text-white"
        >
          <LogIn size={15} /> Login
        </Link>
      </header>

      <main className="mx-auto max-w-5xl px-5">
        <section className="grid place-items-center py-14 text-center sm:py-20">
          <span className="mb-5 grid size-16 place-items-center rounded-2xl bg-green-600 text-3xl font-black text-white shadow-lg shadow-green-600/30">
            F
          </span>
          <h1 className="max-w-2xl text-3xl font-black leading-tight text-pine-900 sm:text-4xl">
            Kelola Keuanganmu, <span className="text-green-600">Raih Masa Depanmu</span>
          </h1>
          <p className="mt-4 max-w-xl text-sm leading-relaxed text-gray-600 sm:text-base">
            Catat transaksi, atur budget bulanan, dan selesaikan to-do keuangan — semua dalam satu tempat.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link
              to="/auth/register"
              className="rounded-xl bg-green-600 px-6 py-3 text-sm font-bold text-white shadow-md shadow-green-600/30 hover:bg-green-700"
            >
              Mulai Sekarang
            </Link>
            <Link
              to="/auth/login"
              className="rounded-xl border border-green-600 px-6 py-3 text-sm font-bold text-green-700 hover:bg-mint-100"
            >
              Sudah punya akun
            </Link>
          </div>
        </section>

        <section className="grid grid-cols-1 gap-4 pb-16 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map((f) => (
            <div key={f.title} className="rounded-2xl border border-gray-200 bg-white p-5 text-center shadow-sm">
              <span
                className="mx-auto mb-3 grid size-12 place-items-center rounded-full text-white"
                style={{ backgroundColor: f.color }}
              >
                <f.icon size={22} />
              </span>
              <h3 className="text-sm font-bold">{f.title}</h3>
              <p className="mt-1 text-xs leading-relaxed text-gray-500">{f.desc}</p>
            </div>
          ))}
        </section>

        <section className="pb-16 text-center">
          <p className="text-lg font-bold italic text-pine-900">Kelola hari ini, untuk esok yang lebih baik.</p>
          <p className="mt-1 text-xs text-gray-500">Lebih teratur · Lebih sadar · Lebih dekat dengan tujuan</p>
        </section>
      </main>
    </div>
  );
}

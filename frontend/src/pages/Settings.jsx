import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Tags, ShieldCheck, AlertTriangle, Check, X, Pencil, LogOut } from 'lucide-react';
import { api } from '../lib/api';

const TYPES = ['INCOME', 'EXPENSE'];
const TYPE_LABEL = { INCOME: 'Pemasukan', EXPENSE: 'Pengeluaran' };

export default function Settings({ user, onUserChange, onLogout }) {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [error, setError] = useState('');

  const [nameOpen, setNameOpen] = useState(false);
  const [nameValue, setNameValue] = useState(user?.name || '');
  const [nameBusy, setNameBusy] = useState(false);

  const [pw, setPw] = useState({ current: '', next: '', confirm: '' });
  const [pwMsg, setPwMsg] = useState({ ok: false, text: '' });
  const [pwBusy, setPwBusy] = useState(false);

  const [delPassword, setDelPassword] = useState('');
  const [delBusy, setDelBusy] = useState(false);

  useEffect(() => {
    Promise.all([api.categories(), api.transactions('?limit=1'), api.todos('?status=active')])
      .then(([cats, trx, tds]) => {
        setStats({ categories: cats.data.length, transactions: trx.total, todos: tds.data.length });
      })
      .catch((err) => setError(err.message));
  }, []);

  const saveName = async () => {
    setNameBusy(true);
    try {
      const res = await api.updateProfile({ name: nameValue });
      onUserChange(res.data.user);
      setNameOpen(false);
    } catch (err) {
      setError(err.message);
    } finally {
      setNameBusy(false);
    }
  };

  const changePassword = async (e) => {
    e.preventDefault();
    setPwMsg({ ok: false, text: '' });
    if (pw.next !== pw.confirm) {
      setPwMsg({ ok: false, text: 'Konfirmasi password baru tidak sama.' });
      return;
    }
    setPwBusy(true);
    try {
      const res = await api.changePassword({ current_password: pw.current, new_password: pw.next });
      setPwMsg({ ok: true, text: res.message });
      setPw({ current: '', next: '', confirm: '' });
    } catch (err) {
      setPwMsg({ ok: false, text: err.message });
    } finally {
      setPwBusy(false);
    }
  };

  const deleteAccount = async () => {
    if (!window.confirm('PERMANEN: Akun dan SELURUH data keuangan akan dihapus. Lanjutkan?')) return;
    setDelBusy(true);
    try {
      await api.deleteAccount({ password: delPassword });
      onUserChange(null);
      navigate('/');
    } catch (err) {
      setError(err.message);
    } finally {
      setDelBusy(false);
    }
  };

  return (
    <div className="space-y-4">
      <header>
        <h1 className="text-2xl font-bold">Pengaturan</h1>
        <p className="text-sm text-gray-500">Profil, keamanan, dan hapus akun.</p>
      </header>

      {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>}

      <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
        <h2 className="mb-4 flex items-center gap-2 font-semibold">
          <ShieldCheck size={16} className="text-green-700" /> Ganti Password
        </h2>
        {pwMsg.text && (
          <p className={`mb-4 rounded-lg px-3 py-2 text-sm ${pwMsg.ok ? 'bg-mint-100 text-green-700' : 'bg-red-50 text-red-600'}`}>
            {pwMsg.text}
          </p>
        )}
        <form onSubmit={changePassword} className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div>
            <label className="mb-1 block text-xs text-gray-500">Password saat ini</label>
            <input
              type="password"
              required
              value={pw.current}
              onChange={(e) => setPw({ ...pw, current: e.target.value })}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-green-600"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs text-gray-500">Password baru</label>
            <input
              type="password"
              required
              value={pw.next}
              onChange={(e) => setPw({ ...pw, next: e.target.value })}
              placeholder="Min. 8 karakter, huruf + angka"
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-green-600"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs text-gray-500">Konfirmasi password baru</label>
            <input
              type="password"
              required
              value={pw.confirm}
              onChange={(e) => setPw({ ...pw, confirm: e.target.value })}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-green-600"
            />
          </div>
          <div className="sm:col-span-3">
            <button
              type="submit"
              disabled={pwBusy}
              className="rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-700 disabled:opacity-60"
            >
              {pwBusy ? 'Menyimpan…' : 'Ubah Password'}
            </button>
          </div>
        </form>
      </section>

      <section className="rounded-2xl border border-red-200 bg-red-50/50 p-5 shadow-sm">
        <h2 className="mb-2 flex items-center gap-2 font-semibold text-red-600">
          <AlertTriangle size={16} /> Hapus Akun
        </h2>
        <p className="mb-3 text-xs leading-relaxed text-gray-600">
          Menghapus akun berarti menghapus <strong>seluruh</strong> transaksi, budget, kategori, dan to-do Anda secara
          permanen (BR-DATA-02). Tindakan ini tidak dapat dibatalkan.
        </p>
        <div className="flex flex-wrap items-center gap-2">
          <input
            type="password"
            value={delPassword}
            onChange={(e) => setDelPassword(e.target.value)}
            placeholder="Konfirmasi dengan password"
            className="w-56 rounded-lg border border-red-200 px-3 py-2 text-sm outline-none focus:border-red-500"
          />
          <button
            onClick={deleteAccount}
            disabled={delBusy || !delPassword}
            className="flex items-center gap-1.5 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-40"
          >
            <Trash2 size={14} />
            {delBusy ? 'Menghapus…' : 'Hapus Akun Permanen'}
          </button>
        </div>
      </section>

      <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
        <h2 className="mb-4 flex items-center gap-2 font-semibold">
          <User size={16} className="text-green-700" /> Akun
        </h2>
        {nameOpen ? (
          <div className="flex flex-wrap items-center gap-2">
            <input
              type="text"
              value={nameValue}
              maxLength={100}
              onChange={(e) => setNameValue(e.target.value)}
              className="min-w-40 flex-1 rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-green-600"
            />
            <button
              onClick={saveName}
              disabled={nameBusy}
              className="flex items-center gap-1 rounded-lg bg-green-600 px-3 py-2 text-sm font-semibold text-white hover:bg-green-700 disabled:opacity-60"
            >
              <Check size={14} /> Simpan
            </button>
            <button
              onClick={() => {
                setNameOpen(false);
                setNameValue(user?.name || '');
              }}
              className="rounded-lg p-2 text-gray-400 hover:bg-gray-50"
              title="Batal"
            >
              <X size={14} />
            </button>
          </div>
        ) : (
          <div className="flex items-center justify-between gap-3">
            <div className="flex min-w-0 items-center gap-3">
              <span className="grid size-12 place-items-center rounded-full bg-green-600 text-lg font-bold text-white">
                {user?.name?.charAt(0)?.toUpperCase() || 'U'}
              </span>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold">{user?.name}</p>
                <p className="truncate text-xs text-gray-400">{user?.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  setNameOpen(true);
                  setNameValue(user?.name || '');
                }}
                className="flex items-center gap-1 rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-semibold text-gray-600 hover:bg-gray-50"
              >
                <Pencil size={13} /> Ubah Nama
              </button>
              <button
                onClick={onLogout}
                className="flex items-center gap-1 rounded-lg border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50"
              >
                <LogOut size={13} /> Keluar
              </button>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}

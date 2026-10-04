import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Pencil, Trash2, X, User, Tags, ShieldCheck, AlertTriangle, Check } from 'lucide-react';
import { api } from '../lib/api';
import CategoryAvatar from '../components/CategoryAvatar';

const TYPES = ['INCOME', 'EXPENSE'];
const TYPE_LABEL = { INCOME: 'Pemasukan', EXPENSE: 'Pengeluaran' };

export default function Settings({ user, onUserChange }) {
  const navigate = useNavigate();
  const [categories, setCategories] = useState(null);
  const [stats, setStats] = useState(null);
  const [form, setForm] = useState({ name: '', type: 'EXPENSE' });
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const [nameOpen, setNameOpen] = useState(false);
  const [nameValue, setNameValue] = useState(user?.name || '');
  const [nameBusy, setNameBusy] = useState(false);

  const [pw, setPw] = useState({ current: '', next: '', confirm: '' });
  const [pwMsg, setPwMsg] = useState({ ok: false, text: '' });
  const [pwBusy, setPwBusy] = useState(false);

  const [delPassword, setDelPassword] = useState('');
  const [delBusy, setDelBusy] = useState(false);

  const load = useCallback(() => {
    Promise.all([api.categories(), api.transactions('?limit=1'), api.todos('?status=active')])
      .then(([cats, trx, tds]) => {
        setCategories(cats.data);
        setStats({ categories: cats.data.length, transactions: trx.total, todos: tds.data.length });
      })
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
        <p className="text-sm text-gray-500">Profil, keamanan, dan manajemen kategori.</p>
      </header>

      {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <h2 className="mb-4 flex items-center gap-2 font-semibold">
            <User size={16} className="text-green-700" /> Profil
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
              <button
                onClick={() => {
                  setNameOpen(true);
                  setNameValue(user?.name || '');
                }}
                className="flex items-center gap-1 rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-semibold text-gray-600 hover:bg-gray-50"
              >
                <Pencil size={13} /> Ubah Nama
              </button>
            </div>
          )}
        </section>

        <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <h2 className="mb-4 font-semibold">Ringkasan Akun</h2>
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="rounded-xl bg-mint-100/70 p-3">
              <p className="num text-lg font-bold text-pine-900">{stats?.categories ?? '—'}</p>
              <p className="text-[11px] text-gray-500">Kategori</p>
            </div>
            <div className="rounded-xl bg-mint-100/70 p-3">
              <p className="num text-lg font-bold text-pine-900">{stats?.transactions ?? '—'}</p>
              <p className="text-[11px] text-gray-500">Transaksi</p>
            </div>
            <div className="rounded-xl bg-mint-100/70 p-3">
              <p className="num text-lg font-bold text-pine-900">{stats?.todos ?? '—'}</p>
              <p className="text-[11px] text-gray-500">To-Do Aktif</p>
            </div>
          </div>
        </section>
      </div>

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
          <Tags size={16} className="text-green-700" /> Kategori
        </h2>

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

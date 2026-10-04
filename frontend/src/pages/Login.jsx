import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../lib/api';

export default function Login({ onLogin }) {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      const res = await api.login(form);
      onLogin(res.data.user);
      navigate('/app/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="grid min-h-screen place-items-center bg-gradient-to-br from-mint-100 via-page to-mint-50 p-4">
      <div className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
        <div className="mb-6 text-center">
          <span className="mx-auto mb-3 grid size-12 place-items-center rounded-xl bg-green-600 text-2xl font-black text-white">F</span>
          <h1 className="text-xl font-bold">Masuk ke Akun Anda</h1>
          <p className="text-sm text-gray-500">Selamat datang kembali! Silakan login untuk melanjutkan.</p>
        </div>
        {error && (
          <p className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>
        )}
        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium">Email</label>
            <input
              type="email"
              required
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="nama@email.com"
              className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-green-600"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Password</label>
            <input
              type="password"
              required
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              placeholder="Masukkan password"
              className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-green-600"
            />
          </div>
          <button
            type="submit"
            disabled={busy}
            className="w-full rounded-lg bg-green-600 py-2.5 font-semibold text-white hover:bg-green-700 disabled:opacity-60"
          >
            {busy ? 'Memproses…' : 'Masuk'}
          </button>
        </form>
        <p className="mt-5 text-center text-sm text-gray-500">
          Belum punya akun?{' '}
          <Link to="/auth/register" className="font-semibold text-green-700 hover:underline">
            Daftar sekarang
          </Link>
        </p>
      </div>
    </div>
  );
}

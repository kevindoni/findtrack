import { useEffect, useState } from 'react';
import { Routes, Route, Navigate, NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  ReceiptText,
  Target,
  ListChecks,
  Tags,
  UserRound,
  Settings as SettingsIcon,
  LogOut,
} from 'lucide-react';
import { api } from './lib/api';
import LogoMark from './components/LogoMark.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import Landing from './pages/Landing.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Transactions from './pages/Transactions.jsx';
import Budgets from './pages/Budgets.jsx';
import Todos from './pages/Todos.jsx';
import Kategori from './pages/Kategori.jsx';
import Settings from './pages/Settings.jsx';

const NAV = [
  { to: '/app/dashboard', label: 'Dashboard', full: 'Dashboard', icon: LayoutDashboard },
  { to: '/app/transactions', label: 'Transaksi', full: 'Transaksi', icon: ReceiptText },
  { to: '/app/budgets', label: 'Budget', full: 'Budget', icon: Target },
  { to: '/app/todos', label: 'To-Do', full: 'Financial To-Do', icon: ListChecks },
  { to: '/app/kategori', label: 'Kategori', full: 'Kategori', icon: Tags },
];

function Brand() {
  return (
    <div className="flex items-center gap-2">
      <LogoMark size={36} />
      <span className="text-xl font-black tracking-wide">FINTRACK</span>
    </div>
  );
}

function Sidebar({ user, onLogout }) {
  const navigate = useNavigate();
  return (
    <aside className="hidden w-60 shrink-0 flex-col bg-pine-900 text-white md:sticky md:top-0 md:flex md:h-screen md:overflow-y-auto">
      <div className="px-6 pt-7">
        <Brand />
      </div>
      <nav className="mt-8 flex flex-col gap-1 px-3">
        {[...NAV, { to: '/app/settings', label: 'Pengaturan', full: 'Pengaturan', icon: SettingsIcon }].map((n) => (
          <NavLink
            key={n.to}
            to={n.to}
            className={({ isActive }) =>
              `flex items-center gap-2.5 rounded-lg px-4 py-2.5 text-sm font-medium transition ${
                isActive ? 'bg-green-600 text-white' : 'text-white/70 hover:bg-pine-800 hover:text-white'
              }`
            }
          >
            <n.icon size={16} className="shrink-0" />
            {n.full}
          </NavLink>
        ))}
      </nav>
      <div className="mt-auto p-4">
        <div className="mb-3 rounded-xl bg-pine-800/60 p-4 text-xs leading-relaxed text-white/60">
          Langkah kecil hari ini, untuk masa depan yang lebih baik.
        </div>
        <div className="flex items-center justify-between rounded-xl bg-pine-800/60 p-3">
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold">{user?.name}</p>
            <p className="truncate text-xs text-white/50">{user?.email}</p>
          </div>
          <button
            onClick={async () => {
              await api.logout();
              onLogout();
              navigate('/auth/login');
            }}
            title="Keluar"
            className="ml-2 rounded-lg bg-white/10 px-2.5 py-1.5 text-xs hover:bg-green-600"
          >
            Keluar
          </button>
        </div>
      </div>
    </aside>
  );
}

function MobileHeader({ user }) {
  return (
    <header className="sticky top-0 z-40 flex items-center justify-between bg-pine-900 px-4 py-3 text-white md:hidden">
      <Brand />
      <div className="grid size-9 place-items-center rounded-full bg-green-600 text-sm font-bold">
        {user?.name?.charAt(0)?.toUpperCase() || 'U'}
      </div>
    </header>
  );
}

function BottomNav() {
  const item = (n) => (
    <NavLink
      key={n.to}
      to={n.to}
      className={({ isActive }) =>
        `flex flex-col items-center gap-0.5 rounded-lg px-1 py-1.5 text-[10px] font-medium ${
          isActive ? 'text-green-600' : 'text-gray-400'
        }`
      }
    >
      <n.icon size={20} />
      {n.label}
    </NavLink>
  );
  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 flex items-stretch justify-around border-t border-gray-200 bg-white/95 px-2 pb-[env(safe-area-inset-bottom)] pt-1 backdrop-blur md:hidden">
      {NAV.filter((n) => n.to !== '/app/settings').map(item)}
      <NavLink
        to="/app/settings"
        className={({ isActive }) =>
          `flex flex-col items-center gap-0.5 rounded-lg px-1 py-1.5 text-[10px] font-medium ${
            isActive ? 'text-green-600' : 'text-gray-400'
          }`
        }
      >
        <UserRound size={20} />
        Akun
      </NavLink>
    </nav>
  );
}

export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .me()
      .then((res) => setUser(res.data.user))
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="grid min-h-screen place-items-center text-gray-400">Memuatâ€¦</div>;
  }

  return (
    <Routes>
      <Route path="/" element={user ? <Navigate to="/app/dashboard" replace /> : <Landing />} />
      <Route
        path="/auth/login"
        element={user ? <Navigate to="/app/dashboard" replace /> : <Login onLogin={setUser} />}
      />
      <Route
        path="/auth/register"
        element={user ? <Navigate to="/app/dashboard" replace /> : <Register onRegister={setUser} />}
      />
      <Route
        path="/app/*"
        element={
          user ? (
            <div className="flex min-h-screen">
              <Sidebar user={user} onLogout={() => setUser(null)} />
              <div className="flex min-w-0 flex-1 flex-col">
                            <main className="min-w-0 flex-1 p-4 pb-28 md:p-8 md:pb-8">
                  <Routes>
                    <Route path="dashboard" element={<Dashboard />} />
                    <Route path="transactions" element={<Transactions />} />
                    <Route path="budgets" element={<Budgets />} />
                    <Route path="todos" element={<Todos />} />
                    <Route path="kategori" element={<Kategori />} />
          <Route path="settings" element={<Settings user={user} onUserChange={setUser} onLogout={() => { api.logout(); setUser(null); }} />} />
                    <Route path="*" element={<Navigate to="/app/dashboard" replace />} />
                  </Routes>
                </main>
              </div>
              <BottomNav />
                          </div>
          ) : (
            <Navigate to="/auth/login" replace />
          )
        }
      />
      <Route path="*" element={<Navigate to={user ? '/app/dashboard' : '/auth/login'} replace />} />
    </Routes>
  );
}

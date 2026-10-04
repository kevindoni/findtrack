const BASE = import.meta.env.VITE_API_URL || '';

async function request(path, { method = 'GET', body } = {}) {
  const res = await fetch(`${BASE}/api/index.php?r=${encodeURIComponent(path)}`, {
    method,
    credentials: 'include',
    cache: 'no-store',
    headers: body ? { 'Content-Type': 'application/json' } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });
  let payload = null;
  try {
    payload = await res.json();
  } catch {
    payload = null;
  }
  if (!res.ok) {
    const err = new Error(payload?.message || `HTTP ${res.status}`);
    err.code = payload?.code || `HTTP_${res.status}`;
    err.status = res.status;
    throw err;
  }
  return payload;
}

export const api = {
  register: (data) => request('/api/v1/auth/register', { method: 'POST', body: data }),
  login: (data) => request('/api/v1/auth/login', { method: 'POST', body: data }),
  logout: () => request('/api/v1/auth/logout', { method: 'POST' }),
  me: () => request('/api/v1/auth/me'),
  updateProfile: (data) => request('/api/v1/auth/profile', { method: 'PUT', body: data }),
  changePassword: (data) => request('/api/v1/auth/password', { method: 'PUT', body: data }),
  deleteAccount: (data) => request('/api/v1/auth/account', { method: 'DELETE', body: data }),

  categories: (params = '') => request(`/api/v1/categories${params}`),
  createCategory: (data) => request('/api/v1/categories', { method: 'POST', body: data }),
  updateCategory: (id, data) => request(`/api/v1/categories/${id}`, { method: 'PUT', body: data }),
  deleteCategory: (id) => request(`/api/v1/categories/${id}`, { method: 'DELETE' }),

  transactions: (params = '') => request(`/api/v1/transactions${params}`),
  createTransaction: (data) => request('/api/v1/transactions', { method: 'POST', body: data }),
  updateTransaction: (id, data) => request(`/api/v1/transactions/${id}`, { method: 'PUT', body: data }),
  deleteTransaction: (id) => request(`/api/v1/transactions/${id}`, { method: 'DELETE' }),

  budgets: (params = '') => request(`/api/v1/budgets${params}`),
  createBudget: (data) => request('/api/v1/budgets', { method: 'POST', body: data }),
  updateBudget: (id, data) => request(`/api/v1/budgets/${id}`, { method: 'PUT', body: data }),
  deleteBudget: (id) => request(`/api/v1/budgets/${id}`, { method: 'DELETE' }),

  todos: (params = '') => request(`/api/v1/todos${params}`),
  createTodo: (data) => request('/api/v1/todos', { method: 'POST', body: data }),
  updateTodo: (id, data) => request(`/api/v1/todos/${id}`, { method: 'PUT', body: data }),
  completeTodo: (id) => request(`/api/v1/todos/${id}/complete`, { method: 'PATCH' }),
  deleteTodo: (id) => request(`/api/v1/todos/${id}`, { method: 'DELETE' }),

  summary: (month) => request(`/api/v1/dashboard/summary?month=${month}`),
};

export const rupiah = (n) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n || 0);

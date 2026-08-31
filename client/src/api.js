const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

function getTokens() {
  return {
    access: localStorage.getItem("access_token"),
    refresh: localStorage.getItem("refresh_token"),
  };
}

function setTokens(access, refresh) {
  localStorage.setItem("access_token", access);
  if (refresh) localStorage.setItem("refresh_token", refresh);
}

export function clearTokens() {
  localStorage.removeItem("access_token");
  localStorage.removeItem("refresh_token");
}

export function getCurrentUser() {
  const raw = localStorage.getItem("user");
  return raw ? JSON.parse(raw) : null;
}

function setCurrentUser(user) {
  localStorage.setItem("user", JSON.stringify(user));
}

async function refreshAccessToken() {
  const { refresh } = getTokens();
  if (!refresh) return null;

  const res = await fetch(`${BASE_URL}/refresh`, {
    method: "POST",
    headers: { Authorization: `Bearer ${refresh}` },
  });
  if (!res.ok) {
    clearTokens();
    return null;
  }
  const data = await res.json();
  setTokens(data.access_token, null);
  return data.access_token;
}

async function request(path, options = {}, retry = true) {
  const { access } = getTokens();
  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };
  if (access) headers.Authorization = `Bearer ${access}`;

  const res = await fetch(`${BASE_URL}${path}`, { ...options, headers });

  if (res.status === 401 && retry) {
    const newAccess = await refreshAccessToken();
    if (newAccess) {
      return request(path, options, false);
    }
  }

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `Request failed: ${res.status}`);
  }

  return res.json();
}

// --- Auth ---
export async function register({ name, email, password, role }) {
  const data = await request("/register", {
    method: "POST",
    body: JSON.stringify({ name, email, password, role }),
  });
  setTokens(data.access_token, null);
  setCurrentUser(data.user);
  return data;
}

export async function login({ email, password }) {
  const data = await request("/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
  setTokens(data.access_token, data.refresh_token);
  setCurrentUser(data.user);
  return data;
}

export function logout() {
  clearTokens();
  localStorage.removeItem("user");
}

// --- Produce ---
export async function getProduce(filters = {}) {
  const params = new URLSearchParams(filters).toString();
  return request(`/produce${params ? `?${params}` : ""}`);
}

export async function createProduce(produce) {
  return request("/produce", {
    method: "POST",
    body: JSON.stringify(produce),
  });
}

// --- Orders ---
export async function getOrders() {
  return request("/orders");
}

export async function createOrder(items) {
  return request("/orders", {
    method: "POST",
    body: JSON.stringify({ items }),
  });
}

export async function updateOrderStatus(orderId, status) {
  return request(`/orders/${orderId}`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });
}

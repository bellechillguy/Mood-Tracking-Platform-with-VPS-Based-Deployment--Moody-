// js/api.js — Moody API Client
const BASE = '/api';

function getToken() { return localStorage.getItem('moody_token'); }
function setToken(t) { localStorage.setItem('moody_token', t); }
function clearToken() { localStorage.removeItem('moody_token'); localStorage.removeItem('moody_user'); }
function getUser() { try { return JSON.parse(localStorage.getItem('moody_user')); } catch { return null; } }
function setUser(u) { localStorage.setItem('moody_user', JSON.stringify(u)); }

function authHeaders() {
  const t = getToken();
  return t ? { Authorization: `Bearer ${t}` } : {};
}

async function request(method, path, body, isForm = false) {
  const opts = { method, headers: { ...authHeaders() } };
  if (body && !isForm) {
    opts.headers['Content-Type'] = 'application/json';
    opts.body = JSON.stringify(body);
  } else if (body && isForm) {
    opts.body = body; // FormData
  }
  const res = await fetch(BASE + path, opts);
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw { status: res.status, message: data.error || 'Request failed' };
  return data;
}

const API = {
  get: (p)            => request('GET', p),
  post: (p, b)        => request('POST', p, b),
  postForm: (p, b)    => request('POST', p, b, true),
  patch: (p, b)       => request('PATCH', p, b),
  delete: (p)         => request('DELETE', p),
  getToken, setToken, clearToken, getUser, setUser,

  // Auth guards
  requireAuth(allowedRoles = []) {
    const token = getToken();
    const user  = getUser();
    if (!token || !user) { window.location.href = '/'; return false; }
    if (allowedRoles.length && !allowedRoles.includes(user.role)) {
      window.location.href = '/';
      return false;
    }
    return user;
  }
};

window.API = API;

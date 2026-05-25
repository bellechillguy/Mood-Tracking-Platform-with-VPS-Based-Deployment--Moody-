// js/dashboard.js — Shared dashboard utilities
document.addEventListener('DOMContentLoaded', async () => {
  // Populate user info in sidebar
  const user = API.getUser();
  if (!user) return;

  const nameEl = document.getElementById('sidebar-name');
  const roleEl = document.getElementById('sidebar-role');
  const avEl   = document.getElementById('sidebar-avatar');

  if (nameEl) nameEl.textContent = user.full_name || user.username;
  if (roleEl) roleEl.textContent = roleLabel(user.role);
  if (avEl) {
    if (user.avatar_path) {
      avEl.innerHTML = `<img src="/uploads/${user.avatar_path}" alt="">`;
    } else {
      avEl.textContent = (user.full_name || user.username || '?')[0].toUpperCase();
    }
  }

  // Sidebar nav active state
  const path = window.location.pathname;
  document.querySelectorAll('.nav-item[data-section]').forEach(item => {
    item.addEventListener('click', () => {
      document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
      item.classList.add('active');
      const sec = item.dataset.section;
      document.querySelectorAll('.dash-section').forEach(s => {
        s.classList.toggle('hidden', s.id !== sec);
      });
    });
  });

  // Load quote
  try {
    const q = await API.get('/quote');
    const qEl = document.getElementById('sidebar-quote');
    if (qEl) qEl.innerHTML = `<span class="quote-text">"${q.quote}"</span><span class="quote-author">— ${q.author}</span>`;
  } catch {}

  // Toast system
  window.toast = (msg, type = '') => {
    const t = document.getElementById('toast');
    if (!t) return;
    t.textContent = msg;
    t.className = `show ${type}`;
    setTimeout(() => { t.className = ''; }, 3200);
  };
});

// Logout
function logout() {
  API.clearToken();
  window.location.href = '/';
}

function roleLabel(r) {
  return { user: 'Patient', psychologist: 'Psychologist', superadmin: 'Superadmin' }[r] || r;
}

function moodEmoji(score) {
  return ['', '😔', '😕', '😐', '🙂', '😊'][score] || '—';
}

function moodColor(score) {
  return ['', 's1', 's2', 's3', 's4', 's5'][score] || '';
}

function fmtDate(d) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

function fmtShort(d) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
}

window.logout   = logout;
window.moodEmoji = moodEmoji;
window.moodColor = moodColor;
window.fmtDate   = fmtDate;
window.fmtShort  = fmtShort;

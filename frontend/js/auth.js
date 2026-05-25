// js/auth.js — Login / Register Logic
document.addEventListener('DOMContentLoaded', () => {
  // Redirect if already logged in
  const token = API.getToken();
  const user  = API.getUser();
  if (token && user) redirectByRole(user.role);

  // Tab switching
  const tabs = document.querySelectorAll('.auth-tab');
  const panels = document.querySelectorAll('.auth-panel');
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      panels.forEach(p => p.classList.remove('active'));
      tab.classList.add('active');
      document.getElementById(tab.dataset.panel).classList.add('active');
      clearMsg();
    });
  });

  // Login
  document.getElementById('login-form').addEventListener('submit', async e => {
    e.preventDefault();
    const btn = e.target.querySelector('button[type="submit"]');
    btn.disabled = true;
    btn.textContent = 'Signing in…';
    try {
      const data = await API.post('/auth/login', {
        email:    document.getElementById('l-email').value.trim(),
        password: document.getElementById('l-pass').value,
      });
      API.setToken(data.token);
      API.setUser(data.user);
      redirectByRole(data.user.role);
    } catch (err) {
      showMsg('login-msg', err.message, 'error');
      btn.disabled = false;
      btn.textContent = 'Sign In';
    }
  });

  // Register
  document.getElementById('register-form').addEventListener('submit', async e => {
    e.preventDefault();
    const btn = e.target.querySelector('button[type="submit"]');
    btn.disabled = true;
    btn.textContent = 'Submitting…';

    const form = new FormData();
    form.append('username',  document.getElementById('r-username').value.trim());
    form.append('email',     document.getElementById('r-email').value.trim());
    form.append('password',  document.getElementById('r-pass').value);
    form.append('full_name', document.getElementById('r-name').value.trim());
    form.append('role',      document.getElementById('r-role').value);
    const avatar = document.getElementById('r-avatar').files[0];
    if (avatar) form.append('avatar', avatar);

    try {
      const data = await API.postForm('/auth/register', form);
      showMsg('register-msg', data.message || 'Registration submitted! Await admin approval.', 'ok');
      e.target.reset();
      document.getElementById('avatar-name').textContent = 'Upload profile photo';
      btn.disabled = false;
      btn.textContent = 'Request Access';
    } catch (err) {
      showMsg('register-msg', err.message, 'error');
      btn.disabled = false;
      btn.textContent = 'Request Access';
    }
  });

  // Avatar file name display
  document.getElementById('r-avatar').addEventListener('change', e => {
    document.getElementById('avatar-name').textContent =
      e.target.files[0] ? e.target.files[0].name : 'Upload profile photo';
  });
});

function redirectByRole(role) {
  const map = { user: '/dashboard-user.html', psychologist: '/dashboard-psych.html', superadmin: '/dashboard-admin.html' };
  window.location.href = map[role] || '/';
}

function showMsg(id, msg, type) {
  const el = document.getElementById(id);
  if (!el) return;
  el.textContent = msg;
  el.className = 'auth-msg ' + type;
}

function clearMsg() {
  document.querySelectorAll('.auth-msg').forEach(el => { el.textContent = ''; el.className = 'auth-msg'; });
}

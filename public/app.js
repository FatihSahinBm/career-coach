const API_BASE = '/api';

// --- Shared Utilities ---

function showMessage(text, type) {
    const el = document.getElementById('auth-message');
    if (el) {
        el.textContent = text;
        el.className = `message ${type}`;
    } else {
        alert(text);
    }
}

function hideMessage() {
    const el = document.getElementById('auth-message');
    if (el) {
        el.className = 'message';
        el.textContent = '';
    }
}

// --- Page Specific Logic ---

// LOGIN PAGE
const loginForm = document.getElementById('login-form');
if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const btn = e.target.querySelector('button');
        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;

        btn.disabled = true;
        btn.textContent = 'Logging in...';
        hideMessage();

        try {
            const res = await fetch(`${API_BASE}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });
            const data = await res.json();

            if (res.ok) {
                const token = data.data?.accessToken || data.token;
                localStorage.setItem('token', token);
                localStorage.setItem('user', JSON.stringify(data.data?.user || {}));
                
                showMessage('Success! Redirecting...', 'success');
                setTimeout(() => window.location.href = 'index.html', 1000);
            } else {
                throw new Error(data.message || 'Login failed');
            }
        } catch (err) {
            showMessage(err.message, 'error');
        } finally {
            btn.disabled = false;
            btn.textContent = 'Login';
        }
    });
}

// REGISTER PAGE
const registerForm = document.getElementById('register-form');
if (registerForm) {
    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const btn = e.target.querySelector('button');
        const name = document.getElementById('register-name').value;
        const email = document.getElementById('register-email').value;
        const password = document.getElementById('register-password').value;
        const confirm = document.getElementById('register-confirm').value;

        if (password !== confirm) {
            showMessage('Passwords do not match', 'error');
            return;
        }

        // Client-side validation
        if (password.length < 8) return showMessage('Password too short (min 8)', 'error');
        if (!/[A-Z]/.test(password)) return showMessage('Need 1 uppercase letter', 'error');
        if (!/[a-z]/.test(password)) return showMessage('Need 1 lowercase letter', 'error');
        if (!/[0-9]/.test(password)) return showMessage('Need 1 number', 'error');

        btn.disabled = true;
        btn.textContent = 'Registering...';
        hideMessage();

        try {
            const res = await fetch(`${API_BASE}/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email, password })
            });
            const data = await res.json();

            if (res.ok) {
                showMessage('Registered! Redirecting to login...', 'success');
                setTimeout(() => window.location.href = 'login.html', 1500);
            } else {
                let msg = data.message;
                if (data.errors) msg = data.errors.map(e => e.msg).join(', ');
                throw new Error(msg || 'Registration failed');
            }
        } catch (err) {
            showMessage(err.message, 'error');
        } finally {
            btn.disabled = false;
            btn.textContent = 'Register';
        }
    });
}

// LOGOUT (Any Page)
const logoutBtn = document.getElementById('logout-btn');
if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = 'login.html';
    });
}

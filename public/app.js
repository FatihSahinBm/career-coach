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

// GOOGLE LOGIN
function handleGoogleLogin(response) {
    const token = response.credential;
    
    // Send token to backend
    fetch(`${API_BASE}/auth/google`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token })
    })
    .then(res => res.json())
    .then(data => {
        if (data.success) {
            localStorage.setItem('token', data.data.accessToken);
            localStorage.setItem('user', JSON.stringify(data.data.user));
            
            showMessage('Google Login Successful! Redirecting...', 'success');
            setTimeout(() => window.location.href = 'index.html', 1000);
        } else {
            throw new Error(data.message || 'Google Login failed');
        }
    })
    .catch(err => {
        showMessage(err.message, 'error');
    });
}

// Global function for Google callback
window.handleGoogleLogin = handleGoogleLogin;

// For this demo with custom button:
const googleBtn = document.getElementById('google-login-btn');
if (googleBtn) {
    googleBtn.addEventListener('click', () => {
        alert('Backend endpoint /api/auth/google hazır! Google Identity Services scriptini login.html\'e ekleyip client_id yapılandırması yapılmalıdır.');
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

// THEME TOGGLE
const themeBtn = document.getElementById('theme-toggle');
if (themeBtn) {
    const icon = themeBtn.querySelector('i');
    
    // Check saved theme
    if (localStorage.getItem('theme') === 'light') {
        document.body.classList.add('light-mode');
        icon.className = 'fas fa-sun';
        icon.style.color = '#f59e0b'; // Amber for sun
    }

    themeBtn.addEventListener('click', () => {
        document.body.classList.toggle('light-mode');
        const isLight = document.body.classList.contains('light-mode');
        
        if (isLight) {
            localStorage.setItem('theme', 'light');
            icon.className = 'fas fa-sun';
            icon.style.color = '#f59e0b';
        } else {
            localStorage.setItem('theme', 'dark');
            icon.className = 'fas fa-moon';
            icon.style.color = ''; // inherit
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

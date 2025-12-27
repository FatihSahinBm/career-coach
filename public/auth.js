// Minimal Drop-in Auth Script
// Assumes backend: http://localhost:3000
const API_BASE = 'http://localhost:3000/api/auth';

document.addEventListener('DOMContentLoaded', () => {

    // Helper: Show/Hide Message
    const showMsg = (text, type = 'error') => {
        const el = document.getElementById('auth-message');
        if (el) {
            el.textContent = text;
            el.style.display = 'block';
            el.className = `message ${type}`; // Expects CSS to handle .error/.success colors
        }
    };

    const clearMsg = () => {
        const el = document.getElementById('auth-message');
        if (el) el.textContent = '';
    };

    // --- LOGIN LOGIC ---
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            clearMsg();
            
            const btn = e.target.querySelector('button');
            const email = document.getElementById('login-email').value;
            const password = document.getElementById('login-password').value;

            btn.textContent = 'Logging in...';
            btn.disabled = true;

            try {
                const res = await fetch(`${API_BASE}/login`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, password })
                });

                const data = await res.json();

                if (!res.ok) throw new Error(data.message || 'Login failed');

                // Success
                // Adjust property access based on your backend response structure
                const token = data.data?.accessToken || data.token; 
                if (token) {
                    localStorage.setItem('token', token);
                    if (data.data?.user) {
                        localStorage.setItem('user', JSON.stringify(data.data.user));
                    }
                    window.location.href = 'index.html'; 
                } else {
                    throw new Error('No token received');
                }

            } catch (err) {
                showMsg(err.message);
            } finally {
                btn.textContent = 'Login';
                btn.disabled = false;
            }
        });
    }

    // --- REGISTER LOGIC ---
    const registerForm = document.getElementById('register-form');
    if (registerForm) {
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            clearMsg();

            const btn = e.target.querySelector('button');
            const name = document.getElementById('register-name').value;
            const email = document.getElementById('register-email').value;
            const password = document.getElementById('register-password').value;
            // Optional confirm password logic if input exists
            const confirm = document.getElementById('register-confirm');
            
            if (confirm && confirm.value !== password) {
                return showMsg('Passwords do not match');
            }

            btn.textContent = 'Registering...';
            btn.disabled = true;

            try {
                const res = await fetch(`${API_BASE}/register`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ name, email, password })
                });

                const data = await res.json();

                if (!res.ok) {
                    // Handle express-validator errors specific format if array
                    const msg = data.errors ? data.errors.map(e => e.msg).join(', ') : (data.message || 'Registration failed');
                    throw new Error(msg);
                }

                // Success
                showMsg('Registration successful! Redirecting...', 'success');
                setTimeout(() => window.location.href = 'login.html', 1500);

            } catch (err) {
                showMsg(err.message);
            } finally {
                btn.textContent = 'Register';
                btn.disabled = false;
            }
        });
    }



    // --- GOOGLE LOGIN (Custom Button Flow) ---
    // We use the Token Model (OAuth2) because it allows custom buttons reliably.
    // It returns an ACCESS TOKEN, which we send to backend to fetch user profile.
    
    // --- GOOGLE LOGIN (Standard Button Implementation) ---
    // Renders the official "Sign in with Google" button into #google-btn-wrapper
    
    // Global Handler for Google Callback
    window.handleGoogleLogin = async (response) => {
        clearMsg();
        try {
            // response.credential contains the ID Token (JWT)
            const res = await fetch(`${API_BASE}/google`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token: response.credential })
            });

            const data = await res.json();

            if (!res.ok || !data.success) {
                throw new Error(data.message || 'Google Login failed');
            }

            if (data.data?.accessToken) {
                localStorage.setItem('token', data.data.accessToken);
                if (data.data?.user) {
                    localStorage.setItem('user', JSON.stringify(data.data.user));
                }
                window.location.href = 'index.html';
            }
        } catch (err) {
            showMsg(err.message);
        }
    };

    /* 
       HTML API handles the button rendering automatically.
       Global handleGoogleLogin is defined above.
    */

    // --- LOGOUT LOGIC ---
    // If you have a logout button on dashboard
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = 'login.html';
        });
    }
});

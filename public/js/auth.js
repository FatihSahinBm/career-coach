/**
 * Authentication module
 * SECURITY: All inputs sanitized, outputs use textContent
 */

import { apiRequest, showLoading, hideLoading, navigateTo, showError, hideError, saveUser, logout as logoutUtil } from './utils.js';

/**
 * Initialize auth event listeners
 */
export function initAuth() {
    // Login form
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }

    // Register form
    const registerForm = document.getElementById('register-form');
    if (registerForm) {
        registerForm.addEventListener('submit', handleRegister);
    }

    // Navigation buttons
    document.getElementById('nav-login-btn')?.addEventListener('click', () => {
        navigateTo('login-page');
    });

    document.getElementById('nav-register-btn')?.addEventListener('click', () => {
        navigateTo('register-page');
    });

    document.getElementById('hero-start-btn')?.addEventListener('click', () => {
        navigateTo('register-page');
    });

    document.getElementById('nav-logout-btn')?.addEventListener('click', logout);

    // Switch between login/register
    document.getElementById('show-register')?.addEventListener('click', (e) => {
        e.preventDefault();
        navigateTo('register-page');
    });

    document.getElementById('show-login')?.addEventListener('click', (e) => {
        e.preventDefault();
        navigateTo('login-page');
    });

    // Check auth state and update UI
    updateAuthUI();
}

/**
 * Handle login
 */
async function handleLogin(e) {
    e.preventDefault();
    hideError('login-error');

    const email = document.getElementById('login-email').value.trim();
    const password = document.getElementById('login-password').value;

    if (!email || !password) {
        showError('login-error', 'Lütfen tüm alanları doldurun');
        return;
    }

    try {
        showLoading();

        const response = await apiRequest('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email, password })
        });

        // Save tokens and user
        localStorage.setItem('accessToken', response.data.accessToken);
        localStorage.setItem('refreshToken', response.data.refreshToken);
        saveUser(response.data.user);

        // Update UI and navigate to dashboard
        updateAuthUI();
        navigateTo('dashboard-page');

        // Clear form
        e.target.reset();
    } catch (error) {
        showError('login-error', error.message || 'Giriş başarısız');
    } finally {
        hideLoading();
    }
}

/**
 * Handle registration
 */
async function handleRegister(e) {
    e.preventDefault();
    hideError('register-error');

    const name = document.getElementById('register-name').value.trim();
    const email = document.getElementById('register-email').value.trim();
    const password = document.getElementById('register-password').value;

    if (!name || !email || !password) {
        showError('register-error', 'Lütfen tüm alanları doldurun');
        return;
    }

    // Validate password
    if (password.length < 8 || 
        !/[A-Z]/.test(password) || 
        !/[a-z]/.test(password) || 
        !/[0-9]/.test(password)) {
        showError('register-error', 'Şifre kriterleri karşılanmıyor');
        return;
    }

    try {
        showLoading();

        const response = await apiRequest('/auth/register', {
            method: 'POST',
            body: JSON.stringify({ name, email, password })
        });

        // Save tokens and user
        localStorage.setItem('accessToken', response.data.accessToken);
        localStorage.setItem('refreshToken', response.data.refreshToken);
        saveUser(response.data.user);

        // Update UI and navigate to dashboard
        updateAuthUI();
        navigateTo('dashboard-page');

        // Clear form
        e.target.reset();
    } catch (error) {
        showError('register-error', error.message || 'Kayıt başarısız');
    } finally {
        hideLoading();
    }
}

/**
 * Logout
 */
function logout() {
    logoutUtil();
}

/**
 * Update auth UI
 */
export function updateAuthUI() {
    const user = JSON.parse(localStorage.getItem('user') || 'null');
    const navAuth = document.getElementById('nav-auth');
    const navUser = document.getElementById('nav-user');
    const userName = document.getElementById('user-name');

    if (user) {
        // User is logged in
        navAuth.style.display = 'none';
        navUser.style.display = 'flex';
        userName.textContent = user.name; // SAFE: textContent
    } else {
        // User is logged out
        navAuth.style.display = 'flex';
        navUser.style.display = 'none';
        // Redirect to landing if not on auth pages
        const currentPage = document.querySelector('.page.active');
        if (currentPage && !['landing-page', 'login-page', 'register-page'].includes(currentPage.id)) {
            navigateTo('landing-page');
        }
    }
}

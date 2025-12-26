/**
 * Utility functions for safe DOM manipulation
 * CRITICAL: Uses textContent to prevent XSS, NEVER innerHTML
 */

const API_BASE_URL = 'http://localhost:3000/api';

/**
 * Show/hide loading overlay
 */
export function showLoading() {
    const overlay = document.getElementById('loading-overlay');
    if (overlay) {
        overlay.style.display = 'flex';
    }
}

export function hideLoading() {
    const overlay = document.getElementById('loading-overlay');
    if (overlay) {
        overlay.style.display = 'none';
    }
}

/**
 * Safe text rendering - USES textContent ONLY
 */
export function setText(element, text) {
    if (element) {
        element.textContent = text || '';
    }
}

/**
 * Create element safely
 */
export function createElement(tag, className = '', text = '') {
    const element = document.createElement(tag);
    if (className) {
        element.className = className;
    }
    if (text) {
        element.textContent = text; // SAFE: using textContent
    }
    return element;
}

/**
 * Clear element children
 */
export function clearElement(element) {
    if (element) {
        while (element.firstChild) {
            element.removeChild(element.firstChild);
        }
    }
}

/**
 * Show error message
 */
export function showError(elementId, message) {
    const errorElement = document.getElementById(elementId);
    if (errorElement) {
        setText(errorElement, message);
        errorElement.classList.add('active');
    }
}

/**
 * Hide error message
 */
export function hideError(elementId) {
    const errorElement = document.getElementById(elementId);
    if (errorElement) {
        errorElement.classList.remove('active');
    }
}

/**
 * API request wrapper with authentication
 */
export async function apiRequest(endpoint, options = {}) {
    const token = localStorage.getItem('accessToken');
    
    const defaultOptions = {
        headers: {
            'Content-Type': 'application/json',
            ...(token && { 'Authorization': `Bearer ${token}` })
        }
    };

    const mergedOptions = {
        ...defaultOptions,
        ...options,
        headers: {
            ...defaultOptions.headers,
            ...options.headers
        }
    };

    try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, mergedOptions);
        const data = await response.json();

        if (!response.ok) {
            // Handle token expiration
            if (response.status === 401 && data.message?.includes('expired')) {
                const refreshed = await refreshToken();
                if (refreshed) {
                    // Retry request with new token
                    return apiRequest(endpoint, options);
                } else {
                    // Refresh failed, logout
                    logout();
                    throw new Error('Session expired. Please login again.');
                }
            }
            throw new Error(data.message || 'Request failed');
        }

        return data;
    } catch (error) {
        console.error('API Error:', error);
        throw error;
    }
}

/**
 * Refresh access token
 */
async function refreshToken() {
    const refreshToken = localStorage.getItem('refreshToken');
    if (!refreshToken) {
        return false;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ refreshToken })
        });

        const data = await response.json();
        if (response.ok && data.data?.accessToken) {
            localStorage.setItem('accessToken', data.data.accessToken);
            return true;
        }
        return false;
    } catch (error) {
        console.error('Token refresh failed:', error);
        return false;
    }
}

/**
 * Logout user
 */
export function logout() {
    const refreshToken = localStorage.getItem('refreshToken');
    
    // Call logout API (fire and forget)
    if (refreshToken) {
        fetch(`${API_BASE_URL}/auth/logout`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ refreshToken })
        }).catch(() => {});
    }

    // Clear local storage
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');

    // Redirect to landing page
    window.location.reload();
}

/**
 * Check if user is authenticated
 */
export function isAuthenticated() {
    return !!localStorage.getItem('accessToken');
}

/**
 * Get current user
 */
export function getCurrentUser() {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
}

/**
 * Save user to local storage
 */
export function saveUser(user) {
    localStorage.setItem('user', JSON.stringify(user));
}

/**
 * Navigate to page
 */
export function navigateTo(pageId) {
    // Hide all pages
    document.querySelectorAll('.page').forEach(page => {
        page.classList.remove('active');
    });

    // Show target page
    const targetPage = document.getElementById(pageId);
    if (targetPage) {
        targetPage.classList.add('active');
    }

    // Scroll to top
    window.scrollTo(0, 0);
}

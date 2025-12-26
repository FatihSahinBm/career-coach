/**
 * Main application entry point
 */

import { initAuth, updateAuthUI } from './auth.js';
import { initCareer } from './career.js';
import { initRoadmap } from './roadmap.js';
import { initInterview } from './interview.js';
import { isAuthenticated, navigateTo } from './utils.js';

/**
 * Initialize application
 */
function init() {
    // Initialize all modules
    initAuth();
    initCareer();
    initRoadmap();
    initInterview();

    // Set initial page based on auth state
    if (isAuthenticated()) {
        navigateTo('dashboard-page');
    } else {
        navigateTo('landing-page');
    }

    // Update auth UI
    updateAuthUI();
}

// Wait for DOM to be ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}

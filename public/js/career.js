/**
 * Career profile and skills management
 * CRITICAL: All AI outputs rendered with textContent for XSS prevention
 */

import { apiRequest, showLoading, hideLoading, navigateTo, createElement, clearElement, setText } from './utils.js';

/**
 * Initialize career module
 */
export function initCareer() {
    // Profile navigation
    document.getElementById('profile-card')?.querySelector('button')?.addEventListener('click', () => {
        navigateTo('profile-page');
        loadCareerProfile();
    });

    document.getElementById('profile-back-btn')?.addEventListener('click', () => {
        navigateTo('dashboard-page');
    });

    // Profile form
    const profileForm = document.getElementById('career-profile-form');
    if (profileForm) {
        profileForm.addEventListener('submit', saveCareerProfile);
    }

    // Add skill button
    document.getElementById('add-skill-btn')?.addEventListener('click', addSkillPrompt);
}

/**
 * Load career profile
 */
async function loadCareerProfile() {
    try {
        showLoading();

        // Load career profile
        const profileResponse = await apiRequest('/users/career-profile');
        const profile = profileResponse.data;

        // Populate form - SAFE: using value property
        if (profile) {
            document.getElementById('current-role').value = profile.currentRole || '';
            document.getElementById('target-role').value = profile.targetRole || '';
            document.getElementById('years-experience').value = profile.yearsOfExperience || 0;
            document.getElementById('education').value = profile.education || '';
            document.getElementById('career-goals').value = profile.careerGoals || '';
        }

        // Load skills
        await loadSkills();
    } catch (error) {
        console.error('Failed to load career profile:', error);
    } finally {
        hideLoading();
    }
}

/**
 * Save career profile
 */
async function saveCareerProfile(e) {
    e.preventDefault();

    const profileData = {
        currentRole: document.getElementById('current-role').value.trim(),
        targetRole: document.getElementById('target-role').value.trim(),
        yearsOfExperience: parseInt(document.getElementById('years-experience').value) || 0,
        education: document.getElementById('education').value.trim(),
        careerGoals: document.getElementById('career-goals').value.trim()
    };

    try {
        showLoading();

        await apiRequest('/users/career-profile', {
            method: 'PUT',
            body: JSON.stringify(profileData)
        });

        alert('Profil kaydedildi!');
    } catch (error) {
        alert('Profil kaydedilemedi: ' + error.message);
    } finally {
        hideLoading();
    }
}

/**
 * Load user skills
 */
async function loadSkills() {
    try {
        const response = await apiRequest('/users/skills');
        const skills = response.data;

        const container = document.getElementById('skills-container');
        clearElement(container);

        skills.forEach(userSkill => {
            const badge = createElement('div', 'skill-badge');
            
            const nameSpan = createElement('span', 'skill-name', userSkill.skill.name); // SAFE: textContent
            const levelSpan = createElement('span', 'skill-level', `Level ${userSkill.proficiency}/5`); // SAFE: textContent
            
            badge.appendChild(nameSpan);
            badge.appendChild(levelSpan);
            container.appendChild(badge);
        });
    } catch (error) {
        console.error('Failed to load skills:', error);
    }
}

/**
 * Add skill prompt
 */
async function addSkillPrompt() {
    // Simple implementation - in production, use a modal with skill search
    const skillName = prompt('Hangi beceriyi eklemek istersiniz?');
    if (!skillName) return;

    const proficiency = prompt('Yeterlilik seviyesi (1-5):', '3');
    if (!proficiency) return;

    const proficiencyNum = parseInt(proficiency);
    if (proficiencyNum < 1 || proficiencyNum > 5) {
        alert('Yeterlilik seviyesi 1-5 arasında olmalıdır');
        return;
    }

    try {
        showLoading();

        // First, create the skill if it doesn't exist
        // For simplicity, we'll try to add it directly
        // In production, search available skills first

        // This is a simplified approach - assumes skill exists
        // In real implementation, you'd search /api/skills first
        // For now, showing the concept
        alert('Beceri ekleme özelliği geliştirilme aşamasında. Lütfen backend üzerinden beceri listesi oluşturun.');
    } catch (error) {
        alert('Beceri eklenemedi: ' + error.message);
    } finally {
        hideLoading();
    }
}

/**
 * Career roadmap module
 * CRITICAL: AI-generated content rendered with textContent only
 */

import { apiRequest, showLoading, hideLoading, navigateTo, createElement, clearElement, setText } from './utils.js';

/**
 * Initialize roadmap module
 */
export function initRoadmap() {
    // Roadmap navigation
    document.getElementById('roadmap-card')?.querySelector('button')?.addEventListener('click', () => {
        navigateTo('roadmap-page');
        loadRoadmaps();
    });

    document.getElementById('roadmap-back-btn')?.addEventListener('click', () => {
        navigateTo('dashboard-page');
    });

    // Generate roadmap button
    document.getElementById('generate-roadmap-btn')?.addEventListener('click', generateRoadmap);
}

/**
 * Load user roadmaps
 */
async function loadRoadmaps() {
    try {
        showLoading();

        const response = await apiRequest('/roadmaps');
        const roadmaps = response.data;

        const container = document.getElementById('roadmap-container');
        const content = document.getElementById('roadmap-content');

        if (roadmaps.length === 0) {
            container.style.display = 'block';
            content.style.display = 'none';
        } else {
            container.style.display = 'none';
            content.style.display = 'block';
            displayRoadmap(roadmaps[0]); // Show first roadmap
        }
    } catch (error) {
        console.error('Failed to load roadmaps:', error);
    } finally {
        hideLoading();
    }
}

/**
 * Generate new roadmap
 */
async function generateRoadmap() {
    const confirmed = confirm('Yeni bir kariyer yol haritası oluşturmak için AI kullanılacak. Devam etmek istiyor musunuz?');
    if (!confirmed) return;

    try {
        showLoading();

        const response = await apiRequest('/roadmaps/generate', {
            method: 'POST',
            body: JSON.stringify({ timeframe: '12 months' })
        });

        const roadmap = response.data;
        
        // Hide empty state and show roadmap
        document.getElementById('roadmap-container').style.display = 'none';
        document.getElementById('roadmap-content').style.display = 'block';
        
        displayRoadmap(roadmap);
        
        alert('Yol haritası başarıyla oluşturuldu!');
    } catch (error) {
        alert('Yol haritası oluşturulamadı: ' + error.message);
    } finally {
        hideLoading();
    }
}

/**
 * Display roadmap
 * CRITICAL: Uses textContent to safely render AI-generated content
 */
function displayRoadmap(roadmap) {
    const content = document.getElementById('roadmap-content');
    clearElement(content);

    // Title
    const title = createElement('h2', '', roadmap.title); // SAFE: textContent
    content.appendChild(title);

    // Description
    if (roadmap.description) {
        const desc = createElement('p', '', roadmap.description); // SAFE: textContent
        desc.style.marginBottom = '2rem';
        desc.style.color = 'var(--gray)';
        content.appendChild(desc);
    }

    // Parse milestones
    let milestones = [];
    try {
        const timelineData = JSON.parse(roadmap.timeline || '[]');
        milestones = Array.isArray(timelineData) ? timelineData : [];
    } catch (e) {
        console.error('Failed to parse roadmap timeline:', e);
    }

    if (milestones.length > 0) {
        const timeline = createElement('div', 'roadmap-timeline');

        milestones.forEach(milestone => {
            const milestoneDiv = createElement('div', 'roadmap-milestone');
            
            const monthTitle = createElement('h3', '', `Ay ${milestone.month}: ${milestone.title}`); // SAFE: textContent
            milestoneDiv.appendChild(monthTitle);

            if (milestone.objectives && Array.isArray(milestone.objectives)) {
                const objectivesList = createElement('ul');
                milestone.objectives.forEach(obj => {
                    const li = createElement('li', '', obj); // SAFE: textContent
                    objectivesList.appendChild(li);
                });
                milestoneDiv.appendChild(objectivesList);
            }

            timeline.appendChild(milestoneDiv);
        });

        content.appendChild(timeline);
    }

    // Progress
    const progressDiv = createElement('div');
    progressDiv.style.marginTop = '2rem';
    progressDiv.style.padding = '1rem';
    progressDiv.style.background = 'var(--white)';
    progressDiv.style.borderRadius = '8px';
    
    const progressLabel = createElement('p', '', `İlerleme: ${roadmap.progress}%`); // SAFE: textContent
    progressDiv.appendChild(progressLabel);
    content.appendChild(progressDiv);
}

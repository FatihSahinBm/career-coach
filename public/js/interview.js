/**
 * Interview simulation module
 * CRITICAL: All AI responses rendered with textContent for XSS prevention
 */

import { apiRequest, showLoading, hideLoading, navigateTo, createElement, clearElement, setText } from './utils.js';

let currentSession = null;
let currentQuestionIndex = 0;

/**
 * Initialize interview module
 */
export function initInterview() {
    // Interview navigation
    document.getElementById('interview-card')?.querySelector('button')?.addEventListener('click', () => {
        navigateTo('interview-page');
        resetInterview();
    });

    document.getElementById('interview-back-btn')?.addEventListener('click', () => {
        navigateTo('dashboard-page');
        resetInterview();
    });

    // Start interview form
    const startForm = document.getElementById('start-interview-form');
    if (startForm) {
        startForm.addEventListener('submit', startInterview);
    }

    // Answer form
    const answerForm = document.getElementById('answer-form');
    if (answerForm) {
        answerForm.addEventListener('submit', submitAnswer);
    }
}

/**
 * Reset interview state
 */
function resetInterview() {
    currentSession = null;
    currentQuestionIndex = 0;
    document.getElementById('interview-start').style.display = 'block';
    document.getElementById('interview-session').style.display = 'none';
    document.getElementById('interview-results').style.display = 'none';
}

/**
 * Start interview
 */
async function startInterview(e) {
    e.preventDefault();

    const position = document.getElementById('interview-position').value.trim();
    const difficulty = document.getElementById('interview-difficulty').value;

    try {
        showLoading();

        const response = await apiRequest('/interviews/start', {
            method: 'POST',
            body: JSON.stringify({ position, difficulty })
        });

        currentSession = response.data;
        currentQuestionIndex = 0;

        // Hide start form, show interview session
        document.getElementById('interview-start').style.display = 'none';
        document.getElementById('interview-session').style.display = 'block';

        displayCurrentQuestion();
    } catch (error) {
        alert('Mülakat başlatılamadı: ' + error.message);
    } finally {
        hideLoading();
    }
}

/**
 * Display current question
 * CRITICAL: Uses textContent to safely render AI-generated questions
 */
function displayCurrentQuestion() {
    if (!currentSession || !currentSession.questions) return;

    const question = currentSession.questions[currentQuestionIndex];
    
    // Update progress - SAFE: textContent
    setText(
        document.getElementById('question-progress'),
        `Soru ${currentQuestionIndex + 1} / ${currentSession.questions.length}`
    );

    // Display question - SAFE: textContent
    const questionDiv = document.getElementById('current-question');
    clearElement(questionDiv);
    
    const questionTitle = createElement('h3', '', `Soru ${currentQuestionIndex + 1}`); // SAFE: textContent
    const questionText = createElement('p', '', question.question); // SAFE: textContent from AI
    
    questionDiv.appendChild(questionTitle);
    questionDiv.appendChild(questionText);

    // Clear answer textarea
    document.getElementById('interview-answer').value = '';
    
    // Hide previous feedback
    document.getElementById('answer-feedback').style.display = 'none';
}

/**
 * Submit answer
 */
async function submitAnswer(e) {
    e.preventDefault();

    const answer = document.getElementById('interview-answer').value.trim();
    
    if (!answer) {
        alert('Lütfen cevabınızı yazın');
        return;
    }

    try {
        showLoading();

        const response = await apiRequest(`/interviews/${currentSession.id}/answer`, {
            method: 'POST',
            body: JSON.stringify({
                questionIndex: currentQuestionIndex,
                answer
            })
        });

        displayFeedback(response.data.feedback);

        // Check if more questions
        currentQuestionIndex++;
        if (currentQuestionIndex < currentSession.questions.length) {
            setTimeout(() => {
                displayCurrentQuestion();
            }, 3000);
        } else {
            // All questions answered, complete interview
            setTimeout(() => {
                completeInterview();
            }, 3000);
        }
    } catch (error) {
        alert('Cevap gönderilemedi: ' + error.message);
    } finally {
        hideLoading();
    }
}

/**
 * Display AI feedback
 * CRITICAL: Uses textContent to safely render AI-generated feedback
 */
function displayFeedback(feedback) {
    const feedbackDiv = document.getElementById('answer-feedback');
    clearElement(feedbackDiv);
    feedbackDiv.style.display = 'block';

    // Score - SAFE: textContent
    const scoreDiv = createElement('div', 'feedback-score', `Puan: ${feedback.score}/10`);
    feedbackDiv.appendChild(scoreDiv);

    // Strengths - SAFE: textContent
    if (feedback.strengths && feedback.strengths.length > 0) {
        const strengthsTitle = createElement('h4', '', 'Güçlü Yönler:'); // SAFE: textContent
        feedbackDiv.appendChild(strengthsTitle);
        
        const strengthsList = createElement('ul');
        feedback.strengths.forEach(strength => {
            const li = createElement('li', '', strength); // SAFE: textContent from AI
            strengthsList.appendChild(li);
        });
        feedbackDiv.appendChild(strengthsList);
    }

    // Improvements - SAFE: textContent
    if (feedback.improvements && feedback.improvements.length > 0) {
        const improvementsTitle = createElement('h4', '', 'Geliştirme Alanları:'); // SAFE: textContent
        feedbackDiv.appendChild(improvementsTitle);
        
        const improvementsList = createElement('ul');
        feedback.improvements.forEach(improvement => {
            const li = createElement('li', '', improvement); // SAFE: textContent from AI
            improvementsList.appendChild(li);
        });
        feedbackDiv.appendChild(improvementsList);
    }

    // Suggestion - SAFE: textContent
    if (feedback.suggestion) {
        const suggestionTitle = createElement('h4', '', 'Öneri:'); // SAFE: textContent
        const suggestionText = createElement('p', '', feedback.suggestion); // SAFE: textContent from AI
        feedbackDiv.appendChild(suggestionTitle);
        feedbackDiv.appendChild(suggestionText);
    }
}

/**
 * Complete interview
 */
async function completeInterview() {
    try {
        showLoading();

        const response = await apiRequest(`/interviews/${currentSession.id}/complete`, {
            method: 'POST'
        });

        // Hide session, show results
        document.getElementById('interview-session').style.display = 'none';
        
        const resultsDiv = document.getElementById('interview-results');
        resultsDiv.style.display = 'block';
        clearElement(resultsDiv);

        // Display results - SAFE: textContent
        const title = createElement('h2', '', 'Mülakat Tamamlandı!'); // SAFE: textContent
        const scoreText = createElement('p', 'feedback-score', `Genel Puan: ${response.data.score}/10`); // SAFE: textContent
        const message = createElement('p', '', `${response.data.feedback.answeredQuestions}/${response.data.feedback.totalQuestions} soruyu cevapladınız.`); // SAFE: textContent
        
        resultsDiv.appendChild(title);
        resultsDiv.appendChild(scoreText);
        resultsDiv.appendChild(message);

        const backBtn = createElement('button', 'btn btn-primary');
        setText(backBtn, 'Kontrol Paneline Dön');
        backBtn.addEventListener('click', () => {
            navigateTo('dashboard-page');
            resetInterview();
        });
        resultsDiv.appendChild(backBtn);
    } catch (error) {
        alert('Mülakat tamamlanamadı: ' + error.message);
    } finally {
        hideLoading();
    }
}

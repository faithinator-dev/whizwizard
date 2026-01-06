// =====================
// Quiz Utility Functions
// =====================

const QuizUtils = {
    // Format time in MM:SS format
    formatTime(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    },

    // Calculate score percentage
    calculateScore(correct, total) {
        if (total === 0) return 0;
        return Math.round((correct / total) * 100);
    },

    // Shuffle array (for randomizing questions/options)
    shuffleArray(array) {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    },

    // Get category icon
    getCategoryIcon(category) {
        const icons = {
            science: 'assets/icons/science.svg',
            history: 'assets/icons/history.svg',
            technology: 'assets/icons/tech.svg',
            general: 'assets/icons/general.svg'
        };
        return icons[category] || icons.general;
    },

    // Get category color
    getCategoryColor(category) {
        const colors = {
            science: '#00d4ff',
            history: '#ffd700',
            technology: '#4a90e2',
            general: '#00e676'
        };
        return colors[category] || colors.general;
    },

    // Validate quiz data
    validateQuiz(quizData) {
        const errors = [];

        if (!quizData.title || quizData.title.trim() === '') {
            errors.push('Quiz title is required');
        }

        if (!quizData.description || quizData.description.trim() === '') {
            errors.push('Quiz description is required');
        }

        if (!quizData.category) {
            errors.push('Quiz category is required');
        }

        if (!quizData.timer || quizData.timer < 10) {
            errors.push('Timer must be at least 10 seconds');
        }

        if (!quizData.questions || quizData.questions.length === 0) {
            errors.push('At least one question is required');
        }

        if (quizData.questions) {
            quizData.questions.forEach((q, index) => {
                if (!q.question || q.question.trim() === '') {
                    errors.push(`Question ${index + 1}: Question text is required`);
                }

                if (!q.options || q.options.length < 2) {
                    errors.push(`Question ${index + 1}: At least 2 options are required`);
                }

                if (q.correctAnswer === undefined || q.correctAnswer === null) {
                    errors.push(`Question ${index + 1}: Correct answer must be selected`);
                }
            });
        }

        return {
            isValid: errors.length === 0,
            errors
        };
    },

    // Show notification
    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        
        notification.style.cssText = `
            position: fixed;
            top: 90px;
            right: 20px;
            padding: 1rem 1.5rem;
            background-color: ${type === 'success' ? '#00e676' : 
                               type === 'error' ? '#ff4757' : 
                               type === 'warning' ? '#ffd700' : '#4a90e2'};
            color: ${type === 'warning' ? '#0a1929' : '#ffffff'};
            border-radius: 12px;
            box-shadow: 0 4px 16px rgba(0, 0, 0, 0.4);
            z-index: 10000;
            font-weight: 600;
            animation: slideInRight 0.3s ease-out;
        `;

        document.body.appendChild(notification);

        setTimeout(() => {
            notification.style.animation = 'fadeOut 0.3s ease-out';
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 300);
        }, 3000);
    },

    // Create loading spinner
    createLoadingSpinner() {
        const spinner = document.createElement('div');
        spinner.className = 'loading-spinner';
        spinner.style.cssText = `
            margin: 2rem auto;
            width: 50px;
            height: 50px;
        `;
        return spinner;
    },

    // Render quiz card
    renderQuizCard(quiz, actions = []) {
        const card = document.createElement('div');
        card.className = 'quiz-card';
        card.setAttribute('data-quiz-id', quiz.id);
        card.setAttribute('data-category', quiz.category);

        const actionsHtml = actions.map(action => `
            <button class="icon-btn ${action.class}" data-action="${action.name}" title="${action.title}">
                <img src="${action.icon}" alt="${action.title}">
            </button>
        `).join('');

        card.innerHTML = `
            <div class="quiz-card-header">
                <span class="quiz-category">${quiz.category}</span>
            </div>
            <h3 class="quiz-card-title">${quiz.title}</h3>
            <p class="quiz-card-description">${quiz.description}</p>
            <div class="quiz-card-footer">
                <div class="quiz-meta">
                    <div class="quiz-meta-item">
                        <img src="assets/icons/question.svg" alt="Questions" class="quiz-meta-icon">
                        <span>${quiz.questions.length} questions</span>
                    </div>
                    <div class="quiz-meta-item">
                        <img src="assets/icons/timer.svg" alt="Timer" class="quiz-meta-icon">
                        <span>${quiz.timer}s</span>
                    </div>
                </div>
                <div class="quiz-actions">
                    ${actionsHtml}
                </div>
            </div>
        `;

        return card;
    },

    // Get URL parameter
    getUrlParameter(name) {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get(name);
    },

    // Set URL parameter
    setUrlParameter(name, value) {
        const url = new URL(window.location);
        url.searchParams.set(name, value);
        window.history.pushState({}, '', url);
    },

    // Debounce function
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }
};

// Make QuizUtils available globally
window.QuizUtils = QuizUtils;

// =====================
// Take Quiz Page JavaScript
// =====================

let currentQuiz = null;
let currentQuestionIndex = 0;
let userAnswers = [];
let timerInterval = null;
let timeRemaining = 0;
let startTime = null;

document.addEventListener('DOMContentLoaded', function() {
    const quizId = QuizUtils.getUrlParameter('id');
    
    if (!quizId) {
        QuizUtils.showNotification('No quiz selected', 'error');
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 2000);
        return;
    }
    
    loadQuiz(quizId);
    setupNavigation();
});

// Load quiz
function loadQuiz(quizId) {
    currentQuiz = Database.getQuizById(quizId);
    
    if (!currentQuiz) {
        QuizUtils.showNotification('Quiz not found', 'error');
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 2000);
        return;
    }
    
    // Initialize
    document.getElementById('quiz-title').textContent = currentQuiz.title;
    document.getElementById('total-questions').textContent = currentQuiz.questions.length;
    userAnswers = new Array(currentQuiz.questions.length).fill(null);
    startTime = Date.now();
    
    // Load first question
    loadQuestion(0);
}

// Load question
function loadQuestion(index) {
    currentQuestionIndex = index;
    const question = currentQuiz.questions[index];
    
    // Update progress
    document.getElementById('current-question').textContent = index + 1;
    const progress = ((index + 1) / currentQuiz.questions.length) * 100;
    document.getElementById('progress-fill').style.width = `${progress}%`;
    
    // Update question text
    document.getElementById('question-text').textContent = question.question;
    
    // Render options
    const optionsContainer = document.getElementById('options-container');
    optionsContainer.innerHTML = '';
    
    question.options.forEach((option, optionIndex) => {
        const button = document.createElement('button');
        button.className = 'option-btn';
        button.textContent = option;
        button.setAttribute('data-option-index', optionIndex);
        
        // Check if this option was previously selected
        if (userAnswers[index] === optionIndex) {
            button.classList.add('selected');
        }
        
        button.addEventListener('click', () => selectOption(optionIndex));
        
        optionsContainer.appendChild(button);
    });
    
    // Update navigation buttons
    updateNavigationButtons();
    
    // Start timer
    startTimer();
}

// Select option
function selectOption(optionIndex) {
    userAnswers[currentQuestionIndex] = optionIndex;
    
    // Update UI
    const optionButtons = document.querySelectorAll('.option-btn');
    optionButtons.forEach((btn, index) => {
        if (index === optionIndex) {
            btn.classList.add('selected');
        } else {
            btn.classList.remove('selected');
        }
    });
}

// Start timer
function startTimer() {
    // Clear existing timer
    if (timerInterval) {
        clearInterval(timerInterval);
    }
    
    timeRemaining = currentQuiz.timer;
    updateTimerDisplay();
    
    timerInterval = setInterval(() => {
        timeRemaining--;
        updateTimerDisplay();
        
        if (timeRemaining <= 0) {
            clearInterval(timerInterval);
            // Auto move to next question
            nextQuestion();
        }
    }, 1000);
}

// Update timer display
function updateTimerDisplay() {
    const timerElement = document.getElementById('timer');
    timerElement.textContent = timeRemaining;
    
    // Add warning classes
    timerElement.classList.remove('warning', 'danger');
    if (timeRemaining <= 5) {
        timerElement.classList.add('danger');
    } else if (timeRemaining <= 10) {
        timerElement.classList.add('warning');
    }
}

// Setup navigation
function setupNavigation() {
    document.getElementById('prev-btn').addEventListener('click', prevQuestion);
    document.getElementById('next-btn').addEventListener('click', nextQuestion);
}

// Previous question
function prevQuestion() {
    if (currentQuestionIndex > 0) {
        loadQuestion(currentQuestionIndex - 1);
    }
}

// Next question
function nextQuestion() {
    if (currentQuestionIndex < currentQuiz.questions.length - 1) {
        loadQuestion(currentQuestionIndex + 1);
    } else {
        finishQuiz();
    }
}

// Update navigation buttons
function updateNavigationButtons() {
    const prevBtn = document.getElementById('prev-btn');
    const nextBtn = document.getElementById('next-btn');
    
    prevBtn.disabled = currentQuestionIndex === 0;
    
    if (currentQuestionIndex === currentQuiz.questions.length - 1) {
        nextBtn.innerHTML = `
            Finish
            <img src="assets/icons/checkmark.svg" alt="Finish" class="btn-icon">
        `;
    } else {
        nextBtn.innerHTML = `
            Next
            <img src="assets/icons/arrow-right.svg" alt="Next" class="btn-icon">
        `;
    }
}

// Finish quiz
function finishQuiz() {
    clearInterval(timerInterval);
    
    // Calculate results
    let correctCount = 0;
    let wrongCount = 0;
    
    currentQuiz.questions.forEach((question, index) => {
        if (userAnswers[index] === question.correctAnswer) {
            correctCount++;
        } else {
            wrongCount++;
        }
    });
    
    const totalQuestions = currentQuiz.questions.length;
    const score = QuizUtils.calculateScore(correctCount, totalQuestions);
    const timeTaken = Math.floor((Date.now() - startTime) / 1000);
    
    // Save result
    const resultData = {
        quizId: currentQuiz.id,
        score: score,
        correctAnswers: correctCount,
        wrongAnswers: wrongCount,
        totalQuestions: totalQuestions,
        timeTaken: timeTaken,
        answers: userAnswers
    };
    
    Database.saveResult(resultData);
    
    // Calculate ranking for this quiz
    const ranking = calculateQuizRanking(currentQuiz.id, score);
    
    // Show results with ranking
    showResults(score, correctCount, wrongCount, timeTaken, ranking);
}

// Calculate ranking for this specific quiz
function calculateQuizRanking(quizId, userScore) {
    const allResults = Database.getAllResults();
    const quizResults = allResults.filter(r => r.quizId === quizId);
    
    // Sort by score (descending) and time (ascending for same scores)
    quizResults.sort((a, b) => {
        if (b.score !== a.score) {
            return b.score - a.score;
        }
        return a.timeTaken - b.timeTaken;
    });
    
    // Find current user's rank
    const currentUser = Auth.getUser();
    const userRank = quizResults.findIndex(r => 
        r.userId === currentUser.id && r.score === userScore
    ) + 1;
    
    return {
        rank: userRank,
        total: quizResults.length,
        topThree: quizResults.slice(0, 3).map((r, idx) => {
            const user = Database.getAllUsers().find(u => u.id === r.userId);
            return {
                rank: idx + 1,
                name: user ? user.name : 'Unknown',
                score: r.score,
                timeTaken: r.timeTaken
            };
        })
    };
}

// Show results
async function showResults(score, correct, wrong, timeTaken, ranking) {
    // Hide quiz container
    document.querySelector('.quiz-container').classList.add('hidden');
    
    // Show result container
    const resultContainer = document.getElementById('result-container');
    resultContainer.classList.remove('hidden');
    
    // Calculate percentage
    const totalQuestions = currentQuiz.questions.length;
    const percentage = (correct / totalQuestions) * 100;
    
    // Update result values
    document.getElementById('score-value').textContent = `${score}%`;
    document.getElementById('correct-answers').textContent = correct;
    document.getElementById('wrong-answers').textContent = wrong;
    document.getElementById('time-taken').textContent = QuizUtils.formatTime(timeTaken);
    
    // Show percentage
    const percentageItem = document.getElementById('percentage-item');
    const percentageValue = document.getElementById('percentage-value');
    percentageItem.style.display = 'flex';
    percentageValue.textContent = `${percentage.toFixed(1)}%`;
    
    // Display grade if quiz has grading level
    if (currentQuiz.gradingLevel && typeof ngGrading !== 'undefined') {
        try {
            const grade = await ngGrading.calculateGrade(percentage, currentQuiz.gradingLevel);
            if (grade) {
                const gradeDisplay = document.getElementById('grade-display');
                gradeDisplay.innerHTML = ngGrading.createGradeBadge(grade);
            }
        } catch (error) {
            console.error('Error displaying grade:', error);
        }
    }
    
    // Add ranking display
    const statsGrid = document.querySelector('.stats-grid');
    if (ranking && !document.getElementById('rank-display')) {
        const rankCard = document.createElement('div');
        rankCard.id = 'rank-display';
        rankCard.className = 'stat-card';
        rankCard.style.gridColumn = 'span 2';
        
        let rankEmoji = '🏆';
        let rankText = 'Your Rank';
        if (ranking.rank === 1) {
            rankEmoji = '🥇';
            rankText = '1st Place!';
        } else if (ranking.rank === 2) {
            rankEmoji = '🥈';
            rankText = '2nd Place!';
        } else if (ranking.rank === 3) {
            rankEmoji = '🥉';
            rankText = '3rd Place!';
        }
        
        rankCard.innerHTML = `
            <div class="stat-icon">${rankEmoji}</div>
            <div class="stat-label">${rankText}</div>
            <div class="stat-value">${ranking.rank} of ${ranking.total}</div>
        `;
        statsGrid.appendChild(rankCard);
        
        // Add leaderboard section
        if (ranking.topThree.length > 0) {
            const leaderboardSection = document.createElement('div');
            leaderboardSection.style.marginTop = '2rem';
            leaderboardSection.innerHTML = `
                <h3 style="text-align: center; margin-bottom: 1.5rem; color: var(--accent-cyan);">🏆 Top 3 Winners 🏆</h3>
                <div style="display: flex; justify-content: center; align-items: flex-end; gap: 1rem; margin-bottom: 2rem;">
                    ${ranking.topThree.map(player => {
                        let height = '120px';
                        let bgColor = 'var(--accent-navy)';
                        let medal = '';
                        
                        if (player.rank === 1) {
                            height = '150px';
                            bgColor = 'linear-gradient(135deg, #ffd700, #ffed4e)';
                            medal = '🥇';
                        } else if (player.rank === 2) {
                            height = '130px';
                            bgColor = 'linear-gradient(135deg, #c0c0c0, #e8e8e8)';
                            medal = '🥈';
                        } else if (player.rank === 3) {
                            height = '110px';
                            bgColor = 'linear-gradient(135deg, #cd7f32, #daa520)';
                            medal = '🥉';
                        }
                        
                        return `
                            <div style="
                                background: ${bgColor};
                                padding: 1rem;
                                border-radius: var(--radius-lg);
                                text-align: center;
                                min-width: 120px;
                                height: ${height};
                                display: flex;
                                flex-direction: column;
                                justify-content: space-between;
                                box-shadow: var(--shadow-lg);
                                color: ${player.rank === 1 ? '#000' : player.rank === 2 ? '#000' : player.rank === 3 ? '#000' : '#fff'};
                            ">
                                <div style="font-size: 2rem;">${medal}</div>
                                <div>
                                    <div style="font-weight: bold; margin-bottom: 0.5rem;">${player.name}</div>
                                    <div style="font-size: 1.5rem; font-weight: bold;">${player.score}%</div>
                                    <div style="font-size: 0.8rem; opacity: 0.8;">${QuizUtils.formatTime(player.timeTaken)}</div>
                                </div>
                            </div>
                        `;
                    }).join('')}
                </div>
            `;
            resultContainer.appendChild(leaderboardSection);
        }
    }
}

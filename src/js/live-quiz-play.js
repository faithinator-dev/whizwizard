// =====================
// Live Quiz Play Page JavaScript
// For participants taking the live quiz
// =====================

let currentRoom = null;
let currentQuiz = null;
let pollInterval = null;
let timerInterval = null;
let currentPlayerAnswer = null;

document.addEventListener('DOMContentLoaded', function() {
    // Require authentication
    if (!Auth.requireAuth()) return;

    const roomId = QuizUtils.getUrlParameter('room');
    if (!roomId) {
        window.location.href = 'join-quiz.html';
        return;
    }

    currentRoom = LiveQuiz.getRoomById(roomId);
    if (!currentRoom) {
        QuizUtils.showNotification('Room not found', 'error');
        setTimeout(() => {
            window.location.href = 'join-quiz.html';
        }, 2000);
        return;
    }

    currentQuiz = Database.getQuizById(currentRoom.quizId);
    
    // Wait for quiz to start if not started
    if (currentRoom.status === 'waiting') {
        showWaitingScreen();
    } else {
        loadCurrentQuestion();
    }

    startPolling();
});

// Show waiting screen
function showWaitingScreen() {
    document.getElementById('question-screen').innerHTML = `
        <div style="text-align: center; padding: 2rem;">
            <h2 style="color: var(--accent-cyan); margin-bottom: 1rem;">Waiting for host to start...</h2>
            <div class="loading-dots"></div>
        </div>
    `;
}

// Load current question
function loadCurrentQuestion() {
    const questionIndex = currentRoom.currentQuestion;
    const question = currentQuiz.questions[questionIndex];
    
    currentPlayerAnswer = null;

    // Update question number
    document.getElementById('question-number').textContent = `${questionIndex + 1}/${currentQuiz.questions.length}`;
    
    // Update question text
    document.getElementById('question-text').textContent = question.question;
    
    // Render options
    const optionsGrid = document.getElementById('options-grid');
    optionsGrid.innerHTML = '';
    
    const colors = ['#e74c3c', '#3498db', '#f39c12', '#2ecc71'];
    
    question.options.forEach((option, index) => {
        const optionBtn = document.createElement('button');
        optionBtn.className = 'live-option animated-scale';
        optionBtn.style.backgroundColor = colors[index];
        optionBtn.style.borderColor = colors[index];
        optionBtn.textContent = option;
        
        optionBtn.addEventListener('click', () => selectAnswer(index));
        
        optionsGrid.appendChild(optionBtn);
    });
    
    // Show question screen
    document.getElementById('question-screen').classList.remove('hidden');
    document.getElementById('leaderboard-screen').classList.add('hidden');
    document.getElementById('results-screen').classList.add('hidden');
    
    // Start timer
    startQuestionTimer();
}

// Select answer
function selectAnswer(answerIndex) {
    if (currentPlayerAnswer !== null) return; // Already answered
    
    currentPlayerAnswer = answerIndex;
    
    // Update UI
    const options = document.querySelectorAll('.live-option');
    options.forEach((opt, index) => {
        if (index === answerIndex) {
            opt.classList.add('selected');
        } else {
            opt.style.opacity = '0.5';
        }
    });
    
    // Submit answer
    const user = Auth.getAuthUser();
    const result = LiveQuiz.submitAnswer(
        currentRoom.id,
        user.id,
        currentRoom.currentQuestion,
        answerIndex
    );
    
    // Show feedback after 1 second
    setTimeout(() => {
        showAnswerFeedback(result.isCorrect, answerIndex);
    }, 1000);
}

// Show answer feedback
function showAnswerFeedback(isCorrect, selectedIndex) {
    const question = currentQuiz.questions[currentRoom.currentQuestion];
    const options = document.querySelectorAll('.live-option');
    
    options.forEach((opt, index) => {
        if (index === question.correctAnswer) {
            opt.classList.add('correct');
        } else if (index === selectedIndex && !isCorrect) {
            opt.classList.add('wrong');
        }
    });
}

// Start question timer
function startQuestionTimer() {
    let timeLeft = LiveQuiz.LIVE_TIMER;
    const timerText = document.getElementById('timer-text');
    const timerProgress = document.getElementById('timer-progress');
    const circumference = 2 * Math.PI * 45; // radius is 45
    
    timerProgress.style.strokeDasharray = circumference;
    timerProgress.style.strokeDashoffset = 0;
    
    function updateTimer() {
        timerText.textContent = timeLeft;
        
        const progress = (timeLeft / LiveQuiz.LIVE_TIMER);
        const offset = circumference * (1 - progress);
        timerProgress.style.strokeDashoffset = offset;
        
        // Update color based on time
        if (timeLeft <= 3) {
            timerProgress.classList.add('danger');
            timerProgress.classList.remove('warning');
        } else if (timeLeft <= 6) {
            timerProgress.classList.add('warning');
            timerProgress.classList.remove('danger');
        }
        
        if (timeLeft <= 0) {
            clearInterval(timerInterval);
            // Auto-submit if not answered
            if (currentPlayerAnswer === null) {
                currentPlayerAnswer = -1; // No answer
            }
        } else {
            timeLeft--;
        }
    }
    
    updateTimer();
    timerInterval = setInterval(updateTimer, 1000);
}

// Show leaderboard
function showLeaderboard() {
    clearInterval(timerInterval);
    
    document.getElementById('question-screen').classList.add('hidden');
    document.getElementById('leaderboard-screen').classList.remove('hidden');
    
    const leaderboard = LiveQuiz.getQuestionLeaderboard(currentRoom.id, currentRoom.currentQuestion);
    const leaderboardList = document.getElementById('live-leaderboard-list');
    const currentUser = Auth.getAuthUser();
    
    document.getElementById('current-question-num').textContent = currentRoom.currentQuestion + 1;
    
    leaderboardList.innerHTML = '';
    
    leaderboard.forEach((player, index) => {
        const item = document.createElement('div');
        item.className = `leaderboard-item animated-fade-in-up rank-${index + 1}`;
        
        const isCurrentUser = player.id === currentUser.id;
        if (isCurrentUser) {
            item.style.borderColor = 'var(--accent-cyan)';
        }
        
        item.innerHTML = `
            <div class="leaderboard-rank">${index + 1}</div>
            <div class="leaderboard-player">
                <div class="leaderboard-player-name">${player.name}${isCurrentUser ? ' (You)' : ''}</div>
            </div>
            <div class="leaderboard-score">${player.points.toLocaleString()}</div>
        `;
        
        leaderboardList.appendChild(item);
    });
    
    // Start countdown for next question
    startNextQuestionCountdown();
}

// Start countdown for next question
function startNextQuestionCountdown() {
    let timeLeft = LiveQuiz.LEADERBOARD_DELAY;
    const timerSpan = document.getElementById('next-question-timer');
    const countdownFill = document.getElementById('countdown-fill');
    
    function updateCountdown() {
        timerSpan.textContent = timeLeft;
        const progress = (timeLeft / LiveQuiz.LEADERBOARD_DELAY) * 100;
        countdownFill.style.width = `${progress}%`;
        
        if (timeLeft <= 0) {
            clearInterval(timerInterval);
        } else {
            timeLeft--;
        }
    }
    
    updateCountdown();
    timerInterval = setInterval(updateCountdown, 1000);
}

// Show final results
function showFinalResults() {
    clearInterval(timerInterval);
    
    document.getElementById('question-screen').classList.add('hidden');
    document.getElementById('leaderboard-screen').classList.add('hidden');
    document.getElementById('results-screen').classList.remove('hidden');
    
    const leaderboard = LiveQuiz.getFinalLeaderboard(currentRoom.id);
    
    // Update podium
    if (leaderboard[0]) {
        document.querySelector('#final-first .podium-name').textContent = leaderboard[0].name;
        document.querySelector('#final-first .podium-score').textContent = leaderboard[0].points.toLocaleString();
    }
    if (leaderboard[1]) {
        document.querySelector('#final-second .podium-name').textContent = leaderboard[1].name;
        document.querySelector('#final-second .podium-score').textContent = leaderboard[1].points.toLocaleString();
    }
    if (leaderboard[2]) {
        document.querySelector('#final-third .podium-name').textContent = leaderboard[2].name;
        document.querySelector('#final-third .podium-score').textContent = leaderboard[2].points.toLocaleString();
    }
    
    // Full leaderboard
    const listContainer = document.getElementById('final-leaderboard-list');
    listContainer.innerHTML = '';
    
    const currentUser = Auth.getAuthUser();
    
    leaderboard.forEach((player, index) => {
        const item = document.createElement('div');
        item.className = 'leaderboard-item animated-fade-in-up';
        
        const isCurrentUser = player.id === currentUser.id;
        if (isCurrentUser) {
            item.style.borderColor = 'var(--accent-cyan)';
        }
        
        item.innerHTML = `
            <div class="leaderboard-rank">${index + 1}</div>
            <div class="leaderboard-player">
                <div class="leaderboard-player-name">${player.name}${isCurrentUser ? ' (You)' : ''}</div>
            </div>
            <div class="leaderboard-score">${player.points.toLocaleString()}</div>
        `;
        
        listContainer.appendChild(item);
    });
}

// Start polling for room updates
function startPolling() {
    pollInterval = setInterval(() => {
        const room = LiveQuiz.getRoomById(currentRoom.id);
        
        if (!room) {
            stopPolling();
            return;
        }
        
        const previousQuestion = currentRoom.currentQuestion;
        const previousStatus = currentRoom.status;
        currentRoom = room;
        
        // Check if moved to next question
        if (room.currentQuestion !== previousQuestion && room.status === 'in-progress') {
            if (previousQuestion >= 0) {
                // Show leaderboard first
                showLeaderboard();
                
                // Then load next question after delay
                setTimeout(() => {
                    if (currentRoom.currentQuestion < currentQuiz.questions.length) {
                        loadCurrentQuestion();
                    }
                }, LiveQuiz.LEADERBOARD_DELAY * 1000);
            } else {
                loadCurrentQuestion();
            }
        }
        
        // Check if quiz finished
        if (room.status === 'finished' && previousStatus !== 'finished') {
            stopPolling();
            setTimeout(() => {
                showFinalResults();
            }, 2000);
        }
    }, LiveQuiz.POLL_INTERVAL);
}

// Stop polling
function stopPolling() {
    if (pollInterval) {
        clearInterval(pollInterval);
        pollInterval = null;
    }
    if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
    }
}

// Cleanup on page unload
window.addEventListener('beforeunload', stopPolling);

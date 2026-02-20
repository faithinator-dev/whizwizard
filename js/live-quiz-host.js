// =====================
// Live Quiz Host Page JavaScript
// For quiz creators to control the live quiz
// =====================

let currentRoom = null;
let currentQuiz = null;
let pollInterval = null;
let autoAdvance = true;

document.addEventListener('DOMContentLoaded', function() {
    // Require authentication
    if (!Auth.requireAuth()) return;

    const roomId = QuizUtils.getUrlParameter('room');
    if (!roomId) {
        window.location.href = 'my-quizzes.html';
        return;
    }

    currentRoom = LiveQuiz.getRoomById(roomId);
    if (!currentRoom) {
        QuizUtils.showNotification('Room not found', 'error');
        setTimeout(() => {
            window.location.href = 'my-quizzes.html';
        }, 2000);
        return;
    }

    // Verify host
    const user = Auth.getAuthUser();
    if (currentRoom.hostId !== user.id) {
        QuizUtils.showNotification('You are not the host of this room', 'error');
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 2000);
        return;
    }

    currentQuiz = Database.getQuizById(currentRoom.quizId);
    
    // Setup UI
    setupLobby();
    
    // Start polling
    startPolling();
    
    // Setup event listeners
    document.getElementById('start-quiz-btn').addEventListener('click', startQuiz);
    document.getElementById('next-question-btn').addEventListener('click', nextQuestion);
    document.getElementById('end-quiz-btn').addEventListener('click', endQuiz);
    
    // Auto-advance toggle
    const autoToggle = document.getElementById('auto-advance-toggle');
    autoToggle.checked = autoAdvance;
    autoToggle.addEventListener('change', (e) => {
        autoAdvance = e.target.checked;
    });
});

// Setup lobby
function setupLobby() {
    document.getElementById('lobby-quiz-title').textContent = currentQuiz.title;
    document.getElementById('join-code-display').textContent = currentRoom.code;
    document.getElementById('quiz-question-count').textContent = currentQuiz.questions.length;
    
    updatePlayersDisplay();
    
    // Show lobby
    document.getElementById('host-lobby-container').classList.remove('hidden');
    document.getElementById('host-controls-container').classList.add('hidden');
}

// Update players display
function updatePlayersDisplay() {
    const playersGrid = document.getElementById('host-players-grid');
    const playerCount = document.getElementById('host-player-count');
    
    playersGrid.innerHTML = '';
    playerCount.textContent = currentRoom.players.length;
    
    currentRoom.players.forEach(player => {
        const playerCard = document.createElement('div');
        playerCard.className = 'player-card animated-scale';
        
        const initial = player.name.charAt(0).toUpperCase();
        
        playerCard.innerHTML = `
            <div class="player-avatar">${initial}</div>
            <div class="player-name">${player.name}</div>
        `;
        
        playersGrid.appendChild(playerCard);
    });
}

// Start quiz
function startQuiz() {
    if (currentRoom.players.length === 0) {
        QuizUtils.showNotification('Wait for at least one player to join', 'error');
        return;
    }
    
    const result = LiveQuiz.startQuiz(currentRoom.id);
    
    if (result.success) {
        currentRoom = result.room;
        showControls();
        QuizUtils.showNotification('Quiz started!', 'success');
    } else {
        QuizUtils.showNotification(result.message, 'error');
    }
}

// Show host controls
function showControls() {
    document.getElementById('host-lobby-container').classList.add('hidden');
    document.getElementById('host-controls-container').classList.remove('hidden');
    
    updateControlsDisplay();
}

// Update controls display
function updateControlsDisplay() {
    const questionIndex = currentRoom.currentQuestion;
    const question = currentQuiz.questions[questionIndex];
    
    // Update question info
    document.getElementById('control-question-num').textContent = `${questionIndex + 1}/${currentQuiz.questions.length}`;
    document.getElementById('control-question-text').textContent = question.question;
    
    // Update response statistics
    const answers = currentRoom.answers[questionIndex] || [];
    const totalResponses = answers.length;
    const totalPlayers = currentRoom.players.length;
    
    document.getElementById('total-responses').textContent = totalResponses;
    document.getElementById('total-players-count').textContent = totalPlayers;
    
    // Update response chart
    const responseChart = document.getElementById('response-chart');
    responseChart.innerHTML = '';
    
    const colors = ['#e74c3c', '#3498db', '#f39c12', '#2ecc71'];
    const responseCounts = [0, 0, 0, 0];
    
    answers.forEach(answer => {
        if (answer.answerIndex >= 0 && answer.answerIndex < 4) {
            responseCounts[answer.answerIndex]++;
        }
    });
    
    question.options.forEach((option, index) => {
        const percentage = totalResponses > 0 ? (responseCounts[index] / totalResponses * 100) : 0;
        const isCorrect = index === question.correctAnswer;
        
        const bar = document.createElement('div');
        bar.className = 'response-bar';
        
        bar.innerHTML = `
            <div class="response-option">
                <span>${option}</span>
                ${isCorrect ? '<span style="color: #2ecc71;">✓</span>' : ''}
            </div>
            <div class="response-progress">
                <div class="response-fill" style="width: ${percentage}%; background-color: ${colors[index]};"></div>
                <span class="response-percentage">${percentage.toFixed(0)}%</span>
            </div>
            <div class="response-count">${responseCounts[index]} / ${totalResponses}</div>
        `;
        
        responseChart.appendChild(bar);
    });
    
    // Update leaderboard
    updateHostLeaderboard();
    
    // Enable/disable next button
    const nextBtn = document.getElementById('next-question-btn');
    const endBtn = document.getElementById('end-quiz-btn');
    
    if (questionIndex >= currentQuiz.questions.length - 1) {
        nextBtn.style.display = 'none';
        endBtn.style.display = 'block';
    } else {
        nextBtn.style.display = 'block';
        endBtn.style.display = 'none';
    }
}

// Update host leaderboard
function updateHostLeaderboard() {
    const leaderboard = LiveQuiz.getQuestionLeaderboard(currentRoom.id, currentRoom.currentQuestion);
    const listContainer = document.getElementById('host-leaderboard-list');
    
    listContainer.innerHTML = '';
    
    leaderboard.slice(0, 5).forEach((player, index) => {
        const item = document.createElement('div');
        item.className = 'leaderboard-item animated-fade-in-up';
        
        item.innerHTML = `
            <div class="leaderboard-rank">${index + 1}</div>
            <div class="leaderboard-player">
                <div class="leaderboard-player-name">${player.name}</div>
            </div>
            <div class="leaderboard-score">${player.points.toLocaleString()}</div>
        `;
        
        listContainer.appendChild(item);
    });
}

// Next question
function nextQuestion() {
    const result = LiveQuiz.nextQuestion(currentRoom.id);
    
    if (result.success) {
        currentRoom = result.room;
        
        if (currentRoom.status === 'finished') {
            showFinalResults();
        } else {
            updateControlsDisplay();
            QuizUtils.showNotification(`Question ${currentRoom.currentQuestion + 1} started`, 'success');
        }
    } else {
        QuizUtils.showNotification(result.message, 'error');
    }
}

// End quiz
function endQuiz() {
    if (!confirm('Are you sure you want to end the quiz?')) {
        return;
    }
    
    const result = LiveQuiz.nextQuestion(currentRoom.id);
    
    if (result.success) {
        currentRoom = result.room;
        showFinalResults();
    }
}

// Show final results
function showFinalResults() {
    document.getElementById('host-controls-container').classList.add('hidden');
    
    const resultsContainer = document.createElement('div');
    resultsContainer.className = 'host-results-container';
    resultsContainer.style.cssText = 'padding: 2rem; text-align: center;';
    
    const leaderboard = LiveQuiz.getFinalLeaderboard(currentRoom.id);
    
    resultsContainer.innerHTML = `
        <h1 style="color: var(--accent-cyan); margin-bottom: 2rem;">Quiz Finished!</h1>
        <div style="background: var(--secondary-navy); padding: 2rem; border-radius: 12px; border: 2px solid var(--accent-blue);">
            <h2 style="color: var(--text-primary); margin-bottom: 1rem;">Final Leaderboard</h2>
            <div id="host-final-leaderboard"></div>
        </div>
        <button onclick="window.location.href='my-quizzes.html'" class="btn btn-primary" style="margin-top: 2rem;">
            Back to My Quizzes
        </button>
    `;
    
    document.querySelector('.host-container').appendChild(resultsContainer);
    
    const finalList = document.getElementById('host-final-leaderboard');
    
    leaderboard.forEach((player, index) => {
        const item = document.createElement('div');
        item.className = 'leaderboard-item animated-fade-in-up';
        item.style.cssText = 'margin-bottom: 0.5rem;';
        
        item.innerHTML = `
            <div class="leaderboard-rank">${index + 1}</div>
            <div class="leaderboard-player">
                <div class="leaderboard-player-name">${player.name}</div>
            </div>
            <div class="leaderboard-score">${player.points.toLocaleString()}</div>
        `;
        
        finalList.appendChild(item);
    });
    
    stopPolling();
}

// Start polling for room updates
function startPolling() {
    pollInterval = setInterval(() => {
        const room = LiveQuiz.getRoomById(currentRoom.id);
        
        if (!room) {
            stopPolling();
            return;
        }
        
        currentRoom = room;
        
        if (currentRoom.status === 'waiting') {
            updatePlayersDisplay();
        } else if (currentRoom.status === 'in-progress') {
            updateControlsDisplay();
            
            // Auto-advance to next question if enabled
            if (autoAdvance) {
                const questionIndex = currentRoom.currentQuestion;
                const answers = currentRoom.answers[questionIndex] || [];
                const totalPlayers = currentRoom.players.length;
                
                // If all players have answered, auto-advance after 2 seconds
                if (answers.length >= totalPlayers && totalPlayers > 0) {
                    stopPolling();
                    setTimeout(() => {
                        nextQuestion();
                        startPolling();
                    }, 2000);
                }
            }
        }
    }, LiveQuiz.POLL_INTERVAL);
}

// Stop polling
function stopPolling() {
    if (pollInterval) {
        clearInterval(pollInterval);
        pollInterval = null;
    }
}

// Cleanup on page unload
window.addEventListener('beforeunload', stopPolling);

// =====================
// Live Quiz Host Page JavaScript
// For quiz creators to control the live quiz
// =====================

let currentRoom = null;
let currentQuiz = null;
let stopListener = null;
let autoAdvance = true;

document.addEventListener('DOMContentLoaded', async function() {
    // Require authentication
    if (!Auth.requireAuth()) return;

    const roomId = QuizUtils.getUrlParameter('room');
    if (!roomId) {
        window.location.href = 'my-quizzes.html';
        return;
    }

    try {
        currentRoom = await FirebaseService.liveRooms.getById(roomId);
        if (!currentRoom) throw new Error('Room not found');

        // Verify host
        const user = Auth.getAuthUser();
        if (currentRoom.hostId !== user.id && !Auth.isAdmin()) {
            QuizUtils.showNotification('You are not the host of this room', 'error');
            setTimeout(() => window.location.href = 'index.html', 2000);
            return;
        }

        currentQuiz = await FirebaseService.quizzes.getById(currentRoom.quizId);
        
        // Setup UI
        setupLobby();
        
        // Listen to room updates (Real-time via Socket)
        stopListener = FirebaseService.liveRooms.listenToRoom(roomId, (room) => {
            console.log('🔄 Room Update Received:', room);
            currentRoom = room;
            
            if (currentRoom.status === 'waiting') {
                updatePlayersDisplay();
            } else if (currentRoom.status === 'in-progress') {
                updateControlsDisplay();
                
                // Auto-advance logic
                if (autoAdvance) {
                    const totalPlayers = currentRoom.participants?.length || 0;
                    // In a more complex version, we would check if all participants submitted answers
                    // For now, we manually advance or use the host controls
                }
            } else if (currentRoom.status === 'finished') {
                showFinalResults();
            }
        });
        
        // Setup event listeners
        document.getElementById('start-quiz-btn').addEventListener('click', startQuiz);
        document.getElementById('next-question-btn').addEventListener('click', nextQuestion);
        
        // Auto-advance toggle (if element exists in HTML)
        const autoToggle = document.getElementById('auto-advance-toggle');
        if (autoToggle) {
            autoToggle.checked = autoAdvance;
            autoToggle.addEventListener('change', (e) => {
                autoAdvance = e.target.checked;
            });
        }
    } catch (error) {
        console.error('Host init error:', error);
        QuizUtils.showNotification('Error joining room: ' + error.message, 'error');
    }
});

// Setup lobby
function setupLobby() {
    document.getElementById('host-quiz-name').textContent = currentQuiz.title;
    document.getElementById('host-code').textContent = currentRoom.roomCode;
    document.getElementById('host-question-count').textContent = currentQuiz.questions.length;
    
    updatePlayersDisplay();
}

// Update players display
function updatePlayersDisplay() {
    const playersGrid = document.getElementById('host-players-grid');
    const playerCount = document.getElementById('host-player-count');
    
    playersGrid.innerHTML = '';
    const participants = currentRoom.participants || [];
    playerCount.textContent = participants.length;
    
    participants.forEach(player => {
        const playerCard = document.createElement('div');
        playerCard.className = 'player-card animated-scale';
        
        const initial = player.name.charAt(0).toUpperCase();
        
        playerCard.innerHTML = `
            <div class="player-avatar">${initial}</div>
            <div class="player-name">${player.name}</div>
        `;
        
        playersGrid.appendChild(playerCard);
    });

    // Enable start button if there are players
    document.getElementById('start-quiz-btn').disabled = participants.length === 0;
}

// Start quiz
async function startQuiz() {
    if ((currentRoom.participants || []).length === 0) {
        QuizUtils.showNotification('Wait for at least one player to join', 'error');
        return;
    }
    
    try {
        const result = await FirebaseService.liveRooms.updateStatus(currentRoom.id, 'in-progress', 0);
        
        if (result.success) {
            currentRoom = result.room;
            
            // Emit Socket event so players know the game started
            if (FirebaseService.socket) {
                FirebaseService.socket.emit('startGame', { roomId: currentRoom.id });
            }
            
            showControls();
            QuizUtils.showNotification('Quiz started!', 'success');
        }
    } catch (error) {
        QuizUtils.showNotification('Failed to start quiz: ' + error.message, 'error');
    }
}

// Show host controls
function showControls() {
    document.getElementById('host-lobby').classList.add('hidden');
    document.getElementById('host-control').classList.remove('hidden');
    
    updateControlsDisplay();
}

// Update controls display
function updateControlsDisplay() {
    const questionIndex = currentRoom.currentQuestion;
    const question = currentQuiz.questions[questionIndex];
    
    // Update question info
    document.getElementById('control-question-num').textContent = questionIndex + 1;
    document.getElementById('control-total-questions').textContent = currentQuiz.questions.length;
    document.getElementById('control-question-text').textContent = question.question;
    
    // Update participant stats
    document.getElementById('total-players').textContent = currentRoom.participants?.length || 0;
    
    // Render options
    const optionsContainer = document.getElementById('control-options');
    optionsContainer.innerHTML = '';
    
    question.options.forEach((option, index) => {
        const div = document.createElement('div');
        div.className = `control-option ${index === question.correctAnswer ? 'correct' : ''}`;
        div.textContent = `${index + 1}. ${option}`;
        optionsContainer.appendChild(div);
    });
}

// Next question
async function nextQuestion() {
    const nextIndex = currentRoom.currentQuestion + 1;
    
    if (nextIndex >= currentQuiz.questions.length) {
        await endQuiz();
        return;
    }

    try {
        const result = await FirebaseService.liveRooms.updateStatus(currentRoom.id, 'in-progress', nextIndex);
        
        if (result.success) {
            currentRoom = result.room;
            
            // Emit Socket event so players move to next question
            if (FirebaseService.socket) {
                FirebaseService.socket.emit('nextQuestion', { 
                    roomId: currentRoom.id, 
                    questionIndex: nextIndex 
                });
            }
            
            updateControlsDisplay();
            QuizUtils.showNotification(`Question ${nextIndex + 1} started`, 'success');
        }
    } catch (error) {
        QuizUtils.showNotification('Error: ' + error.message, 'error');
    }
}

// End quiz
async function endQuiz() {
    try {
        const result = await FirebaseService.liveRooms.updateStatus(currentRoom.id, 'finished');
        if (result.success) {
            currentRoom = result.room;
            showFinalResults();
        }
    } catch (error) {
        QuizUtils.showNotification('Error ending quiz: ' + error.message, 'error');
    }
}

// Show final results
function showFinalResults() {
    document.getElementById('host-control').innerHTML = `
        <div class="results-header" style="text-align: center; padding: 2rem;">
            <img src="assets/characters/winner-character.svg" alt="Winner" style="height: 150px;">
            <h1 style="color: #00d4ff;">Quiz Finished!</h1>
            <p>The final results have been calculated.</p>
            <a href="index.html" class="btn btn-primary" style="margin-top: 2rem;">Back to Home</a>
        </div>
    `;
}

function copyCode() {
    const code = document.getElementById('host-code').textContent;
    navigator.clipboard.writeText(code);
    QuizUtils.showNotification('Code copied to clipboard!', 'success');
}

function cancelQuiz() {
    if (confirm('Are you sure you want to cancel this quiz room?')) {
        FirebaseService.liveRooms.delete(currentRoom.id).then(() => {
            window.location.href = 'my-quizzes.html';
        });
    }
}

window.addEventListener('beforeunload', () => {
    if (stopListener) stopListener();
});

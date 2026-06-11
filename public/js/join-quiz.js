// =====================
// Join Quiz Page JavaScript
// =====================

let currentRoom = null;
let pollInterval = null;

document.addEventListener('DOMContentLoaded', function() {
    // Require authentication
    if (!Auth.requireAuth()) return;

    // Display user name
    const user = Auth.getAuthUser();
    document.getElementById('user-name-display').textContent = user.name;

    // Setup form submission
    document.getElementById('join-code-form').addEventListener('submit', handleJoinCode);
});

// Handle join code submission
function handleJoinCode(e) {
    e.preventDefault();

    const code = document.getElementById('quiz-code-input').value.trim().toUpperCase();

    if (!code || code.length !== 6) {
        QuizUtils.showNotification('Please enter a valid 6-character code', 'error');
        return;
    }

    const result = LiveQuiz.joinRoom(code);

    if (result.success) {
        currentRoom = result.room;
        showLobby();
        startPolling();
    } else {
        QuizUtils.showNotification(result.message, 'error');
    }
}

// Show lobby
function showLobby() {
    document.getElementById('join-container').classList.add('hidden');
    document.getElementById('lobby-container').classList.remove('hidden');

    const quiz = Database.getQuizById(currentRoom.quizId);
    
    document.getElementById('lobby-quiz-name').textContent = quiz.title;
    document.getElementById('lobby-code-display').textContent = currentRoom.code;
    document.getElementById('question-count').textContent = quiz.questions.length;

    updatePlayersDisplay();
}

// Update players display
function updatePlayersDisplay() {
    const playersGrid = document.getElementById('players-grid');
    const playerCount = document.getElementById('player-count');

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

// Start polling for room updates
function startPolling() {
    pollInterval = setInterval(() => {
        const room = LiveQuiz.getRoomById(currentRoom.id);
        
        if (!room) {
            stopPolling();
            QuizUtils.showNotification('Room no longer exists', 'error');
            setTimeout(() => {
                window.location.href = 'join-quiz.html';
            }, 2000);
            return;
        }

        currentRoom = room;
        updatePlayersDisplay();

        // Check if quiz started
        if (room.status === 'in-progress' && room.currentQuestion === 0) {
            stopPolling();
            // Navigate to live quiz play page
            window.location.href = `live-quiz-play.html?room=${room.id}`;
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

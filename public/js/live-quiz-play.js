// =====================
// Live Quiz Play Page JavaScript
// For participants taking the live quiz
// =====================

let currentRoom = null;
let currentQuiz = null;
let stopListener = null;
let timerInterval = null;
let currentPlayerAnswer = null;

document.addEventListener('DOMContentLoaded', async function() {
    // Require authentication
    if (!Auth.requireAuth()) return;

    const roomId = QuizUtils.getUrlParameter('room');
    if (!roomId) {
        window.location.href = 'join-quiz.html';
        return;
    }

    try {
        currentRoom = await FirebaseService.liveRooms.getById(roomId);
        if (!currentRoom) throw new Error('Room not found');

        currentQuiz = await FirebaseService.quizzes.getById(currentRoom.quizId);
        
        // Listen to room updates (Real-time via Socket)
        stopListener = FirebaseService.liveRooms.listenToRoom(roomId, (room) => {
            console.log('🔄 Player Room Update:', room);
            const prevQuestion = currentRoom.currentQuestion;
            const prevStatus = currentRoom.status;
            currentRoom = room;

            if (currentRoom.status === 'waiting') {
                showWaitingScreen();
            } else if (currentRoom.status === 'in-progress') {
                if (prevStatus === 'waiting' || currentRoom.currentQuestion !== prevQuestion) {
                    loadCurrentQuestion();
                }
            } else if (currentRoom.status === 'finished') {
                showFinalResults();
            }
        });
    } catch (error) {
        console.error('Player init error:', error);
        QuizUtils.showNotification('Error joining quiz: ' + error.message, 'error');
    }
});

// Show waiting screen
function showWaitingScreen() {
    document.getElementById('question-text').textContent = "Waiting for host to start...";
    document.getElementById('options-grid').innerHTML = '<div class="loading-dots"></div>';
}

// Load current question
function loadCurrentQuestion() {
    const questionIndex = currentRoom.currentQuestion;
    const question = currentQuiz.questions[questionIndex];
    
    currentPlayerAnswer = null;

    // Update UI
    document.getElementById('question-number').textContent = `${questionIndex + 1}/${currentQuiz.questions.length}`;
    document.getElementById('question-text').textContent = question.question;
    
    const optionsGrid = document.getElementById('options-grid');
    optionsGrid.innerHTML = '';
    
    const colors = ['#e74c3c', '#3498db', '#f39c12', '#2ecc71'];
    
    question.options.forEach((option, index) => {
        const optionBtn = document.createElement('button');
        optionBtn.className = 'live-option animated-scale';
        optionBtn.style.backgroundColor = colors[index];
        optionBtn.textContent = option;
        optionBtn.onclick = () => selectAnswer(index);
        optionsGrid.appendChild(optionBtn);
    });
    
    startQuestionTimer();
}

// Select answer
function selectAnswer(answerIndex) {
    if (currentPlayerAnswer !== null) return;
    
    currentPlayerAnswer = answerIndex;
    
    // Visual feedback
    const options = document.querySelectorAll('.live-option');
    options.forEach((opt, index) => {
        if (index === answerIndex) {
            opt.classList.add('selected');
        } else {
            opt.style.opacity = '0.5';
        }
    });
    
    // Submit via Socket for real-time host feedback
    if (FirebaseService.socket) {
        FirebaseService.socket.emit('submitAnswer', {
            roomId: currentRoom.id,
            userId: Auth.getAuthUser().id,
            name: Auth.getAuthUser().name,
            score: 0 // In a real version, calculate points based on time
        });
    }

    QuizUtils.showNotification('Answer submitted! Waiting for next question...', 'info');
}

// Start question timer
function startQuestionTimer() {
    if (timerInterval) clearInterval(timerInterval);
    
    let timeLeft = 30; // Use quiz timer if available
    const timerText = document.getElementById('timer-text');
    const timerProgress = document.getElementById('timer-progress');
    const totalTime = 30;
    
    function updateTimer() {
        timerText.textContent = timeLeft;
        const offset = 283 * (1 - timeLeft / totalTime); // 283 is approx circumference
        timerProgress.style.strokeDashoffset = offset;
        
        if (timeLeft <= 0) {
            clearInterval(timerInterval);
            if (currentPlayerAnswer === null) selectAnswer(-1);
        } else {
            timeLeft--;
        }
    }
    
    updateTimer();
    timerInterval = setInterval(updateTimer, 1000);
}

// Show final results
function showFinalResults() {
    if (timerInterval) clearInterval(timerInterval);
    document.getElementById('question-screen').classList.add('hidden');
    document.getElementById('results-screen').classList.remove('hidden');
    
    // Populate simple podium for now
    document.querySelector('#final-first .podium-name').textContent = Auth.getAuthUser().name;
    document.querySelector('#final-first .podium-score').textContent = "Completed!";
}

window.addEventListener('beforeunload', () => {
    if (stopListener) stopListener();
});

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
    
    // Show results
    showResults(score, correctCount, wrongCount, timeTaken);
}

// Show results
function showResults(score, correct, wrong, timeTaken) {
    // Hide quiz container
    document.querySelector('.quiz-container').classList.add('hidden');
    
    // Show result container
    const resultContainer = document.getElementById('result-container');
    resultContainer.classList.remove('hidden');
    
    // Update result values
    document.getElementById('score-value').textContent = `${score}%`;
    document.getElementById('correct-answers').textContent = correct;
    document.getElementById('wrong-answers').textContent = wrong;
    document.getElementById('time-taken').textContent = QuizUtils.formatTime(timeTaken);
}

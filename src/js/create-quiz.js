// =====================
// Create Quiz Page JavaScript
// =====================

let questionCount = 0;

document.addEventListener('DOMContentLoaded', function() {
    // Require authentication
    if (!Auth.requireAuth()) return;
    
    // Update authentication navigation
    updateAuthNavigation();
    
    // Add first question automatically
    addQuestion();
    
    // Setup form submission
    document.getElementById('create-quiz-form').addEventListener('submit', handleFormSubmit);
    
    // Setup add question button
    document.getElementById('add-question-btn').addEventListener('click', addQuestion);
});

// Update authentication navigation
function updateAuthNavigation() {
    const navAuth = document.getElementById('nav-auth');
    const user = Auth.getAuthUser();
    
    navAuth.innerHTML = `
        <div class="user-menu">
            <span class="user-name">${user.name}</span>
            <button onclick="logout()" class="btn btn-secondary btn-sm">Logout</button>
        </div>
    `;
}

// Logout function
function logout() {
    Auth.logout();
    window.location.href = 'index.html';
}

// Add new question
function addQuestion() {
    questionCount++;
    const questionsContainer = document.getElementById('questions-container');
    
    const questionCard = document.createElement('div');
    questionCard.className = 'question-card animated-fade-in-up';
    questionCard.setAttribute('data-question-number', questionCount);
    
    questionCard.innerHTML = `
        <div class="question-card-header">
            <span class="question-number">Question ${questionCount}</span>
            <button type="button" class="icon-btn delete" onclick="removeQuestion(${questionCount})">
                <img src="assets/icons/trash.svg" alt="Delete">
            </button>
        </div>
        
        <div class="form-group">
            <label class="form-label">Question Text</label>
            <input type="text" class="form-input question-text" placeholder="Enter question" required>
        </div>
        
        <div class="options-group">
            <label class="form-label">Options (Select the correct answer)</label>
            <div class="option-item">
                <input type="radio" name="correct-${questionCount}" value="0" class="option-radio" required>
                <input type="text" class="form-input option-text" placeholder="Option 1" required>
            </div>
            <div class="option-item">
                <input type="radio" name="correct-${questionCount}" value="1" class="option-radio">
                <input type="text" class="form-input option-text" placeholder="Option 2" required>
            </div>
            <div class="option-item">
                <input type="radio" name="correct-${questionCount}" value="2" class="option-radio">
                <input type="text" class="form-input option-text" placeholder="Option 3" required>
            </div>
            <div class="option-item">
                <input type="radio" name="correct-${questionCount}" value="3" class="option-radio">
                <input type="text" class="form-input option-text" placeholder="Option 4" required>
            </div>
        </div>
    `;
    
    questionsContainer.appendChild(questionCard);
}

// Remove question
function removeQuestion(questionNumber) {
    const questionCard = document.querySelector(`[data-question-number="${questionNumber}"]`);
    if (questionCard) {
        questionCard.classList.add('animated-fade-out');
        setTimeout(() => {
            questionCard.remove();
            renumberQuestions();
        }, 300);
    }
}

// Renumber questions after deletion
function renumberQuestions() {
    const questionCards = document.querySelectorAll('.question-card');
    questionCards.forEach((card, index) => {
        const newNumber = index + 1;
        card.setAttribute('data-question-number', newNumber);
        card.querySelector('.question-number').textContent = `Question ${newNumber}`;
        
        // Update radio button names
        const radioButtons = card.querySelectorAll('.option-radio');
        radioButtons.forEach(radio => {
            radio.name = `correct-${newNumber}`;
        });
    });
    questionCount = questionCards.length;
}

// Handle form submission
function handleFormSubmit(e) {
    e.preventDefault();
    
    // Get form data
    const title = document.getElementById('quiz-title').value.trim();
    const description = document.getElementById('quiz-description').value.trim();
    const category = document.getElementById('quiz-category').value;
    const timer = document.getElementById('quiz-timer').value;
    
    // Get questions
    const questions = [];
    const questionCards = document.querySelectorAll('.question-card');
    
    questionCards.forEach((card, index) => {
        const questionText = card.querySelector('.question-text').value.trim();
        const optionInputs = card.querySelectorAll('.option-text');
        const options = Array.from(optionInputs).map(input => input.value.trim());
        
        const correctRadio = card.querySelector('.option-radio:checked');
        const correctAnswer = correctRadio ? parseInt(correctRadio.value) : 0;
        
        questions.push({
            question: questionText,
            options: options,
            correctAnswer: correctAnswer
        });
    });
    
    // Create quiz data object
    const quizData = {
        title,
        description,
        category,
        timer,
        questions
    };
    
    // Validate quiz data
    const validation = QuizUtils.validateQuiz(quizData);
    
    if (!validation.isValid) {
        QuizUtils.showNotification(validation.errors[0], 'error');
        return;
    }
    
    // Save quiz
    const savedQuiz = Database.saveQuiz(quizData);
    
    if (savedQuiz) {
        QuizUtils.showNotification('Quiz created successfully!', 'success');
        setTimeout(() => {
            window.location.href = 'my-quizzes.html';
        }, 1500);
    } else {
        QuizUtils.showNotification('Failed to create quiz', 'error');
    }
}

// Make removeQuestion available globally
window.removeQuestion = removeQuestion;

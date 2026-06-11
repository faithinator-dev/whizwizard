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

    // Setup AI Magic Generator
    const magicBtn = document.getElementById('magic-generate-btn');
    if (magicBtn) {
        magicBtn.addEventListener('click', handleMagicGenerate);
    }
});

// Handle AI Magic Generation
async function handleMagicGenerate() {
    const topicInput = document.getElementById('ai-topic');
    const topic = topicInput.value.trim();
    const magicBtn = document.getElementById('magic-generate-btn');

    if (!topic) {
        QuizUtils.showNotification('Please enter a topic for the AI Sorcerer!', 'warning');
        return;
    }

    try {
        ButtonLoader.show(magicBtn);
        QuizUtils.showNotification('The Sorcerer is casting a spell...', 'info');

        // Call our new backend API
        const response = await fetch('/api/quizzes/generate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('authToken')}`
            },
            body: JSON.stringify({ topic, count: 5 })
        });

        const data = await response.json();

        if (data.success) {
            populateQuizForm(data.quiz);
            QuizUtils.showNotification('Magic successful! Quiz generated.', 'success');
            
            // Scroll to the form
            document.getElementById('create-quiz-form').scrollIntoView({ behavior: 'smooth' });
        } else {
            QuizUtils.showNotification(data.message || 'The spell failed.', 'error');
        }
    } catch (error) {
        console.error('Magic generation error:', error);
        QuizUtils.showNotification('The Sorcerer is out of mana. Try again later.', 'error');
    } finally {
        ButtonLoader.hide(magicBtn);
    }
}

// Populate form with AI data
function populateQuizForm(quiz) {
    // Fill basic info
    document.getElementById('quiz-title').value = quiz.title;
    document.getElementById('quiz-description').value = quiz.description;
    document.getElementById('quiz-category').value = quiz.category;
    document.getElementById('quiz-timer').value = 30;

    // Clear existing questions
    const container = document.getElementById('questions-container');
    container.innerHTML = '';
    questionCount = 0;

    // Add generated questions
    quiz.questions.forEach((q, index) => {
        addQuestion();
        const cards = document.querySelectorAll('.question-card');
        const lastCard = cards[cards.length - 1];

        // Fill question text
        lastCard.querySelector('.question-text').value = q.question;

        // Fill options
        const optionInputs = lastCard.querySelectorAll('.option-text');
        q.options.forEach((opt, optIndex) => {
            if (optionInputs[optIndex]) {
                optionInputs[optIndex].value = opt;
            }
        });

        // Set correct answer
        const radios = lastCard.querySelectorAll('.option-radio');
        if (radios[q.correctAnswer]) {
            radios[q.correctAnswer].checked = true;
        }
    });
}

// Update authentication navigation
function updateAuthNavigation() {
    const navAuth = document.getElementById('nav-auth');
    const mobileProfile = document.getElementById('mobile-user-profile');
    const mobileLogout = document.getElementById('mobile-logout');
    const user = Auth.getAuthUser();
    
    // Create avatar HTML
    let avatarHTML;
    if (user.avatar || user.photoURL) {
        avatarHTML = `<img src="${user.avatar || user.photoURL}" alt="${user.name}" class="user-avatar" onclick="window.location.href='profile.html'">`;
    } else {
        const initials = user.name ? user.name.substring(0, 2).toUpperCase() : 'U';
        avatarHTML = `<div class="default-avatar" onclick="window.location.href='profile.html'">${initials}</div>`;
    }
    
    // Desktop navigation
    navAuth.innerHTML = `
        <div class="user-menu">
            ${avatarHTML}
            <span class="user-name">${user.name}</span>
            ${user.role === 'admin' ? '<a href="admin-dashboard.html" class="btn btn-secondary btn-sm">Admin</a>' : ''}
            <button onclick="logout()" class="btn btn-secondary btn-sm">Logout</button>
        </div>
    `;
    
    // Mobile menu profile section
    if (mobileProfile) {
        let mobileAvatarHTML;
        if (user.avatar || user.photoURL) {
            mobileAvatarHTML = `<img src="${user.avatar || user.photoURL}" alt="${user.name}" class="mobile-user-avatar">`;
        } else {
            const initials = user.name ? user.name.substring(0, 2).toUpperCase() : 'U';
            mobileAvatarHTML = `<div class="mobile-default-avatar">${initials}</div>`;
        }
        
        mobileProfile.innerHTML = `
            ${mobileAvatarHTML}
            <div class="mobile-user-info">
                <div class="mobile-user-name">${user.name}</div>
                <div class="mobile-user-email">${user.email || ''}</div>
            </div>
        `;
        mobileProfile.classList.add('active');
    }
    
    // Mobile menu logout section
    if (mobileLogout) {
        mobileLogout.innerHTML = `
            ${user.role === 'admin' ? '<a href="admin-dashboard.html" class="btn btn-secondary" style="margin-bottom: var(--spacing-sm);"><img src="assets/icons/settings.svg" alt="Admin" class="nav-icon">Admin Dashboard</a>' : ''}
            <button onclick="logout()" class="btn btn-danger">
                <img src="assets/icons/logout.svg" alt="Logout" class="nav-icon">
                Logout
            </button>
        `;
        mobileLogout.classList.add('active');
    }
}

// Logout function
function logout() {
    Auth.logout();
    window.location.href = 'index.html';
}

// Add new question
function addQuestion() {
    questionCount++;
    const container = document.getElementById('questions-container');
    const template = document.getElementById('question-card-template');
    const clone = template.content.cloneNode(true);
    
    const card = clone.querySelector('.question-card');
    card.setAttribute('data-question-number', questionCount);
    card.querySelector('.question-number').textContent = questionCount;
    
    // Set unique radio names
    const radios = clone.querySelectorAll('.option-radio');
    radios.forEach(radio => {
        radio.name = `correct-${questionCount}`;
    });

    // Setup Image Upload logic
    const fileInput = clone.querySelector('.q-image-input');
    const uploadBtn = clone.querySelector('.upload-trigger-btn');
    const removeImgBtn = clone.querySelector('.remove-img-btn');
    const previewArea = clone.querySelector('.image-preview');
    const imgPreview = previewArea.querySelector('img');
    const urlInput = clone.querySelector('.q-image-url');

    uploadBtn.onclick = () => fileInput.click();

    fileInput.onchange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('image', file);

        try {
            QuizUtils.showNotification('Casting upload spell...', 'info');
            const response = await fetch('/api/upload', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('authToken')}`
                },
                body: formData
            });

            const data = await response.json();
            if (data.success) {
                imgPreview.src = data.imageUrl;
                urlInput.value = data.imageUrl;
                previewArea.classList.remove('hidden');
                uploadBtn.classList.add('hidden');
                QuizUtils.showNotification('Image added!', 'success');
            }
        } catch (err) {
            QuizUtils.showNotification('Failed to upload image', 'error');
        }
    };

    removeImgBtn.onclick = () => {
        urlInput.value = '';
        fileInput.value = '';
        previewArea.classList.add('hidden');
        uploadBtn.classList.remove('hidden');
    };

    // Setup remove question logic
    clone.querySelector('.remove-question-btn').onclick = () => {
        card.remove();
        renumberQuestions();
    };
    
    container.appendChild(clone);
}

// Remove question
function removeQuestion(questionNumber) {
    const questionCard = document.querySelector(`[data-question-number="${questionNumber}"]`);
    if (questionCard) {
        questionCard.remove();
        renumberQuestions();
    }
}

// Renumber questions after deletion
function renumberQuestions() {
    const questionCards = document.querySelectorAll('.question-card');
    questionCards.forEach((card, index) => {
        const newNumber = index + 1;
        card.setAttribute('data-question-number', newNumber);
        card.querySelector('.question-number').textContent = newNumber;
        
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
    
    const submitBtn = e.target.querySelector('button[type="submit"]');
    
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
        const imageUrl = card.querySelector('.q-image-url').value;
        const optionInputs = card.querySelectorAll('.option-text');
        const options = Array.from(optionInputs).map(input => input.value.trim());
        
        const correctRadio = card.querySelector('.option-radio:checked');
        const correctAnswer = correctRadio ? parseInt(correctRadio.value) : 0;
        
        questions.push({
            question: questionText,
            image: imageUrl || null,
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
    
    // Show loading
    ButtonLoader.show(submitBtn);
    
    // Simulate async save (add small delay for UX)
    setTimeout(async () => {
        try {
            const result = await FirebaseService.quizzes.create(quizData);

            if (result && result.success) {
                QuizUtils.showNotification('Quiz created successfully!', 'success');
                setTimeout(() => {
                    window.location.href = 'my-quizzes.html';
                }, 1000);
            } else {
                QuizUtils.showNotification('Failed to create quiz', 'error');
                ButtonLoader.hide(submitBtn);
            }
        } catch (error) {
            console.error('Error creating quiz:', error);
            QuizUtils.showNotification('Failed to create quiz', 'error');
            ButtonLoader.hide(submitBtn);
        }
    }, 500);
}

// Make removeQuestion available globally
window.removeQuestion = removeQuestion;

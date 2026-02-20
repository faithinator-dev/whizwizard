// =====================
// My Quizzes Page JavaScript
// =====================

document.addEventListener('DOMContentLoaded', function() {
    // Require authentication
    if (!Auth.requireAuth()) return;
    
    // Update authentication navigation
    updateAuthNavigation();
    
    loadMyQuizzes();
    setupDeleteModal();
});

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

// Load user's quizzes
function loadMyQuizzes() {
    const currentUser = Auth.getAuthUser();
    const quizzes = Database.getQuizzesByUser(currentUser.id);
    const container = document.getElementById('my-quizzes-container');
    const emptyState = document.getElementById('empty-state');
    
    container.innerHTML = '';
    
    if (quizzes.length === 0) {
        container.classList.add('hidden');
        emptyState.classList.remove('hidden');
        return;
    }
    
    container.classList.remove('hidden');
    emptyState.classList.add('hidden');
    
    quizzes.forEach(quiz => {
        const actions = [
            {
                name: 'live',
                class: 'live',
                icon: 'assets/icons/users.svg',
                title: 'Start Live Session'
            },
            {
                name: 'play',
                class: 'play',
                icon: 'assets/icons/play.svg',
                title: 'Take Quiz'
            },
            {
                name: 'edit',
                class: 'edit',
                icon: 'assets/icons/edit.svg',
                title: 'Edit Quiz'
            },
            {
                name: 'delete',
                class: 'delete',
                icon: 'assets/icons/trash.svg',
                title: 'Delete Quiz'
            }
        ];
        
        const card = QuizUtils.renderQuizCard(quiz, actions);
        
        // Add attempts info
        const footer = card.querySelector('.quiz-card-footer');
        const attemptsInfo = document.createElement('div');
        attemptsInfo.className = 'quiz-meta-item';
        attemptsInfo.innerHTML = `
            <img src="assets/icons/users.svg" alt="Attempts" class="quiz-meta-icon">
            <span>${quiz.attempts || 0} attempts</span>
        `;
        footer.querySelector('.quiz-meta').appendChild(attemptsInfo);
        
        // Add event listeners
        card.querySelector('[data-action="live"]').addEventListener('click', (e) => {
            e.stopPropagation();
            startLiveSession(quiz.id);
        });
        
        card.querySelector('[data-action="play"]').addEventListener('click', (e) => {
            e.stopPropagation();
            window.location.href = `take-quiz.html?id=${quiz.id}`;
        });
        
        card.querySelector('[data-action="edit"]').addEventListener('click', (e) => {
            e.stopPropagation();
            editQuiz(quiz.id);
        });
        
        card.querySelector('[data-action="delete"]').addEventListener('click', (e) => {
            e.stopPropagation();
            showDeleteModal(quiz.id);
        });
        
        container.appendChild(card);
    });
}

// Start live session
function startLiveSession(quizId) {
    const result = LiveQuiz.createRoom(quizId);
    
    if (result.success) {
        QuizUtils.showNotification('Live session created!', 'success');
        setTimeout(() => {
            window.location.href = `live-quiz-host.html?room=${result.room.id}`;
        }, 500);
    } else {
        QuizUtils.showNotification(result.message, 'error');
    }
}

// Edit quiz
function editQuiz(quizId) {
    QuizUtils.showNotification('Edit functionality coming soon!', 'info');
}

// Delete modal setup
let quizToDelete = null;

function setupDeleteModal() {
    const modal = document.getElementById('delete-modal');
    const cancelBtn = document.getElementById('cancel-delete-btn');
    const confirmBtn = document.getElementById('confirm-delete-btn');
    
    cancelBtn.addEventListener('click', hideDeleteModal);
    
    confirmBtn.addEventListener('click', () => {
        if (quizToDelete) {
            deleteQuiz(quizToDelete);
            hideDeleteModal();
        }
    });
    
    // Close modal on overlay click
    modal.querySelector('.modal-overlay').addEventListener('click', hideDeleteModal);
}

// Show delete modal
function showDeleteModal(quizId) {
    quizToDelete = quizId;
    document.getElementById('delete-modal').classList.remove('hidden');
}

// Hide delete modal
function hideDeleteModal() {
    quizToDelete = null;
    document.getElementById('delete-modal').classList.add('hidden');
}

// Delete quiz
function deleteQuiz(quizId) {
    const success = Database.deleteQuiz(quizId);
    
    if (success) {
        QuizUtils.showNotification('Quiz deleted successfully', 'success');
        loadMyQuizzes();
    } else {
        QuizUtils.showNotification('Failed to delete quiz', 'error');
    }
}

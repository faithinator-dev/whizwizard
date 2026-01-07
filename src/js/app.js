// =====================
// Main App JavaScript
// Home Page Functionality
// =====================

document.addEventListener('DOMContentLoaded', function() {
    // Check authentication and update navigation
    updateAuthNavigation();
    
    // Load statistics
    loadStatistics();
    
    // Load quizzes
    loadQuizzes('all');
    
    // Setup filter buttons
    setupFilters();
});

// Update authentication navigation
function updateAuthNavigation() {
    const navAuth = document.getElementById('nav-auth');
    const mobileProfile = document.getElementById('mobile-user-profile');
    const mobileLogout = document.getElementById('mobile-logout');
    
    if (Auth.isAuthenticated()) {
        const user = Auth.getUser();
        
        // Create avatar HTML
        let avatarHTML;
        if (user.avatar) {
            avatarHTML = `<img src="${user.avatar}" alt="${user.name}" class="user-avatar" onclick="window.location.href='profile.html'">`;
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
            if (user.avatar) {
                mobileAvatarHTML = `<img src="${user.avatar}" alt="${user.name}" class="mobile-user-avatar">`;
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
    } else {
        navAuth.innerHTML = `
            <div class="auth-buttons">
                <a href="login.html" class="btn btn-secondary btn-sm">Login</a>
                <a href="signup.html" class="btn btn-primary btn-sm">Sign Up</a>
            </div>
        `;
        
        // Hide mobile sections when logged out
        if (mobileProfile) {
            mobileProfile.classList.remove('active');
        }
        if (mobileLogout) {
            mobileLogout.classList.remove('active');
        }
    }
}

// Logout function
function logout() {
    Auth.logout();
    window.location.reload();
}

// Load statistics
function loadStatistics() {
    const totalQuizzes = Database.getTotalQuizzes();
    const totalUsers = Database.getTotalUsers();
    const totalCompleted = Database.getTotalCompleted();
    
    document.getElementById('total-quizzes').textContent = totalQuizzes;
    document.getElementById('total-users').textContent = totalUsers;
    document.getElementById('total-completed').textContent = totalCompleted;
}

// Load quizzes
function loadQuizzes(category = 'all') {
    const quizzesContainer = document.getElementById('quizzes-container');
    const quizzes = Database.getQuizzesByCategory(category);
    
    quizzesContainer.innerHTML = '';
    
    if (quizzes.length === 0) {
        quizzesContainer.innerHTML = `
            <div class="empty-state" style="grid-column: 1 / -1;">
                <img src="assets/characters/empty-character.svg" alt="No Quizzes" class="empty-character animated-float">
                <h3 class="empty-title">No Quizzes Available</h3>
                <p class="empty-text">Be the first to create a quiz!</p>
                <a href="create-quiz.html" class="btn btn-primary">
                    <img src="assets/icons/plus.svg" alt="Create" class="btn-icon">
                    Create Quiz
                </a>
            </div>
        `;
        return;
    }
    
    quizzes.forEach(quiz => {
        const actions = [
            {
                name: 'play',
                class: 'play',
                icon: 'assets/icons/play.svg',
                title: 'Take Quiz'
            }
        ];
        
        const card = QuizUtils.renderQuizCard(quiz, actions);
        
        // Add click handler for play button
        card.querySelector('[data-action="play"]').addEventListener('click', (e) => {
            e.stopPropagation();
            window.location.href = `take-quiz.html?id=${quiz.id}`;
        });
        
        // Add click handler for card
        card.addEventListener('click', () => {
            window.location.href = `take-quiz.html?id=${quiz.id}`;
        });
        
        quizzesContainer.appendChild(card);
    });
}

// Setup filter buttons
function setupFilters() {
    const filterButtons = document.querySelectorAll('.filter-btn');
    
    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Remove active class from all buttons
            filterButtons.forEach(btn => btn.classList.remove('active'));
            
            // Add active class to clicked button
            button.classList.add('active');
            
            // Load quizzes for selected category
            const category = button.getAttribute('data-category');
            loadQuizzes(category);
        });
    });
}

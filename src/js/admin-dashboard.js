// =====================
// Admin Dashboard JavaScript
// =====================

let allUsers = [];
let userGrowthChart = null;

document.addEventListener('DOMContentLoaded', async function() {
    // Check if user is admin
    const currentUser = Auth.getUser();
    if (!currentUser || currentUser.email !== 'admin@whizwizard.com') {
        // For now, allow any logged-in user to access
        // In production, check for admin role
        if (!Auth.isAuthenticated()) {
            window.location.href = 'login.html';
            return;
        }
    }

    await loadDashboardData();
    initializeChart();
});

async function loadDashboardData() {
    try {
        // Load users
        await loadUsers();
        
        // Update statistics
        updateStatistics();
        
        // Update chart
        updateUserGrowthChart();
    } catch (error) {
        console.error('Error loading dashboard data:', error);
        QuizUtils.showNotification('Error loading data. Please refresh.', 'error');
    }
}

async function loadUsers() {
    try {
        // Try to fetch from API
        const response = await fetch(`${API_CONFIG.baseURL}/users`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('authToken')}`
            }
        });

        if (response.ok) {
            const data = await response.json();
            allUsers = data.users || [];
        } else {
            // Fallback to localStorage if API fails
            allUsers = Database.getAllUsers();
        }

        displayUsers(allUsers);
    } catch (error) {
        console.error('Error loading users:', error);
        // Fallback to localStorage
        allUsers = Database.getAllUsers();
        displayUsers(allUsers);
    }
}

function displayUsers(users) {
    const tbody = document.getElementById('users-table-body');
    
    if (users.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="6" style="text-align: center; padding: 2rem; color: var(--text-secondary);">
                    No users found
                </td>
            </tr>
        `;
        return;
    }

    tbody.innerHTML = users.map(user => {
        const initials = user.name ? user.name.substring(0, 2).toUpperCase() : 'U';
        const joinDate = new Date(user.createdAt || Date.now()).toLocaleDateString();
        const quizzesCount = Database.getAllQuizzes().filter(q => q.createdBy === user.id).length || 0;

        return `
            <tr>
                <td>
                    <div class="user-avatar">${initials}</div>
                </td>
                <td>${user.name || 'Unknown'}</td>
                <td>${user.email}</td>
                <td>${joinDate}</td>
                <td>${quizzesCount}</td>
                <td>
                    <button class="action-btn btn-email" onclick="openEmailModal('${user.email}', '${user.name}')">
                        📧 Email
                    </button>
                    <button class="action-btn btn-view" onclick="viewUserDetails('${user.id}')">
                        👁️ View
                    </button>
                    <button class="action-btn btn-delete" onclick="deleteUser('${user.id}')">
                        🗑️ Delete
                    </button>
                </td>
            </tr>
        `;
    }).join('');
}

function updateStatistics() {
    // Total users
    document.getElementById('total-users').textContent = allUsers.length;
    
    // Calculate new users this week
    const oneWeekAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
    const newUsersThisWeek = allUsers.filter(u => new Date(u.createdAt) > oneWeekAgo).length;
    document.getElementById('users-change').textContent = `+${newUsersThisWeek} this week`;

    // Total quizzes
    const allQuizzes = Database.getAllQuizzes();
    document.getElementById('total-quizzes').textContent = allQuizzes.length;
    const newQuizzesThisWeek = allQuizzes.filter(q => new Date(q.createdAt) > oneWeekAgo).length;
    document.getElementById('quizzes-change').textContent = `+${newQuizzesThisWeek} this week`;

    // Quiz attempts
    const allResults = Database.getAllResults();
    document.getElementById('total-attempts').textContent = allResults.length;
    const newAttemptsThisWeek = allResults.filter(r => new Date(r.completedAt) > oneWeekAgo).length;
    document.getElementById('attempts-change').textContent = `+${newAttemptsThisWeek} this week`;

    // Active today (mock data for now)
    const activeToday = Math.floor(allUsers.length * 0.15); // Assume 15% active
    document.getElementById('active-today').textContent = activeToday;
}

function initializeChart() {
    const ctx = document.getElementById('userGrowthChart');
    
    // Create sample data for last 7 days
    const labels = [];
    const data = [];
    
    for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        labels.push(date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
        
        // Count users registered on or before this date
        const usersUntilDate = allUsers.filter(u => new Date(u.createdAt) <= date).length;
        data.push(usersUntilDate);
    }

    userGrowthChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Total Users',
                data: data,
                borderColor: '#00d4ff',
                backgroundColor: 'rgba(0, 212, 255, 0.1)',
                tension: 0.4,
                fill: true
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    labels: {
                        color: '#ffffff'
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        color: '#b8c5d6',
                        stepSize: 1
                    },
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)'
                    }
                },
                x: {
                    ticks: {
                        color: '#b8c5d6'
                    },
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)'
                    }
                }
            }
        }
    });
}

function updateUserGrowthChart() {
    if (!userGrowthChart) return;
    
    // Update chart data
    const data = [];
    for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const usersUntilDate = allUsers.filter(u => new Date(u.createdAt) <= date).length;
        data.push(usersUntilDate);
    }
    
    userGrowthChart.data.datasets[0].data = data;
    userGrowthChart.update();
}

function filterUsers() {
    const searchTerm = document.getElementById('search-users').value.toLowerCase();
    const roleFilter = document.getElementById('filter-role').value;

    let filtered = allUsers;

    // Filter by search term
    if (searchTerm) {
        filtered = filtered.filter(user =>
            user.name?.toLowerCase().includes(searchTerm) ||
            user.email?.toLowerCase().includes(searchTerm)
        );
    }

    // Filter by role (placeholder - you'd need role field in user data)
    if (roleFilter !== 'all') {
        // For now, just show all - implement role-based filtering later
    }

    displayUsers(filtered);
}

function openEmailModal(email, name) {
    document.getElementById('email-to').value = email;
    document.getElementById('email-subject').value = `Hello ${name}!`;
    document.getElementById('email-message').value = '';
    document.getElementById('email-modal').classList.add('active');
}

function closeEmailModal() {
    document.getElementById('email-modal').classList.remove('active');
    document.getElementById('email-form').reset();
}

async function sendEmail(e) {
    e.preventDefault();
    
    const to = document.getElementById('email-to').value;
    const subject = document.getElementById('email-subject').value;
    const message = document.getElementById('email-message').value;

    try {
        // In production, this would call your email API endpoint
        // For now, just show success message
        QuizUtils.showNotification(`Email sent to ${to}!`, 'success');
        closeEmailModal();

        // TODO: Implement actual email sending via API
        // const response = await fetch(`${API_CONFIG.baseURL}/admin/send-email`, {
        //     method: 'POST',
        //     headers: {
        //         'Content-Type': 'application/json',
        //         'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        //     },
        //     body: JSON.stringify({ to, subject, message })
        // });

    } catch (error) {
        console.error('Error sending email:', error);
        QuizUtils.showNotification('Failed to send email', 'error');
    }
}

function viewUserDetails(userId) {
    const user = allUsers.find(u => u.id === userId);
    if (!user) return;

    const quizzes = Database.getAllQuizzes().filter(q => q.createdBy === userId);
    const results = Database.getAllResults().filter(r => r.userId === userId);

    alert(`User Details:\n\nName: ${user.name}\nEmail: ${user.email}\nJoined: ${new Date(user.createdAt).toLocaleDateString()}\nQuizzes Created: ${quizzes.length}\nQuizzes Taken: ${results.length}`);
}

function deleteUser(userId) {
    if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
        return;
    }

    try {
        // Remove from localStorage
        Database.deleteUser(userId);
        
        // Reload users
        allUsers = Database.getAllUsers();
        displayUsers(allUsers);
        updateStatistics();
        
        QuizUtils.showNotification('User deleted successfully', 'success');
    } catch (error) {
        console.error('Error deleting user:', error);
        QuizUtils.showNotification('Failed to delete user', 'error');
    }
}

async function refreshData() {
    QuizUtils.showNotification('Refreshing data...', 'info');
    await loadDashboardData();
    QuizUtils.showNotification('Data refreshed!', 'success');
}

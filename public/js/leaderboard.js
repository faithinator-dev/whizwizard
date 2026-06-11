// =====================
// Leaderboard Page JavaScript
// =====================

document.addEventListener('DOMContentLoaded', function() {
    loadLeaderboard();
});

// Load leaderboard
async function loadLeaderboard() {
    try {
        const results = await FirebaseService.results.getAll();
        const leaderboardMap = new Map();

        results.forEach(result => {
            const key = result.userId || result.userName || 'guest';
            const existing = leaderboardMap.get(key) || {
                id: result.userId || key,
                name: result.userName || 'Guest',
                totalScore: 0,
                quizzesCompleted: 0,
                avgScore: 0
            };

            existing.totalScore += result.score || 0;
            existing.quizzesCompleted += 1;
            existing.avgScore = existing.quizzesCompleted > 0 ? Math.round(existing.totalScore / existing.quizzesCompleted) : 0;
            leaderboardMap.set(key, existing);
        });

        const leaderboardData = Array.from(leaderboardMap.values()).sort((a, b) => b.totalScore - a.totalScore);
        const tbody = document.getElementById('leaderboard-body');
        const emptyState = document.getElementById('empty-leaderboard');
    
        if (leaderboardData.length === 0) {
            document.querySelector('.leaderboard-list').classList.add('hidden');
            document.querySelector('.podium').classList.add('hidden');
            emptyState.classList.remove('hidden');
            return;
        }
    
        document.querySelector('.leaderboard-list').classList.remove('hidden');
        document.querySelector('.podium').classList.remove('hidden');
        emptyState.classList.add('hidden');
    
        // Update podium (top 3)
        updatePodium(leaderboardData);
    
        // Update table
        tbody.innerHTML = '';
    
        leaderboardData.forEach((entry, index) => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${index + 1}</td>
                <td>${entry.name}</td>
                <td>${entry.quizzesCompleted}</td>
                <td>${entry.totalScore}</td>
                <td>${entry.avgScore}%</td>
            `;
            
            // Highlight current user
            const currentUser = Auth.getUser();
            if (currentUser && entry.id === currentUser.id) {
                row.style.backgroundColor = 'var(--accent-blue)';
                row.style.color = 'var(--text-primary)';
            }
            
            tbody.appendChild(row);
        });
    } catch (error) {
        console.error('Error loading leaderboard:', error);
        QuizUtils.showNotification('Failed to load leaderboard', 'error');
    }
}

// Update podium
function updatePodium(leaderboardData) {
    // First place
    if (leaderboardData[0]) {
        const firstPlace = document.getElementById('first-place');
        firstPlace.querySelector('.podium-name').textContent = leaderboardData[0].name;
        firstPlace.querySelector('.podium-score').textContent = leaderboardData[0].totalScore;
    }
    
    // Second place
    if (leaderboardData[1]) {
        const secondPlace = document.getElementById('second-place');
        secondPlace.querySelector('.podium-name').textContent = leaderboardData[1].name;
        secondPlace.querySelector('.podium-score').textContent = leaderboardData[1].totalScore;
    }
    
    // Third place
    if (leaderboardData[2]) {
        const thirdPlace = document.getElementById('third-place');
        thirdPlace.querySelector('.podium-name').textContent = leaderboardData[2].name;
        thirdPlace.querySelector('.podium-score').textContent = leaderboardData[2].totalScore;
    }
}

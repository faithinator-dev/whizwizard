// =====================
// Profile Page JavaScript
// =====================

document.addEventListener('DOMContentLoaded', function() {
    // Check authentication
    if (!Auth.isAuthenticated()) {
        window.location.href = 'login.html';
        return;
    }

    loadProfile();
    setupAvatarUpload();
    setupProfileForm();
});

function loadProfile() {
    const user = Auth.getUser();
    
    if (!user) {
        window.location.href = 'login.html';
        return;
    }

    // Display avatar
    const avatarContainer = document.getElementById('current-avatar');
    if (user.avatar || user.photoURL) {
        avatarContainer.innerHTML = `<img src="${user.avatar || user.photoURL}" alt="${user.name}" class="user-avatar" style="width: 120px; height: 120px;">`;
    } else {
        const initials = user.name ? user.name.substring(0, 2).toUpperCase() : 'U';
        avatarContainer.textContent = initials;
        avatarContainer.className = 'default-avatar';
    }

    // Populate form fields
    document.getElementById('profile-name').value = user.name || '';
    document.getElementById('profile-email').value = user.email || '';
    document.getElementById('profile-role').value = user.role === 'admin' ? 'Administrator' : 'User';

    // Populate stats
    document.getElementById('stat-completed').textContent = user.quizzesCompleted || 0;
    document.getElementById('stat-created').textContent = user.quizzesCreated || 0;
    document.getElementById('stat-score').textContent = user.totalScore || 0;
}

function setupAvatarUpload() {
    const avatarInput = document.getElementById('avatar-upload');
    
    avatarInput.addEventListener('change', function(e) {
        const file = e.target.files[0];
        
        if (!file) return;
        
        // Validate file type
        if (!file.type.startsWith('image/')) {
            QuizUtils.showNotification('Please upload an image file', 'error');
            return;
        }
        
        // Validate file size (max 2MB)
        if (file.size > 2 * 1024 * 1024) {
            QuizUtils.showNotification('Image size should be less than 2MB', 'error');
            return;
        }
        
        // Read and display image
        const reader = new FileReader();
        reader.onload = function(e) {
            const avatarUrl = e.target.result;
            
            // Update display
            const avatarContainer = document.getElementById('current-avatar');
            avatarContainer.innerHTML = `<img src="${avatarUrl}" alt="Profile" class="user-avatar" style="width: 120px; height: 120px;">`;
            
            // Update user data
            const user = Auth.getUser();
            user.avatar = avatarUrl;
            
            // Save to database
            Database.updateUser(user.id, { avatar: avatarUrl });
            localStorage.setItem('user', JSON.stringify(user));
            
            QuizUtils.showNotification('Profile picture updated!', 'success');
        };
        
        reader.readAsDataURL(file);
    });
}

function setupProfileForm() {
    const form = document.getElementById('profile-form');
    
    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const user = Auth.getUser();
        const name = document.getElementById('profile-name').value.trim();
        const currentPassword = document.getElementById('current-password').value;
        const newPassword = document.getElementById('new-password').value;
        const confirmPassword = document.getElementById('confirm-password').value;
        
        // Validate name
        if (!name) {
            QuizUtils.showNotification('Name is required', 'error');
            return;
        }
        
        // Update name if changed
        if (name !== user.name) {
            user.name = name;
            Database.updateUser(user.id, { name: name });
        }
        
        // Handle password change
        if (currentPassword || newPassword || confirmPassword) {
            if (!currentPassword) {
                QuizUtils.showNotification('Please enter current password', 'error');
                return;
            }
            
            if (newPassword.length < 6) {
                QuizUtils.showNotification('New password must be at least 6 characters', 'error');
                return;
            }
            
            if (newPassword !== confirmPassword) {
                QuizUtils.showNotification('Passwords do not match', 'error');
                return;
            }
            
            // Verify current password
            const storedUser = Database.getUserByEmail(user.email);
            const isValidPassword = await User.comparePassword(currentPassword, storedUser.password);
            
            if (!isValidPassword) {
                QuizUtils.showNotification('Current password is incorrect', 'error');
                return;
            }
            
            // Hash and save new password
            const hashedPassword = await User.hashPassword(newPassword);
            Database.updateUser(user.id, { password: hashedPassword });
            
            QuizUtils.showNotification('Password updated successfully!', 'success');
            
            // Clear password fields
            document.getElementById('current-password').value = '';
            document.getElementById('new-password').value = '';
            document.getElementById('confirm-password').value = '';
        }
        
        // Update localStorage
        localStorage.setItem('user', JSON.stringify(user));
        
        QuizUtils.showNotification('Profile updated successfully!', 'success');
        
        // Refresh after short delay
        setTimeout(() => {
            location.reload();
        }, 1000);
    });
}

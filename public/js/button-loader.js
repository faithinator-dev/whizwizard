// =====================
// Button Loading Utility
// Handles loading states for all CTA buttons
// =====================

const ButtonLoader = {
    /**
     * Set button to loading state
     * @param {HTMLElement|string} button - Button element or selector
     * @returns {HTMLElement} The button element
     */
    show: function(button) {
        const btn = typeof button === 'string' ? document.querySelector(button) : button;
        if (!btn) return null;
        
        // Store original text
        if (!btn.dataset.originalText) {
            btn.dataset.originalText = btn.innerHTML;
        }
        
        // Add loading class and disable
        btn.classList.add('loading');
        btn.disabled = true;
        
        return btn;
    },
    
    /**
     * Remove loading state from button
     * @param {HTMLElement|string} button - Button element or selector
     * @returns {HTMLElement} The button element
     */
    hide: function(button) {
        const btn = typeof button === 'string' ? document.querySelector(button) : button;
        if (!btn) return null;
        
        // Restore original text
        if (btn.dataset.originalText) {
            btn.innerHTML = btn.dataset.originalText;
            delete btn.dataset.originalText;
        }
        
        // Remove loading class and enable
        btn.classList.remove('loading');
        btn.disabled = false;
        
        return btn;
    },
    
    /**
     * Execute async function with button loading state
     * @param {HTMLElement|string} button - Button element or selector
     * @param {Function} asyncFn - Async function to execute
     * @returns {Promise} The result of asyncFn
     */
    async execute(button, asyncFn) {
        const btn = this.show(button);
        try {
            const result = await asyncFn();
            return result;
        } catch (error) {
            throw error;
        } finally {
            this.hide(btn);
        }
    },
    
    /**
     * Auto-attach loading to form submissions
     * @param {string} formSelector - Form selector
     * @param {string} buttonSelector - Submit button selector within form
     */
    attachToForm: function(formSelector, buttonSelector = 'button[type="submit"]') {
        const form = document.querySelector(formSelector);
        if (!form) return;
        
        form.addEventListener('submit', (e) => {
            const submitBtn = form.querySelector(buttonSelector);
            if (submitBtn) {
                this.show(submitBtn);
            }
        });
    }
};

// Make it globally available
window.ButtonLoader = ButtonLoader;

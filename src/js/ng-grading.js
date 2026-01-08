/**
 * Nigerian Grading System Frontend Module
 * Handles grading system display and calculations
 */

class NGGradingSystem {
    constructor() {
        // Determine API base URL based on environment
        // Supports localhost:3000 or any other port if specified
        const isLocalhost = window.location.hostname === 'localhost' || 
                           window.location.hostname === '127.0.0.1';
        
        if (isLocalhost) {
            // Try to use the same port as the frontend, or default to 3000
            const port = window.location.port || '3000';
            this.API_BASE_URL = `http://localhost:${port === '8000' ? '3000' : port}/api`;
        } else {
            // Production: use relative path
            this.API_BASE_URL = '/api';
        }
    }

    /**
     * Get all available grade scales
     */
    async getAllScales() {
        try {
            const response = await fetch(`${this.API_BASE_URL}/grades/scales`);
            const data = await response.json();
            
            if (data.success) {
                return data.data;
            }
            throw new Error('Failed to fetch grade scales');
        } catch (error) {
            console.error('Error fetching grade scales:', error);
            return [];
        }
    }

    /**
     * Get grade scale by educational level
     */
    async getScaleByLevel(level) {
        try {
            const response = await fetch(`${this.API_BASE_URL}/grades/scales/${level}`);
            const data = await response.json();
            
            if (data.success) {
                return data.data;
            }
            throw new Error('Failed to fetch grade scale');
        } catch (error) {
            console.error('Error fetching grade scale:', error);
            return null;
        }
    }

    /**
     * Calculate grade for a given percentage and level
     */
    async calculateGrade(percentage, level) {
        try {
            const response = await fetch(`${this.API_BASE_URL}/grades/calculate`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ percentage, level })
            });
            const data = await response.json();
            
            if (data.success) {
                return data.data;
            }
            throw new Error('Failed to calculate grade');
        } catch (error) {
            console.error('Error calculating grade:', error);
            return null;
        }
    }

    /**
     * Get grade color for UI display
     */
    getGradeColor(grade, level) {
        if (level === 'secondary') {
            if (['A1', 'B2', 'B3'].includes(grade)) return '#00e676'; // Green
            if (['C4', 'C5', 'C6'].includes(grade)) return '#4a90e2'; // Blue
            if (['D7', 'E8'].includes(grade)) return '#ffd700'; // Yellow
            return '#ff4757'; // Red
        }
        
        if (level === 'polytechnic' || level === 'university') {
            if (['A', 'AB'].includes(grade)) return '#00e676'; // Green
            if (['B', 'BC', 'C'].includes(grade)) return '#4a90e2'; // Blue
            if (['CD', 'D', 'E'].includes(grade)) return '#ffd700'; // Yellow
            return '#ff4757'; // Red
        }

        return '#4a90e2'; // Default blue
    }

    /**
     * Create grade badge HTML
     */
    createGradeBadge(gradeData) {
        if (!gradeData) return '';

        const color = this.getGradeColor(gradeData.grade, gradeData.level);
        const displayInfo = this.getGradeDisplayInfo(gradeData);

        return `
            <div class="grade-badge" style="background-color: ${color}20; border: 2px solid ${color}; color: ${color};">
                <div class="grade-main">${gradeData.grade}</div>
                <div class="grade-description">${gradeData.description}</div>
                ${displayInfo ? `<div class="grade-info">${displayInfo}</div>` : ''}
            </div>
        `;
    }

    /**
     * Get additional grade display info (points or GPA)
     */
    getGradeDisplayInfo(gradeData) {
        if (gradeData.level === 'secondary' && gradeData.points !== null) {
            return `${gradeData.points} points`;
        }
        if ((gradeData.level === 'polytechnic' || gradeData.level === 'university') && gradeData.gpa !== null) {
            return `GPA: ${gradeData.gpa.toFixed(1)}`;
        }
        return '';
    }

    /**
     * Create grade scale selector HTML
     */
    createGradeScaleSelector(selectedLevel = null) {
        const levels = [
            { value: '', label: 'No Grading (Default)' },
            { value: 'secondary', label: 'Secondary School (WAEC/NECO)' },
            { value: 'polytechnic', label: 'Polytechnic (ND/HND)' },
            { value: 'university', label: 'University (Undergraduate)' }
        ];

        return `
            <div class="form-group">
                <label for="gradingLevel">
                    <i class="fas fa-graduation-cap"></i>
                    Grading System (Nigerian Standards)
                </label>
                <select id="gradingLevel" name="gradingLevel" class="form-control">
                    ${levels.map(level => `
                        <option value="${level.value}" ${selectedLevel === level.value ? 'selected' : ''}>
                            ${level.label}
                        </option>
                    `).join('')}
                </select>
                <small class="form-text">Select the educational level for automatic grade calculation</small>
            </div>
        `;
    }

    /**
     * Display grade scale reference table
     */
    async displayGradeScaleTable(level, containerId) {
        const container = document.getElementById(containerId);
        if (!container || !level) return;

        const scale = await this.getScaleByLevel(level);
        if (!scale) {
            container.innerHTML = '<p>Grade scale not available</p>';
            return;
        }

        const headers = level === 'secondary' 
            ? ['Grade', 'Range (%)', 'Description', 'Points']
            : ['Grade', 'Range (%)', 'Description', 'GPA'];

        const rows = scale.scales.map(s => {
            const color = this.getGradeColor(s.grade, level);
            const extraInfo = level === 'secondary' ? s.points : s.gpa.toFixed(1);
            
            return `
                <tr>
                    <td><span class="grade-badge-small" style="background-color: ${color}; color: white;">${s.grade}</span></td>
                    <td>${s.min} - ${s.max}</td>
                    <td>${s.description}</td>
                    <td>${extraInfo}</td>
                </tr>
            `;
        }).join('');

        container.innerHTML = `
            <div class="grade-scale-table">
                <h3>${scale.name}</h3>
                <table class="table">
                    <thead>
                        <tr>
                            ${headers.map(h => `<th>${h}</th>`).join('')}
                        </tr>
                    </thead>
                    <tbody>
                        ${rows}
                    </tbody>
                </table>
            </div>
        `;
    }

    /**
     * Format result with grade
     */
    formatResultWithGrade(result) {
        const percentage = result.percentage || 0;
        let gradeHTML = '';

        if (result.grade) {
            gradeHTML = this.createGradeBadge(result.grade);
        }

        return {
            percentage: percentage.toFixed(1),
            gradeHTML: gradeHTML,
            score: result.score,
            correctAnswers: result.correctAnswers,
            totalQuestions: result.totalQuestions
        };
    }

    /**
     * Add grade styles to the page
     */
    addGradeStyles() {
        if (document.getElementById('ng-grading-styles')) return;

        const style = document.createElement('style');
        style.id = 'ng-grading-styles';
        style.textContent = `
            .grade-badge {
                display: inline-block;
                padding: 15px 20px;
                border-radius: 12px;
                text-align: center;
                margin: 10px 0;
                animation: fadeInUp 0.5s ease;
            }

            .grade-main {
                font-size: 2em;
                font-weight: bold;
                margin-bottom: 5px;
            }

            .grade-description {
                font-size: 1em;
                opacity: 0.9;
            }

            .grade-info {
                font-size: 0.9em;
                margin-top: 5px;
                opacity: 0.8;
            }

            .grade-badge-small {
                display: inline-block;
                padding: 4px 8px;
                border-radius: 4px;
                font-weight: bold;
                font-size: 0.9em;
            }

            .grade-scale-table {
                margin: 20px 0;
                animation: fadeIn 0.5s ease;
            }

            .grade-scale-table table {
                width: 100%;
                border-collapse: collapse;
                background: var(--secondary-navy);
                border-radius: 8px;
                overflow: hidden;
            }

            .grade-scale-table th {
                background: var(--primary-navy);
                color: var(--accent-cyan);
                padding: 12px;
                text-align: left;
            }

            .grade-scale-table td {
                padding: 10px 12px;
                border-top: 1px solid var(--accent-navy);
                color: white;
            }

            .grade-scale-table h3 {
                color: var(--accent-cyan);
                margin-bottom: 15px;
            }
        `;
        document.head.appendChild(style);
    }
}

// Initialize grading system
const ngGrading = new NGGradingSystem();
ngGrading.addGradeStyles();

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = NGGradingSystem;
}

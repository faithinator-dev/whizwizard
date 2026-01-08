const { getFirestore } = require('../config/database');

/**
 * Nigerian Grading System
 * Supports multiple educational levels:
 * - Secondary School (WAEC/NECO): A1-F9 system
 * - Polytechnic: GPA 0.0-5.0 system
 * - University: First Class, Second Class Upper/Lower, Third Class, Pass, Fail
 */

class GradeScale {
    constructor(data) {
        this.id = data.id || null;
        this.level = data.level; // 'secondary', 'polytechnic', 'university'
        this.name = data.name;
        this.scales = data.scales || [];
        this.createdAt = data.createdAt || new Date();
        this.updatedAt = data.updatedAt || new Date();
    }

    // Nigerian Secondary School Grading Scale (WAEC/NECO)
    static getSecondarySchoolScale() {
        return {
            level: 'secondary',
            name: 'Secondary School (WAEC/NECO)',
            scales: [
                { grade: 'A1', min: 75, max: 100, description: 'Excellent', points: 9 },
                { grade: 'B2', min: 70, max: 74, description: 'Very Good', points: 8 },
                { grade: 'B3', min: 65, max: 69, description: 'Good', points: 7 },
                { grade: 'C4', min: 60, max: 64, description: 'Credit', points: 6 },
                { grade: 'C5', min: 55, max: 59, description: 'Credit', points: 5 },
                { grade: 'C6', min: 50, max: 54, description: 'Credit', points: 4 },
                { grade: 'D7', min: 45, max: 49, description: 'Pass', points: 3 },
                { grade: 'E8', min: 40, max: 44, description: 'Pass', points: 2 },
                { grade: 'F9', min: 0, max: 39, description: 'Fail', points: 1 }
            ]
        };
    }

    // Nigerian Polytechnic Grading Scale
    static getPolytechnicScale() {
        return {
            level: 'polytechnic',
            name: 'Polytechnic (ND/HND)',
            scales: [
                { grade: 'A', min: 75, max: 100, description: 'Distinction', gpa: 5.0 },
                { grade: 'AB', min: 70, max: 74, description: 'Upper Credit', gpa: 4.5 },
                { grade: 'B', min: 65, max: 69, description: 'Upper Credit', gpa: 4.0 },
                { grade: 'BC', min: 60, max: 64, description: 'Lower Credit', gpa: 3.5 },
                { grade: 'C', min: 55, max: 59, description: 'Lower Credit', gpa: 3.0 },
                { grade: 'CD', min: 50, max: 54, description: 'Pass', gpa: 2.5 },
                { grade: 'D', min: 45, max: 49, description: 'Pass', gpa: 2.0 },
                { grade: 'E', min: 40, max: 44, description: 'Pass', gpa: 1.5 },
                { grade: 'F', min: 0, max: 39, description: 'Fail', gpa: 0.0 }
            ]
        };
    }

    // Nigerian University Grading Scale
    static getUniversityScale() {
        return {
            level: 'university',
            name: 'University (Undergraduate)',
            scales: [
                { grade: 'A', min: 70, max: 100, description: 'First Class', gpa: 5.0 },
                { grade: 'B', min: 60, max: 69, description: 'Second Class Upper', gpa: 4.0 },
                { grade: 'C', min: 50, max: 59, description: 'Second Class Lower', gpa: 3.0 },
                { grade: 'D', min: 45, max: 49, description: 'Third Class', gpa: 2.0 },
                { grade: 'E', min: 40, max: 44, description: 'Pass', gpa: 1.0 },
                { grade: 'F', min: 0, max: 39, description: 'Fail', gpa: 0.0 }
            ]
        };
    }

    // Get all available grade scales
    static getAllScales() {
        return [
            GradeScale.getSecondarySchoolScale(),
            GradeScale.getPolytechnicScale(),
            GradeScale.getUniversityScale()
        ];
    }

    // Calculate grade based on percentage score and educational level
    static calculateGrade(percentage, level) {
        let scale;
        
        switch (level) {
            case 'secondary':
                scale = GradeScale.getSecondarySchoolScale();
                break;
            case 'polytechnic':
                scale = GradeScale.getPolytechnicScale();
                break;
            case 'university':
                scale = GradeScale.getUniversityScale();
                break;
            default:
                return null;
        }

        // Find the appropriate grade based on percentage
        for (const gradeInfo of scale.scales) {
            if (percentage >= gradeInfo.min && percentage <= gradeInfo.max) {
                return {
                    grade: gradeInfo.grade,
                    description: gradeInfo.description,
                    points: gradeInfo.points || null,
                    gpa: gradeInfo.gpa || null,
                    percentage: percentage,
                    level: level
                };
            }
        }

        // Fallback: find the grade with the lowest minimum score (fail grade)
        const lowestGrade = scale.scales.reduce((lowest, current) => 
            (current.min < lowest.min) ? current : lowest, scale.scales[0]);
        
        return {
            grade: lowestGrade.grade,
            description: lowestGrade.description,
            points: lowestGrade.points || null,
            gpa: lowestGrade.gpa || null,
            percentage: percentage,
            level: level
        };
    }

    // Get grade color for UI display
    static getGradeColor(grade, level) {
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

    // Validate grade scale data
    static validate(data) {
        const errors = [];

        if (!data.level || !['secondary', 'polytechnic', 'university'].includes(data.level)) {
            errors.push('Invalid educational level');
        }
        if (!data.name || data.name.trim().length === 0) {
            errors.push('Name is required');
        }
        if (!data.scales || !Array.isArray(data.scales) || data.scales.length === 0) {
            errors.push('Scales array is required');
        }

        return errors;
    }

    // Save grade scale to Firestore (for custom scales)
    async save() {
        const db = getFirestore();
        const scaleData = {
            level: this.level,
            name: this.name,
            scales: this.scales,
            updatedAt: new Date()
        };

        if (this.id) {
            await db.collection('gradeScales').doc(this.id).update(scaleData);
        } else {
            scaleData.createdAt = new Date();
            const docRef = await db.collection('gradeScales').add(scaleData);
            this.id = docRef.id;
            this.createdAt = scaleData.createdAt;
        }

        return this;
    }

    // Find grade scale by ID
    static async findById(id) {
        const db = getFirestore();
        const doc = await db.collection('gradeScales').doc(id).get();
        
        if (!doc.exists) {
            return null;
        }

        return new GradeScale({
            id: doc.id,
            ...doc.data()
        });
    }

    // Find all custom grade scales
    static async findAll() {
        const db = getFirestore();
        const snapshot = await db.collection('gradeScales').get();
        
        return snapshot.docs.map(doc => new GradeScale({
            id: doc.id,
            ...doc.data()
        }));
    }
}

module.exports = GradeScale;

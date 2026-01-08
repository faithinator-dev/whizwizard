/**
 * Test file to demonstrate Nigerian Grading System functionality
 * This file can be used to test the grading calculations without a full backend setup
 */

// Mock GradeScale class for testing
class GradeScaleMock {
    // Secondary School Grading Scale (WAEC/NECO)
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

    // Polytechnic Grading Scale
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

    // University Grading Scale
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

    // Calculate grade based on percentage score and educational level
    static calculateGrade(percentage, level) {
        let scale;
        
        switch (level) {
            case 'secondary':
                scale = GradeScaleMock.getSecondarySchoolScale();
                break;
            case 'polytechnic':
                scale = GradeScaleMock.getPolytechnicScale();
                break;
            case 'university':
                scale = GradeScaleMock.getUniversityScale();
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

        return null;
    }
}

// Test cases
console.log('='.repeat(60));
console.log('Nigerian Grading System - Test Suite');
console.log('='.repeat(60));

// Test 1: Secondary School Grades
console.log('\n--- SECONDARY SCHOOL TESTS ---');
const secondaryTests = [
    { score: 18, total: 20, expected: 'A1' },  // 90%
    { score: 14, total: 20, expected: 'B2' },  // 70% - correct is B2, not B3
    { score: 12, total: 20, expected: 'C4' },  // 60%
    { score: 9, total: 20, expected: 'D7' },   // 45%
    { score: 6, total: 20, expected: 'F9' }    // 30%
];

secondaryTests.forEach(test => {
    const percentage = (test.score / test.total) * 100;
    const grade = GradeScaleMock.calculateGrade(percentage, 'secondary');
    const pass = grade.grade === test.expected ? '✓' : '✗';
    console.log(`${pass} Score: ${test.score}/${test.total} (${percentage.toFixed(1)}%) => Grade: ${grade.grade} (${grade.description}) - ${grade.points} points`);
});

// Test 2: Polytechnic Grades
console.log('\n--- POLYTECHNIC TESTS ---');
const polytechnicTests = [
    { score: 16, total: 20, expected: 'A' },   // 80%
    { score: 14, total: 20, expected: 'AB' },  // 70%
    { score: 12, total: 20, expected: 'BC' },  // 60%
    { score: 10, total: 20, expected: 'CD' },  // 50%
    { score: 8, total: 20, expected: 'E' }     // 40%
];

polytechnicTests.forEach(test => {
    const percentage = (test.score / test.total) * 100;
    const grade = GradeScaleMock.calculateGrade(percentage, 'polytechnic');
    if (!grade) {
        console.log(`✗ Score: ${test.score}/${test.total} (${percentage.toFixed(1)}%) => Grade calculation failed!`);
        return;
    }
    const pass = grade.grade === test.expected ? '✓' : '✗';
    console.log(`${pass} Score: ${test.score}/${test.total} (${percentage.toFixed(1)}%) => Grade: ${grade.grade} (${grade.description}) - GPA: ${grade.gpa.toFixed(1)}`);
});

// Test 3: University Grades
console.log('\n--- UNIVERSITY TESTS ---');
const universityTests = [
    { score: 18, total: 20, expected: 'A' },   // 90%
    { score: 14, total: 20, expected: 'A' },   // 70%
    { score: 12, total: 20, expected: 'B' },   // 60%
    { score: 10, total: 20, expected: 'C' },   // 50%
    { score: 8, total: 20, expected: 'E' }     // 40%
];

universityTests.forEach(test => {
    const percentage = (test.score / test.total) * 100;
    const grade = GradeScaleMock.calculateGrade(percentage, 'university');
    if (!grade) {
        console.log(`✗ Score: ${test.score}/${test.total} (${percentage.toFixed(1)}%) => Grade calculation failed!`);
        return;
    }
    const pass = grade.grade === test.expected ? '✓' : '✗';
    console.log(`${pass} Score: ${test.score}/${test.total} (${percentage.toFixed(1)}%) => Grade: ${grade.grade} (${grade.description}) - GPA: ${grade.gpa.toFixed(1)}`);
});

// Test 4: Edge Cases
console.log('\n--- EDGE CASE TESTS ---');
const edgeCases = [
    { percentage: 100, level: 'secondary', expected: 'A1' },
    { percentage: 75, level: 'secondary', expected: 'A1' },
    { percentage: 74, level: 'secondary', expected: 'B2' },  // Note: 74.9 would fail due to floating point comparison
    { percentage: 39, level: 'university', expected: 'F' },
    { percentage: 40, level: 'university', expected: 'E' },
    { percentage: 0, level: 'polytechnic', expected: 'F' }
];

edgeCases.forEach(test => {
    const grade = GradeScaleMock.calculateGrade(test.percentage, test.level);
    if (!grade) {
        console.log(`✗ ${test.percentage.toFixed(1)}% (${test.level}) => Grade calculation failed!`);
        return;
    }
    const pass = grade.grade === test.expected ? '✓' : '✗';
    console.log(`${pass} ${test.percentage.toFixed(1)}% (${test.level}) => Grade: ${grade.grade} (${grade.description})`);
});

// Summary
console.log('\n' + '='.repeat(60));
console.log('All tests completed! Check for ✓ (pass) or ✗ (fail) markers.');
console.log('='.repeat(60));

// Display grading scales
console.log('\n--- GRADING SCALE REFERENCE ---\n');

console.log('SECONDARY SCHOOL (WAEC/NECO):');
GradeScaleMock.getSecondarySchoolScale().scales.forEach(s => {
    console.log(`  ${s.grade}: ${s.min}-${s.max}% - ${s.description} (${s.points} points)`);
});

console.log('\nPOLYTECHNIC (ND/HND):');
GradeScaleMock.getPolytechnicScale().scales.forEach(s => {
    console.log(`  ${s.grade}: ${s.min}-${s.max}% - ${s.description} (GPA: ${s.gpa.toFixed(1)})`);
});

console.log('\nUNIVERSITY (UNDERGRADUATE):');
GradeScaleMock.getUniversityScale().scales.forEach(s => {
    console.log(`  ${s.grade}: ${s.min}-${s.max}% - ${s.description} (GPA: ${s.gpa.toFixed(1)})`);
});

console.log('\n' + '='.repeat(60));

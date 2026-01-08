# Nigerian Grading System for WhizWizard

## Overview

WhizWizard now includes a comprehensive Nigerian (NG) grading system that automatically calculates and displays grades based on quiz performance. This system supports three major educational levels in Nigeria:

1. **Secondary School** (WAEC/NECO grading system)
2. **Polytechnic** (National Diploma and Higher National Diploma)
3. **University** (Undergraduate degree programs)

## Features

### ✅ Automatic Grade Calculation
- Grades are automatically calculated based on quiz percentage scores
- Different grading scales for different educational levels
- Real-time grade assignment upon quiz completion

### ✅ Multiple Educational Levels
- **Secondary School**: A1-F9 grading system with points (9-1)
- **Polytechnic**: A-F grading system with GPA scale (5.0-0.0)
- **University**: A-F grading system with class classifications

### ✅ Visual Grade Display
- Color-coded grade badges for easy identification
- Grade descriptions (Excellent, Good, Pass, Fail, etc.)
- Additional information (points for secondary, GPA for tertiary)

### ✅ Comprehensive Grade Information
- Grade letter (A1, B2, C4, etc.)
- Percentage score
- Grade description
- Points or GPA (depending on level)

## Grading Scales

### 1. Secondary School (WAEC/NECO)

The West African Examinations Council (WAEC) and National Examinations Council (NECO) grading system:

| Grade | Score Range | Description | Points |
|-------|-------------|-------------|--------|
| A1    | 75-100%     | Excellent   | 9      |
| B2    | 70-74%      | Very Good   | 8      |
| B3    | 65-69%      | Good        | 7      |
| C4    | 60-64%      | Credit      | 6      |
| C5    | 55-59%      | Credit      | 5      |
| C6    | 50-54%      | Credit      | 4      |
| D7    | 45-49%      | Pass        | 3      |
| E8    | 40-44%      | Pass        | 2      |
| F9    | 0-39%       | Fail        | 1      |

**Usage**: Ideal for secondary school students preparing for WAEC, NECO, or other O-Level examinations.

### 2. Polytechnic (ND/HND)

The National Board for Technical Education (NBTE) grading system for National Diploma (ND) and Higher National Diploma (HND):

| Grade | Score Range | Description   | GPA |
|-------|-------------|---------------|-----|
| A     | 75-100%     | Distinction   | 5.0 |
| AB    | 70-74%      | Upper Credit  | 4.5 |
| B     | 65-69%      | Upper Credit  | 4.0 |
| BC    | 60-64%      | Lower Credit  | 3.5 |
| C     | 55-59%      | Lower Credit  | 3.0 |
| CD    | 50-54%      | Pass          | 2.5 |
| D     | 45-49%      | Pass          | 2.0 |
| E     | 40-44%      | Pass          | 1.5 |
| F     | 0-39%       | Fail          | 0.0 |

**Usage**: Perfect for polytechnic students and vocational training programs.

### 3. University (Undergraduate)

The National Universities Commission (NUC) grading system for undergraduate programs:

| Grade | Score Range | Classification        | GPA |
|-------|-------------|-----------------------|-----|
| A     | 70-100%     | First Class          | 5.0 |
| B     | 60-69%      | Second Class Upper   | 4.0 |
| C     | 50-59%      | Second Class Lower   | 3.0 |
| D     | 45-49%      | Third Class          | 2.0 |
| E     | 40-44%      | Pass                 | 1.0 |
| F     | 0-39%       | Fail                 | 0.0 |

**Usage**: Designed for university-level courses and degree programs.

## How to Use

### For Quiz Creators

1. **Create a New Quiz**
   - Navigate to "Create Quiz" page
   - Fill in quiz details (title, description, category, timer)

2. **Select Grading System**
   - Find the "Nigerian Grading System" dropdown
   - Choose one of the following:
     - **No Grading (Default)**: No grades will be assigned
     - **Secondary School**: For WAEC/NECO-level quizzes
     - **Polytechnic**: For ND/HND-level quizzes
     - **University**: For undergraduate-level quizzes

3. **Add Questions**
   - Add your quiz questions as usual
   - The grading system will automatically calculate grades based on the final score

4. **Save Quiz**
   - Click "Create Quiz"
   - The grading level will be saved with the quiz

### For Quiz Takers

1. **Take a Quiz**
   - Select and complete any quiz
   - Answer questions within the time limit

2. **View Results**
   - After completing the quiz, you'll see:
     - Your score
     - Percentage achieved
     - Grade (if applicable)
     - Grade description
     - Points or GPA (depending on level)

3. **Understand Your Grade**
   - **Green badges**: Excellent/Distinction grades
   - **Blue badges**: Good/Credit grades
   - **Yellow badges**: Pass grades
   - **Red badges**: Fail grades

## API Endpoints

### Get All Grade Scales
```
GET /api/grades/scales
```
Returns all available grading scales (Secondary, Polytechnic, University).

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "level": "secondary",
      "name": "Secondary School (WAEC/NECO)",
      "scales": [...]
    },
    ...
  ]
}
```

### Get Grade Scale by Level
```
GET /api/grades/scales/:level
```
Get a specific grade scale (secondary, polytechnic, or university).

**Parameters:**
- `level`: Educational level (secondary, polytechnic, university)

**Response:**
```json
{
  "success": true,
  "data": {
    "level": "secondary",
    "name": "Secondary School (WAEC/NECO)",
    "scales": [
      {
        "grade": "A1",
        "min": 75,
        "max": 100,
        "description": "Excellent",
        "points": 9
      },
      ...
    ]
  }
}
```

### Calculate Grade
```
POST /api/grades/calculate
```
Calculate grade for a given percentage and educational level.

**Request Body:**
```json
{
  "percentage": 85,
  "level": "secondary"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "grade": "A1",
    "description": "Excellent",
    "points": 9,
    "gpa": null,
    "percentage": 85,
    "level": "secondary"
  }
}
```

### Get Grade Color
```
GET /api/grades/color/:level/:grade
```
Get the color code for a specific grade (for UI display).

**Response:**
```json
{
  "success": true,
  "data": {
    "color": "#00e676"
  }
}
```

## Database Schema

### Quiz Model (Updated)
```javascript
{
  id: string,
  title: string,
  description: string,
  category: string,
  timer: number,
  questions: array,
  createdBy: string,
  attempts: number,
  averageScore: number,
  gradingLevel: string | null,  // NEW: 'secondary', 'polytechnic', 'university', or null
  createdAt: timestamp,
  updatedAt: timestamp
}
```

### Result Model (Updated)
```javascript
{
  id: string,
  quiz: string,
  user: string,
  score: number,
  correctAnswers: number,
  wrongAnswers: number,
  totalQuestions: number,
  timeTaken: number,
  answers: array,
  percentage: number,           // NEW: Percentage score
  grade: {                      // NEW: Grade object
    grade: string,              // e.g., "A1", "B", "C"
    description: string,        // e.g., "Excellent", "Second Class Upper"
    points: number | null,      // For secondary school
    gpa: number | null,         // For polytechnic/university
    percentage: number,
    level: string
  },
  createdAt: timestamp,
  updatedAt: timestamp
}
```

## Frontend Integration

### Include Grading Module
```html
<script src="js/ng-grading.js"></script>
```

### Display Grade Badge
```javascript
const gradeData = {
  grade: 'A1',
  description: 'Excellent',
  points: 9,
  level: 'secondary',
  percentage: 85
};

const badgeHTML = ngGrading.createGradeBadge(gradeData);
document.getElementById('grade-container').innerHTML = badgeHTML;
```

### Show Grade Scale Table
```javascript
// Display grade scale reference table
await ngGrading.displayGradeScaleTable('secondary', 'grade-table-container');
```

### Calculate Grade
```javascript
// Calculate grade for 78% in university level
const grade = await ngGrading.calculateGrade(78, 'university');
console.log(grade);
// Output: { grade: 'A', description: 'First Class', gpa: 5.0, ... }
```

## Benefits

### For Educators
- **Standardized Grading**: Use official Nigerian grading standards
- **Automatic Calculation**: No manual grade conversion needed
- **Flexibility**: Choose the appropriate level for your students
- **Transparency**: Students see clear grade breakdowns

### For Students
- **Clear Feedback**: Understand performance with familiar grading systems
- **Motivation**: Work towards specific grade targets
- **Preparation**: Practice with the grading system used in actual exams
- **Progress Tracking**: Monitor improvement over time

## Examples

### Example 1: Secondary School Quiz
A student scores 18 out of 20 questions (90%):
- **Score**: 18/20
- **Percentage**: 90%
- **Grade**: A1
- **Description**: Excellent
- **Points**: 9

### Example 2: University Quiz
A student scores 13 out of 20 questions (65%):
- **Score**: 13/20
- **Percentage**: 65%
- **Grade**: B
- **Description**: Second Class Upper
- **GPA**: 4.0

### Example 3: Polytechnic Quiz
A student scores 11 out of 20 questions (55%):
- **Score**: 11/20
- **Percentage**: 55%
- **Grade**: C
- **Description**: Lower Credit
- **GPA**: 3.0

## Best Practices

1. **Choose the Right Level**: Select the grading level that matches your target audience
2. **Be Consistent**: Use the same grading level for related quizzes
3. **Explain Grades**: Help students understand what each grade means
4. **Set Clear Expectations**: Let students know the grading criteria before they start
5. **Use for Practice**: Great for exam preparation and self-assessment

## Troubleshooting

### Grade Not Showing
- Ensure the quiz has a grading level set
- Check that the percentage calculation is correct
- Verify the backend API is accessible

### Wrong Grade Displayed
- Confirm the correct grading level is selected
- Check percentage calculations
- Review the grade scale tables above

### Grade Colors Not Appearing
- Ensure `ng-grading.js` is loaded
- Check that CSS styles are applied
- Verify browser console for errors

## Future Enhancements

Planned features for future releases:
- Custom grade scales
- Grade distribution analytics
- Comparative grade analysis
- Grade prediction based on performance trends
- Export grade reports

## Support

For issues or questions about the grading system:
1. Check this documentation
2. Review API responses for errors
3. Check browser console for JavaScript errors
4. Ensure all dependencies are loaded correctly

---

**Version**: 1.0.0  
**Last Updated**: January 2026  
**Compatible With**: WhizWizard v1.0.0+

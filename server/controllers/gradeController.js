const GradeScale = require('../models/GradeScale');

// Get all available grade scales
exports.getAllScales = async (req, res) => {
    try {
        const scales = GradeScale.getAllScales();
        res.json({
            success: true,
            data: scales
        });
    } catch (error) {
        console.error('Error getting grade scales:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to retrieve grade scales'
        });
    }
};

// Get a specific grade scale by level
exports.getScaleByLevel = async (req, res) => {
    try {
        const { level } = req.params;
        
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
                return res.status(400).json({
                    success: false,
                    error: 'Invalid educational level. Must be secondary, polytechnic, or university'
                });
        }

        res.json({
            success: true,
            data: scale
        });
    } catch (error) {
        console.error('Error getting grade scale:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to retrieve grade scale'
        });
    }
};

// Calculate grade for a given percentage and level
exports.calculateGrade = async (req, res) => {
    try {
        const { percentage, level } = req.body;

        // Validate input
        if (percentage === undefined || percentage < 0 || percentage > 100) {
            return res.status(400).json({
                success: false,
                error: 'Percentage must be between 0 and 100'
            });
        }

        if (!level || !['secondary', 'polytechnic', 'university'].includes(level)) {
            return res.status(400).json({
                success: false,
                error: 'Invalid educational level. Must be secondary, polytechnic, or university'
            });
        }

        const grade = GradeScale.calculateGrade(percentage, level);

        if (!grade) {
            return res.status(400).json({
                success: false,
                error: 'Failed to calculate grade'
            });
        }

        res.json({
            success: true,
            data: grade
        });
    } catch (error) {
        console.error('Error calculating grade:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to calculate grade'
        });
    }
};

// Get grade color for UI display
exports.getGradeColor = async (req, res) => {
    try {
        const { level, grade } = req.params;

        if (!level || !['secondary', 'polytechnic', 'university'].includes(level)) {
            return res.status(400).json({
                success: false,
                error: 'Invalid educational level'
            });
        }

        const color = GradeScale.getGradeColor(grade, level);

        res.json({
            success: true,
            data: { color }
        });
    } catch (error) {
        console.error('Error getting grade color:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to get grade color'
        });
    }
};

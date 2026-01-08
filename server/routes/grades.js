const express = require('express');
const router = express.Router();
const gradeController = require('../controllers/gradeController');

// Get all available grade scales
router.get('/scales', gradeController.getAllScales);

// Get a specific grade scale by level
router.get('/scales/:level', gradeController.getScaleByLevel);

// Calculate grade for a given percentage and level
router.post('/calculate', gradeController.calculateGrade);

// Get grade color for UI display
router.get('/color/:level/:grade', gradeController.getGradeColor);

module.exports = router;

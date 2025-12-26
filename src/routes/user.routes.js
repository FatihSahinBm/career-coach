import express from 'express';
import * as userController from '../controllers/user.controller.js';
import { authenticateToken } from '../middleware/auth.js';
import { careerProfileValidation, skillValidation } from '../middleware/validation.js';

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

/**
 * @route   GET /api/users/profile
 * @desc    Get current user profile
 * @access  Private
 */
router.get('/profile', userController.getProfile);

/**
 * @route   PUT /api/users/profile
 * @desc    Update user profile
 * @access  Private
 */
router.put('/profile', userController.updateProfile);

/**
 * @route   GET /api/users/career-profile
 * @desc    Get career profile
 * @access  Private
 */
router.get('/career-profile', userController.getCareerProfile);

/**
 * @route   PUT /api/users/career-profile
 * @desc    Update career profile
 * @access  Private
 */
router.put('/career-profile', careerProfileValidation, userController.updateCareerProfile);

/**
 * @route   GET /api/users/skills
 * @desc    Get user skills
 * @access  Private
 */
router.get('/skills', userController.getUserSkills);

/**
 * @route   POST /api/users/skills
 * @desc    Add skill to user
 * @access  Private
 */
router.post('/skills', skillValidation, userController.addSkill);

/**
 * @route   PUT /api/users/skills/:skillId
 * @desc    Update user skill
 * @access  Private
 */
router.put('/skills/:skillId', userController.updateSkill);

/**
 * @route   DELETE /api/users/skills/:skillId
 * @desc    Remove user skill
 * @access  Private
 */
router.delete('/skills/:skillId', userController.removeSkill);

export default router;

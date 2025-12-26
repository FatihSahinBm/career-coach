import express from 'express';
import * as interviewController from '../controllers/interview.controller.js';
import { authenticateToken } from '../middleware/auth.js';
import { aiLimiter } from '../middleware/rateLimiter.js';
import { startInterviewValidation, answerValidation } from '../middleware/validation.js';

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

/**
 * @route   POST /api/interviews/start
 * @desc    Start new interview session (AI)
 * @access  Private
 */
router.post('/start', aiLimiter, startInterviewValidation, interviewController.startInterview);

/**
 * @route   POST /api/interviews/:id/answer
 * @desc    Submit answer to interview question (AI)
 * @access  Private
 */
router.post('/:id/answer', aiLimiter, answerValidation, interviewController.submitAnswer);

/**
 * @route   POST /api/interviews/:id/complete
 * @desc    Complete interview session
 * @access  Private
 */
router.post('/:id/complete', interviewController.completeInterview);

/**
 * @route   GET /api/interviews/:id
 * @desc    Get interview session
 * @access  Private
 */
router.get('/:id', interviewController.getInterview);

/**
 * @route   GET /api/interviews
 * @desc    Get all user interviews
 * @access  Private
 */
router.get('/', interviewController.getInterviews);

export default router;

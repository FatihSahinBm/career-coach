import express from 'express';
import * as roadmapController from '../controllers/roadmap.controller.js';
import { authenticateToken } from '../middleware/auth.js';
import { aiLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

/**
 * @route   GET /api/roadmaps
 * @desc    Get all user roadmaps
 * @access  Private
 */
router.get('/', roadmapController.getRoadmaps);

/**
 * @route   GET /api/roadmaps/:id
 * @desc    Get specific roadmap
 * @access  Private
 */
router.get('/:id', roadmapController.getRoadmap);

/**
 * @route   POST /api/roadmaps/generate
 * @desc    Generate new roadmap (AI)
 * @access  Private
 */
router.post('/generate', aiLimiter, roadmapController.generateRoadmap);

/**
 * @route   PUT /api/roadmaps/:id
 * @desc    Update roadmap progress
 * @access  Private
 */
router.put('/:id', roadmapController.updateRoadmap);

/**
 * @route   DELETE /api/roadmaps/:id
 * @desc    Delete roadmap
 * @access  Private
 */
router.delete('/:id', roadmapController.deleteRoadmap);

export default router;

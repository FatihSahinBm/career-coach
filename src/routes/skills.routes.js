import express from 'express';
import * as userController from '../controllers/user.controller.js';

const router = express.Router();

/**
 * @route   GET /api/skills
 * @desc    Get all available skills
 * @access  Public
 */
router.get('/', userController.getAllSkills);

export default router;

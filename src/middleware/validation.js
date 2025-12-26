import { body, param, query, validationResult } from 'express-validator';
import { AppError } from './errorHandler.js';

/**
 * Validation result handler
 */
export const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }
  next();
};

/**
 * Auth validation rules
 */
export const registerValidation = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Valid email is required'),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters')
    .matches(/[A-Z]/)
    .withMessage('Password must contain at least one uppercase letter')
    .matches(/[a-z]/)
    .withMessage('Password must contain at least one lowercase letter')
    .matches(/[0-9]/)
    .withMessage('Password must contain at least one number'),
  body('name')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters'),
  handleValidationErrors
];

export const loginValidation = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Valid email is required'),
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
  handleValidationErrors
];

/**
 * Career profile validation
 */
export const careerProfileValidation = [
  body('currentRole')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('Current role must not exceed 200 characters'),
  body('targetRole')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('Target role must not exceed 200 characters'),
  body('yearsOfExperience')
    .optional()
    .isInt({ min: 0, max: 70 })
    .withMessage('Years of experience must be between 0 and 70'),
  body('education')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Education must not exceed 500 characters'),
  handleValidationErrors
];

/**
 * Skill validation
 */
export const skillValidation = [
  body('skillId')
    .notEmpty()
    .isUUID()
    .withMessage('Valid skill ID is required'),
  body('proficiency')
    .isInt({ min: 1, max: 5 })
    .withMessage('Proficiency must be between 1 and 5'),
  body('yearsUsed')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Years used must be a positive number'),
  handleValidationErrors
];

/**
 * Interview validation
 */
export const startInterviewValidation = [
  body('position')
    .trim()
    .notEmpty()
    .isLength({ max: 200 })
    .withMessage('Position is required and must not exceed 200 characters'),
  body('difficulty')
    .isIn(['junior', 'mid', 'senior'])
    .withMessage('Difficulty must be junior, mid, or senior'),
  handleValidationErrors
];

export const answerValidation = [
  param('id')
    .isUUID()
    .withMessage('Valid session ID is required'),
  body('questionIndex')
    .isInt({ min: 0 })
    .withMessage('Valid question index is required'),
  body('answer')
    .trim()
    .notEmpty()
    .isLength({ max: 2000 })
    .withMessage('Answer is required and must not exceed 2000 characters'),
  handleValidationErrors
];

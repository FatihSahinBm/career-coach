import * as interviewService from '../services/interview.service.js';

/**
 * Start new interview session
 * POST /api/interviews/start
 */
export async function startInterview(req, res, next) {
  try {
    const { position, difficulty } = req.body;
    const session = await interviewService.startInterview(req.user.id, position, difficulty);

    res.status(201).json({
      success: true,
      message: 'Interview session started',
      data: session
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Submit answer to interview question
 * POST /api/interviews/:id/answer
 */
export async function submitAnswer(req, res, next) {
  try {
    const { questionIndex, answer } = req.body;
    const result = await interviewService.submitAnswer(
      req.params.id,
      req.user.id,
      questionIndex,
      answer
    );

    res.json({
      success: true,
      message: 'Answer submitted successfully',
      data: result
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Complete interview session
 * POST /api/interviews/:id/complete
 */
export async function completeInterview(req, res, next) {
  try {
    const result = await interviewService.completeInterview(req.params.id, req.user.id);

    res.json({
      success: true,
      message: 'Interview completed',
      data: result
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Get interview session
 * GET /api/interviews/:id
 */
export async function getInterview(req, res, next) {
  try {
    const session = await interviewService.getInterviewSession(req.params.id, req.user.id);

    res.json({
      success: true,
      data: session
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Get all user interviews
 * GET /api/interviews
 */
export async function getInterviews(req, res, next) {
  try {
    const sessions = await interviewService.getUserInterviews(req.user.id);

    res.json({
      success: true,
      data: sessions
    });
  } catch (error) {
    next(error);
  }
}

import * as roadmapService from '../services/roadmap.service.js';

/**
 * Get all user roadmaps
 * GET /api/roadmaps
 */
export async function getRoadmaps(req, res, next) {
  try {
    const roadmaps = await roadmapService.getUserRoadmaps(req.user.id);

    res.json({
      success: true,
      data: roadmaps
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Get specific roadmap
 * GET /api/roadmaps/:id
 */
export async function getRoadmap(req, res, next) {
  try {
    const roadmap = await roadmapService.getRoadmapById(req.params.id, req.user.id);

    res.json({
      success: true,
      data: roadmap
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Generate new roadmap
 * POST /api/roadmaps/generate
 */
export async function generateRoadmap(req, res, next) {
  try {
    const { timeframe } = req.body;
    const roadmap = await roadmapService.generateRoadmap(req.user.id, timeframe);

    res.status(201).json({
      success: true,
      message: 'Roadmap generated successfully',
      data: roadmap
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Update roadmap progress
 * PUT /api/roadmaps/:id
 */
export async function updateRoadmap(req, res, next) {
  try {
    const { progress, status } = req.body;
    const updated = await roadmapService.updateRoadmapProgress(
      req.params.id,
      req.user.id,
      progress,
      status
    );

    res.json({
      success: true,
      message: 'Roadmap updated successfully',
      data: updated
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Delete roadmap
 * DELETE /api/roadmaps/:id
 */
export async function deleteRoadmap(req, res, next) {
  try {
    await roadmapService.deleteRoadmap(req.params.id, req.user.id);

    res.json({
      success: true,
      message: 'Roadmap deleted successfully'
    });
  } catch (error) {
    next(error);
  }
}

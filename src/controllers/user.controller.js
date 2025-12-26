import * as userService from '../services/user.service.js';

/**
 * Get current user profile
 * GET /api/users/profile
 */
export async function getProfile(req, res, next) {
  try {
    const profile = await userService.getUserProfile(req.user.id);

    res.json({
      success: true,
      data: profile
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Update user profile
 * PUT /api/users/profile
 */
export async function updateProfile(req, res, next) {
  try {
    const updated = await userService.updateUserProfile(req.user.id, req.body);

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: updated
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Get career profile
 * GET /api/users/career-profile
 */
export async function getCareerProfile(req, res, next) {
  try {
    const careerProfile = await userService.getCareerProfile(req.user.id);

    res.json({
      success: true,
      data: careerProfile
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Update career profile
 * PUT /api/users/career-profile
 */
export async function updateCareerProfile(req, res, next) {
  try {
    const updated = await userService.updateCareerProfile(req.user.id, req.body);

    res.json({
      success: true,
      message: 'Career profile updated successfully',
      data: updated
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Get user skills
 * GET /api/users/skills
 */
export async function getUserSkills(req, res, next) {
  try {
    const skills = await userService.getUserSkills(req.user.id);

    res.json({
      success: true,
      data: skills
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Add skill to user
 * POST /api/users/skills
 */
export async function addSkill(req, res, next) {
  try {
    const userSkill = await userService.addUserSkill(req.user.id, req.body);

    res.status(201).json({
      success: true,
      message: 'Skill added successfully',
      data: userSkill
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Update user skill
 * PUT /api/users/skills/:skillId
 */
export async function updateSkill(req, res, next) {
  try {
    const updated = await userService.updateUserSkill(
      req.user.id,
      req.params.skillId,
      req.body
    );

    res.json({
      success: true,
      message: 'Skill updated successfully',
      data: updated
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Remove user skill
 * DELETE /api/users/skills/:skillId
 */
export async function removeSkill(req, res, next) {
  try {
    await userService.removeUserSkill(req.user.id, req.params.skillId);

    res.json({
      success: true,
      message: 'Skill removed successfully'
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Get all available skills
 * GET /api/skills
 */
export async function getAllSkills(req, res, next) {
  try {
    const { category } = req.query;
    const skills = await userService.getAllSkills(category);

    res.json({
      success: true,
      data: skills
    });
  } catch (error) {
    next(error);
  }
}

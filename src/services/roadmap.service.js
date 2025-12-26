import { prisma } from '../config/database.js';
import { AppError } from '../middleware/errorHandler.js';
import * as aiService from './ai.service.js';
import * as userService from './user.service.js';

/**
 * Get all roadmaps for user
 */
export async function getUserRoadmaps(userId) {
  const roadmaps = await prisma.careerRoadmap.findMany({
    where: {
      userId,
      deletedAt: null
    },
    orderBy: {
      createdAt: 'desc'
    }
  });

  return roadmaps;
}

/**
 * Get roadmap by ID
 */
export async function getRoadmapById(roadmapId, userId) {
  const roadmap = await prisma.careerRoadmap.findFirst({
    where: {
      id: roadmapId,
      userId,
      deletedAt: null
    }
  });

  if (!roadmap) {
    throw new AppError('Roadmap not found', 404);
  }

  return roadmap;
}

/**
 * Generate new career roadmap using AI
 */
export async function generateRoadmap(userId, timeframe = '12 months') {
  // Get user's career profile and skills
  const careerProfile = await userService.getCareerProfile(userId);
  const skills = await userService.getUserSkills(userId);

  if (!careerProfile.targetRole) {
    throw new AppError('Please set a target role in your career profile first', 400);
  }

  // Use AI to generate roadmap
  const roadmapData = await aiService.generateCareerRoadmap(
    careerProfile,
    skills,
    timeframe
  );

  // Store roadmap in database
  const roadmap = await prisma.careerRoadmap.create({
    data: {
      userId,
      title: `Career path: ${careerProfile.currentRole || 'Current'} → ${careerProfile.targetRole}`,
      description: `${timeframe} roadmap to transition to ${careerProfile.targetRole}`,
      targetRole: careerProfile.targetRole,
      timeline: JSON.stringify(roadmapData.milestones || []),
      milestones: JSON.stringify(roadmapData),
      resources: JSON.stringify(roadmapData.recommendedProjects || []),
      status: 'active',
      progress: 0
    }
  });

  return roadmap;
}

/**
 * Update roadmap progress
 */
export async function updateRoadmapProgress(roadmapId, userId, progress, status) {
  const roadmap = await getRoadmapById(roadmapId, userId);

  const updated = await prisma.careerRoadmap.update({
    where: { id: roadmap.id },
    data: {
      progress: progress !== undefined ? progress : roadmap.progress,
      status: status || roadmap.status
    }
  });

  return updated;
}

/**
 * Delete roadmap (soft delete)
 */
export async function deleteRoadmap(roadmapId, userId) {
  const roadmap = await getRoadmapById(roadmapId, userId);

  await prisma.careerRoadmap.update({
    where: { id: roadmap.id },
    data: { deletedAt: new Date() }
  });

  return { success: true };
}

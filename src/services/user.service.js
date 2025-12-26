import { prisma } from '../config/database.js';
import { AppError } from '../middleware/errorHandler.js';
import { sanitizeObject } from '../utils/sanitizer.js';

/**
 * Get user profile
 */
export async function getUserProfile(userId) {
  const user = await prisma.user.findFirst({
    where: {
      id: userId,
      deletedAt: null
    },
    select: {
      id: true,
      email: true,
      name: true,
      createdAt: true,
      careerProfile: true
    }
  });

  if (!user) {
    throw new AppError('User not found', 404);
  }

  return user;
}

/**
 * Update user profile
 */
export async function updateUserProfile(userId, data) {
  const sanitizedData = sanitizeObject(data);

  const user = await prisma.user.update({
    where: { id: userId },
    data: {
      name: sanitizedData.name
    },
    select: {
      id: true,
      email: true,
      name: true,
      updatedAt: true
    }
  });

  return user;
}

/**
 * Get career profile
 */
export async function getCareerProfile(userId) {
  let careerProfile = await prisma.careerProfile.findFirst({
    where: {
      userId,
      deletedAt: null
    }
  });

  // Create if doesn't exist
  if (!careerProfile) {
    careerProfile = await prisma.careerProfile.create({
      data: { userId }
    });
  }

  return careerProfile;
}

/**
 * Update career profile
 */
export async function updateCareerProfile(userId, data) {
  const sanitizedData = sanitizeObject(data);

  // Get or create profile
  let careerProfile = await prisma.careerProfile.findFirst({
    where: {
      userId,
      deletedAt: null
    }
  });

  if (careerProfile) {
    careerProfile = await prisma.careerProfile.update({
      where: { id: careerProfile.id },
      data: {
        currentRole: sanitizedData.currentRole,
        targetRole: sanitizedData.targetRole,
        yearsOfExperience: sanitizedData.yearsOfExperience,
        education: sanitizedData.education,
        interests: sanitizedData.interests,
        strengths: sanitizedData.strengths,
        weaknesses: sanitizedData.weaknesses,
        careerGoals: sanitizedData.careerGoals
      }
    });
  } else {
    careerProfile = await prisma.careerProfile.create({
      data: {
        userId,
        ...sanitizedData
      }
    });
  }

  return careerProfile;
}

/**
 * Get user skills
 */
export async function getUserSkills(userId) {
  const skills = await prisma.userSkill.findMany({
    where: {
      userId,
      deletedAt: null
    },
    include: {
      skill: true
    },
    orderBy: {
      proficiency: 'desc'
    }
  });

  return skills;
}

/**
 * Add skill to user
 */
export async function addUserSkill(userId, skillData) {
  const { skillId, proficiency, yearsUsed } = skillData;

  // Check if skill exists
  const skill = await prisma.skill.findUnique({
    where: { id: skillId }
  });

  if (!skill) {
    throw new AppError('Skill not found', 404);
  }

  // Check if already added
  const existing = await prisma.userSkill.findFirst({
    where: {
      userId,
      skillId,
      deletedAt: null
    }
  });

  if (existing) {
    throw new AppError('Skill already added', 400);
  }

  const userSkill = await prisma.userSkill.create({
    data: {
      userId,
      skillId,
      proficiency,
      yearsUsed: yearsUsed || 0
    },
    include: {
      skill: true
    }
  });

  return userSkill;
}

/**
 * Update user skill
 */
export async function updateUserSkill(userId, skillId, data) {
  const userSkill = await prisma.userSkill.findFirst({
    where: {
      userId,
      skillId,
      deletedAt: null
    }
  });

  if (!userSkill) {
    throw new AppError('User skill not found', 404);
  }

  const updated = await prisma.userSkill.update({
    where: { id: userSkill.id },
    data: {
      proficiency: data.proficiency,
      yearsUsed: data.yearsUsed,
      lastUsed: data.lastUsed ? new Date(data.lastUsed) : undefined
    },
    include: {
      skill: true
    }
  });

  return updated;
}

/**
 * Remove user skill (soft delete)
 */
export async function removeUserSkill(userId, skillId) {
  const userSkill = await prisma.userSkill.findFirst({
    where: {
      userId,
      skillId,
      deletedAt: null
    }
  });

  if (!userSkill) {
    throw new AppError('User skill not found', 404);
  }

  await prisma.userSkill.update({
    where: { id: userSkill.id },
    data: { deletedAt: new Date() }
  });

  return { success: true };
}

/**
 * Get all available skills
 */
export async function getAllSkills(category = null) {
  const where = {
    deletedAt: null
  };

  if (category) {
    where.category = category;
  }

  const skills = await prisma.skill.findMany({
    where,
    orderBy: {
      name: 'asc'
    }
  });

  return skills;
}

/**
 * Create new skill (admin function)
 */
export async function createSkill(data) {
  const sanitizedData = sanitizeObject(data);

  const skill = await prisma.skill.create({
    data: {
      name: sanitizedData.name,
      category: sanitizedData.category,
      description: sanitizedData.description
    }
  });

  return skill;
}

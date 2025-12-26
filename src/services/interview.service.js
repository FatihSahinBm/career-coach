import { prisma } from '../config/database.js';
import { AppError } from '../middleware/errorHandler.js';
import * as aiService from './ai.service.js';
import { sanitizeInput } from '../utils/sanitizer.js';

/**
 * Start new interview session
 */
export async function startInterview(userId, position, difficulty) {
  // Generate interview questions using AI
  const questions = await aiService.generateInterviewQuestions(position, difficulty, 5);

  // Create session
  const session = await prisma.interviewSession.create({
    data: {
      userId,
      position: sanitizeInput(position),
      difficulty,
      questions: JSON.stringify(questions),
      answers: JSON.stringify([]),
      status: 'in_progress'
    }
  });

  return {
    id: session.id,
    position: session.position,
    difficulty: session.difficulty,
    questions,
    status: session.status
  };
}

/**
 * Submit answer to interview question
 */
export async function submitAnswer(sessionId, userId, questionIndex, answer) {
  // Get session
  const session = await prisma.interviewSession.findFirst({
    where: {
      id: sessionId,
      userId,
      deletedAt: null
    }
  });

  if (!session) {
    throw new AppError('Interview session not found', 404);
  }

  if (session.status !== 'in_progress') {
    throw new AppError('Interview session is not active', 400);
  }

  const questions = JSON.parse(session.questions);
  const answers = JSON.parse(session.answers || '[]');

  if (questionIndex < 0 || questionIndex >= questions.length) {
    throw new AppError('Invalid question index', 400);
  }

  const question = questions[questionIndex];

  // Get AI feedback on answer
  const feedback = await aiService.evaluateAnswer(
    question.question,
    answer,
    session.position,
    session.difficulty
  );

  // Store answer with feedback
  answers[questionIndex] = {
    question: question.question,
    answer: sanitizeInput(answer),
    feedback,
    timestamp: new Date().toISOString()
  };

  // Update session
  const updated = await prisma.interviewSession.update({
    where: { id: session.id },
    data: {
      answers: JSON.stringify(answers)
    }
  });

  return {
    questionIndex,
    feedback,
    totalQuestions: questions.length,
    answeredQuestions: answers.filter(a => a).length
  };
}

/**
 * Complete interview session
 */
export async function completeInterview(sessionId, userId) {
  const session = await prisma.interviewSession.findFirst({
    where: {
      id: sessionId,
      userId,
      deletedAt: null
    }
  });

  if (!session) {
    throw new AppError('Interview session not found', 404);
  }

  const answers = JSON.parse(session.answers || '[]');
  
  // Calculate overall score
  const scores = answers.filter(a => a && a.feedback).map(a => a.feedback.score || 0);
  const averageScore = scores.length > 0 
    ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) 
    : 0;

  // Generate overall feedback
  const overallFeedback = {
    totalQuestions: JSON.parse(session.questions).length,
    answeredQuestions: answers.filter(a => a).length,
    averageScore,
    answersWithFeedback: answers
  };

  // Update session
  const updated = await prisma.interviewSession.update({
    where: { id: session.id },
    data: {
      status: 'completed',
      score: averageScore,
      feedback: JSON.stringify(overallFeedback)
    }
  });

  return {
    sessionId: updated.id,
    score: averageScore,
    feedback: overallFeedback
  };
}

/**
 * Get interview session
 */
export async function getInterviewSession(sessionId, userId) {
  const session = await prisma.interviewSession.findFirst({
    where: {
      id: sessionId,
      userId,
      deletedAt: null
    }
  });

  if (!session) {
    throw new AppError('Interview session not found', 404);
  }

  return {
    id: session.id,
    position: session.position,
    difficulty: session.difficulty,
    questions: JSON.parse(session.questions),
    answers: JSON.parse(session.answers || '[]'),
    feedback: session.feedback ? JSON.parse(session.feedback) : null,
    score: session.score,
    status: session.status,
    createdAt: session.createdAt
  };
}

/**
 * Get all interview sessions for user
 */
export async function getUserInterviews(userId) {
  const sessions = await prisma.interviewSession.findMany({
    where: {
      userId,
      deletedAt: null
    },
    select: {
      id: true,
      position: true,
      difficulty: true,
      score: true,
      status: true,
      createdAt: true
    },
    orderBy: {
      createdAt: 'desc'
    }
  });

  return sessions;
}

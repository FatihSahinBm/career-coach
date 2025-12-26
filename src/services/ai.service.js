import { GoogleGenerativeAI } from '@google/generative-ai';
import { sanitizeAIInput } from '../utils/sanitizer.js';
import { logger } from '../utils/logger.js';
import { AppError } from '../middleware/errorHandler.js';

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

/**
 * IMPORTANT: AI Service Layer Rules
 * 1. AI never writes directly to database
 * 2. All inputs must be sanitized
 * 3. Prompts must be deterministic
 * 4. AI is never involved in auth logic
 */

/**
 * Analyze career profile and generate insights
 */
export async function analyzeCareerProfile(careerProfile, skills) {
  try {
    // Sanitize all inputs
    const sanitizedProfile = {
      currentRole: sanitizeAIInput(careerProfile.currentRole || ''),
      targetRole: sanitizeAIInput(careerProfile.targetRole || ''),
      yearsOfExperience: careerProfile.yearsOfExperience || 0,
      education: sanitizeAIInput(careerProfile.education || ''),
      careerGoals: sanitizeAIInput(careerProfile.careerGoals || '')
    };

    const sanitizedSkills = skills.map(s => sanitizeAIInput(s.name));

    // Deterministic prompt
    const prompt = `
You are a career counselor. Analyze the following career profile and provide insights.

Current Role: ${sanitizedProfile.currentRole}
Target Role: ${sanitizedProfile.targetRole}
Years of Experience: ${sanitizedProfile.yearsOfExperience}
Education: ${sanitizedProfile.education}
Career Goals: ${sanitizedProfile.careerGoals}
Current Skills: ${sanitizedSkills.join(', ')}

Provide:
1. Career path analysis
2. Skill gap identification
3. Recommended next steps
4. Growth opportunities

Format your response as structured text, not HTML.
`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const analysis = response.text();

    return sanitizeAIInput(analysis);
  } catch (error) {
    logger.error('AI career analysis error:', error);
    throw new AppError('Failed to analyze career profile', 500);
  }
}

/**
 * Generate personalized career roadmap
 */
export async function generateCareerRoadmap(careerProfile, skills, timeframe = '12 months') {
  try {
    const sanitizedProfile = {
      currentRole: sanitizeAIInput(careerProfile.currentRole || ''),
      targetRole: sanitizeAIInput(careerProfile.targetRole || ''),
      yearsOfExperience: careerProfile.yearsOfExperience || 0
    };

    const sanitizedSkills = skills.map(s => ({
      name: sanitizeAIInput(s.skill.name),
      proficiency: s.proficiency
    }));

    const prompt = `
Create a detailed career roadmap for the following profile:

Current Position: ${sanitizedProfile.currentRole}
Target Position: ${sanitizedProfile.targetRole}
Experience: ${sanitizedProfile.yearsOfExperience} years
Timeframe: ${timeframe}

Current Skills:
${sanitizedSkills.map(s => `- ${s.name} (Level ${s.proficiency}/5)`).join('\n')}

Generate a structured roadmap with:
1. Monthly milestones
2. Skills to develop
3. Projects to build
4. Certifications to pursue
5. Networking activities

Format as JSON with this structure:
{
  "milestones": [
    {
      "month": 1,
      "title": "...",
      "objectives": ["...", "..."],
      "skills": ["...", "..."]
    }
  ],
  "skillsToLearn": ["...", "..."],
  "recommendedProjects": ["...", "..."],
  "certifications": ["...", "..."]
}
`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    let roadmapText = response.text();

    // Extract JSON from response
    const jsonMatch = roadmapText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const roadmapData = JSON.parse(jsonMatch[0]);
      return roadmapData;
    }

    // Fallback if JSON parsing fails
    return {
      milestones: [],
      rawContent: sanitizeAIInput(roadmapText)
    };
  } catch (error) {
    logger.error('AI roadmap generation error:', error);
    throw new AppError('Failed to generate career roadmap', 500);
  }
}

/**
 * Generate interview questions based on position and difficulty
 */
export async function generateInterviewQuestions(position, difficulty, count = 5) {
  try {
    const sanitizedPosition = sanitizeAIInput(position);
    const sanitizedDifficulty = sanitizeAIInput(difficulty);

    const prompt = `
Generate ${count} interview questions for a ${sanitizedDifficulty}-level ${sanitizedPosition} position.

Include:
- Mix of technical and behavioral questions
- Questions appropriate for ${sanitizedDifficulty} level
- Diverse topics related to ${sanitizedPosition}

Format as JSON array:
[
  {
    "question": "...",
    "type": "technical" | "behavioral",
    "topic": "..."
  }
]
`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    let questionsText = response.text();

    // Extract JSON from response
    const jsonMatch = questionsText.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      const questions = JSON.parse(jsonMatch[0]);
      return questions;
    }

    throw new Error('Failed to parse interview questions');
  } catch (error) {
    logger.error('AI interview questions generation error:', error);
    throw new AppError('Failed to generate interview questions', 500);
  }
}

/**
 * Evaluate interview answer and provide feedback
 */
export async function evaluateAnswer(question, answer, position, difficulty) {
  try {
    const sanitizedQuestion = sanitizeAIInput(question);
    const sanitizedAnswer = sanitizeAIInput(answer);
    const sanitizedPosition = sanitizeAIInput(position);
    const sanitizedDifficulty = sanitizeAIInput(difficulty);

    const prompt = `
You are interviewing a ${sanitizedDifficulty}-level candidate for a ${sanitizedPosition} position.

Question: ${sanitizedQuestion}
Candidate's Answer: ${sanitizedAnswer}

Evaluate the answer and provide:
1. Score (0-10)
2. Strengths in the answer
3. Areas for improvement
4. Suggested better answer approach

Format as JSON:
{
  "score": 0-10,
  "strengths": ["...", "..."],
  "improvements": ["...", "..."],
  "suggestion": "..."
}
`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    let feedbackText = response.text();

    // Extract JSON
    const jsonMatch = feedbackText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const feedback = JSON.parse(jsonMatch[0]);
      return feedback;
    }

    // Fallback
    return {
      score: 5,
      rawFeedback: sanitizeAIInput(feedbackText)
    };
  } catch (error) {
    logger.error('AI answer evaluation error:', error);
    throw new AppError('Failed to evaluate answer', 500);
  }
}

/**
 * Get skill recommendations based on career goals
 */
export async function recommendSkills(currentRole, targetRole, currentSkills) {
  try {
    const sanitizedCurrent = sanitizeAIInput(currentRole);
    const sanitizedTarget = sanitizeAIInput(targetRole);
    const sanitizedSkills = currentSkills.map(s => sanitizeAIInput(s));

    const prompt = `
Career transition analysis:
Current Role: ${sanitizedCurrent}
Target Role: ${sanitizedTarget}
Current Skills: ${sanitizedSkills.join(', ')}

Recommend:
1. Top 5 skills to learn
2. Priority order
3. Learning resources for each

Format as JSON array:
[
  {
    "skill": "...",
    "priority": "high" | "medium" | "low",
    "reason": "...",
    "resources": ["...", "..."]
  }
]
`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    let recommendationsText = response.text();

    const jsonMatch = recommendationsText.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      const recommendations = JSON.parse(jsonMatch[0]);
      return recommendations;
    }

    return [];
  } catch (error) {
    logger.error('AI skill recommendations error:', error);
    throw new AppError('Failed to generate skill recommendations', 500);
  }
}

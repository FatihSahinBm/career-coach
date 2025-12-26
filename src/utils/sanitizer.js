/**
 * Sanitization utilities for XSS prevention
 * These functions ensure user input is safe before processing
 */

/**
 * Remove HTML tags from string
 */
export function stripHtml(str) {
  if (!str) return '';
  return String(str).replace(/<[^>]*>/g, '');
}

/**
 * Sanitize user input for safe storage and display
 */
export function sanitizeInput(input) {
  if (!input) return '';
  
  // Remove HTML tags
  let sanitized = stripHtml(input);
  
  // Trim whitespace
  sanitized = sanitized.trim();
  
  return sanitized;
}

/**
 * Sanitize object properties recursively
 */
export function sanitizeObject(obj) {
  if (!obj || typeof obj !== 'object') return obj;
  
  const sanitized = {};
  
  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === 'string') {
      sanitized[key] = sanitizeInput(value);
    } else if (Array.isArray(value)) {
      sanitized[key] = value.map(item => 
        typeof item === 'string' ? sanitizeInput(item) : sanitizeObject(item)
      );
    } else if (typeof value === 'object' && value !== null) {
      sanitized[key] = sanitizeObject(value);
    } else {
      sanitized[key] = value;
    }
  }
  
  return sanitized;
}

/**
 * Sanitize AI prompt input to prevent injection
 */
export function sanitizeAIInput(input) {
  if (!input) return '';
  
  let sanitized = sanitizeInput(input);
  
  // Additional safety for AI prompts
  // Remove potential prompt injection patterns
  sanitized = sanitized.replace(/system:|assistant:|user:/gi, '');
  
  return sanitized;
}

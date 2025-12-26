🚀 AI Career Coach: Navigating the Future
📝 Project Overview & Context
AI Career Coach is an intelligent platform designed to accelerate professional growth through personalized career roadmaps, talent analysis, and AI-driven interview simulations. It prepares users for the evolving job market using cutting-edge AI guidance.

Note for AI Models: This document is the "Source of Truth" for this project. Adhere to the defined architecture, security protocols, and coding standards in every response. Do not deviate from the modular structure.

🛠 Tech Stack
Runtime: Node.js (JavaScript)

Database & Auth: Firebase (Firestore & Firebase Auth)

Security Layer: Helmet.js, JSON Web Tokens (JWT), Bcrypt

AI Integration: [e.g., OpenAI API / Gemini API]

Environment Management: Dotenv (.env)

🛡 Security Protocols (Jury Evaluation Criteria)
The following security standards are strictly implemented to ensure a production-ready application:

1. XSS (Cross-Site Scripting) Prevention
Sanitization: All user inputs must be sanitized using DOMPurify before rendering.

Safe DOM Manipulation: Use of .textContent is mandatory over .innerHTML to prevent script injection.

CSP: A strict Content Security Policy is enforced via Helmet.js.

2. Database & Data Security
Firebase Security Rules: Granular server-side rules are implemented to prevent unauthorized NoSQL access.

Input Validation: All incoming requests are validated using Joi or Express-Validator.

Sensitive Data: Passwords must be hashed with Bcrypt (Salt rounds: 12) and never stored in plain text.

3. API & Authentication Security
JWT: Secure token-based authentication with expiration logic.

CSRF Protection: Anti-CSRF tokens and SameSite cookie attributes are utilized.

Error Handling: Generic error messages are returned to the client to avoid leaking stack traces or system logic.

🤖 AI Prompting Instructions
When generating or refactoring code for this project, follow these rules:

Security First: Never generate code with hardcoded credentials or insecure input handling.

Modular Design: Follow the Single Responsibility Principle (SRP). Every function should do one thing.

Firebase v9+: Use the Modular Firebase SDK syntax (Functional approach).

Clean Code: Prioritize readability, use descriptive naming conventions, and follow SOLID principles.

No Hallucinations: If a requirement is unclear or not mentioned in this README, ask for clarification instead of assuming.

📁 Project Structure & Workflow
/src/services: External API integrations (Firebase, AI).

/src/middleware: Security, Auth, and Validation logic.

/src/routes: API endpoint definitions.

/src/utils: Helper functions and shared logic.

/public: Static assets and frontend entry points.
import http from "http";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function loadDotEnv() {
  try {
    const envPath = path.join(__dirname, ".env");
    if (!fs.existsSync(envPath)) return;

    const raw = fs.readFileSync(envPath, "utf8");
    const lines = raw.split(/\r?\n/);
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const idx = trimmed.indexOf("=");
      if (idx <= 0) continue;

      const key = trimmed.slice(0, idx).trim();
      let val = trimmed.slice(idx + 1).trim();
      if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
        val = val.slice(1, -1);
      }
      if (!process.env[key]) process.env[key] = val;
    }
  } catch {
    // ignore
  }
}

loadDotEnv();

function sendJson(res, status, obj) {
  const body = JSON.stringify(obj);
  res.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  });
  res.end(body);
}

function sendText(res, status, text, contentType) {
  res.writeHead(status, {
    "Content-Type": (contentType || "text/plain") + "; charset=utf-8",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  });
  res.end(text);
}

function contentTypeFor(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  if (ext === ".html") return "text/html";
  if (ext === ".css") return "text/css";
  if (ext === ".js") return "application/javascript";
  if (ext === ".json") return "application/json";
  if (ext === ".svg") return "image/svg+xml";
  if (ext === ".png") return "image/png";
  if (ext === ".jpg" || ext === ".jpeg") return "image/jpeg";
  return "application/octet-stream";
}

async function readJsonBody(req) {
  return await new Promise((resolve, reject) => {
    let data = "";
    req.on("data", (chunk) => {
      data += chunk;
      if (data.length > 1_000_000) {
        reject(new Error("Request too large"));
        req.destroy();
      }
    });
    req.on("end", () => {
      if (!data) return resolve({});
      try {
        resolve(JSON.parse(data));
      } catch {
        reject(new Error("Invalid JSON"));
      }
    });
    req.on("error", reject);
  });
}

function requireApiKey() {
  const key = process.env.OPENAI_API_KEY;
  if (!key) {
    console.warn("OPENAI_API_KEY not set. Using MOCK data.");
    return null;
  }
  return key;
}

function requireFetch() {
  if (typeof globalThis.fetch !== "function") {
    const err = new Error("This server requires Node.js 18+ (global fetch). Please upgrade Node.");
    err.statusCode = 500;
    throw err;
  }
}

// MOCK DATA GENERATORS
function getMockData(endpoint) {
  if (endpoint === "ats") {
    return {
      total: 85,
      breakdown: { keywordScore: 90, formatScore: 80, seniorityFit: 85, domainFit: 85 },
      missingKeywords: ["Docker", "Kubernetes", "Redis", "System Design"],
      editSuggestions: [
        "Use more quantitative metrics in your work experience (e.g., 'Improved performance by 20%').",
        "Shorten your summary to 3-4 lines focusing on your main stack.",
        "Add a 'Projects' section to showcase your GitHub portfolio.",
        "Ensure your contact information is clearly visible at the top."
      ],
      skillGap: {
        summary: "You have a strong foundation but lack some DevOps and architectural skills.",
        courses: [
          { title: "Advanced Kubernetes Hands-on", why: "Critical for scaling applications.", impactPct: 20 },
          { title: "System Design Interview Prep", why: "Essential for senior roles.", impactPct: 15 }
        ],
        chanceIncreasePct: 35
      }
    };
  }
  if (endpoint === "salary") {
    return {
      min: 65000,
      max: 95000,
      expected: 82000,
      currency: "TRY",
      tactic: "Market Value Anchoring",
      answer: "Based on my research and experience level, the market average for this role is around 82,000 TRY. Considering my specific skills in [Skill], I aim for the upper end of this range.",
      notes: [
        "The market for this role is currently competitive.",
        "Remote work options may influence the base salary."
      ]
    };
  }
  if (endpoint === "networking") {
    return {
      personas: [
        { title: "Senior Engineering Manager", why: "Decision maker for hiring." },
        { title: "Lead Developer", why: "Can refer you internally." },
        { title: "Talent Acquisition Specialist", why: "Filters initial candidates." }
      ],
      messages: [
        {
          title: "Direct Approach",
          text: "Merhaba [Ad], [Şirket]'teki çalışmalarınızı takip ediyorum. Özellikle [Proje] konusundaki yaklaşımınız çok etkileyici. Ben de benzer teknolojilerle çalışıyorum ve ekibinizdeki açık pozisyonla ilgileniyorum. Bir kahve eşliğinde tecrübelerimizi konuşmak isterim."
        },
        {
          title: "Advice Seeking",
          text: "Selam [Ad], [Alan] alanındaki kariyer yolculuğunuz bana ilham veriyor. Sektöre yeni bakış açıları getiren projeleriniz var. Müsait bir zamanınızda kariyer tavsiyelerinizi dinlemeyi çok isterim."
        }
      ]
    };
  }
  if (endpoint === "portfolio") {
    return {
      score: 78,
      wins: ["Clean layout", "Good use of projects", "Clear contact info", "Mobile responsive"],
      issues: ["Lack of case studies", "GitHub link is broken on some pages", "Need more distinct personal branding"],
      nextActions: [
        "Fix the GitHub link in the footer.",
        "Add a detailed case study for your main project.",
        "Add a blog section to demonstrate thought leadership.",
        "Improve accessibility scores (contrast, aria-labels)."
      ]
    };
  }
  return {};
}

async function callOpenAIJson({ system, user, schemaHint }) {
  requireFetch();
  const apiKey = requireApiKey();

  // MOCK MODE
  if (!apiKey) {
    // We can't know the exact endpoint here easily without passing it,
    // but the caller logic is standardized.
    // However, to keep it simple, let's just return null here and handle it in handleApi
    // OR, better yet, requireApiKey returns null, we check it here?
    // Actually, let's throw a specific error or handle it upstack.
    // simpler: handleApi checks the key presence or we pass a flag.
    // Let's just return a special object that callers won't mistake?
    // No, callOpenAIJson is generic.
    // Let's refactor handleApi to assume if callOpenAIJson returns null/undefined it might be mock?
    // Better strategy: update handleApi to check apiKey first.
    return null; // Signal to caller to use mock
  }

  const model = process.env.OPENAI_MODEL || "gpt-4o-mini";

  const messages = [
    {
      role: "system",
      content:
        system +
        "\n\nReturn ONLY valid JSON. Do not wrap in markdown. Do not include explanations. " +
        (schemaHint ? `JSON schema (hint): ${schemaHint}` : ""),
    },
    { role: "user", content: user },
  ];

  const resp = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages,
      temperature: 0.3,
      response_format: { type: "json_object" },
    }),
  });

  if (!resp.ok) {
    const text = await resp.text().catch(() => "");
    const err = new Error(`OpenAI error: ${resp.status} ${resp.statusText} ${text}`);
    err.statusCode = 502;
    throw err;
  }

  const data = await resp.json();
  const content = data?.choices?.[0]?.message?.content;
  if (!content) {
    const err = new Error("OpenAI returned empty content.");
    err.statusCode = 502;
    throw err;
  }

  try {
    return JSON.parse(content);
  } catch {
    const err = new Error("Model output was not valid JSON.");
    err.statusCode = 502;
    throw err;
  }
}


function requireGeminiApiKey() {
  const key = process.env.GEMINI_API_KEY;
  if (!key) {
    console.warn("GEMINI_API_KEY not set.");
    return null;
  }
  return key;
}

async function callGeminiJson({ prompt, schemaHint }) {
  requireFetch();
  const apiKey = requireGeminiApiKey();

  // MOCK MODE if no key
  if (!apiKey) {
    return null;
  }

  const model = process.env.GEMINI_MODEL || "gemini-3-flash-preview";
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

  const finalPrompt = prompt + (schemaHint ? `\n\nReturn valid JSON matching this schema: ${schemaHint}\nRETURN ONLY JSON.` : "");

  const resp = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{
        parts: [{ text: finalPrompt }]
      }],
      generationConfig: {
        responseMimeType: "application/json"
      }
    }),
  });

  if (!resp.ok) {
    const text = await resp.text().catch(() => "");
    const err = new Error(`Gemini error: ${resp.status} ${resp.statusText} ${text}`);
    err.statusCode = 502;
    throw err;
  }

  const data = await resp.json();
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;

  if (!text) {
    throw new Error("Gemini returned empty content.");
  }

  // Clean markdown code blocks (```json ... ```)
  const cleanText = text.replace(/```json/g, "").replace(/```/g, "").trim();

  try {
    return JSON.parse(cleanText);
  } catch (err) {
    console.error("Gemini Parse Error. Text received:", text);
    throw new Error("Gemini output was not valid JSON.");
  }
}

async function handleApi(req, res) {

  const url = new URL(req.url, `http://${req.headers.host}`);

  if (url.pathname === "/health" && req.method === "GET") {
    return sendJson(res, 200, { ok: true });
  }

  if (!url.pathname.startsWith("/api/")) return false;
  if (req.method === "OPTIONS") {
    sendText(res, 204, "", "text/plain");
    return true;
  }

  if (req.method !== "POST") {
    sendJson(res, 405, { ok: false, error: "Method not allowed" });
    return true;
  }

  const body = await readJsonBody(req);

  // Check for API Key ONCE here to decide on Mock vs Real
  // Check for API Key ONCE here to decide on Mock vs Real
  const apiKey = requireGeminiApiKey();
  const useMock = !apiKey;

  try {
    if (url.pathname === "/api/ats") {
      if (useMock) {
        await new Promise(r => setTimeout(r, 1000)); // Fake delay
        sendJson(res, 200, getMockData("ats"));
        return true;
      }
      const { cvText, jdText, targetRole, targetCity } = body || {};
      const system =
        "You are an expert ATS and recruiting analyst. You score CV-to-job match rigorously and give actionable edits.";
      const schemaHint =
        '{"total":number,"breakdown":{"keywordScore":number,"formatScore":number,"seniorityFit":number,"domainFit":number},"missingKeywords":string[],"editSuggestions":string[],"skillGap":{"summary":string,"courses":[{"title":string,"why":string,"impactPct":number}],"chanceIncreasePct":number}}';
      const user =
        `Analyze CV vs Job Description. Output in Turkish.\n\n` +
        `Target role: ${targetRole || ""}\n` +
        `City: ${targetCity || ""}\n\n` +
        `CV:\n${cvText || ""}\n\n` +
        `Job Description:\n${jdText || ""}\n\n` +
        `Rules:\n` +
        `- total must be 0-100\n` +
        `- missingKeywords: list the most important missing hard/soft skills and tools, max 18\n` +
        `- editSuggestions: max 5, concrete\n` +
        `- courses: exactly 2 items; impactPct each 5-35\n` +
        `- chanceIncreasePct: 10-60 (your estimate)`;

      const prompt = `System: ${system}\n\nUser: ${user}`;
      const out = await callGeminiJson({ prompt, schemaHint });
      sendJson(res, 200, out);
      return true;
    }

    if (url.pathname === "/api/salary") {
      if (useMock) {
        await new Promise(r => setTimeout(r, 1000));
        sendJson(res, 200, getMockData("salary"));
        return true;
      }
      const { role, city, years, skills, workMode } = body || {};
      const system =
        "You are a compensation analyst and salary negotiation coach. You propose a realistic range and a tailored negotiation answer.";
      const schemaHint =
        '{"min":number,"max":number,"expected":number,"currency":"TRY","tactic":string,"answer":string,"notes":string[]}';
      const user =
        `Compute Turkey market salary for: role=${role || ""}, city=${city || ""}, years=${years ?? ""}, workMode=${workMode || ""}.\n` +
        `Skills: ${(Array.isArray(skills) ? skills : []).join(", ")}\n\n` +
        `Return monthly gross TRY band. Provide negotiation tactic and a ready-to-say answer in Turkish.`;

      const prompt = `System: ${system}\n\nUser: ${user}`;
      const out = await callGeminiJson({ prompt, schemaHint });
      sendJson(res, 200, out);
      return true;
    }

    if (url.pathname === "/api/networking") {
      if (useMock) {
        await new Promise(r => setTimeout(r, 1000));
        sendJson(res, 200, getMockData("networking"));
        return true;
      }
      const { company, role, profile } = body || {};
      const system =
        "You are a career networking strategist. You suggest who to contact and draft high-quality cold messages.";
      const schemaHint = '{"personas":[{"title":string,"why":string}],"messages":[{"title":string,"text":string}]}';
      const user =
        `Target company: ${company || ""}\nTarget role: ${role || ""}\nProfile: ${profile || ""}\n\n` +
        `Return 3 personas and 2 cold messages in Turkish. Messages must be short, polite and specific.`;

      const prompt = `System: ${system}\n\nUser: ${user}`;
      const out = await callGeminiJson({ prompt, schemaHint });
      sendJson(res, 200, out);
      return true;
    }

    async function callGeminiForGitHub({ htmlContent, readmeContent }) {
      requireFetch();
      const apiKey = requireGeminiApiKey();
      if (!apiKey) {
        throw new Error("Gemini API Key is missing. Please check .env file.");
      }

      // STRICTLY USE GEMINI 3 FLASH PREVIEW AS REQUESTED
      const model = "gemini-3-flash-preview";
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

      const prompt = `
  Analyze this raw HTML content of a GitHub profile.
  
  CRITICAL INSTRUCTIONS:
  1. **DEFINITION OF 'BIO':** For this analysis, "Bio" = **Sidebar Biography** + **Profile README** (the main content area usually under "Pinned").
  2. **Look Deeper:** You MUST search the entire HTML for "Programming Languages", "Tech Stack", "Tools", or icon/image alts like "Python", "React", "Java".
  3. **Specific Rule:** If you see a section titled "Programming Languages" or similar in the HTML (even if deep down), **YOU MUST NOT SAY** technical skills are missing.
  4. **Evidence-Based Scoring:** Score based on 10 criteria. Tech stack in README counts as Tech stack in Bio.
  5. **No Hallucinations:** If you don't see a License badge, say it's missing.

  EVALUATION RUBRIC (Total 100 + BONUS):
  
  1. **CONTRIBUTION ACTIVITY (30 Points):**
     - 1000+ contributions: 30 pts.
     - 500-999 contributions: 20-29 pts.
     - <100 contributions: 0-9 pts.
     
  2. **CORE QUALITY (50 Points):**
     - README, Code Quality, Structure, Docs, License, Tests, CI/CD, Professionalism. (5 pts each)
     
  3. **VOLUME & DIVERSITY BOOSTERS (20 Points + Potential Overfill):**
     - **High Repo Count:** >15 public repos (+5 pts).
     - **Tech Stack Diversity:** Knows 5+ distinct languages/frameworks (Python, JS, Rust, React, AWS etc.) (+5 pts).
     - **Achievements:** Has GitHub Achievements badges (Arctic Code Vault, Pull Shark, YOLO etc.) (+5 pts).
     - **Tooling:** Uses specific tools like Docker, K8s, Terraform (+5 pts).

  **SCORING RULE:** If the user has high activity (1000+ contribs) AND diverse stack AND achievements, the score should be VERY HIGH (90-100). Do not be stingy for power users.

  **GOD MODE RULE:** If the user has **>50 Repositories** OR **>1000 Followers** OR **>2000 Contributions**:
  - The score MUST be between **95 and 100**.
  - Ignore minor missing details like "License missing in one repo" or "No bio text". The volume of work speaks for itself.
  - Strengths must highlight "Industry Leader / Elite Profile".

  HTML Content (truncated):
  ${htmlContent.slice(0, 150000)}

  ---
  DETECTED PROFILE README CONTENT (MARKDOWN):
  ${readmeContent ? readmeContent.slice(0, 20000) : "Not found or empty."}
  ---
  
  CRITICAL: If the section above contains the README, USE IT to determine Tech Stack, Documentation, and Overview. Do not say it's missing if it's right there!

  Return JSON (Turkish):
  {
    "score": number,
    "strengths": ["string"],
    "weaknesses": ["string"],
    "suggestions": ["string"]
  }
  RETURN ONLY JSON.`;

      const resp = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { responseMimeType: "application/json" }
        }),
      });

      if (!resp.ok) {
        const text = await resp.text();
        throw new Error(`Gemini 3.0 Error: ${resp.status} - ${text}`);
      }

      const data = await resp.json();
      const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!text) throw new Error("Empty response from Gemini 3.0");

      const cleanText = text.replace(/```json/g, "").replace(/```/g, "").trim();
      return JSON.parse(cleanText);
    }

    // ... inside handleApi ...

    if (url.pathname === "/api/portfolio") {
      const { github } = body || {};

      if (!github) {
        sendJson(res, 400, { ok: false, error: "GitHub link required" });
        return true;
      }

      // Extract Username
      let username = "";
      try {
        const u = new URL(github);
        const parts = u.pathname.split("/").filter(Boolean);
        if (parts.length > 0) username = parts[0];
      } catch (e) {
        // ignore
      }

      // Fetch GitHub Profile and Raw README
      try {
        const headers = {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
        };

        const ghResp = await fetch(github, { headers });
        if (!ghResp.ok) {
          throw new Error(`GitHub profile not found or private (${ghResp.status})`);
        }
        const htmlContent = await ghResp.text();

        // Try fetching Raw Profile README (main or master)
        let readmeContent = "";
        if (username) {
          console.log(`[DEBUG] Target Username: ${username}`);
          const branches = ["main", "master"];
          for (const branch of branches) {
            const rawUrl = `https://raw.githubusercontent.com/${username}/${username}/${branch}/README.md`;
            console.log(`[DEBUG] Trying Raw URL: ${rawUrl}`);
            const rawResp = await fetch(rawUrl);
            console.log(`[DEBUG] Resp Status: ${rawResp.status}`);
            if (rawResp.ok) {
              readmeContent = await rawResp.text();
              console.log(`[DEBUG] README Found! Length: ${readmeContent.length}`);
              break;
            }
          }
        } else {
          console.log(`[DEBUG] Could not extract username from ${github}`);
        }

        // Analyze with Gemini 3.0
        const out = await callGeminiForGitHub({ htmlContent, readmeContent });
        sendJson(res, 200, out);

      } catch (err) {
        console.error("GitHub Analysis Error:", err);
        sendJson(res, 500, { ok: false, error: err.message });
      }
      return true;
    }


    if (url.pathname === "/api/interview/ask") {
      const { role } = body || {};
      const prompt = `You are a technical interviewer. Generate a challenging but fair interview question for the role: "${role || 'Software Engineer'}". 
      The question should be conceptual or scenario-based. 
      IMPORTANT: The generated question MUST BE IN TURKISH LANGUAGE.
      Output valid JSON.`;

      const schemaHint = '{"question": "string"}';

      try {
        const out = await callGeminiJson({ prompt, schemaHint });
        sendJson(res, 200, { ...out, sessionId: Date.now().toString() });
      } catch (err) {
        // Fallback if Gemini fails or no key
        console.error("Gemini Interview Ask Error:", err);
        sendJson(res, 200, {
          question: `(HATA: ${err.message}) Fallback mode: ${role} pozisyonu için React'te 'useEffect' hook'unun kullanım amaçlarını ve dependency array'in önemini açıklayınız.`,
          sessionId: "mock-session"
        });
      }
      return true;
    }

    if (url.pathname === "/api/interview/evaluate") {
      const { role, question, answer } = body || {};

      const prompt = `Role: ${role}\nQuestion: ${question}\nCandidate Answer: ${answer}\n\nEvaluate the answer. Give a score (0-100), list strengths and weaknesses, and provide an ideal concise answer. Output valid JSON. Output Language: Turkish.`;

      const schemaHint = '{"score": number, "strengths": ["string"], "weaknesses": ["string"], "idealAnswer": "string"}';

      try {
        const out = await callGeminiJson({ prompt, schemaHint });
        sendJson(res, 200, out);
      } catch (err) {
        console.error("Gemini Interview Eval Error:", err);
        sendJson(res, 200, {
          score: 75,
          strengths: ["Net ifade (Fallback)", "Temel kavramlar doğru"],
          weaknesses: ["Daha derin teknik detay verilebilir (Fallback)"],
          idealAnswer: "Bu bir fallback cevabıdır. API anahtarı eksik veya hata oluştu."
        });
      }
      return true;
    }

    if (url.pathname === "/api/burnout") {
      const { satisfaction, stress, growth, note, history } = body || {};

      const prompt = `You are a compassionate Career Coach and Burnout Specialist.
      Analyze the user's latest check-in:
      - Job Satisfaction: ${satisfaction}/10
      - Stress Level: ${stress}/10
      - Growth/Learning: ${growth}/10
      - User Note: "${note || ''}"
      - Recent History (last 3 entries): ${JSON.stringify(history || [])}
      
      Provide a helpful, empathetic, and actionable feedback in Turkish.
      
      CRITICAL INSTRUCTIONS:
      1. **Be Detailed:** Do not write just one sentence. Write a substantial paragraph (4-6 sentences) analyzing their situation.
      2. **Be Specific:** Reference their exact scores and note. For example, "Stres seviyen 9 olduğu için..." or "Notunda belirttiğin proje teslimi..."
      3. **Actionable:** Give concrete advice (e.g., "Take a walk," "Talk to manager," "Focus on one task").
      
      Determine a status: 'good' (healthy), 'warn' (caution), 'danger' (high risk).
      
      Return JSON:
      {
        "text": "Your detailed advice here...",
        "status": "good" | "warn" | "danger"
      }
      RETURN ONLY JSON.`;

      const schemaHint = '{"text": "string", "status": "string"}';
      const out = await callGeminiJson({ prompt, schemaHint });
      sendJson(res, 200, out);
      return true;
    }

    sendJson(res, 404, { ok: false, error: "Not found" });
    return true;
  } catch (err) {
    const status = err?.statusCode || 500;
    sendJson(res, status, { ok: false, error: String(err?.message || err) });
    return true;
  }
}
function serveStatic(req, res) {
  const url = new URL(req.url, `http://${req.headers.host}`);
  let pathname = decodeURIComponent(url.pathname);
  if (pathname === "/") pathname = "/index.html";

  // Server is in /public/a, but static files are in /public (one level up)
  const resolved = path.resolve(__dirname, "..", "." + pathname);
  // Allow serving files from the 'public' directory (parent of 'public/a')
  const publicDir = path.resolve(__dirname, "..");
  if (!resolved.startsWith(publicDir)) {
    sendText(res, 403, "Forbidden");
    return;
  }

  fs.readFile(resolved, (err, data) => {
    if (err) {
      sendText(res, 404, "Not found");
      return;
    }
    res.writeHead(200, {
      "Content-Type": contentTypeFor(resolved) + "; charset=utf-8",
      "Access-Control-Allow-Origin": "*",
    });
    res.end(data);
  });
}

const port = Number(process.env.PORT || 5174);
const server = http.createServer(async (req, res) => {
  try {
    const handled = await handleApi(req, res);
    if (handled) return;
    serveStatic(req, res);
  } catch (err) {
    sendJson(res, 500, { ok: false, error: String(err?.message || err) });
  }
});

server.listen(port, () => {
  console.log(`CareerFlow server running on http://localhost:${port}`);
  const geminiKey = process.env.GEMINI_API_KEY;
  if (geminiKey) {
    console.log("✅ Gemini API Key detected.");
  } else {
    console.log("❌ Gemini API Key NOT detected. Please check .env file.");
  }
});

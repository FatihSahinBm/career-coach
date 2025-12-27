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
        for (const line of raw.split(/\r?\n/)) {
            const trimmed = line.trim();
            if (!trimmed || trimmed.startsWith("#")) continue;
            const [key, ...vals] = trimmed.split("=");
            if (key && vals.length) process.env[key.trim()] = vals.join("=").trim();
        }
    } catch (e) {
        console.error("Error loading .env", e);
    }
}

loadDotEnv();

const key = process.env.GEMINI_API_KEY;
if (!key) {
    console.error("No GEMINI_API_KEY found in .env");
    process.exit(1);
}

async function listModels() {
    const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${key}`;
    try {
        const resp = await fetch(url);
        if (!resp.ok) {
            console.error("Error fetching models:", await resp.text());
            return;
        }
        const data = await resp.json();
        console.log("Available Models:");
        (data.models || []).forEach(m => {
            // Filter for generateContent supported models
            if (m.supportedGenerationMethods.includes("generateContent")) {
                console.log(`- ${m.name} (${m.displayName})`);
            }
        });
    } catch (err) {
        console.error("Exception:", err);
    }
}

listModels();

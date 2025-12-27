/* =========================================
   UTILS & SHARED CONSTANTS
   ========================================= */

const TAB_IDS = ["ats", "salary", "networking", "portfolio", "burnout", "interview"];

const STOP_WORDS = new Set([
    "ve",
    "ile",
    "için",
    "da",
    "de",
    "bir",
    "the",
    "a",
    "an",
    "to",
    "of",
    "in",
    "on",
    "for",
    "is",
    "are",
    "as",
    "at",
    "by",
    "or",
    "you",
    "your",
    "we",
    "our",
    "this",
    "that",
    "it",
    "with",
]);

const CANONICAL_REPLACEMENTS = [
    { re: /\bci\s*\/\s*cd\b/gi, val: "ci/cd" },
    { re: /\bcicd\b/gi, val: "ci/cd" },
    { re: /\bnext\s*\.?\s*js\b/gi, val: "next.js" },
    { re: /\bnode\s*\.?\s*js\b/gi, val: "node.js" },
    { re: /\btailwind\s*css\b/gi, val: "tailwindcss" },
    { re: /\btailwind\b/gi, val: "tailwindcss" },
    { re: /\bpower\s*bi\b/gi, val: "powerbi" },
    { re: /\bpostgre\s*sql\b/gi, val: "postgresql" },
    { re: /\bjava\s*script\b/gi, val: "javascript" },
    { re: /\btype\s*script\b/gi, val: "typescript" },
    { re: /\breact\s*js\b/gi, val: "react" },
];

const AI_SERVER_ORIGIN = "http://localhost:5174";

function $(id) {
    return document.getElementById(id);
}

function escapeHtml(str) {
    return String(str)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}

function clamp(n, min, max) {
    return Math.max(min, Math.min(max, n));
}

function canonicalizeRaw(text) {
    let t = String(text || "").replace(/\r\n/g, "\n");
    for (const r of CANONICAL_REPLACEMENTS) {
        t = t.replace(r.re, r.val);
    }
    return t;
}

function formatKeywordDisplay(token) {
    return String(token || "").replaceAll("_", " ");
}

function apiBase() {
    try {
        if (window?.location?.origin === AI_SERVER_ORIGIN) return "";
        if (window?.location?.port === "5174") return "";
    } catch {
        // ignore
    }
    return AI_SERVER_ORIGIN;
}

async function apiPostJson(path, body) {
    const base = apiBase();
    const resp = await fetch(base + path, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body || {}),
    });

    const data = await resp.json().catch(() => null);
    if (!resp.ok || !data || data.ok === false) {
        const msg = data?.error || `${resp.status} ${resp.statusText}`;
        throw new Error(msg);
    }
    return data;
}

function setBusy(buttonEl, busy, busyText) {
    if (!buttonEl) return;
    if (!buttonEl.dataset.originalText) {
        buttonEl.dataset.originalText = buttonEl.textContent || "";
    }
    buttonEl.disabled = Boolean(busy);
    buttonEl.textContent = busy ? busyText || "Yükleniyor..." : buttonEl.dataset.originalText;
}

function normalizeText(text) {
    return canonicalizeRaw(text)
        .toLowerCase()
        .replace(/[^a-z0-9ığüşöç\s\+\#\-\.\/]/gi, " ")
        .replace(/\s+/g, " ")
        .trim();
}

function tokenize(text) {
    const t = normalizeText(text);
    if (!t) return [];
    return t.split(" ").filter(Boolean);
}

function makeNgrams(tokens, n) {
    if (!Array.isArray(tokens) || tokens.length < n) return [];
    const res = [];
    for (let i = 0; i <= tokens.length - n; i++) {
        const parts = tokens.slice(i, i + n);
        if (parts.some((p) => p.length < 3 || STOP_WORDS.has(p))) continue;
        res.push(parts.join("_"));
    }
    return res;
}

function unique(arr) {
    return Array.from(new Set(arr));
}

function countOccurrences(tokens) {
    const map = new Map();
    for (const tok of tokens) {
        map.set(tok, (map.get(tok) || 0) + 1);
    }
    return map;
}

function scoreLabel(score) {
    if (score >= 80) return { label: "Güçlü", tone: "good" };
    if (score >= 60) return { label: "Orta", tone: "warn" };
    return { label: "Zayıf", tone: "bad" };
}

function renderChips(container, words, tone) {
    container.innerHTML = "";
    if (!words || words.length === 0) {
        container.innerHTML = `<div class="muted">—</div>`;
        return;
    }

    for (const w of words) {
        const el = document.createElement("span");
        el.className = `chip ${tone ? `chip--${tone}` : ""}`.trim();
        el.textContent = formatKeywordDisplay(w);
        container.appendChild(el);
    }
}

function setListItems(ol, items) {
    ol.innerHTML = "";
    if (!items || items.length === 0) {
        ol.innerHTML = `<li class="muted">—</li>`;
        return;
    }

    for (const it of items) {
        const li = document.createElement("li");
        li.textContent = it;
        ol.appendChild(li);
    }
}

function bindFormPersistence({ key, fields }) {
    try {
        const raw = localStorage.getItem(key);
        if (raw) {
            const data = JSON.parse(raw);
            for (const f of fields) {
                const el = $(f);
                if (!el) continue;
                if (typeof data?.[f] === "string" || typeof data?.[f] === "number") {
                    el.value = String(data[f]);
                }
            }
        }
    } catch {
        // ignore
    }

    const save = () => {
        const data = {};
        for (const f of fields) {
            const el = $(f);
            if (!el) continue;
            data[f] = el.value;
        }
        localStorage.setItem(key, JSON.stringify(data));
    };

    for (const f of fields) {
        const el = $(f);
        if (!el) continue;
        el.addEventListener("input", save);
        el.addEventListener("change", save);
    }
}

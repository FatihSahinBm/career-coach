/* =========================================
   ATS & ANALIZ MODÜLÜ
   ========================================= */

function detectProfession(cvText) {
    const techKeywords = [
        'developer', 'engineer', 'software', 'programc', 'yazılım', 'geliştirici', 'mühendis',
        'frontend', 'backend', 'full stack', 'fullstack', 'full-stack',
        'mobile', 'android', 'ios', 'react', 'angular', 'vue', 'svelte',
        'node', 'java', 'python', 'javascript', 'typescript', 'php', 'ruby', 'golang', 'rust',
        'devops', 'cloud', 'aws', 'azure', 'gcp', 'kubernetes', 'docker',
        'data engineer', 'ml engineer', 'machine learning', 'ai', 'yapay zeka',
        'qa', 'test', 'sdet', 'automation',
        'web developer', 'app developer', 'uygulamazgeliştir'
    ];

    const lowerCV = cvText.toLowerCase();
    return techKeywords.some(keyword => lowerCV.includes(keyword));
}

function detectTechStack(cvText) {
    const technologies = {
        frontend: ['react', 'vue', 'angular', 'next.js', 'nextjs', 'svelte', 'html', 'css', 'sass', 'tailwind', 'bootstrap', 'javascript', 'typescript', 'webpack', 'vite'],
        backend: ['node.js', 'nodejs', 'express', 'django', 'flask', 'spring', 'asp.net', 'laravel', 'rails', 'fastapi', 'nest.js'],
        mobile: ['react native', 'flutter', 'swift', 'kotlin', 'android', 'ios', 'xamarin'],
        database: ['mongodb', 'postgresql', 'mysql', 'redis', 'sql', 'dynamodb', 'cassandra', 'elasticsearch'],
        devops: ['docker', 'kubernetes', 'aws', 'azure', 'gcp', 'jenkins', 'gitlab', 'github actions', 'terraform', 'ansible', 'ci/cd'],
        languages: ['javascript', 'typescript', 'python', 'java', 'c#', 'go', 'rust', 'php', 'ruby', 'kotlin', 'swift']
    };

    const found = {};
    const lowerCV = cvText.toLowerCase();

    for (let [category, keywords] of Object.entries(technologies)) {
        found[category] = keywords.filter(tech => lowerCV.includes(tech));
    }

    return found;
}

function detectExperienceLevel(cvText) {
    const lowerCV = cvText.toLowerCase();

    // Yıl tespiti (örn: "3 yıl deneyim", "5 years experience", "3+ yıl")
    const yearMatches = [
        lowerCV.match(/(\d+)\+?\s*(yıl|year)/),
        lowerCV.match(/(\d+)\+?\s*yıllık/),
        lowerCV.match(/(\d+)\+?\s*yrs/)
    ].filter(Boolean);

    const years = yearMatches.length > 0 ? parseInt(yearMatches[0][1]) : 0;

    // Seviye kelimeleri
    if (lowerCV.includes('senior') || lowerCV.includes('lead') || lowerCV.includes('kıdemli') || years >= 5) {
        return { level: 'senior', years };
    } else if (lowerCV.includes('mid') || lowerCV.includes('orta') || lowerCV.includes('intermediate') || years >= 2) {
        return { level: 'mid', years };
    } else {
        return { level: 'junior', years };
    }
}

function generateTechSuggestions(techStack, experienceInfo) {
    const suggestions = [];
    const { level } = experienceInfo;

    // Frontend geliştiriciler için
    if (techStack.frontend.length > 0) {
        if (!techStack.frontend.includes('typescript')) {
            suggestions.push("TypeScript öğren - modern frontend development için kritik");
        }
        if (techStack.frontend.includes('react') && !techStack.frontend.includes('next.js') && !techStack.frontend.includes('nextjs')) {
            suggestions.push("Next.js ile full-stack yeteneklerini güçlendir");
        }
        if (!techStack.frontend.some(t => ['tailwind', 'sass', 'bootstrap'].includes(t))) {
            suggestions.push("Modern CSS framework ekle (TailwindCSS önerilir)");
        }
    }

    // Backend geliştiriciler için
    if (techStack.backend.length > 0) {
        if (techStack.database.length === 0) {
            suggestions.push("Database yetkinliği ekle (PostgreSQL veya MongoDB öner)");
        }
        if (level !== 'junior' && !techStack.backend.some(t => t.includes('nest') || t.includes('spring'))) {
            suggestions.push("Enterprise framework öğren (NestJS veya Spring Boot)");
        }
    }

    // DevOps eksikliği
    if (techStack.devops.length === 0 && level !== 'junior') {
        suggestions.push("Docker/Kubernetes gibi DevOps araçları öğren - modern development için şart");
    }

    // Database eksikliği
    if (techStack.database.length === 0 && (techStack.backend.length > 0 || techStack.frontend.length > 0)) {
        suggestions.push("SQL ve NoSQL database deneyimi ekle");
    }

    // Cloud eksikliği
    if (!techStack.devops.some(t => ['aws', 'azure', 'gcp'].includes(t)) && level === 'senior') {
        suggestions.push("Cloud platform deneyimi ekle (AWS, Azure veya GCP)");
    }

    return suggestions.slice(0, 5); // En fazla 5 öneri
}

function computeKeywordOverlap(cvText, jdText) {
    const cvUni = tokenize(cvText);
    const jdUni = tokenize(jdText);

    const cvTokens = cvUni.concat(makeNgrams(cvUni, 2));
    const jdTokens = jdUni.concat(makeNgrams(jdUni, 2));

    const cvCounts = countOccurrences(cvTokens);
    const jdCounts = countOccurrences(jdTokens);

    const jdUnique = unique(jdTokens);
    const cvUnique = unique(cvTokens);

    const jdKeywords = jdUnique
        .filter((w) => w.length >= 3)
        .filter((w) => !STOP_WORDS.has(w));

    const common = [];
    const missing = [];

    for (const kw of jdKeywords) {
        if (cvCounts.has(kw)) common.push(kw);
        else missing.push(kw);
    }

    const coverage = jdKeywords.length === 0 ? 0 : common.length / jdKeywords.length;

    const missingWeighted = missing
        .map((kw) => ({ kw, weight: jdCounts.get(kw) || 1 }))
        .sort((a, b) => b.weight - a.weight)
        .slice(0, 18)
        .map((x) => x.kw);

    const commonWeighted = common
        .map((kw) => ({ kw, weight: jdCounts.get(kw) || 1 }))
        .sort((a, b) => b.weight - a.weight)
        .slice(0, 18)
        .map((x) => x.kw);

    return {
        coverage,
        jdKeywordCount: jdKeywords.length,
        commonWeighted,
        missingWeighted,
        cvUniqueCount: cvUnique.length,
    };
}

function computeFormatScore(cvText) {
    const raw = String(cvText || "");
    const t = normalizeText(raw);

    if (!t) return { score: 0, reasons: ["CV metni boş."] };

    const reasons = [];
    let score = 100;

    const lines = raw.split(/\n/);
    const veryLongLines = lines.filter((l) => l.length > 160).length;
    if (veryLongLines >= 3) {
        score -= 12;
        reasons.push("Çok uzun satırlar var (ATS okunabilirliği düşebilir).");
    }

    const hasExperience = /deneyim|experience|work history|employment/i.test(raw);
    const hasEducation = /eğitim|education/i.test(raw);
    const hasSkills = /beceri|skills|yetenek/i.test(raw);
    if (!hasExperience) {
        score -= 8;
        reasons.push("Deneyim bölümü başlığı net değil.");
    }
    if (!hasEducation) {
        score -= 6;
        reasons.push("Eğitim bölümü başlığı net değil.");
    }
    if (!hasSkills) {
        score -= 10;
        reasons.push("Beceriler/Skills bölümü başlığı net değil.");
    }

    const hasEmail = /[\w._%+-]+@[\w.-]+\.[A-Za-z]{2,}/.test(raw);
    const hasPhone = /(\+?\d[\d\s()\-]{7,})/.test(raw);
    if (!hasEmail) {
        score -= 10;
        reasons.push("E-posta adresi bulunamadı.");
    }
    if (!hasPhone) {
        score -= 6;
        reasons.push("Telefon numarası bulunamadı.");
    }

    score = clamp(score, 0, 100);
    return { score, reasons };
}

function computeAtsScore({ cvText, jdText }) {
    const overlap = computeKeywordOverlap(cvText, jdText);
    const format = computeFormatScore(cvText);

    // Compose: 70% keyword match + 30% formatting
    const keywordScore = clamp(Math.round(overlap.coverage * 100), 0, 100);
    const formatScore = format.score;
    const total = clamp(Math.round(keywordScore * 0.7 + formatScore * 0.3), 0, 100);

    const breakdown = {
        keywordScore,
        formatScore,
        jdKeywordCount: overlap.jdKeywordCount,
        cvUniqueCount: overlap.cvUniqueCount,
    };

    return {
        total,
        breakdown,
        missingKeywords: overlap.missingWeighted,
        commonKeywords: overlap.commonWeighted,
        formatReasons: format.reasons,
    };
}

function buildEditSuggestions({ missingKeywords, formatReasons }) {
    const suggestions = [];

    if (missingKeywords && missingKeywords.length > 0) {
        const top = missingKeywords.slice(0, 5);
        suggestions.push(`İlanda geçen kritik terimleri CV’de birebir geçir: ${top.map(formatKeywordDisplay).join(", ")}.`);
    }

    for (const r of formatReasons.slice(0, 3)) {
        suggestions.push(r);
    }

    suggestions.push("Başarılarını ölçülebilir hale getir (örn: % artış, süre, kullanıcı sayısı). ");
    suggestions.push("İlan diline uygun başlıklar kullan: Experience / Education / Skills.");

    return unique(suggestions).slice(0, 5);
}

function buildSkillGap({ missingKeywords, targetRole }) {
    const missing = (missingKeywords || []).slice(0, 8);
    const role = targetRole || "hedef rol";

    if (missing.length === 0) {
        return {
            summary: "Bu ilana göre kritik anahtar kelimeler açısından iyi durumdasın.",
            courses: [
                { title: `(${role}) Mülakat Hazırlık: STAR tekniği`, impact: 15 },
                { title: `(${role}) Sistematik CV iyileştirme ve proje anlatımı`, impact: 12 },
            ],
        };
    }

    // Very simple heuristic: propose 2 course clusters based on missing terms
    const cluster1 = missing.slice(0, 4).map(formatKeywordDisplay).join(", ");
    const cluster2 = missing.slice(4, 8).map(formatKeywordDisplay).join(", ");

    const base = 18;
    const extra = clamp(missing.length * 3, 10, 28);

    return {
        summary: `Skill gap tespiti: ${role} için ilanda geçen bazı terimler CV’de zayıf görünüyor.`,
        courses: [
            { title: `Kurs 1: ${cluster1 || "Çekirdek teknik beceriler"} (temel + pratik)`, impact: base + Math.round(extra * 0.6) },
            { title: `Kurs 2: ${cluster2 || "İleri seviye araçlar"} (proje odaklı)`, impact: base + Math.round(extra * 0.4) },
        ],
    };
}

function buildAtsReport({ total, breakdown, missingKeywords, formatReasons }, targetRole) {
    const badge = scoreLabel(total);

    $("atsScore").textContent = `${total}/100`;
    const badgeEl = $("scoreBadge");
    badgeEl.textContent = badge.label;
    badgeEl.style.borderColor =
        badge.tone === "good" ? "rgba(34,197,94,0.35)" : badge.tone === "warn" ? "rgba(245,158,11,0.35)" : "rgba(239,68,68,0.35)";
    badgeEl.style.background =
        badge.tone === "good" ? "rgba(34,197,94,0.10)" : badge.tone === "warn" ? "rgba(245,158,11,0.10)" : "rgba(239,68,68,0.10)";

    const bar = $("scoreBar");
    bar.style.width = `${total}%`;

    const breakdownEl = $("scoreBreakdown");
    breakdownEl.innerHTML =
        `Anahtar kelime: <b>${breakdown.keywordScore}</b>/100 · ` +
        `Format/ATS okunabilirliği: <b>${breakdown.formatScore}</b>/100 · ` +
        `İlan terimi: <b>${breakdown.jdKeywordCount}</b> · CV kelime çeşitliliği: <b>${breakdown.cvUniqueCount}</b>`;

    renderChips($("missingKeywords"), missingKeywords, missingKeywords.length > 0 ? "warn" : undefined);

    const edits = buildEditSuggestions({ missingKeywords, formatReasons });
    setListItems($("editSuggestions"), edits);

    const gap = buildSkillGap({ missingKeywords, targetRole });
    const chance = clamp(gap.courses.reduce((s, c) => s + c.impact, 0) / 4, 10, 60);

    $("skillGap").innerHTML =
        `<div><b>${escapeHtml(gap.summary)}</b></div>` +
        `<div class="divider"></div>` +
        `<div class="kv"><div class="kv__k">Öneri</div><div class="kv__v">2 kurs</div></div>` +
        `<div class="kv"><div class="kv__k">Tahmini etki</div><div class="kv__v">Şansın ~%${Math.round(chance)} artar</div></div>` +
        `<div class="divider"></div>` +
        `<div class="muted"><b>Kurs 1:</b> ${escapeHtml(gap.courses[0].title)}</div>` +
        `<div class="muted"><b>Kurs 2:</b> ${escapeHtml(gap.courses[1].title)}</div>`;
}

function buildAtsReportFromAi(ai, targetRole) {
    const total = clamp(Number(ai?.total ?? 0), 0, 100);
    const breakdown = {
        keywordScore: clamp(Number(ai?.breakdown?.keywordScore ?? 0), 0, 100),
        formatScore: clamp(Number(ai?.breakdown?.formatScore ?? 0), 0, 100),
        jdKeywordCount: Number(ai?.missingKeywords?.length ?? 0),
        cvUniqueCount: 0,
    };

    $("atsScore").textContent = `${total}/100`;
    const badge = scoreLabel(total);
    const badgeEl = $("scoreBadge");
    badgeEl.textContent = badge.label;
    badgeEl.style.borderColor =
        badge.tone === "good" ? "rgba(34,197,94,0.35)" : badge.tone === "warn" ? "rgba(245,158,11,0.35)" : "rgba(239,68,68,0.35)";
    badgeEl.style.background =
        badge.tone === "good" ? "rgba(34,197,94,0.10)" : badge.tone === "warn" ? "rgba(245,158,11,0.10)" : "rgba(239,68,68,0.10)";

    $("scoreBar").style.width = `${total}%`;

    const breakdownEl = $("scoreBreakdown");
    breakdownEl.innerHTML =
        `Anahtar kelime: <b>${breakdown.keywordScore}</b>/100 · ` +
        `Format/ATS okunabilirliği: <b>${breakdown.formatScore}</b>/100` +
        (ai?.breakdown?.seniorityFit != null ? ` · Seniority: <b>${escapeHtml(ai.breakdown.seniorityFit)}</b>/100` : "") +
        (ai?.breakdown?.domainFit != null ? ` · Domain: <b>${escapeHtml(ai.breakdown.domainFit)}</b>/100` : "");

    const missing = Array.isArray(ai?.missingKeywords) ? ai.missingKeywords.slice(0, 18) : [];
    renderChips($("missingKeywords"), missing, missing.length > 0 ? "warn" : undefined);

    const edits = Array.isArray(ai?.editSuggestions) ? ai.editSuggestions.slice(0, 5) : [];
    setListItems($("editSuggestions"), edits);

    const sg = ai?.skillGap;
    const courses = Array.isArray(sg?.courses) ? sg.courses.slice(0, 2) : [];
    const chance = clamp(Number(sg?.chanceIncreasePct ?? 0), 10, 60);

    if (courses.length === 2) {
        $("skillGap").innerHTML =
            `<div><b>${escapeHtml(String(sg?.summary || "Skill gap analizi"))}</b></div>` +
            `<div class="divider"></div>` +
            `<div class="kv"><div class="kv__k">Öneri</div><div class="kv__v">2 kurs</div></div>` +
            `<div class="kv"><div class="kv__k">Tahmini etki</div><div class="kv__v">Şansın ~%${Math.round(chance)} artar</div></div>` +
            `<div class="divider"></div>` +
            `<div class="muted"><b>Kurs 1:</b> ${escapeHtml(courses[0]?.title || "")}</div>` +
            `<div class="muted">${escapeHtml(courses[0]?.why || "")}</div>` +
            `<div class="divider"></div>` +
            `<div class="muted"><b>Kurs 2:</b> ${escapeHtml(courses[1]?.title || "")}</div>` +
            `<div class="muted">${escapeHtml(courses[1]?.why || "")}</div>`;
    } else {
        const fallback = buildSkillGap({ missingKeywords: missing, targetRole });
        const chance2 = clamp(fallback.courses.reduce((s, c) => s + c.impact, 0) / 4, 10, 60);
        $("skillGap").innerHTML =
            `<div><b>${escapeHtml(fallback.summary)}</b></div>` +
            `<div class="divider"></div>` +
            `<div class="kv"><div class="kv__k">Öneri</div><div class="kv__v">2 kurs</div></div>` +
            `<div class="kv"><div class="kv__k">Tahmini etki</div><div class="kv__v">Şansın ~%${Math.round(chance2)} artar</div></div>` +
            `<div class="divider"></div>` +
            `<div class="muted"><b>Kurs 1:</b> ${escapeHtml(fallback.courses[0].title)}</div>` +
            `<div class="muted"><b>Kurs 2:</b> ${escapeHtml(fallback.courses[1].title)}</div>`;
    }
}

function loadExample() {
    $("targetRole").value = "Frontend Developer";
    $("targetCity").value = "İstanbul";

    $("cvText").value = `Murat Okay\n\nE-posta: murat@example.com\nTelefon: +90 555 000 00 00\n\nÖzet\n3 yıl deneyimli Frontend Developer. React, TypeScript ve modern web performansı konularında çalıştım.\n\nDeneyim\n- React ile dashboard geliştirdim, sayfa yükleme süresini %30 iyileştirdim.\n- REST API entegrasyonları, state management (Redux) ve test (Jest) kullandım.\n\nBeceriler\nReact, TypeScript, JavaScript, HTML, CSS, Redux, Jest, Git\n\nEğitim\nBilgisayar Mühendisliği`;

    $("jdText").value = `Aranan Nitelikler\n- React ve TypeScript ile 2+ yıl deneyim\n- Next.js bilgisi\n- TailwindCSS\n- Test yazımı (Jest, Cypress)\n- CI/CD süreçlerine aşinalık\n- Performans optimizasyonu\n\nSorumluluklar\n- Modern web arayüzleri geliştirmek\n- Code review ve takım içi iletişim\n- Analitik düşünme ve problem çözme`;
}

function clearAts() {
    $("cvText").value = "";
    $("jdText").value = "";
    $("targetRole").value = "";
    $("targetCity").value = "";

    $("atsScore").textContent = "—";
    $("scoreBadge").textContent = "—";
    $("scoreBar").style.width = "0%";
    $("scoreBreakdown").textContent = "";
    $("missingKeywords").innerHTML = "";
    $("editSuggestions").innerHTML = "";
    $("skillGap").innerHTML = "";
}

function initAts() {
    $("atsForm").addEventListener("submit", async (e) => {
        e.preventDefault();

        const cvText = $("cvText").value;
        const jdText = $("jdText").value;
        const targetRole = $("targetRole").value.trim();
        const targetCity = $("targetCity").value.trim();

        const submitBtn = e?.submitter || $("atsForm")?.querySelector('button[type="submit"]');

        // ÖNCELİKLE MESLEK KONTROLÜ YAP
        if (!detectProfession(cvText)) {
            $("missingKeywords").innerHTML = `<div class="chip chip--bad">⚠️ Uygun Değil</div>`;
            $("editSuggestions").innerHTML = `<li><b>Bu platform sadece yazılım mühendisleri ve geliştiriciler içindir.</b></li>
        <li>Lütfen yazılım geliştirici, frontend/backend developer, DevOps, QA engineer gibi teknik pozisyonlar için CV girin.</li>
        <li>Eğer yazılım mühendisiyseniz, CV'nizde "developer", "engineer", "yazılım" gibi anahtar kelimelerin olduğundan emin olun.</li>`;
            $("skillGap").innerHTML = `<div class="callout" style="border-color: rgba(239,68,68,0.35); background: rgba(239,68,68,0.10);">
        <b>⚠️ Platform Kısıtlaması</b><br>
        <div class="muted">CareerFlow AI, yazılım mühendisleri ve geliştiriciler için özel olarak tasarlanmıştır. 
        Marketing, Sales, HR gibi teknik olmayan pozisyonlar desteklenmemektedir.</div>
      </div>`;

            $("atsScore").textContent = "—";
            $("scoreBadge").textContent = "Uygun Değil";
            $("scoreBar").style.width = "0%";
            $("scoreBreakdown").textContent = "";

            const badgeEl = $("scoreBadge");
            badgeEl.style.borderColor = "rgba(239,68,68,0.35)";
            badgeEl.style.background = "rgba(239,68,68,0.10)";
            return;
        }

        setBusy(submitBtn, true, "AI analiz ediyor...");

        $("missingKeywords").innerHTML = `<div class="muted">AI analiz ediliyor...</div>`;
        $("editSuggestions").innerHTML = `<li class="muted">AI analiz ediliyor...</li>`;
        $("skillGap").innerHTML = `AI analiz ediliyor...`;

        try {
            const ai = await apiPostJson("/api/ats", { cvText, jdText, targetRole, targetCity });
            buildAtsReportFromAi(ai, targetRole);
        } catch {
            // Fallback: Dinamik analiz yap
            const res = computeAtsScore({ cvText, jdText });

            // Teknoloji analizi ekle
            const techStack = detectTechStack(cvText);
            const experienceInfo = detectExperienceLevel(cvText);
            const techSuggestions = generateTechSuggestions(techStack, experienceInfo);

            // Teknoloji bilgilerini rapora ekle
            const totalTechs = Object.values(techStack).flat().length;
            const techBonus = Math.min(totalTechs * 2, 20);
            res.total = clamp(res.total + techBonus, 0, 100);

            // Özet bilgiler
            const techSummary = [];
            if (techStack.frontend.length > 0) techSummary.push(`Frontend: ${techStack.frontend.slice(0, 3).join(', ')}`);
            if (techStack.backend.length > 0) techSummary.push(`Backend: ${techStack.backend.slice(0, 3).join(', ')}`);
            if (techStack.mobile.length > 0) techSummary.push(`Mobile: ${techStack.mobile.slice(0, 2).join(', ')}`);
            if (techStack.devops.length > 0) techSummary.push(`DevOps: ${techStack.devops.slice(0, 3).join(', ')}`);

            // Öneri listesine teknoloji önerilerini ekle
            const combinedSuggestions = buildEditSuggestions({
                missingKeywords: res.missingKeywords,
                formatReasons: res.formatReasons
            });

            // Tech suggestions'ı da ekle
            techSuggestions.forEach(sug => {
                if (!combinedSuggestions.includes(sug)) {
                    combinedSuggestions.push(sug);
                }
            });

            buildAtsReport(res, targetRole);

            // Teknoloji bilgilerini breakdown'a ekle
            const breakdownEl = $("scoreBreakdown");
            const currentBreakdown = breakdownEl.innerHTML;
            breakdownEl.innerHTML = currentBreakdown +
                `<br>Seviye: <b>${experienceInfo.level}</b> (${experienceInfo.years} yıl) · ` +
                `Teknoloji: <b>${totalTechs}</b> tespit · ` +
                `Bonus: <b>+${techBonus}</b>`;

            // Skill gap'e teknoloji özetini ekle
            if (techSummary.length > 0) {
                const skillGapEl = $("skillGap");
                skillGapEl.innerHTML =
                    `<div class="callout"><b>🎯 Tespit Edilen Teknolojiler</b><br>` +
                    `<div class="muted">${techSummary.join(' • ')}</div></div>` +
                    `<div class="divider"></div>` +
                    skillGapEl.innerHTML;
            }

            // Önerileri güncelle
            setListItems($("editSuggestions"), combinedSuggestions.slice(0, 6));
        } finally {
            setBusy(submitBtn, false);
        }
    });

    $("btnLoadExample").addEventListener("click", () => loadExample());
    $("btnClear").addEventListener("click", () => clearAts());
}

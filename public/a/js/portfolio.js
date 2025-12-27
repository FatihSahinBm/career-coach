/* =========================================
   GITHUB PORTFOLIO ANALYSIS (Real-time)
   ========================================= */

function initPortfolio() {
    const form = $("portfolioForm");
    if (!form) return;

    form.addEventListener("submit", async (e) => {
        e.preventDefault();

        const github = $("pfGithub").value.trim();
        if (!github) {
            alert("Lütfen GitHub profil linkini girin.");
            return;
        }

        const submitBtn = e.submitter || form.querySelector('button[type="submit"]');
        const resultEl = $("portfolioResult");
        if (!resultEl) return;

        setBusy(submitBtn, true, "GitHub taranıyor & Analiz ediliyor...");
        resultEl.innerHTML = `<div class="callout">GitHub profili inceleniyor... (Model: gemini-3-flash-preview)</div>`;

        try {
            const ai = await apiPostJson("/api/portfolio", { github });

            const score = clamp(Number(ai?.score ?? 0), 0, 100);
            const badge = scoreLabel(score);
            const strengths = Array.isArray(ai?.strengths) ? ai.strengths : [];
            const weaknesses = Array.isArray(ai?.weaknesses) ? ai.weaknesses : [];
            const suggestions = Array.isArray(ai?.suggestions) ? ai.suggestions : [];

            resultEl.innerHTML =
                `<div class="kv"><div class="kv__k">GitHub Skoru</div><div class="kv__v">${score}/100 (${escapeHtml(badge.label)})</div></div>` +
                `<div class="divider"></div>` +
                `<div class="stack">` +
                `<div class="callout"><div><b>✓ Güçlü Yönler</b></div><div class="muted">${strengths.length ? strengths.map(s => `• ${escapeHtml(s)}`).join("<br>") : "Bulunamadı"}</div></div>` +
                `<div class="callout" style="border-color: rgba(245,158,11,0.3); background: rgba(245,158,11,0.05);"><div><b>⚠ Eksik / Zayıf Noktalar</b></div><div class="muted">${weaknesses.length ? weaknesses.map(w => `• ${escapeHtml(w)}`).join("<br>") : "Sorun yok"}</div></div>` +
                `<div class="callout"><div><b>→ Gelişim Tavsiyeleri</b></div><div class="muted">${suggestions.length ? suggestions.map(s => `• ${escapeHtml(s)}`).join("<br>") : "-"}</div></div>` +
                `</div>`;

        } catch (err) {
            console.error(err);
            resultEl.innerHTML = `<div class="callout" style="border-color:red; color:red;">Hata: ${escapeHtml(err.message)}</div>`;
        } finally {
            setBusy(submitBtn, false);
        }
    });
}

/* =========================================
   BURNOUT & IŞ MEMNUNIYETI MODÜLÜ
   ========================================= */

const BURNOUT_KEY = "careerflow_burnout_entries_v1";

function loadBurnoutEntries() {
    try {
        const raw = localStorage.getItem(BURNOUT_KEY);
        if (!raw) return [];
        const parsed = JSON.parse(raw);
        return Array.isArray(parsed) ? parsed : [];
    } catch {
        return [];
    }
}

function saveBurnoutEntries(entries) {
    localStorage.setItem(BURNOUT_KEY, JSON.stringify(entries));
}

function burnoutFeedback(entries) {
    if (entries.length === 0) {
        return { text: "Henüz kayıt yok.", status: "neutral" };
    }

    const last = entries[entries.length - 1];
    const recent = entries.slice(-3);

    const avg = (k) => recent.reduce((s, e) => s + (Number(e[k]) || 0), 0) / recent.length;
    const sat = avg("satisfaction");
    const stress = avg("stress");
    const growth = avg("growth");

    let text = `Son ${recent.length} kayıt ortalaması: memnuniyet ${sat.toFixed(1)}/10, stres ${stress.toFixed(1)}/10, gelişim ${growth.toFixed(1)}/10.`;

    if (stress >= 7 && sat <= 5) {
        text += " Stres yüksek ve memnuniyet düşük görünüyor: iş yükü/öncelikler için yöneticinle 1:1 planla; haftalık net sınırlar koy.";
        return { text, status: "warn" };
    }

    if (growth <= 4) {
        text += " Gelişim hızı düşük: haftada 2 saat öğrenme slotu ayır veya yeni sorumluluk talep et.";
        return { text, status: "warn" };
    }

    text += " Genel trend dengeli. Bu ay bir hedef belirle: 1 teknik konu + 1 iletişim/presentasyon konusu.";
    return { text, status: "good" };
}

function renderBurnout(entries) {
    const feedback = burnoutFeedback(entries);

    const last = entries.length ? entries[entries.length - 1] : null;
    const history = entries
        .slice()
        .reverse()
        .slice(0, 6)
        .map((e) => `${e.date} — memnuniyet ${e.satisfaction}/10, stres ${e.stress}/10, gelişim ${e.growth}/10${e.note ? ` · ${e.note}` : ""}`);

    const toneClass = feedback.status === "warn" ? "chip--warn" : feedback.status === "good" ? "chip--good" : "";

    $("burnoutResult").innerHTML =
        `<div class="callout"><div><b>AI geri bildirimi</b></div><div class="muted">${escapeHtml(feedback.text)}</div></div>` +
        (last
            ? `<div class="kv"><div class="kv__k">Son kayıt</div><div class="kv__v">${escapeHtml(last.date)}</div></div>`
            : "") +
        `<div class="callout"><div><b>Geçmiş (son 6)</b></div><div class="muted">${history.length ? history.map(escapeHtml).join("<br>") : "—"}</div></div>`;
}

function initBurnout() {
    const entries = loadBurnoutEntries();
    renderBurnout(entries);

    $("burnoutForm").addEventListener("submit", async (e) => {
        e.preventDefault();

        const satisfaction = Number($("boSatisfaction").value);
        const stress = Number($("boStress").value);
        const growth = Number($("boGrowth").value);
        const note = $("boNote").value.trim();

        const ok =
            satisfaction >= 1 && satisfaction <= 10 &&
            stress >= 1 && stress <= 10 &&
            growth >= 1 && growth <= 10;

        if (!ok) {
            $("burnoutResult").innerHTML = `<div class="callout">Lütfen 1-10 arası değerler gir.</div>`;
            return;
        }

        const now = new Date();
        const date = now.toLocaleDateString("tr-TR", { year: "numeric", month: "2-digit", day: "2-digit" });

        const newEntry = { date, satisfaction, stress, growth, note };
        const all = loadBurnoutEntries();
        all.push(newEntry);
        saveBurnoutEntries(all);

        $("boNote").value = "";

        // Render local state first
        renderBurnout(all);

        // Call AI for deeper analysis
        const submitBtn = e.submitter || $("burnoutForm").querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;
        setBusy(submitBtn, true, "AI Analiz Ediyor...");

        const feedbackContainer = $("burnoutResult").querySelector(".callout"); // The first callout is usually the feedback
        if (feedbackContainer) feedbackContainer.innerHTML = `<div class="muted">Yapay zeka analiz ediyor...</div>`;

        try {
            const history = all.slice(-3); // Send last 3 for context
            const ai = await apiPostJson("/api/burnout", { satisfaction, stress, growth, note, history });

            if (ai && ai.text) {
                // Update the feedback display with AI result
                // Using dark mode transparent backgrounds: Red (danger), Orange (warn), Green (good)
                $("burnoutResult").innerHTML =
                    `<div class="callout" style="${ai.status === 'danger' ? 'border-color:rgba(239,68,68,0.5);background:rgba(239,68,68,0.15)' : ai.status === 'warn' ? 'border-color:rgba(245,158,11,0.5);background:rgba(245,158,11,0.15)' : 'border-color:rgba(34,197,94,0.5);background:rgba(34,197,94,0.15)'}">
                        <div><b>Kariyer Koçu</b></div>
                        <div class="muted">${escapeHtml(ai.text)}</div>
                     </div>` +
                    `<div class="kv"><div class="kv__k">Son kayıt</div><div class="kv__v">${escapeHtml(newEntry.date)}</div></div>` +
                    `<div class="callout"><div><b>Geçmiş (son 6)</b></div><div class="muted">${all.slice().reverse().slice(0, 6).map(e => `${e.date} — Memnuniyet ${e.satisfaction}, Stres ${e.stress}, Gelişim ${e.growth}`).join("<br>")}</div></div>`;
            }
        } catch (err) {
            console.error("AI Burnout Error:", err);
            // Fallback to standard render if API fails
            renderBurnout(all);
        } finally {
            setBusy(submitBtn, false);
            submitBtn.textContent = originalText;
        }
    });

    $("btnClearBurnout").addEventListener("click", () => {
        localStorage.removeItem(BURNOUT_KEY);
        renderBurnout([]);
    });
}

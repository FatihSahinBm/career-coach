/* =========================================
   MÜLAKAT (AI) MODÜLÜ
   ========================================= */

function initInterview() {
    const setupForm = $("interviewSetupForm");
    const answerForm = $("interviewAnswerForm");
    const questionArea = $("interviewQuestionArea");
    const questionText = $("interviewQuestionText");
    const resultArea = $("interviewResult");
    const feedbackContent = $("interviewFeedbackContent");
    const btnNewQuestion = $("btnNewQuestion");

    // State
    let currentSessionId = null;

    setupForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        const role = $("interviewRole").value.trim();
        if (!role) return;

        setBusy(setupForm.querySelector("button"), true, "Soru Hazırlanıyor...");
        questionArea.style.display = "none";
        resultArea.style.display = "block";
        resultArea.querySelector(".callout").textContent = "Mülakat başlatılıyor...";
        feedbackContent.style.display = "none";

        try {
            const data = await apiPostJson("/api/interview/ask", { role });

            // Show Question
            questionArea.style.display = "block";
            questionText.textContent = data.question || "Soru yüklenemedi.";
            $("interviewAnswer").value = "";
            currentSessionId = data.sessionId; // If backend sends one, otherwise we might not need it if stateless

            // Update result area prompt
            resultArea.querySelector(".callout").textContent = "Soruyu cevapla ve değerlendir.";

        } catch (err) {
            alert("Hata: " + err.message);
        } finally {
            setBusy(setupForm.querySelector("button"), false);
        }
    });

    answerForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        const answer = $("interviewAnswer").value.trim();
        const role = $("interviewRole").value.trim();
        const question = questionText.textContent;

        if (!answer) {
            alert("Lütfen bir cevap yazın.");
            return;
        }

        setBusy(answerForm.querySelector("button"), true, "Değerlendiriliyor...");

        try {
            const data = await apiPostJson("/api/interview/evaluate", { role, question, answer });

            // Render Feedback
            resultArea.querySelector(".callout").style.display = "none";
            feedbackContent.style.display = "block";

            $("interviewScore").textContent = `${data.score}/100`;
            const badge = scoreLabel(data.score); // Reuse existing scoreLabel
            const badgeEl = $("interviewBadge");
            badgeEl.textContent = badge.label;
            badgeEl.style.borderColor = badge.tone === "good" ? "rgba(34,197,94,0.35)" : badge.tone === "warn" ? "rgba(245,158,11,0.35)" : "rgba(239,68,68,0.35)";
            badgeEl.style.background = badge.tone === "good" ? "rgba(34,197,94,0.10)" : badge.tone === "warn" ? "rgba(245,158,11,0.10)" : "rgba(239,68,68,0.10)";

            $("interviewScoreBar").style.width = `${data.score}%`;

            setListItems($("interviewStrengths"), data.strengths);
            setListItems($("interviewWeaknesses"), data.weaknesses);

            $("interviewIdealAnswer").textContent = data.idealAnswer || "—";

        } catch (err) {
            alert("Hata: " + err.message);
        } finally {
            setBusy(answerForm.querySelector("button"), false);
        }
    });

    btnNewQuestion.addEventListener("click", () => {
        // Reset UI to setup
        questionArea.style.display = "none";
        feedbackContent.style.display = "none";
        resultArea.querySelector(".callout").style.display = "block";
        resultArea.querySelector(".callout").textContent = "Yeni mülakat için formu kullan.";
        $("interviewAnswer").value = "";
        $("interviewRole").focus();
    });
}

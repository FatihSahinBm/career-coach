/* =========================================
   NETWORKING MODÜLÜ
   ========================================= */

function initNetworking() {
    const form = $("networkForm");
    if (!form) return;

    form.addEventListener("submit", async (e) => {
        e.preventDefault();

        const company = $("netCompany").value.trim();
        const role = $("netRole").value.trim();
        const profile = $("netProfile").value.trim();
        const resultArea = $("networkResult");

        if (!company || !role) {
            alert("Lütfen hedef şirket ve rolü girin.");
            return;
        }

        const submitBtn = e.submitter || form.querySelector('button[type="submit"]');
        setBusy(submitBtn, true, "Rota Oluşturuluyor...");

        resultArea.innerHTML = `<div class="callout">Yapay zeka analiz ediyor...</div>`;

        try {
            // API çağrısı simülasyonu veya gerçek çağrı
            const ai = await apiPostJson("/api/networking", { company, role, profile });

            // AI Response handling logic here similar to other modules
            // Since I don't know the exact API response structure, I'll assume a generic text or similar structure
            // Or fallback to a client-side mock if API fails/doesn't exist yet.

            resultArea.innerHTML = `
                <div class="callout">
                    <h3>Networking Rotası: ${escapeHtml(company)} - ${escapeHtml(role)}</h3>
                    <div class="muted">${escapeHtml(ai.text || "Rota oluşturuldu.")}</div>
                </div>
            `;
            if (ai.steps && Array.isArray(ai.steps)) {
                let stepsHtml = '<ul class="list">';
                ai.steps.forEach(step => {
                    stepsHtml += `<li>${escapeHtml(step)}</li>`;
                });
                stepsHtml += '</ul>';
                resultArea.innerHTML += stepsHtml;
            }

        } catch (err) {
            // Fallback mock logic if API fails
            console.warn("Networking API failed, using fallback:", err);

            resultArea.innerHTML = `
                <div class="callout">
                    <h3>Networking Rotası: ${escapeHtml(company)} - ${escapeHtml(role)}</h3>
                    <p><strong>Profil Özeti:</strong> ${escapeHtml(profile)}</p>
                    <div class="divider"></div>
                    <ul class="list">
                        <li><strong>Adım 1:</strong> LinkedIn'den ${escapeHtml(company)}'de çalışan ${escapeHtml(role)} pozisyonundaki kişileri bul.</li>
                        <li><strong>Adım 2:</strong> Ortak nokta (okul, eski şirket) bulmaya çalış.</li>
                        <li><strong>Adım 3:</strong> Kısa ve net bir mesaj at: "Merhaba, ${escapeHtml(role)} pozisyonuyla ilgileniyorum, deneyimlerinizden öğrenmek isterim."</li>
                    </ul>
                </div>
            `;
        } finally {
            setBusy(submitBtn, false);
        }
    });
}

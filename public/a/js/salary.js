/* =========================================
   MAAŞ & PAZARLIK MODÜLÜ
   ========================================= */

const TURKISH_CITIES = [
    "Adana", "Adıyaman", "Afyonkarahisar", "Ağrı", "Aksaray", "Amasya", "Ankara", "Antalya", "Ardahan", "Artvin",
    "Aydın", "Balıkesir", "Bartın", "Batman", "Bayburt", "Bilecik", "Bingöl", "Bitlis", "Bolu", "Burdur",
    "Bursa", "Çanakkale", "Çankırı", "Çorum", "Denizli", "Diyarbakır", "Düzce", "Edirne", "Elazığ", "Erzincan",
    "Erzurum", "Eskişehir", "Gaziantep", "Giresun", "Gümüşhane", "Hakkari", "Hatay", "Iğdır", "Isparta", "İstanbul",
    "İzmir", "Kahramanmaraş", "Karabük", "Karaman", "Kars", "Kastamonu", "Kayseri", "Kırıkkale", "Kırklareli", "Kırşehir",
    "Kilis", "Kocaeli", "Konya", "Kütahya", "Malatya", "Manisa", "Mardin", "Mersin", "Muğla", "Muş",
    "Nevşehir", "Niğde", "Ordu", "Osmaniye", "Rize", "Sakarya", "Samsun", "Siirt", "Sinop", "Sivas",
    "Şanlıurfa", "Şırnak", "Tekirdağ", "Tokat", "Trabzon", "Tunceli", "Uşak", "Van", "Yalova", "Yozgat", "Zonguldak"
];

const COMMON_ROLES = [
    // Bilişim & Teknoloji
    "Yazılım Mühendisi", "Frontend Geliştirici", "Backend Geliştirici", "Full Stack Geliştirici", "Mobil Geliştirici (iOS/Android)",
    "DevOps Mühendisi", "Siber Güvenlik Uzmanı", "Veri Analisti", "Veri Bilimci", "Sistem Yöneticisi", "Oyun Geliştirici",
    "Yazılım Mimarı", "Teknoloji Lideri (Tech Lead)", "Ürün Yöneticisi (Product Manager)", "Proje Yöneticisi", "İş Analisti",
    "UI/UX Tasarımcı", "Grafik Tasarımcı",

    // Mühendislik & Teknik
    "Makine Mühendisi", "İnşaat Mühendisi", "Elektrik-Elektronik Mühendisi", "Endüstri Mühendisi", "Mimar", "Harita Mühendisi", "Ziraat Mühendisi",

    // Eğitim & Akademik
    "Öğretmen (İlkokul/Ortaokul/Lise)", "Akademisyen / Araştırma Görevlisi", "Özel Ders Öğretmeni", "Yabancı Dil Eğitmeni",

    // Sağlık
    "Hemşire", "Eczacı", "Psikolog", "Diyetisyen", "Fizyoterapist", "Diş Hekimi", "Veteriner Hekim",

    // Hukuk & Finans
    "Avukat", "Mali Müşavir", "Muhasebeci", "Finans Uzmanı", "İnsan Kaynakları Uzmanı", "Bankacı",

    // Satış & Pazarlama
    "Dijital Pazarlama Uzmanı", "Sosyal Medya Uzmanı", "SEO Uzmanı", "Satış Temsilcisi", "Müşteri Temsilcisi", "Emlak Danışmanı",

    // Hizmet & Operasyon
    "Lojistik Uzmanı", "Çağrı Merkezi Müşteri Temsilcisi",

];

// Fill COMMON_ROLES until ~100 with variations if needed or keep concise list of most popular. 

function estimateSalary({ role, city, years, skills, workMode }) {
    const r = normalizeText(role);
    const c = normalizeText(city);

    // Default: Genel Beyaz Yaka / Uzman
    let baseMin = 30000;
    let baseMax = 60000;

    // 1. Yazılım & Yüksek Teknoloji
    if (/yazılım|frontend|backend|fullstack|software|developer|mühendis|engineer|mimarı|lead|cto|veri|data|siber|devops|architect/.test(r)) {
        baseMin = 45000;
        baseMax = 95000;
    }
    // 2. Sağlık (Hekim/Eczacı) & Üst Düzey Yönetim
    else if (/doktor|hekim|eczacı|yönetici|müdür|avukat/.test(r)) {
        baseMin = 45000;
        baseMax = 90000;
    }
    // 3. Esnaf & Zanaat (Ustalık gerektiren)
    else if (/usta|tamirci|tesisat|elektrik|berber|kuaför|terzi|kaynak|boya|şef|aşçı/.test(r)) {
        baseMin = 35000;
        baseMax = 85000; // İyi ustalar çok kazanır
    }
    // 4. Eğitim & Akademik
    else if (/öğretmen|akademisyen|eğitmen/.test(r)) {
        baseMin = 30000;
        baseMax = 55000;
    }
    // 5. Hizmet & Başlangıç Seviyesi
    else if (/kasiyer|garson|komi|kurye|güvenlik|şoför|satış danışmanı|çağrı|sekreter/.test(r)) {
        baseMin = 22000; // Asgari ücret bandı üstü
        baseMax = 38000;
    }

    const cityMult =
        /istanbul/.test(c) ? 1.15 : /ankara|izmir/.test(c) ? 1.08 : /bursa|kocaeli|antalya/.test(c) ? 1.02 : 0.96;

    const y = isFinite(years) ? years : 0;
    const expMult = clamp(1 + y * 0.08, 1, 1.9);

    const s = skills.map((x) => normalizeText(x));
    // Tech-specific skills boost
    const premiumSkills = ["typescript", "react", "next.js", "aws", "docker", "kubernetes", "python", "java", "c#", "go", "flutter"];
    const premiumCount = s.filter((x) => premiumSkills.includes(x)).length;
    const skillMult = clamp(1 + premiumCount * 0.04, 1, 1.25);

    const modeMult = workMode === "remote" ? 1.03 : workMode === "onsite" ? 1.0 : 1.01;

    const min = Math.round(baseMin * cityMult * expMult * skillMult * modeMult);
    const max = Math.round(baseMax * cityMult * expMult * skillMult * modeMult);

    const anchor = Math.round((min + max) / 2);
    return { min, max, anchor };
}

function buildNegotiation({ role, city, range, years }) {
    const y = isFinite(years) ? years : 0;
    const level = y < 2 ? "junior" : y < 5 ? "mid" : "senior";

    const tactic =
        level === "junior"
            ? "Aralığın alt-orta bandına yakın, öğrenme hızı ve teslim kalitesi üzerinden pazarlık yap."
            : level === "mid"
                ? "Aralığın orta-üst bandına hedef koy; etki/çıktı örneklerinle konuş."
                : "Üst banda yakın konuş; kapsam, sorumluluk ve piyasa kıyaslarını netleştir.";

    const expected =
        level === "junior" ? range.anchor : level === "mid" ? Math.round(range.anchor * 1.06) : Math.round(range.anchor * 1.12);

    const answer =
        `Bu rol için (${role || "rol"}, ${city || "şehir"}) piyasada aylık brüt ${range.min.toLocaleString("tr-TR")} - ${range.max.toLocaleString("tr-TR")} TL bandı makul görünüyor. ` +
        `Benim deneyimim (${y} yıl) ve katkı alanlarım doğrultusunda ${expected.toLocaleString("tr-TR")} TL civarını hedefliyorum; ` +
        `toplam paket ve rol kapsamına göre esnekim.`;

    return { tactic, expected, answer };
}

function initSalary() {
    // Populate Dropdowns
    const citySelect = $("salaryCity");
    const roleSelect = $("salaryRole");

    if (citySelect) {
        TURKISH_CITIES.sort((a, b) => a.localeCompare(b, 'tr')).forEach(city => {
            const opt = document.createElement("option");
            opt.value = city;
            opt.textContent = city;
            citySelect.appendChild(opt);
        });
    }

    if (roleSelect) {
        COMMON_ROLES.sort().forEach(role => {
            const opt = document.createElement("option");
            opt.value = role;
            opt.textContent = role;
            roleSelect.appendChild(opt);
        });
    }

    $("salaryForm").addEventListener("submit", async (e) => {
        e.preventDefault();

        const role = $("salaryRole").value.trim();
        const city = $("salaryCity").value.trim();
        const years = parseFloat($("salaryYears").value);
        const workMode = $("salaryWorkMode").value;
        const skills = $("salarySkills").value
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean);

        const submitBtn = e?.submitter || $("salaryForm")?.querySelector('button[type="submit"]');
        setBusy(submitBtn, true, "AI hesaplıyor...");
        $("salaryResult").innerHTML = `<div class="callout">AI hesaplıyor...</div>`;

        try {
            const ai = await apiPostJson("/api/salary", { role, city, years, skills, workMode });
            const min = Number(ai?.min ?? 0);
            const max = Number(ai?.max ?? 0);
            const expected = Number(ai?.expected ?? 0);
            const tactic = String(ai?.tactic || "");
            const answer = String(ai?.answer || "");
            const notes = Array.isArray(ai?.notes) ? ai.notes : [];

            $("salaryResult").innerHTML =
                `<div class="kv"><div class="kv__k">Tahmini Piyasa Aralığı (Aylık Brüt)</div><div class="kv__v">${min.toLocaleString("tr-TR")} - ${max.toLocaleString("tr-TR")} TL</div></div>` +
                `<div class="kv"><div class="kv__k">Önerilen Hedef</div><div class="kv__v">${expected.toLocaleString("tr-TR")} TL</div></div>` +
                `<div class="callout"><div><b>Pazarlık taktiği</b></div><div class="muted">${escapeHtml(tactic)}</div></div>` +
                `<div class="callout"><div class="row"><div><b>"Maaş beklentiniz nedir?" hazır cevabı</b></div><button class="btn btn--secondary btn--small" type="button" data-copy-id="salaryAnswer">Kopyala</button></div><div id="salaryAnswer" class="muted">${escapeHtml(answer)}</div></div>` +
                (notes.length ? `<div class="callout"><div><b>Notlar</b></div><div class="muted">${notes.map(escapeHtml).join("<br>")}</div></div>` : "");
        } catch {
            const range = estimateSalary({ role, city, years, skills, workMode });
            const negotiation = buildNegotiation({ role, city, range, years });
            $("salaryResult").innerHTML =
                `<div class="kv"><div class="kv__k">Tahmini Piyasa Aralığı (Aylık Brüt)</div><div class="kv__v">${range.min.toLocaleString("tr-TR")} - ${range.max.toLocaleString("tr-TR")} TL</div></div>` +
                `<div class="kv"><div class="kv__k">Önerilen Hedef</div><div class="kv__v">${negotiation.expected.toLocaleString("tr-TR")} TL</div></div>` +
                `<div class="callout"><div><b>Pazarlık taktiği</b></div><div class="muted">${escapeHtml(negotiation.tactic)}</div></div>` +
                `<div class="callout"><div class="row"><div><b>"Maaş beklentiniz nedir?" hazır cevabı</b></div><button class="btn btn--secondary btn--small" type="button" data-copy-id="salaryAnswer">Kopyala</button></div><div id="salaryAnswer" class="muted">${escapeHtml(negotiation.answer)}</div></div>`;
        } finally {
            setBusy(submitBtn, false);
        }
    });
}

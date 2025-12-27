/* =========================================
   GENEL ÖZELLİKLER (Copy, Print, Tabs)
   ========================================= */

function initCopy() {
    document.addEventListener("click", async (e) => {
        const btn = e.target?.closest?.("[data-copy-id]");
        if (!btn) return;
        const id = btn.getAttribute("data-copy-id");
        const target = id ? document.getElementById(id) : null;
        const text = target?.innerText || target?.textContent || "";
        if (!text.trim()) return;

        try {
            await navigator.clipboard.writeText(text);
            btn.textContent = "Kopyalandı";
            setTimeout(() => {
                btn.textContent = "Kopyala";
            }, 1200);
        } catch {
            window.prompt("Kopyalamak için Ctrl+C", text);
        }
    });
}

function initPrint() {
    const btn = $("btnPrint");
    if (btn) {
        btn.addEventListener("click", () => {
            window.print();
        });
    }
}

function initTabs() {
    const tabButtons = Array.from(document.querySelectorAll(".tab"));
    tabButtons.forEach((btn) => {
        btn.addEventListener("click", () => {
            const key = btn.getAttribute("data-tab");
            if (!TAB_IDS.includes(key)) return;

            tabButtons.forEach((b) => b.classList.toggle("is-active", b === btn));
            TAB_IDS.forEach((id) => {
                const panel = $("tab-" + id);
                if (panel) panel.classList.toggle("is-active", id === key);
            });
        });
    });
}

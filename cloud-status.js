(function () {
  let pill, timer;
  function show(text, background) {
    if (!pill) return;
    clearTimeout(timer);
    pill.textContent = text;
    pill.style.background = background;
    pill.style.opacity = "1";
    if (text === "✓ Cloud Saved") timer = setTimeout(() => pill.style.opacity = "0", 1800);
  }
  addEventListener("load", () => {
    pill = document.createElement("div");
    pill.style.cssText = "position:fixed;top:14px;right:18px;z-index:30000;padding:8px 13px;border-radius:999px;color:#fff;font:700 12px Inter,Arial;box-shadow:0 5px 18px #0003;opacity:0;transition:opacity .25s";
    document.body.appendChild(pill);
  });
  addEventListener("crm-cloud-saving", () => show("Saving to Cloud...", "#d97706"));
  addEventListener("crm-cloud-saved", () => show("✓ Cloud Saved", "#16a34a"));
  addEventListener("crm-cloud-error", e => show("✕ Cloud Save Failed", "#dc2626"));
})();

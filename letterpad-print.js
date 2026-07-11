(function () {
  function applyLetterpad() {
    document.querySelectorAll("#print-area").forEach(area => {
      if (area.dataset.letterpadReady) return;
      area.dataset.letterpadReady = "1";
      const existingHeader = area.firstElementChild;
      if (existingHeader) existingHeader.classList.add("crm-old-header");
      const header = document.createElement("img");
      header.src = "letterpad-header.png";
      header.alt = "Ratneswar Engineering letterhead";
      header.className = "letterpad-header";
      const footer = document.createElement("img");
      footer.src = "letterpad-footer.png";
      footer.alt = "Ratneswar Engineering footer";
      footer.className = "letterpad-footer";
      const sign = document.createElement("img");
      sign.src = "letterpad-sign.png";
      sign.alt = "Authorised stamp and signature";
      sign.className = "letterpad-sign";
      area.prepend(header);
      area.append(sign);
      area.append(footer);
    });
  }
  new MutationObserver(applyLetterpad).observe(document.documentElement, { childList: true, subtree: true });
  addEventListener("load", applyLetterpad);
  addEventListener("beforeprint", applyLetterpad);
})();

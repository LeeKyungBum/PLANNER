document.addEventListener("DOMContentLoaded", () => {
  const path = window.location.pathname.split("/").pop(); // 예: network-detail.html
  const baseName = path.split(".")[0]; // 예: network-detail

  const buttons = document.querySelectorAll("nav ul li button");

  buttons.forEach(btn => {
    const tab = btn.getAttribute("data-tab");

    // 정확히 일치해야 하는 페이지
    const strictTabs = ["ai", "level", "resume", "experience", "portfolio", "navigation"];

    // "포함 일치" 허용하는 페이지 (세부 페이지 포함)
    const looseTabs = ["network"];

    if (
      (strictTabs.includes(tab) && baseName === tab) ||
      (looseTabs.includes(tab) && baseName.startsWith(tab))
    ) {
      btn.classList.add("active");
    }
  });
});


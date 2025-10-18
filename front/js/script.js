document.addEventListener("DOMContentLoaded", () => {
  const buttons = document.querySelectorAll("nav button");
  const tabs = document.querySelectorAll(".tab");

  buttons.forEach(btn => {
    btn.addEventListener("click", () => {
      // 버튼 active 처리
      buttons.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");

      // 탭 전환
      const target = btn.dataset.tab;
      tabs.forEach(tab => {
        tab.classList.remove("active");
        if (tab.id === target) {
          tab.classList.add("active");
        }
      });
    });
  });
});

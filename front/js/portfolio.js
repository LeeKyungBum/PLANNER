document.addEventListener("DOMContentLoaded", async () => {
  const token = localStorage.getItem("token");
  const form = document.getElementById("portfolioForm");
  const listContainer = document.getElementById("portfolioList");
  const msg = document.getElementById("uploadMessage");

  // 업로드 폼 제출
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const title = document.getElementById("title").value;
    const description = document.getElementById("description").value;
    const file = document.getElementById("file").files[0];

    if (!file) {
      msg.textContent = "파일을 선택해주세요.";
      msg.style.color = "#e74c3c";
      return;
    }

    const formData = new FormData();
    formData.append("title", title);
    formData.append("description", description);
    formData.append("file", file);

    try {
      const res = await fetch("http://localhost:8081/portfolio/upload", {
        method: "POST",
        headers: { "Authorization": `Bearer ${token}` },
        body: formData
      });

      const result = await res.json();
      if (res.ok && result.success) {
        msg.style.color = "#27ae60";
        msg.textContent = "포트폴리오가 성공적으로 등록되었습니다!";
        form.reset();
        loadPortfolioList();
      } else {
        msg.style.color = "#e74c3c";
        msg.textContent = result.message || "업로드 실패";
      }
    } catch {
      msg.style.color = "#e74c3c";
      msg.textContent = "서버 오류";
    }
  });

  // 목록 불러오기
  async function loadPortfolioList() {
    listContainer.innerHTML = "";
    try {
      const res = await fetch("http://localhost:8081/portfolio/list", {
        headers: { "Authorization": `Bearer ${token}` }
      });
      const result = await res.json();

      if (res.ok && result.success && result.data.length > 0) {
        result.data.forEach(item => {
          const card = document.createElement("div");
          card.className = "portfolio-card";
          card.innerHTML = `
            <h3>${item.title}</h3>
            <p>${item.description}</p>
            <a href="${item.fileUrl}" target="_blank">파일 보기</a>
          `;
          listContainer.appendChild(card);
        });
      } else {
        listContainer.innerHTML = "<p>등록된 포트폴리오가 없습니다.</p>";
      }
    } catch {
      listContainer.innerHTML = "<p>목록을 불러오지 못했습니다.</p>";
    }
  }

  loadPortfolioList();
});

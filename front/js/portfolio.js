// 파일 이름 표시
const fileInput = document.getElementById("file");
const fileNameSpan = document.getElementById("fileName");

fileInput.addEventListener("change", () => {
  if (fileInput.files && fileInput.files.length > 0) {
    fileNameSpan.textContent = fileInput.files[0].name;
  } else {
    fileNameSpan.textContent = "선택된 파일 없음";
  }
});

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

        // 약간의 지연 후 목록 갱신
        setTimeout(() => {
          loadPortfolioList();
        }, 800);
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
            <div class="card-actions">
              <button class="view-btn" data-id="${item.id}">수정</button>
              <button class="delete-btn" data-id="${item.id}">삭제</button>
            </div>
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

  // 수정 및 삭제 버튼 처리
  listContainer.addEventListener("click", async (e) => {
    const id = e.target.dataset.id;
    if (!id) return;

    // 상세 보기
    if (e.target.classList.contains("view-btn")) {
      window.location.href = `portfolio-view.html?id=${id}`;
      return;
    }

    // 삭제
    if (e.target.classList.contains("delete-btn")) {
      if (!confirm("정말 삭제하시겠습니까?")) return;

      try {
        const res = await fetch(`http://localhost:8081/portfolio/delete/${id}`, {
          method: "DELETE",
          headers: { "Authorization": `Bearer ${token}` }
        });
        const result = await res.json();
        if (res.ok && result.success) {
          alert("삭제 완료!");
          loadPortfolioList();
        } else {
          alert(result.message || "삭제 실패");
        }
      } catch {
        alert("서버 오류로 삭제에 실패했습니다.");
      }
    }
  });

  // 페이지 로드시 목록 불러오기
  loadPortfolioList();
});

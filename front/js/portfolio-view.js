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
  const params = new URLSearchParams(window.location.search);
  const id = params.get("id");
  const msg = document.getElementById("message");

  if (!id) {
    msg.textContent = "잘못된 접근입니다.";
    return;
  }

  // 기존 데이터
  try {
    const res = await fetch(`http://localhost:8081/portfolio/${id}`, {
      headers: { "Authorization": `Bearer ${token}` }
    });
    const result = await res.json();

    if (res.ok && result.success) {
      const data = result.data;
      document.getElementById("title").value = data.title;
      document.getElementById("description").value = data.description;
      document.getElementById("fileLink").href = data.fileUrl;
    } else {
      msg.textContent = "포트폴리오 정보를 불러올 수 없습니다.";
    }
  } catch {
    msg.textContent = "서버 오류로 데이터를 불러오지 못했습니다.";
  }

  // 수정 폼 제출
  document.getElementById("editForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    const title = document.getElementById("title").value;
    const description = document.getElementById("description").value;
    const file = document.getElementById("file").files[0];

    const formData = new FormData();
    formData.append("title", title);
    formData.append("description", description);
    if (file) formData.append("file", file);

    try {
      const res = await fetch(`http://localhost:8081/portfolio/update/${id}`, {
        method: "PUT",
        headers: { "Authorization": `Bearer ${token}` },
        body: formData
      });
      const result = await res.json();

      if (res.ok && result.success) {
        msg.style.color = "#27ae60";
        msg.textContent = "수정이 완료되었습니다!";
        setTimeout(() => (window.location.href = "portfolio.html"), 1000);
      } else {
        msg.style.color = "#e74c3c";
        msg.textContent = result.message || "수정 실패";
      }
    } catch {
      msg.style.color = "#e74c3c";
      msg.textContent = "서버 오류로 수정 실패";
    }
  });
});

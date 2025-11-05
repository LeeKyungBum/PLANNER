document.addEventListener("DOMContentLoaded", async () => {
  const token = localStorage.getItem("token");
  const uid = localStorage.getItem("uid");
  const params = new URLSearchParams(window.location.search);
  const id = params.get("id");

  const titleEl = document.getElementById("detailTitle");
  const companyEl = document.getElementById("detailCompany");
  const qaContainer = document.getElementById("qaContainer");
  const msg = document.getElementById("message");

  const moreBtn = document.querySelector(".more-btn");
  const dropdown = document.querySelector(".dropdown-menu");

  const editBtn = document.getElementById("editBtn");
  const deleteBtn = document.getElementById("deleteBtn");
  const backBtn = document.getElementById("backBtn");

  let editMode = false;

  // ... 메뉴 열기 / 닫기
  moreBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    dropdown.classList.toggle("hidden");
  });

  document.addEventListener("click", () => dropdown.classList.add("hidden"));

  // 불러오기
  async function loadResume() {
    const res = await fetch(`http://localhost:8081/planner/resume/${uid}/${id}`, {
      headers: { "Authorization": `Bearer ${token}` }
    });
    const data = await res.json();

    titleEl.textContent = data.title;
    companyEl.textContent = `지원 회사: ${data.company}`;

    qaContainer.innerHTML = "";
    data.questions.forEach((q, i) => {
      const block = document.createElement("div");
      block.classList.add("qa-block");
      block.innerHTML = editMode
        ? `<input type="text" class="question" value="${q.question}">
           <textarea class="answer">${q.answer}</textarea>`
        : `<p><strong>Q${i + 1}. ${q.question}</strong></p><p>${q.answer}</p>`;
      qaContainer.appendChild(block);
    });
  }

  // 수정
  editBtn.addEventListener("click", async (e) => {
    e.stopPropagation();
    dropdown.classList.add("hidden");

    editMode = true;
    moreBtn.style.display = "none"; // ... 숨김
    backBtn.textContent = "저장하기"; // 버튼 이름 변경
    backBtn.classList.add("save-mode"); // 모드 식별용 클래스

    msg.textContent = "수정 모드입니다.";
    msg.style.color = "orange";

    await loadResume();
  });

  // 삭제
  deleteBtn.addEventListener("click", async (e) => {
    e.stopPropagation();
    dropdown.classList.add("hidden");

    if (!confirm("정말 삭제하시겠습니까?")) return;
    const res = await fetch(`http://localhost:8081/planner/resume/${uid}/${id}`, {
      method: "DELETE",
      headers: { "Authorization": `Bearer ${token}` }
    });
    if (res.ok) {
      alert("삭제 완료!");
      location.href = "resume.html";
    }
  });

  // 목록으로 / 저장하기
  backBtn.addEventListener("click", async () => {
    // 저장 모드일 때
    if (editMode && backBtn.classList.contains("save-mode")) {
      const title = titleEl.textContent;
      const company = companyEl.textContent.replace("지원 회사: ", "");
      const questions = Array.from(document.querySelectorAll(".qa-block")).map(block => ({
        question: block.querySelector(".question").value.trim(),
        answer: block.querySelector(".answer").value.trim(),
      }));

      try {
        const res = await fetch(`http://localhost:8081/planner/resume/${uid}/${id}`, {
          method: "PUT",
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({ title, company, questions })
        });

        if (res.ok) {
          msg.textContent = "저장 완료!";
          msg.style.color = "green";
          editMode = false;

          backBtn.textContent = "목록으로"; // 원래대로
          backBtn.classList.remove("save-mode");
          moreBtn.style.display = "block"; // ... 다시 표시

          await loadResume();
        } else {
          msg.textContent = "저장 실패";
          msg.style.color = "red";
        }
      } catch (err) {
        console.error(err);
      }
    } else {
      // 일반 목록 이동
      location.href = "resume.html";
    }
  });

  await loadResume();
});

document.addEventListener("DOMContentLoaded", async () => {
  const token = localStorage.getItem("token");
  const uid = localStorage.getItem("uid");
  const addBtn = document.getElementById("addQuestionBtn");
  const saveBtn = document.getElementById("saveBtn");
  const qaContainer = document.getElementById("qaContainer");
  const msg = document.getElementById("message");
  const listContainer = document.getElementById("resumeList"); // 추가: 목록 영역

  // 질문 추가
  addBtn.addEventListener("click", () => {
    const newBlock = document.createElement("div");
    newBlock.classList.add("qa-block");

    newBlock.innerHTML = `
      <div class="qa-header">
        <button class="remove-btn">−</button>
      </div>
      <input type="text" class="question" placeholder="질문을 입력하세요.">
      <textarea class="answer" placeholder="답변을 입력하세요."></textarea>
    `;

    qaContainer.appendChild(newBlock);

    // 삭제 버튼 기능 연결
    const removeBtn = newBlock.querySelector(".remove-btn");
    removeBtn.addEventListener("click", () => {
      newBlock.remove();
    });
  });

  // 저장
  saveBtn.addEventListener("click", async () => {
    const title = document.getElementById("title").value.trim();
    const company = document.getElementById("company").value.trim();
    const questions = Array.from(document.querySelectorAll(".qa-block")).map(block => ({
      question: block.querySelector(".question").value.trim(),
      answer: block.querySelector(".answer").value.trim(),
    }));

    if (!title || !company) {
      msg.textContent = "제목과 회사를 입력해주세요.";
      msg.style.color = "red";
      return;
    }

    try {
      const res = await fetch(`http://localhost:8081/planner/resume/${uid}`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ title, company, questions })
      });

      if (res.ok) {
        msg.textContent = "저장 완료!";
        msg.style.color = "green";

        // 입력칸 초기화
        document.getElementById("title").value = "";
        document.getElementById("company").value = "";
        qaContainer.innerHTML = `
          <div class="qa-block">
            <input type="text" class="question" placeholder="질문을 입력하세요.">
            <textarea class="answer" placeholder="답변을 입력하세요."></textarea>
          </div>
        `;

        await loadResumes(); // 저장 후 목록 새로고침
      } else {
        msg.textContent = "저장 실패. 다시 시도해주세요.";
        msg.style.color = "red";
      }
    } catch (err) {
      console.error(err);
      msg.textContent = "오류가 발생했습니다.";
      msg.style.color = "red";
    }
  });

  // 목록 불러오기 함수
  async function loadResumes() {
    if (!listContainer) return; // resumeList div 없으면 생략

    listContainer.innerHTML = "<p>불러오는 중...</p>";

    try {
      const res = await fetch(`http://localhost:8081/planner/resume/${uid}`, {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });

      if (!res.ok) throw new Error("목록 불러오기 실패");

      const data = await res.json();

      if (!data.length) {
        listContainer.innerHTML = "<p>작성한 자기소개서가 없습니다.</p>";
        return;
      }

      listContainer.innerHTML = "";
      data.forEach(r => {
        const card = document.createElement("div");
        card.classList.add("resume-card");

        card.innerHTML = `
          <h3>${r.title}</h3>
          <p>회사 명: ${r.company}</p>
          <div class="card-buttons">
            <button class="view-btn" onclick="location.href='resume-detail.html?id=${r.id}'">상세보기</button>
          </div>
        `;

        listContainer.appendChild(card);
      });
    } catch (err) {
      console.error(err);
      listContainer.innerHTML = "<p>불러오기 오류 발생</p>";
    }
  }

  // 페이지 진입 시 바로 목록 불러오기
  await loadResumes();
});

// 기본 첫 번째 칸에는 제거 버튼 숨기기
document.querySelector(".qa-block .remove-btn")?.classList.add("hidden");

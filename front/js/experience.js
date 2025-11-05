document.addEventListener("DOMContentLoaded", async () => {
  const uid = localStorage.getItem("uid");
  const token = localStorage.getItem("token");

  const form = document.getElementById("experienceForm");
  const listContainer = document.getElementById("experienceList");

  const categorySelect = document.getElementById("category");
  const careerFields = document.getElementById("careerFields");

  const msg = document.getElementById("uploadMessage");
  const fileInput = document.getElementById("file");
  const fileNameEl = document.getElementById("fileName");
  
  const modal = document.getElementById("expModal");
  const closeBtn = document.querySelector(".close");

  let editId = null; // 수정 중인 ID
  let currentFileUrl = null; // 수정 시 기존 파일 URL

  categorySelect.addEventListener("change", () => {
    const value = categorySelect.value;

    if (value === "certificate") {
      // 숨기기
      careerFields.style.display = "none";

      // required 제거
      organization.removeAttribute("required");
      startDate.removeAttribute("required");

      // 값 초기화
      organization.value = "";
      position.value = "";
      startDate.value = "";
      endDate.value = "";
      ongoing.checked = false;
    } else if (value === "career") {
      // 보이기
      careerFields.style.display = "block";

      // required 다시 추가
      organization.setAttribute("required", "true");
      startDate.setAttribute("required", "true");
    }
  });

  // 파일명 표시
  fileInput.addEventListener("change", () => {
    fileNameEl.textContent = fileInput.files.length
      ? fileInput.files[0].name
      : currentFileUrl
      ? "기존 파일 유지됨"
      : "선택된 파일 없음";
  });

  // 등록 or 수정
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const formData = new FormData(form);

    // 파일이 없고 기존 파일 유지라면, fileUrl 그대로 전달
    if (!fileInput.files.length && currentFileUrl) {
      formData.append("fileUrl", currentFileUrl);
    }

    const method = editId ? "PUT" : "POST";
    const url = editId
      ? `http://localhost:8081/planner/experience/${editId}`
      : `http://localhost:8081/planner/experience/${uid}`;

    try {
      const res = await fetch(url, {
        method,
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      if (!res.ok) throw new Error("저장 실패");

      msg.textContent = editId ? "수정 완료!" : "등록 완료!";
      msg.style.color = "#27ae60";

      // 등록 시 XP +5
      // if (!editId) await addXP(uid, 5, "경력/자격증 등록");

      form.reset();
      fileNameEl.textContent = "선택된 파일 없음";
      editId = null;
      currentFileUrl = null;
      loadList();
    } catch (err) {
      msg.textContent = "오류가 발생했습니다.";
      msg.style.color = "#e74c3c";
      console.error(err);
    }
  });

  // XP 추가 요청 (등록 시에만)
  // async function addXP(uid, gain, activity) {
  //   try {
  //     await fetch(`http://localhost:8081/planner/level/xp/${uid}`, {
  //       method: "POST",
  //       headers: {
  //         "Authorization": `Bearer ${token}`,
  //         "Content-Type": "application/json",
  //       },
  //       body: JSON.stringify({ gain, activity }),
  //     });
  //   } catch (err) {
  //     console.error("XP 추가 실패:", err);
  //   }
  // }

  // 목록 불러오기
  async function loadList() {
    listContainer.innerHTML = "";
    const res = await fetch(`http://localhost:8081/planner/experience/list/${uid}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();

    data.forEach((exp) => {
      const card = document.createElement("div");
      card.className = "exp-card";
      card.dataset.id = exp.id;

      const period = exp.ongoing
        ? `${exp.startDate} ~ 진행 중`
        : `${exp.startDate} ~ ${exp.endDate || "-"}`;

      const isCareer = exp.category === "career";

      card.innerHTML = `
        <h3>${exp.title}</h3>
        <p><b>분류:</b> ${isCareer ? "경력" : "자격증"}</p>
        ${isCareer ? `<p><b>소속:</b> ${exp.organization}</p>` : ""}
        ${isCareer ? `<p><b>직위:</b> ${exp.position || "-"}</p>` : ""}
        ${isCareer ? `<p><b>기간:</b> ${period}</p>` : ""}
        <p><b>설명:</b> ${exp.description || "-"}</p>
        <div class="btns">
          <button class="detail-btn" data-id="${exp.id}">상세보기</button>
          <button class="edit-btn" data-id="${exp.id}">수정</button>
          <button class="delete-btn" data-id="${exp.id}">삭제</button>
        </div>
      `;
      listContainer.appendChild(card);
    });

    // 상세보기 버튼
    document.querySelectorAll(".detail-btn").forEach((btn) =>
      btn.addEventListener("click", async () => {
        const id = btn.dataset.id;
        const res = await fetch(
          `http://localhost:8081/planner/experience/detail/${id}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const data = await res.json();
        showModal(data);
      })
    );

    // 수정 버튼
    document.querySelectorAll(".edit-btn").forEach((btn) =>
      btn.addEventListener("click", async () => {
        const id = btn.dataset.id;
        const res = await fetch(
          `http://localhost:8081/planner/experience/detail/${id}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const exp = await res.json();
        fillForm(exp);
        editId = id;
        msg.textContent = "수정 모드입니다. (파일 선택하지 않으면 기존 파일 유지)";
        msg.style.color = "#2980b9";
        window.scrollTo({ top: 0, behavior: "smooth" });
      })
    );

    // 삭제 버튼
    document.querySelectorAll(".delete-btn").forEach((btn) =>
      btn.addEventListener("click", async () => {
        if (!confirm("정말 삭제할까요?")) return;
        const id = btn.dataset.id;
        await fetch(`http://localhost:8081/planner/experience/${id}`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        });
        loadList();
      })
    );
  }

  // 폼 채우기 (수정 시)
  function fillForm(exp) {
    form.category.value = exp.category;
    form.title.value = exp.title;
    form.organization.value = exp.organization;
    form.position.value = exp.position || "";
    form.startDate.value = exp.startDate;
    form.endDate.value = exp.endDate || "";
    form.ongoing.checked = exp.ongoing;
    form.description.value = exp.description || "";
    currentFileUrl = exp.fileUrl || null;
    fileNameEl.textContent = currentFileUrl
      ? "기존 파일 유지됨"
      : "선택된 파일 없음";
  }

  // 상세보기 모달
  function showModal(data) {
    modal.style.display = "block";
    document.getElementById("modalTitle").textContent = data.title;

    const modalOrg = document.getElementById("modalOrg");
    const modalPosition = document.getElementById("modalPosition");
    const modalPeriod = document.getElementById("modalPeriod");

    if (data.category === "career") {
      modalOrg.style.display = "block";
      modalPosition.style.display = "block";
      modalPeriod.style.display = "block";

      modalOrg.textContent = `소속: ${data.organization}`;
      modalPosition.textContent = `직위: ${data.position || "-"}`;
      const period = data.ongoing
        ? `${data.startDate} ~ 진행 중`
        : `${data.startDate} ~ ${data.endDate || "-"}`;
      modalPeriod.textContent = `기간: ${period}`;
    } else {
      // 자격증이면 숨김
      modalOrg.style.display = "none";
      modalPosition.style.display = "none";
      modalPeriod.style.display = "none";
    }

    document.getElementById("modalDesc").textContent = data.description || "-";

    const link = document.getElementById("modalFile");
    if (data.fileUrl) {
      link.href = data.fileUrl;
      link.style.display = "inline";
    } else {
      link.style.display = "none";
    }
  }

  // 모달 닫기
  closeBtn.onclick = () => (modal.style.display = "none");
  window.onclick = (e) => {
    if (e.target === modal) modal.style.display = "none";
  };

  loadList();
});

document.addEventListener("DOMContentLoaded", async () => {
  const container = document.getElementById("homePostContainer");
  const moreBtn = document.getElementById("goNetworkBtn");
  const token = localStorage.getItem("token");
  const rankingContainer = document.getElementById("rankingContainer");

  // Firestore의 Timestamp를 처리하는 유틸
  function formatDate(dateValue) {
    try {
      const sec = dateValue.seconds ?? dateValue._seconds;
      const nano = dateValue.nanos ?? dateValue._nanoseconds;
      if (sec) {
        const d = new Date(sec * 1000 + Math.floor(nano / 1_000_000));
        return d.toLocaleDateString();
      }
      return new Date(dateValue).toLocaleDateString();
    } catch {
      return "-";
    }
  }

  // 게시글 불러오기 (최신 5개만)
  try {
    const res = await fetch("http://localhost:8081/planner/posts?limit=5");
    if (!res.ok) throw new Error("게시글 불러오기 실패");
    const posts = await res.json();

    if (!posts.length) {
      container.innerHTML = `<p class="empty-text">아직 등록된 게시글이 없습니다.</p>`;
      return;
    }

    container.innerHTML = posts.map(p => `
      <div class="post-card" data-id="${p.id}">
        ${p.imageUrl ? `<img src="${p.imageUrl}" alt="게시글 이미지">` : ""}
        <div class="title">${p.title}</div>
        <div class="meta">${p.author} | ${formatDate(p.createdAt)}</div>
      </div>
    `).join("");

    // 카드 클릭 이벤트
    container.addEventListener("click", (e) => {
      const card = e.target.closest(".post-card");
      if (!card) return;
      const id = card.dataset.id;
      location.href = `network-detail.html?id=${id}`;
    });

  } catch (err) {
    console.error(err);
    container.innerHTML = `<p class="empty-text">게시글을 불러올 수 없습니다.<br>서버 오류 발생</p>`;
  }

  // “더보기” 버튼
  moreBtn.addEventListener("click", () => {
    location.href = "network.html";
  });

  try {
    const res = await fetch("http://localhost:8081/planner/level/ranking", {
      headers: { "Authorization": `Bearer ${token}` }
    });

    if (!res.ok) throw new Error("랭킹 로드 실패");
    const result = await res.json();

    rankingContainer.innerHTML = "";

    if (result.data && result.data.length > 0) {
      result.data.slice(0, 5).forEach((user, index) => {
        const card = document.createElement("div");
        card.className = "ranking-card";
        card.innerHTML = `
          <div class="rank">#${index + 1}</div>
          <div class="username">${user.nickname}</div>
          <div class="level">Lv.${user.currentLevel}</div>
        `;
        rankingContainer.appendChild(card);
      });
    } else {
      rankingContainer.innerHTML = "<p>아직 랭킹 데이터가 없습니다.</p>";
    }
  } catch (err) {
    rankingContainer.innerHTML = "<p>랭킹을 불러오지 못했습니다.</p>";
    console.error(err);
  }
});

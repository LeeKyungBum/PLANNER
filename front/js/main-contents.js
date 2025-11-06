document.addEventListener("DOMContentLoaded", async () => {
  const container = document.getElementById("homePostContainer");
  const moreBtn = document.getElementById("goNetworkBtn");

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
    container.innerHTML = `<p class="empty-text">게시글을 불러오는 중 오류가 발생했습니다.</p>`;
  }

  // “더보기” 버튼
  moreBtn.addEventListener("click", () => {
    location.href = "network.html";
  });
});

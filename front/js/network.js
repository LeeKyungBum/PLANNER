document.addEventListener("DOMContentLoaded", () => {
  const uid = localStorage.getItem("uid");
  const token = localStorage.getItem("token");

  const categoryBtns = document.querySelectorAll(".category-tabs button");
  const searchInput = document.getElementById("searchInput");
  const postContainer = document.getElementById("postContainer");
  const newPostBtn = document.getElementById("newPostBtn");

  let currentCategory = "전체"; // 초기값 변경
  let posts = [];

  // 게시글 불러오기 함수
  async function loadPosts(category) {
    let url = "http://localhost:8081/planner/posts";
    if (category && category !== "전체") {
      url += `?category=${category}`;
    }

    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error("게시글을 불러오는 중 오류 발생");
      posts = await res.json();
      renderPosts(posts);
    } catch (err) {
      console.error(err);
      postContainer.innerHTML = `<p class="empty-text">게시글을 불러오는 중 오류가 발생했습니다.</p>`;
    }
  }

  // 게시글 카드 렌더링
  function renderPosts(list) {
    if (!list.length) {
      postContainer.innerHTML = `<p class="empty-text">게시글이 없습니다.</p>`;
      return;
    }

    postContainer.innerHTML = list.map(p => `
      <div class="post-card" data-id="${p.id}">
        ${p.imageUrl ? `<img src="${p.imageUrl}" alt="게시글 이미지">` : ""}
        <div class="title">${p.title}</div>
        <div class="meta">${p.author} | ${new Date(p.createdAt).toLocaleDateString()}</div>
        ${p.uid === uid ? `
          <div class="actions">
            <button class="editBtn" data-id="${p.id}">수정</button>
            <button class="deleteBtn" data-id="${p.id}">삭제</button>
          </div>` : ""}
      </div>
    `).join("");
  }

  // 카테고리 버튼 이벤트
  categoryBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      categoryBtns.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      currentCategory = btn.dataset.category;
      loadPosts(currentCategory);
    });
  });

  // 검색 기능
  searchInput.addEventListener("input", () => {
    const keyword = searchInput.value.toLowerCase();
    const filtered = posts.filter(p => p.title.toLowerCase().includes(keyword));
    renderPosts(filtered);
  });

  // 글쓰기 버튼
  newPostBtn.addEventListener("click", () => {
    if (!token) {
      alert("로그인이 필요합니다.");
      return;
    }
    const categoryParam = currentCategory !== "전체" ? `?category=${currentCategory}` : "";
    location.href = `network-write.html${categoryParam}`;
  });

  // 카드 클릭 (상세/수정/삭제)
  postContainer.addEventListener("click", (e) => {
    const id = e.target.closest(".post-card")?.dataset.id;
    if (!id) return;

    if (e.target.classList.contains("editBtn")) {
      location.href = `network-write.html?editId=${id}`;
      return;
    }

    if (e.target.classList.contains("deleteBtn")) {
      if (confirm("정말 삭제하시겠습니까?")) {
        fetch(`http://localhost:8081/planner/posts/${id}`, {
          method: "DELETE",
          headers: { "Authorization": `Bearer ${token}` }
        }).then(() => loadPosts(currentCategory));
      }
      return;
    }

    location.href = `network-detail.html?id=${id}`;
  });

  // 초기 로드
  loadPosts(currentCategory);
});

document.addEventListener("DOMContentLoaded", async () => {
  let uid = localStorage.getItem("uid");
  const token = localStorage.getItem("token");
  const loginBtn = document.getElementById("loginBtn");


  // auth.js를 안 쓰는 이유는 게시물을 조회할 때는 비 로그인인 유저도 가능하게 하기 위함임
  // 그것을 하기 위해 수정,삭제,등록 시에는 로그인 페이지로 유도하도록 하였음
  if (token) {
    try {
      const res = await fetch("http://localhost:8081/auth/myInfo", {
        method: "GET",
        headers: { "Authorization": `Bearer ${token}` },
      });
      const result = await res.json();

      if (res.ok && result.success) {
        const user = result.data;
        uid = user.uid; // <- 여기가 핵심
        loginBtn.innerHTML = `
          <span style="color:white;font-size:14px;margin-right:10px;">${user.name}님</span>
          <a href="#" id="logoutBtn" class="login-btn">로그아웃</a>
        `;
        document.getElementById("logoutBtn").addEventListener("click", () => {
          localStorage.removeItem("token");
          localStorage.removeItem("uid");
          window.location.reload();
        });
      } else {
        loginBtn.innerHTML = `<a href="login.html" class="login-btn">로그인</a>`;
      }
    } catch (err) {
      console.error("인증 확인 오류:", err);
      loginBtn.innerHTML = `<a href="login.html" class="login-btn">로그인</a>`;
    }
  } else {
    loginBtn.innerHTML = `<a href="login.html" class="login-btn">로그인</a>`;
  }

  const categoryBtns = document.querySelectorAll(".category-tabs button");
  const searchInput = document.getElementById("searchInput");
  const postContainer = document.getElementById("postContainer");
  const newPostBtn = document.getElementById("newPostBtn");

  let currentCategory = "전체"; // 초기값
  let posts = [];

  // 게시글 불러오기
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
    const isLoggedIn = token && uid; // 로그인 여부 확인

    if (!list.length) {
      postContainer.innerHTML = `<p class="empty-text">게시글이 없습니다.</p>`;
      return;
    }

    postContainer.innerHTML = list.map(p => `
      <div class="post-card" data-id="${p.id}">
        ${p.imageUrl ? `<img src="${p.imageUrl}" alt="게시글 이미지">` : ""}
        <div class="title">${p.title}</div>
        <div class="meta">${p.author} | ${formatDate(p.createdAt)}</div>

        ${
          isLoggedIn && p.uid === uid
            ? `
              <div class="actions">
                <button class="editBtn" data-id="${p.id}">수정</button>
                <button class="deleteBtn" data-id="${p.id}">삭제</button>
              </div>
            `
            : ""
        }
      </div>
    `).join("");
  }

  // Firestore Timestamp를 YYYY-MM-DD 변환하는 함수
  function formatDate(dateValue) {
    try {
      if (!dateValue) return "-";

      // Firestore Timestamp 형태 (seconds/nanos or _seconds/_nanoseconds)
      const seconds = dateValue.seconds ?? dateValue._seconds;
      const nanos = dateValue.nanos ?? dateValue._nanoseconds;

      if (seconds) {
        const d = new Date(seconds * 1000 + Math.floor(nanos / 1_000_000));
        return d.toLocaleString();
      }

      // 문자열 또는 Date형일 경우
      return new Date(dateValue).toLocaleString();
    } catch {
      return "-";
    }
}


  // 카테고리 클릭 이벤트
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

  // 글쓰기 버튼 클릭
  newPostBtn.addEventListener("click", () => {
    if (!token) {
      alert("로그인이 필요한 서비스입니다.");
      location.href = "login.html";
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

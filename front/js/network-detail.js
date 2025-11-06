document.addEventListener("DOMContentLoaded", async () => {
  const uid = localStorage.getItem("uid");
  const token = localStorage.getItem("token");

  const params = new URLSearchParams(location.search);
  const postId = params.get("id");

  const titleEl = document.getElementById("postTitle");
  const metaEl = document.getElementById("postMeta");
  const contentEl = document.getElementById("postContent");
  const imageEl = document.getElementById("postImage");
  const postActions = document.getElementById("postActions");
  const editBtn = document.getElementById("editPostBtn");
  const deleteBtn = document.getElementById("deletePostBtn");

  const commentList = document.getElementById("commentList");
  const commentInput = document.getElementById("commentInput");
  const commentSubmit = document.getElementById("commentSubmitBtn");

  let post = null;
  let comments = [];

  // 날짜 포맷 맞추는 함수
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


  // 게시글 불러오기
  async function loadPost() {
    const res = await fetch(`http://localhost:8081/planner/posts/${postId}`);
    post = await res.json();

    titleEl.textContent = post.title;
    metaEl.textContent = `${post.author} | ${formatDate(post.createdAt).toLocaleString()}`;
    contentEl.textContent = post.content;

    if (post.imageUrl) {
      imageEl.src = post.imageUrl;
      imageEl.style.display = "block";
    }

    if (uid === post.uid) postActions.style.display = "flex";
  }

  // 게시글 수정/삭제
  editBtn.addEventListener("click", () => {
    location.href = `network-write.html?editId=${postId}`;
  });

  deleteBtn.addEventListener("click", async () => {
    if (!confirm("정말 삭제하시겠습니까?")) return;
    await fetch(`http://localhost:8081/planner/posts/${postId}`, {
      method: "DELETE",
      headers: { "Authorization": `Bearer ${token}` }
    });
    alert("삭제되었습니다.");
    location.href = "network.html";
  });

  // 댓글 불러오기
  async function loadComments() {
    const res = await fetch(`http://localhost:8081/planner/posts/${postId}/comments`);
    comments = await res.json();
    renderComments();
  }

  // 댓글 렌더링
  function renderComments() {
    if (!comments.length) {
      commentList.innerHTML = `<p class="empty-text">등록된 댓글이 없습니다.</p>`;
      return;
    }

    commentList.innerHTML = comments.map(c => `
      <div class="comment" data-id="${c.id}">
        <div>
          <span class="author">${c.author}</span>
          <span class="date">${formatDate(c.createdAt).toLocaleString()}</span>
        </div>
        <div class="text">${c.content}</div>
        ${uid === c.uid ? `
          <div class="comment-actions">
            <button class="editCommentBtn">수정</button>
            <button class="deleteCommentBtn">삭제</button>
          </div>
        ` : ""}
      </div>
    `).join("");
  }

  // 댓글 작성
  commentSubmit.addEventListener("click", async () => {
    if (!token) {
      alert("로그인이 필요합니다.");
      window.location.href = "login.html";
      return;
    }

    const content = commentInput.value.trim();
    if (!content) return alert("내용을 입력해주세요.");

    await fetch(`http://localhost:8081/planner/posts/${postId}/comments`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ uid, content })
    });

    commentInput.value = "";
    loadComments();
  });

  // 댓글 수정/삭제
  commentList.addEventListener("click", async (e) => {
    const commentEl = e.target.closest(".comment");
    if (!commentEl) return;

    const commentId = commentEl.dataset.id;

    // 수정
    if (e.target.classList.contains("editCommentBtn")) {
      const oldText = commentEl.querySelector(".text").textContent;
      const newText = prompt("댓글 수정:", oldText);
      if (newText === null || newText.trim() === "") return;

      await fetch(`http://localhost:8081/planner/posts/${postId}/comments/${commentId}`, {
        method: "PUT",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ content: newText })
      });

      loadComments();
    }

    // 삭제
    if (e.target.classList.contains("deleteCommentBtn")) {
      if (!confirm("댓글을 삭제하시겠습니까?")) return;

      await fetch(`http://localhost:8081/planner/posts/${postId}/comments/${commentId}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` }
      });

      loadComments();
    }
  });

  // 초기 로드
  await loadPost();
  await loadComments();
});

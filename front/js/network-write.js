document.addEventListener("DOMContentLoaded", async () => {
  const uid = localStorage.getItem("uid");
  const token = localStorage.getItem("token");

  const params = new URLSearchParams(location.search);
  const editId = params.get("editId");
  const defaultCategory = params.get("category");

  const form = document.getElementById("writeForm");
  const categorySelect = document.getElementById("categorySelect");
  const titleInput = document.getElementById("title");
  const contentInput = document.getElementById("content");
  const imageInput = document.getElementById("image");

  if (defaultCategory) categorySelect.value = defaultCategory;

  // 수정 모드
  if (editId) {
    document.getElementById("pageTitle").textContent = "글 수정";
    const res = await fetch(`http://localhost:8081/planner/posts/${editId}`);
    const post = await res.json();
    categorySelect.value = post.category;
    titleInput.value = post.title;
    contentInput.value = post.content;
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const title = titleInput.value.trim();
    const content = contentInput.value.trim();
    const category = categorySelect.value;
    const file = imageInput.files[0];

    if (!title || !content) {
      alert("제목과 내용을 입력해주세요.");
      return;
    }

    const formData = new FormData();
    formData.append("uid", uid);
    formData.append("title", title);
    formData.append("content", content);
    formData.append("category", category);
    if (file) formData.append("image", file);

    const url = editId
      ? `http://localhost:8081/planner/posts/${editId}`
      : `http://localhost:8081/planner/posts`;

    const method = editId ? "PUT" : "POST";

    try {
      const res = await fetch(url, {
        method,
        headers: {
          "Authorization": `Bearer ${token}`
        },
        body: formData
      });

      if (res.ok) {
        alert(editId ? "게시글이 수정되었습니다." : "게시글이 등록되었습니다.");
        location.href = "network.html";
      } else {
        const result = await res.text();
        alert("업로드 실패: " + result);
      }
    } catch (err) {
      console.error(err);
      alert("서버 오류가 발생했습니다.");
    }
  });
});

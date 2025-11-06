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
  const cancelBtn = document.getElementById("cancelBtn");

  if (defaultCategory) categorySelect.value = defaultCategory;

  // 수정 모드일 경우 데이터 불러오기
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

    const formData = new FormData();
    formData.append("uid", uid);
    formData.append("category", categorySelect.value);
    formData.append("title", titleInput.value);
    formData.append("content", contentInput.value);
    if (imageInput.files[0]) formData.append("image", imageInput.files[0]);

    const url = editId 
      ? `http://localhost:8081/planner/posts/${editId}`
      : `http://localhost:8081/planner/posts`;
    const method = editId ? "PUT" : "POST";

    await fetch(url, {
      method,
      headers: { "Authorization": `Bearer ${token}` },
      body: formData
    });

    alert(editId ? "수정되었습니다." : "등록되었습니다.");
    location.href = "network.html";
  });

  cancelBtn.addEventListener("click", () => location.href = "network.html");
});

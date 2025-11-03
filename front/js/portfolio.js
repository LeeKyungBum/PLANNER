const API_BASE = "http://localhost:8081/api/portfolio";

const uploadForm = document.getElementById("uploadForm");
const portfolioList = document.getElementById("portfolio-list");

uploadForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const formData = new FormData(uploadForm);
  const res = await fetch(`${API_BASE}/upload`, {
    method: "POST",
    body: formData
  });

  if (res.ok) {
    alert("포트폴리오가 업로드되었습니다!");
    uploadForm.reset();
    loadPortfolios();
  }
});

async function loadPortfolios() {
  portfolioList.innerHTML = "";
  const res = await fetch(`${API_BASE}/list`);
  const data = await res.json();

  data.forEach((item) => {
    const div = document.createElement("div");
    div.classList.add("portfolio-card");
    div.innerHTML = `
      <h3>${item.title}</h3>
      <p>${item.description}</p>
      <a href="${item.fileUrl}" target="_blank">${item.originalFileName}</a>
      <span>${new Date(item.uploadedAt).toLocaleDateString()}</span>
    `;
    portfolioList.appendChild(div);
  });
}

loadPortfolios();

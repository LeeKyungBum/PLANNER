// network-detail과 write에 적용할 헤더 js
document.addEventListener("DOMContentLoaded", async () => {
  const token = localStorage.getItem("token");
  const loginBtn = document.getElementById("loginBtn");

  if (!loginBtn) return;

  if (!token) {
    // 로그인 안 된 상태
    loginBtn.innerHTML = `<a href="login.html" class="login-btn">로그인</a>`;
    return;
  }

  try {
    const res = await fetch("http://localhost:8081/auth/myInfo", {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
      },
    });

    const result = await res.json();

    if (res.ok && result.success) {
      const user = result.data;
      loginBtn.innerHTML = `
        <span style="color:white;font-size:14px;margin-right:10px;">${user.name}님</span>
        <a href="#" id="logoutBtn" class="login-btn">로그아웃</a>
      `;

      // 로그아웃 기능
      document.getElementById("logoutBtn").addEventListener("click", () => {
        localStorage.removeItem("token");
        localStorage.removeItem("uid");
        window.location.reload();
      });
    } else {
      loginBtn.innerHTML = `<a href="login.html" class="login-btn">로그인</a>`;
    }
  } catch (err) {
    console.error("로그인 상태 확인 실패:", err);
    loginBtn.innerHTML = `<a href="login.html" class="login-btn">로그인</a>`;
  }
});

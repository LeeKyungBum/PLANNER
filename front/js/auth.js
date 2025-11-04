document.addEventListener("DOMContentLoaded", async () => {
  const token = localStorage.getItem("token");
  const loginBtn = document.getElementById("loginBtn");

  const isMainPage = window.location.pathname.endsWith("index.html") || window.location.pathname === "/";

  if (!token && isMainPage) {
    loginBtn.innerHTML = `<a href="login.html" class="login-btn">로그인</a>`;
    return;
  }

  if (!token && !isMainPage) {
    window.alert("로그인이 필요한 서비스입니다.");
    window.location.href = "login.html";
    return;
  }

  try {
    const res = await fetch("http://localhost:8081/auth/myInfo", {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      credentials: "include",
      mode: "cors"
    });

    const result = await res.json();

    if (res.ok && result.success) {
      const user = result.data;
      console.log("현재 로그인 사용자:", user);

      loginBtn.innerHTML = `
        <span style="color:white;font-size:14px;margin-right:10px;">${user.name}님</span>
        <a href="#" id="logoutBtn" class="login-btn">로그아웃</a>
      `;

      document.getElementById("logoutBtn").addEventListener("click", () => {
        localStorage.removeItem("token");
        window.location.reload();
      });

    } else {
      localStorage.removeItem("token");
      alert("로그인이 만료되었습니다. 다시 로그인해주세요.");
      if (!isMainPage) window.location.href = "login.html";
      else loginBtn.innerHTML = `<a href="login.html" class="login-btn">로그인</a>`;
    }
  } catch (err) {
    console.error("인증 확인 오류:", err);
    localStorage.removeItem("token");
    if (!isMainPage) window.location.href = "login.html";
    else loginBtn.innerHTML = `<a href="login.html" class="login-btn">로그인</a>`;
  }
});

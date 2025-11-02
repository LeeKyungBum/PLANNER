document.addEventListener("DOMContentLoaded", async () => {
  const token = localStorage.getItem("token");
  const loginBtn = document.getElementById("loginBtn");

  // 현재 페이지 이름 (index.html인지 확인)
  const isMainPage = window.location.pathname.endsWith("index.html") || window.location.pathname === "/";

  // index.html에서는 로그인 없어도 접근 가능
  if (!token && isMainPage) {
    loginBtn.innerHTML = `<a href="login.html" class="login-btn">로그인</a>`;
    return;
  }

  // 로그인 안 된 상태에서 보호 페이지 접근 시 차단
  if (!token && !isMainPage) {
    window.location.href = "login.html";
    return;
  }

  // 서버에 토큰 검증
  try {
    const res = await fetch("http://localhost:8081/auth/me", {
      headers: { "Authorization": `Bearer ${token}` },
    });

    if (res.ok) {
      const user = await res.json();

      // 로그인 상태일 때 UI 변경
      loginBtn.innerHTML = `
        <span style="color:white;font-size:14px;margin-right:10px;">${user.name}님</span>
        <a href="#" id="logoutBtn" class="login-btn">로그아웃</a>
      `;

      // 로그아웃 처리
      document.getElementById("logoutBtn").addEventListener("click", () => {
        localStorage.removeItem("token");
        window.location.reload();
      });
    } else {
      // 토큰이 만료되었거나 잘못된 경우
      localStorage.removeItem("token");
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

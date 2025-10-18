document.getElementById("loginForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const data = {
    email: document.getElementById("email").value,
    password: document.getElementById("password").value
  };
  const msg = document.getElementById("serverMessage");

  try {
    const res = await fetch("http://localhost:8081/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    });
    if (res.ok) {
      const result = await res.json();
      localStorage.setItem("token", result.token);
      msg.style.color = "#27ae60";
      msg.textContent = "로그인 성공!";
      setTimeout(() => (window.location.href = "index.html"), 1000);

    } else {
      msg.style.color = "#e74c3c";
      msg.textContent = "로그인 실패: 아이디나 비밀번호를 확인해주세요.";
    }
  } catch {
    msg.style.color = "#e74c3c";
    msg.textContent = "서버 연결 오류";
  }
});

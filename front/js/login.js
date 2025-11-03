// document.getElementById("loginForm").addEventListener("submit", async (e) => {
//   e.preventDefault();
//   const data = {
//     email: document.getElementById("email").value,
//     password: document.getElementById("password").value
//   };
//   const msg = document.getElementById("serverMessage");

//   try {
//     const res = await fetch("http://localhost:8081/auth/login", {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify(data)
//     });
//     if (res.ok) {
//       const result = await res.json();
//       localStorage.setItem("token", result.token);
//       msg.style.color = "#27ae60";
//       msg.textContent = "로그인 성공!";
//       setTimeout(() => (window.location.href = "index.html"), 1000);

//     } else {
//       msg.style.color = "#e74c3c";
//       msg.textContent = "로그인 실패: 아이디나 비밀번호를 확인해주세요.";
//     }
//   } catch {
//     msg.style.color = "#e74c3c";
//     msg.textContent = "서버 연결 오류";
//   }
// });
// 간단한 토스트 표시 함수
function showToast(message, type = "success") {
  let toast = document.createElement("div");
  toast.className = `toast ${type}`;
  toast.textContent = message;
  document.body.appendChild(toast);

  // 나타나기
  setTimeout(() => toast.classList.add("show"), 100);

  // 2초 후 사라지기
  setTimeout(() => {
    toast.classList.remove("show");
    setTimeout(() => toast.remove(), 300);
  }, 2000);
}

document.getElementById("loginForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const data = {
    email: document.getElementById("email").value,
    password: document.getElementById("password").value
  };

  try {
    const res = await fetch("http://localhost:8081/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    });

    if (res.ok) {
      const result = await res.json();

      const token = result.data?.token;
      if (!token) {
        showToast("토큰을 받지 못했습니다.", "error");
        return;
      }

      localStorage.setItem("token", token);

      showToast("로그인 성공!", "success");
      setTimeout(() => (window.location.href = "index.html"), 1000);
    } else {
      showToast("이메일 또는 비밀번호를 확인하세요.", "error");
    }
  } catch {
    showToast("서버 연결 오류", "error");
  }
});

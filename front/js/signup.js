const pw = document.getElementById("password");
const confirm = document.getElementById("confirmPassword");
const pwMsg = document.getElementById("pwMessage");
const confirmMsg = document.getElementById("confirmMessage");
const serverMsg = document.getElementById("serverMessage");

pw.addEventListener("input", () => {
  if (pw.value.length < 6) {
    pwMsg.textContent = "비밀번호는 6자 이상이어야 합니다.";
    pwMsg.className = "validation-message error";
  } else {
    pwMsg.textContent = "사용 가능한 비밀번호입니다.";
    pwMsg.className = "validation-message success";
  }
  checkMatch();
});

confirm.addEventListener("input", checkMatch);
function checkMatch() {
  if (!confirm.value) return (confirmMsg.textContent = "");
  if (pw.value !== confirm.value) {
    confirmMsg.textContent = "비밀번호가 일치하지 않습니다.";
    confirmMsg.className = "validation-message error";
  } else if (pw.value.length >= 6) {
    confirmMsg.textContent = "비밀번호가 일치합니다.";
    confirmMsg.className = "validation-message success";
  }
}

document.getElementById("signupForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  if (pw.value.length < 6 || pw.value !== confirm.value) return;

  const data = {
    email: document.getElementById("email").value,
    password: pw.value,
    name: document.getElementById("name").value,
    affiliation: document.getElementById("affiliation").value,
    phone: document.getElementById("phone").value
  };

  try {
    const res = await fetch("http://localhost:8081/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    });

    if (res.ok) {
      serverMsg.style.color = "#27ae60";
      serverMsg.textContent = "회원가입 성공! 로그인 페이지로 이동합니다.";
      setTimeout(() => (window.location.href = "login.html"), 1500);
    } else {
      serverMsg.style.color = "#e74c3c";
      serverMsg.textContent = "회원가입 실패: " + (await res.text());
    }
  } catch (err) {
    serverMsg.style.color = "#e74c3c";
    serverMsg.textContent = "서버 연결 오류: " + err.message;
  }
});

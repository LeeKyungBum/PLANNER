const uid = localStorage.getItem("uid");
const token = localStorage.getItem("token");

let currentType = "resume";
let currentConversationId = null;

// 요소
const tabResume = document.getElementById("tabResume");
const tabSpec = document.getElementById("tabSpec");
const conversationList = document.getElementById("conversationList");
const newChatBtn = document.getElementById("newChatBtn");
const sendBtn = document.getElementById("sendBtn");
const userInput = document.getElementById("userInput");
const messagesDiv = document.getElementById("messages");

// 모달 관련 요소
const modal = document.getElementById("newChatModal");
const titleInput = document.getElementById("chatTitleInput");
const createBtn = document.getElementById("createChatBtn");
const cancelBtn = document.getElementById("cancelChatBtn");

// 탭 전환
tabResume.addEventListener("click", () => switchTab("resume"));
tabSpec.addEventListener("click", () => switchTab("spec"));

function switchTab(type) {
  currentType = type;
  tabResume.classList.toggle("active", type === "resume");
  tabSpec.classList.toggle("active", type === "spec");
  loadConversations();
}

// 모달 열기/닫기
newChatBtn.addEventListener("click", () => {
  modal.style.display = "flex";
  titleInput.value = "";
  titleInput.focus();
});

cancelBtn.addEventListener("click", () => {
  modal.style.display = "none";
});

window.addEventListener("click", (e) => {
  if (e.target === modal) modal.style.display = "none";
});

// 대화 생성 (유형 + 제목)
createBtn.addEventListener("click", async () => {
  const title = titleInput.value.trim();
  const selectedType = document.querySelector('input[name="chatType"]:checked').value;

  if (!title) {
    alert("대화방 제목을 입력하세요.");
    return;
  }

  const res = await fetch("http://localhost:8081/planner/ai/create", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ uid, type: selectedType, title })
  });

  const conversationId = await res.text();
  currentConversationId = conversationId;
  currentType = selectedType; // 선택된 탭으로 반영
  modal.style.display = "none";
  loadConversations();
  messagesDiv.innerHTML = "";
});

// 대화 목록 불러오기
async function loadConversations() {
  conversationList.innerHTML = "";
  const res = await fetch(`http://localhost:8081/planner/ai/list/${uid}`);
  const data = await res.json();

  const filtered = data.filter(d => d.type === currentType);
  filtered.forEach(conv => {
    const div = document.createElement("div");
    div.className = "conversation-item";
    div.innerHTML = `
      <span>${conv.title}</span>
      <button class="delete-btn" data-id="${conv.conversationId}">삭제</button>
    `;
    div.addEventListener("click", () => openConversation(conv.conversationId));
    conversationList.appendChild(div);
  });

  document.querySelectorAll(".delete-btn").forEach(btn => {
    btn.addEventListener("click", async (e) => {
      e.stopPropagation();
      const id = e.target.dataset.id;
      await fetch(`http://localhost:8081/planner/ai/delete/${uid}/${id}`, { method: "DELETE" });
      loadConversations();
    });
  });
}

// 대화 열기
async function openConversation(conversationId) {
  currentConversationId = conversationId;
  messagesDiv.innerHTML = "";

  const res = await fetch(`http://localhost:8081/planner/ai/list/${uid}`);
  const data = await res.json();
  const conv = data.find(c => c.conversationId === conversationId);

  const titleDiv = document.createElement("div");
  titleDiv.className = "chat-title";
  titleDiv.textContent = conv.title;
  messagesDiv.appendChild(titleDiv);
}

// 메시지 전송
sendBtn.addEventListener("click", async () => {
  const msg = userInput.value.trim();
  if (!msg || !currentConversationId) return;

  // 사용자 메시지 즉시 표시
  appendMessage(msg, "user");
  userInput.value = "";

  // “생각 중…” 표시
  const thinkingMsg = appendMessage("생각 중...", "ai", true);

  // 서버 요청
  const res = await fetch("http://localhost:8081/planner/ai", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      uid,
      conversationId: currentConversationId,
      type: currentType,
      message: msg
    })
  });

  const data = await res.json();

  // “생각 중...” 교체
  setTimeout(() => {
    thinkingMsg.textContent = data.reply;
    thinkingMsg.classList.remove("thinking");
  }, 500);
});

// 메시지 표시 함수
function appendMessage(content, role, isThinking = false) {
  const div = document.createElement("div");
  div.className = `msg ${role}`;
  div.textContent = content;
  if (isThinking) div.classList.add("thinking");
  messagesDiv.appendChild(div);
  messagesDiv.scrollTop = messagesDiv.scrollHeight;
  return div;
}

// 초기 로드
loadConversations();

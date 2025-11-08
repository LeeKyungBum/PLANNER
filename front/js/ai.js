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
  currentType = selectedType; // 선택한 카테고리 저장
  modal.style.display = "none";

  switchTab(selectedType);

  setTimeout(() => openConversation(conversationId), 300);
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
      if(window.confirm("대화방을 삭제하시겠습니까?")){
        e.stopPropagation();
        const id = e.target.dataset.id;
        await fetch(`http://localhost:8081/planner/ai/delete/${uid}/${id}`, { method: "DELETE" });
        location.reload();
        loadConversations();
      }
    });
  });
}
// 빈공간 클릭 시 대화창 닫기
document.addEventListener("click", (e) => {
  const isConversationItem = e.target.closest(".conversation-item");
  const isMessageArea = e.target.closest("#messages");
  const isModal = e.target.closest("#newChatModal");
  const isInputBox = e.target.closest(".input-box");

  // 대화 아이템, 채팅창, 모달 클릭 시는 무시
  if (isConversationItem || isMessageArea || isModal || isInputBox) return;

  // 그 외의 영역 클릭 시 채팅창 닫기
  closeConversation();
});

function closeConversation() {
  currentConversationId = null;
  messagesDiv.innerHTML = "<p class='chat-placeholder'>대화를 선택해주세요.</p>";
  document.querySelectorAll(".conversation-item").forEach(item => item.classList.remove("active"));
}

// 대화 열기
async function openConversation(conversationId) {
  currentConversationId = conversationId;
  messagesDiv.innerHTML = "";

  // 왼쪽 리스트 하이라이트 처리
  document.querySelectorAll(".conversation-item").forEach(item => {
    item.classList.toggle("active", item.querySelector(".delete-btn").dataset.id === conversationId);
  });

  // 대화 제목
  const res = await fetch(`http://localhost:8081/planner/ai/list/${uid}`);
  const data = await res.json();
  const conv = data.find(c => c.conversationId === conversationId);

  const titleDiv = document.createElement("h2");
  titleDiv.className = "chat-title";
  titleDiv.textContent = conv.title;
  messagesDiv.appendChild(titleDiv);

  // 메시지 불러오기
  const msgRes = await fetch(`http://localhost:8081/planner/ai/messages/${uid}/${conversationId}`);
  const msgs = await msgRes.json();

  msgs.forEach(m => appendMessage(m.content, m.role, false, m.createdAt));
}

// 메시지 전송
sendBtn.addEventListener("click", async () => {
  const msg = userInput.value.trim();
  if (!msg || !currentConversationId) return;

  // 사용자 메시지 즉시 표시
  appendMessage(msg, "user");
  userInput.value = "";

  // 생각 중 표시
  const thinkingMsg = appendMessage("생각 중", "ai", true);

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

  // 생각 중 교체 -> 대화
  setTimeout(() => {
    thinkingMsg.textContent = data.reply;
    thinkingMsg.classList.remove("thinking");
  }, 500);
});

// 메시지 표시 함수
function appendMessage(content, role, isThinking = false, createdAt = null) {
  if (role === "assistant") role = "ai";
  const wrapper = document.createElement("div");
  wrapper.className = `msg-wrapper ${role}`;

  const bubble = document.createElement("div");
  bubble.className = `msg ${role}`;
  bubble.textContent = content;

  // gpt 응답이 markdown이기 때문에 변환이 필요함(#이나 * 같은 기호로 옴)
  if (role === "ai") {
    bubble.innerHTML = marked.parse(content);
  } else {
    bubble.textContent = content;
  }

  // 생각 중 애니메이션 표시
  if (isThinking) bubble.classList.add("thinking");

  wrapper.appendChild(bubble);

  // 시간 표시 (없으면 현재 시각)
  const time = document.createElement("div");
  time.className = "msg-time";

  let formattedTime = createdAt ? formatTime(createdAt) : formatTime(new Date());
  time.textContent = formattedTime;
  wrapper.appendChild(time);

  messagesDiv.appendChild(wrapper);
  messagesDiv.scrollTop = messagesDiv.scrollHeight;

  return bubble;
}

// 오전/오후 hh:mm 포맷
function formatTime(dateInput) {
  const date = typeof dateInput === "string" ? new Date(dateInput) : dateInput;
  const hours = date.getHours();
  const minutes = date.getMinutes().toString().padStart(2, "0");
  const ampm = hours >= 12 ? "오후" : "오전";
  const formatted = `${ampm} ${hours % 12 || 12}:${minutes}`;
  return formatted;
}

// 초기 로드
loadConversations();

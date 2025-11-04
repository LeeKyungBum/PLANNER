document.addEventListener("DOMContentLoaded", async () => {
  const token = localStorage.getItem("token");
  const uid = localStorage.getItem("uid");

  if (!token || !uid) {
    console.error("로그인이 필요합니다.");
    return;
  }

  const logBody = document.getElementById("logBody");
  const levelEl = document.getElementById("currentLevel");
  const xpEl = document.getElementById("currentXP");
  const reqEl = document.getElementById("requiredXP");
  const remEl = document.getElementById("xpRemaining");
  const xpProgress = document.getElementById("xpProgress");

  async function loadLevelData() {
    try {
      const res = await fetch(`http://localhost:8081/planner/level/${uid}`, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });
      if (!res.ok) throw new Error("데이터 로드 실패");
      const data = await res.json();
      renderLevel(data);
    } catch (err) {
      console.error("레벨 데이터 불러오기 실패:", err);
    }
  }

  async function addXP(activity, gain) {
    try {
      const res = await fetch(
        `http://localhost:8081/planner/level/${uid}/add-xp?activity=${encodeURIComponent(activity)}&gain=${gain}`,
        {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json"
          }
        }
      );
      const data = await res.json();
      renderLevel(data);
    } catch (err) {
      console.error("XP 추가 실패:", err);
    }
  }

  function renderLevel(data) {
    const { currentLevel, currentXP, nextRequiredXP, activityLog } = data;

    levelEl.textContent = currentLevel;
    xpEl.textContent = currentXP;
    reqEl.textContent = nextRequiredXP;
    remEl.textContent = Math.max(nextRequiredXP - currentXP, 0);

    const progress = nextRequiredXP > 0 ? (currentXP / nextRequiredXP) * 100 : 0;
    xpProgress.style.width = `${Math.min(progress, 100)}%`;

    logBody.innerHTML = "";
    if (activityLog && activityLog.length > 0) {
        activityLog
        .slice()
        .reverse()
        .forEach(a => {
            let dateStr = "";
            if (a.date) {
                if (a.date.seconds) {
                    dateStr = new Date(a.date.seconds * 1000)
                    .toLocaleString("ko-KR", {
                        year: "numeric",
                        month: "2-digit",
                        day: "2-digit",
                        hour: "2-digit",
                        minute: "2-digit",
                    });
                } else {
                    dateStr = new Date(a.date)
                    .toLocaleString("ko-KR", {
                        year: "numeric",
                        month: "2-digit",
                        day: "2-digit",
                        hour: "2-digit",
                        minute: "2-digit",
                    });
                }
            } else {
            dateStr = "-";
            }

            const row = `<tr><td>${dateStr}</td><td>${a.activity}</td><td>+${a.gain}</td><td></td></tr>`;
            logBody.insertAdjacentHTML("beforeend", row);
            });
        }
    }
  await loadLevelData();
});

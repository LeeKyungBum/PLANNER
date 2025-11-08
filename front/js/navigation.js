document.addEventListener("DOMContentLoaded", async () => {

  async function fetchData(module) {
      const uid = localStorage.getItem("uid");
      const token = localStorage.getItem("token");
      let url = "";

      switch (module) {
        case "portfolio":
          url = "http://127.0.0.1:8081/portfolio/list";
          break;
        case "resume":
          url = `http://127.0.0.1:8081/planner/resume/${uid}`;
          break;
        case "experience":
          url = `http://127.0.0.1:8081/planner/experience/list/${uid}`;
          break;
        case "network":
          url = `http://127.0.0.1:8081/planner/posts/user/${uid}`;
          break;
        case "level":
          url = `http://127.0.0.1:8081/planner/level/${uid}`;
          break;
        default:
          return null;
      }

      try {
        console.log(`[${module}] 요청:`, url);

        const res = await fetch(url, {
          headers: { "Authorization": `Bearer ${token}` },
          credentials: "include"
        });

        console.log(`[${module}] 상태코드:`, res.status);

        if (!res.ok) {
          console.error(`[${module}] 요청 실패`);
          return null;
        }

        const data = await res.json();
        console.log(`[${module}] 응답:`, data);
        return data.data || data;
      } catch (err) {
        console.error(`[${module}] 에러:`, err);
        return null;
      }
  }



  const [portfolio, ai, level, network, resume, experience] = await Promise.all([
    fetchData("portfolio"),
    fetchData("ai"),
    fetchData("level"),
    fetchData("network"),
    fetchData("resume"),
    fetchData("experience")
  ]);

  // Portfolio
  document.getElementById("portfolioCount").textContent = portfolio?.length || 0;
  document.getElementById("lastPortfolio").textContent = portfolio?.[0]?.title || "최근 등록 없음";

  // AI
  document.getElementById("aiCompletion").textContent = ai?.completion || 0;
  document.getElementById("lastAiEdit").textContent = ai?.lastEdited || "-";

  // Level
  document.getElementById("currentLevel").textContent = `Lv.${level?.currentLevel || 0}`;
  document.getElementById("xpNow").textContent = level?.currentXP || 0;
  document.getElementById("xpReq").textContent = level?.nextRequiredXP || 0;
  document.querySelector(".xp-progress").style.width =
    `${(level?.currentXP / level?.nextRequiredXP) * 100 || 0}%`;


  // Experience
  document.getElementById("careerCount").textContent = experience?.length || 0;
  document.getElementById("certCount").textContent = 0; // 자격/경력 구분 없으면 일단 0

  // Resume
  document.getElementById("resumeCount").textContent = resume?.length || 0;
  document.getElementById("lastResume").textContent = resume?.[0]?.title || "-";

  // Network
  document.getElementById("postCount").textContent = network?.length || 0;
  document.getElementById("lastPost").textContent = network?.[0]?.title || "-";

  // 차트 (활동 비중)
  const ctx1 = document.getElementById("activityChart");
  new Chart(ctx1, {
    type: "pie",
    data: {
      labels: ["Portfolio", "AI", "Experience", "Resume", "Network"],
      datasets: [{
        data: [
          portfolio?.length || 0,
          ai?.completion || 0,
          experience?.careerCount + experience?.certCount || 0,
          resume?.length || 0,
          network?.length || 0
        ]
      }]
    }
  });

  // XP 변화 그래프
  const ctx2 = document.getElementById("xpChart");
  new Chart(ctx2, {
    type: "line",
    data: {
      labels: level?.activityLog?.map(l => new Date(l.date).toLocaleDateString()) || [],
      datasets: [{
        label: "XP 변화",
        data: level?.activityLog?.map(l => l.gain) || [],
        borderWidth: 2
      }]
    }
  });
});

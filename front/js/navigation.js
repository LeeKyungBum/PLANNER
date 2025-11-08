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
  function formatDate(dateValue) {
      try {
          const sec = dateValue.seconds ?? dateValue._seconds;
          const nano = dateValue.nanos ?? dateValue._nanoseconds;
          if (sec) {
            const d = new Date(sec * 1000 + Math.floor(nano / 1_000_000));
            return d.toLocaleDateString();
          }
          return new Date(dateValue).toLocaleDateString();
      } catch {
            return "-"; 
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
  let careerCount = 0;
  let certCount = 0;

  if (Array.isArray(experience)) {
    careerCount = experience.filter(e => e.category === "career").length;
    certCount = experience.filter(e => e.category === "certificate").length;
  }

  document.getElementById("careerCount").textContent = careerCount;
  document.getElementById("certCount").textContent = certCount;


  // Resume
  document.getElementById("resumeCount").textContent = resume?.length || 0;
  document.getElementById("lastResume").textContent = resume?.[0]?.title || "-";

  // Network
  document.getElementById("postCount").textContent = network?.length || 0;
  document.getElementById("lastPost").textContent = network?.[0]?.title || "-";

  // 차트 (활동 비중)
  const ctx1 = document.getElementById("activityChart");
  const chart1 = new Chart(ctx1, {
    type: "pie",
    data: {
      labels: ["포트폴리오", "경력", "자격증", "자기소개서", "게시글"],
      datasets: [{
        data: [
          portfolio?.length || 0,
          careerCount || 0,
          certCount || 0,
          resume?.length || 0,
          network?.length || 0
        ],
        backgroundColor: [
          "#3498db", "#2ecc71", "#f1c40f", "#9b59b6", "#e67e22"
        ],
        borderWidth: 1
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: true,
          position: "bottom",
          labels: {
            font: { size: 13 }
          }
        },
        tooltip: {
          position: "nearest",
          backgroundColor: "rgba(0, 0, 0, 0.8)",
          titleFont: { size: 14, weight: "bold" },
          bodyFont: { size: 13 },
          padding: 10,
          callbacks: {
            label: (context) => {
              const label = context.label || "";
              const value = context.parsed;
              return `${label}: ${value}개`;
            }
          }
        },
        title: {
          display: true,
          text: "활동 비중",
          font: { size: 18, weight: "bold" },
          color: "#000000ff",
          padding: { top: 10, bottom: 10 }
        }
      }
    }
  });

  // XP 변화 그래프
  const ctx2 = document.getElementById("xpChart");
  const chart2 = new Chart(ctx2, {
  type: "line",
  data: {
    labels: level?.activityLog?.map(l => formatDate(l.date)) || [],
    datasets: [{
      label: "XP 변화",
      data: level?.activityLog?.map(l => l.gain) || [],
      borderWidth: 2,
      borderColor: "#4CAF50",
      tension: 0.3,
      fill: false
    }]
  },
  options: {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: "index",
      intersect: false
    },
    plugins: {
      legend: { display: false },
      title: {
        display: true,
        text: "XP 변화 추이",
        color: "#000000ff",
        font: { size: 18, weight: "bold" }
      },
      tooltip: {
        position: "nearest",
        mode: "index",
        intersect: false,
        callbacks: {
          title: ctx => formatDate(level.activityLog[ctx[0].dataIndex].date),
          label: ctx => {
            const act = level.activityLog[ctx.dataIndex].activity;
            const gain = ctx.parsed.y;
            return `${act} (+${gain} XP)`;
          }
        }
      }
    }
  }
});

window.addEventListener("resize", () => chart1.resize());
window.addEventListener("resize", () => chart2.resize());

});

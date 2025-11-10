document.addEventListener("DOMContentLoaded", async () => {
  // ---------------------공통 데이터 로드 함수---------------------------
  async function fetchData(module) {
    const uid = localStorage.getItem("uid");
    const token = localStorage.getItem("token");
    let url = "";

    switch (module) {
      case "portfolio":
        url = "http://127.0.0.1:8081/portfolio/list";
        break;
      case "ai":
        url = `http://127.0.0.1:8081/planner/ai/list/${uid}`;
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
      const res = await fetch(url, {
        headers: { "Authorization": `Bearer ${token}` },
        credentials: "include"
      });

      if (!res.ok) throw new Error(`[${module}] 요청 실패`);
      const data = await res.json();
      return data.data || data;
    } catch (err) {
      console.error(`[${module}] 에러:`, err);
      return null;
    }
  }

  // ----------------------날짜 변환 함수---------------------------
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

  // -----------------------데이터 불러오기--------------------------
  const [portfolio, ai, level, network, resume, experience] = await Promise.all([
    fetchData("portfolio"),
    fetchData("ai"),
    fetchData("level"),
    fetchData("network"),
    fetchData("resume"),
    fetchData("experience")
  ]);

  // -------------------요약 카드 채우기---------------------------
  document.getElementById("portfolioCount").textContent = portfolio?.length || 0;
  document.getElementById("lastPortfolio").textContent = portfolio?.[0]?.title || "최근 등록 없음";

  document.getElementById("aiCompletion").textContent = ai?.length || 0;
  document.getElementById("lastAiEdit").textContent = ai?.[0]?.title || "-";

  document.getElementById("currentLevel").textContent = `Lv.${level?.currentLevel || 0}`;
  document.getElementById("xpNow").textContent = level?.currentXP || 0;
  document.getElementById("xpReq").textContent = level?.nextRequiredXP || 0;
  document.querySelector(".xp-progress").style.width =
    `${(level?.currentXP / level?.nextRequiredXP) * 100 || 0}%`;

  let careerCount = 0;
  let certCount = 0;
  if (Array.isArray(experience)) {
    careerCount = experience.filter(e => e.category === "career").length;
    certCount = experience.filter(e => e.category === "certificate").length;
  }
  document.getElementById("careerCount").textContent = careerCount;
  document.getElementById("certCount").textContent = certCount;

  document.getElementById("resumeCount").textContent = resume?.length || 0;
  document.getElementById("lastResume").textContent = resume?.[0]?.title || "-";

  document.getElementById("postCount").textContent = network?.length || 0;
  document.getElementById("lastPost").textContent = network?.[0]?.title || "-";

  // ------------------------도넛 차트 렌더 함수----------------------------
  let chart1;
  function renderDonut() {
    const ctx1 = document.getElementById("activityChart");
    if (chart1) chart1.destroy();

    chart1 = new Chart(ctx1, {
      type: "doughnut",
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
          backgroundColor: ["#3498db", "#2ecc71", "#f1c40f", "#9b59b6", "#e67e22"],
          borderWidth: 2,
          borderColor: "#fff"
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: {
          animateRotate: true,
          animateScale: true,
          duration: 1200,
          easing: "easeOutQuart"
        },
        cutout: "60%",
        plugins: {
          legend: {
            display: true,
            position: "bottom",
            labels: { font: { size: 13 } }
          },
          title: {
            display: true,
            text: "나의 활동",
            font: { size: 18, weight: "bold" },
            color: "#000000ff",
            padding: { top: 10, bottom: 10 }
          },
          tooltip: {
            position: "nearest",
            backgroundColor: "rgba(0, 0, 0, 0.8)",
            titleFont: { size: 14, weight: "bold" },
            bodyFont: { size: 13 },
            padding: 10,
            callbacks: {
              label: (context) => `${context.label}: ${context.parsed}개`
            }
          }
        }
      }
    });
  }

  // ----------------------------XP 변화 차트 렌더 함수 --------------------------
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
        tension: 0.35,
        fill: false,
        pointRadius: 4,
        pointHoverRadius: 6,
        pointBackgroundColor: "#27ae60"
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: {
        mode: "index",
        intersect: false
      },
      animations: {
        x: {
          duration: 1500,
          easing: "easeOutCubic"
        },
        y: {
          duration: 1500,
          easing: "easeInOutCubic"
        },
        tension: {
          duration: 2000,
          easing: "easeOutElastic",
          from: 0,
          to: 0.35,
          loop: false
        }
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
      },
      elements: {
        line: { borderJoinStyle: "round" }
      }
    }
  });

  function renderActivityLog() {
    const logBody = document.getElementById("logBody");
    logBody.innerHTML = "";

    if (!level?.activityLog?.length) {
      logBody.innerHTML = `<tr><td colspan="3">최근 활동이 없습니다.</td></tr>`;
      return;
    }

    level.activityLog
      .slice() // 원본 복사
      .reverse() // 최신순 정렬
      .forEach(a => {
        const date = formatDate(a.date);
        const tr = document.createElement("tr");
        tr.innerHTML = `
          <td>${date}</td>
          <td>${a.activity}</td>
          <td>+${a.gain}</td>
        `;
        logBody.appendChild(tr);
      });
  }

  // -------------------렌더링 타이밍 조정 ----------------------
  setTimeout(() => {
    renderDonut();
    renderActivityLog();
  }, 200);

  window.addEventListener("resize", () => {
    clearTimeout(window._resizeTimer);
    window._resizeTimer = setTimeout(() => {
      renderDonut(); // 크기 변경 시 도넛차트 다시 그리기
      chart2.resize();
    }, 250);
  });

});

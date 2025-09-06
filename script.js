// 전역 변수
let currentData = [];
let priceChart = null;
let volumeChart = null;
let changeRateChart = null;

// 코인 정보 매핑
const coinInfo = {
  "KRW-BTC": { name: "비트코인", symbol: "BTC" },
  "KRW-ETH": { name: "이더리움", symbol: "ETH" },
  "KRW-XRP": { name: "리플", symbol: "XRP" },
  "KRW-ADA": { name: "에이다", symbol: "ADA" },
  "KRW-DOT": { name: "폴카닷", symbol: "DOT" },
  "KRW-LINK": { name: "체인링크", symbol: "LINK" },
  "KRW-BCH": { name: "비트코인캐시", symbol: "BCH" },
  "KRW-LTC": { name: "라이트코인", symbol: "LTC" },
};

// DOM 요소
const elements = {
  marketSelect: document.getElementById("marketSelect"),
  periodSelect: document.getElementById("periodSelect"),
  startDate: document.getElementById("startDate"),
  endDate: document.getElementById("endDate"),
  searchBtn: document.getElementById("searchBtn"),
  loadingIndicator: document.getElementById("loadingIndicator"),
  marketInfo: document.getElementById("marketInfo"),
  chartsSection: document.getElementById("chartsSection"),
  analysisSection: document.getElementById("analysisSection"),
  coinAnalysisBtn: document.getElementById("coinAnalysisBtn"),
  analysisContent: document.getElementById("analysisContent"),
  customDateGroup: document.getElementById("customDateGroup"),
  customDateGroup2: document.getElementById("customDateGroup2"),
};

// 초기화
document.addEventListener("DOMContentLoaded", function () {
  initializeEventListeners();
  setDefaultDates();
});

// 이벤트 리스너 초기화
function initializeEventListeners() {
  elements.periodSelect.addEventListener("change", handlePeriodChange);
  elements.searchBtn.addEventListener("click", handleSearch);
  elements.coinAnalysisBtn.addEventListener("click", toggleAnalysis);

  // 엔터키로 검색
  elements.startDate.addEventListener("keypress", function (e) {
    if (e.key === "Enter") handleSearch();
  });
  elements.endDate.addEventListener("keypress", function (e) {
    if (e.key === "Enter") handleSearch();
  });
}

// 기본 날짜 설정
function setDefaultDates() {
  const today = new Date();
  const thirtyDaysAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

  elements.endDate.value = today.toISOString().split("T")[0];
  elements.startDate.value = thirtyDaysAgo.toISOString().split("T")[0];
}

// 기간 선택 변경 처리
function handlePeriodChange() {
  const period = elements.periodSelect.value;

  if (period === "custom") {
    elements.customDateGroup.style.display = "flex";
    elements.customDateGroup2.style.display = "flex";
  } else {
    elements.customDateGroup.style.display = "none";
    elements.customDateGroup2.style.display = "none";

    const today = new Date();
    const pastDate = new Date(
      today.getTime() - parseInt(period) * 24 * 60 * 60 * 1000
    );

    elements.endDate.value = today.toISOString().split("T")[0];
    elements.startDate.value = pastDate.toISOString().split("T")[0];
  }
}

// 검색 처리
async function handleSearch() {
  try {
    showLoading(true);
    hideResults();

    const market = elements.marketSelect.value;
    const startDate = elements.startDate.value;
    const endDate = elements.endDate.value;

    if (!startDate || !endDate) {
      alert("시작일과 종료일을 선택해주세요.");
      return;
    }

    if (new Date(startDate) > new Date(endDate)) {
      alert("시작일이 종료일보다 늦을 수 없습니다.");
      return;
    }

    // 업비트 API 호출
    const candleData = await fetchCandleData(market, startDate, endDate);
    const tickerData = await fetchTickerData(market);

    if (candleData && candleData.length > 0) {
      currentData = candleData;
      displayMarketInfo(market, tickerData);
      createCharts();
      showResults();
    } else {
      alert("선택한 기간에 대한 데이터가 없습니다.");
    }
  } catch (error) {
    console.error("데이터 조회 실패:", error);
    alert("데이터 조회 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.");
  } finally {
    showLoading(false);
  }
}

// 업비트 캔들 데이터 조회
async function fetchCandleData(market, startDate, endDate) {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffTime = Math.abs(end - start);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  // 최대 200개까지만 조회 (업비트 API 제한)
  const count = Math.min(diffDays + 1, 200);

  const url = `https://api.upbit.com/v1/candles/days?market=${market}&count=${count}&to=${endDate}T23:59:59Z`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();

    // 날짜 순으로 정렬 (오래된 것부터)
    return data.reverse();
  } catch (error) {
    console.error("캔들 데이터 조회 실패:", error);
    throw error;
  }
}

// 업비트 현재가 정보 조회
async function fetchTickerData(market) {
  const url = `https://api.upbit.com/v1/ticker?markets=${market}`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data[0];
  } catch (error) {
    console.error("현재가 데이터 조회 실패:", error);
    return null;
  }
}

// 마켓 정보 표시
function displayMarketInfo(market, tickerData) {
  const coin = coinInfo[market];
  const coinNameElement = document.getElementById("coinName");
  const currentPriceElement = document.getElementById("currentPrice");
  const priceChangeElement = document.getElementById("priceChange");
  const changeRateElement = document.getElementById("changeRate");
  const highPriceElement = document.getElementById("highPrice");
  const lowPriceElement = document.getElementById("lowPrice");
  const volumeElement = document.getElementById("volume");

  coinNameElement.textContent = `${coin.name} (${coin.symbol})`;

  if (tickerData) {
    const price = tickerData.trade_price;
    const change = tickerData.change_price;
    const changeRate = tickerData.change_rate * 100;
    const isPositive = change >= 0;

    currentPriceElement.textContent = formatPrice(price);
    priceChangeElement.textContent =
      (isPositive ? "+" : "") + formatPrice(change);
    changeRateElement.textContent = `(${
      isPositive ? "+" : ""
    }${changeRate.toFixed(2)}%)`;

    // 색상 적용
    const colorClass = isPositive ? "positive" : "negative";
    priceChangeElement.className = `price-change ${colorClass}`;
    changeRateElement.className = `change-rate ${colorClass}`;

    highPriceElement.textContent = formatPrice(tickerData.high_price);
    lowPriceElement.textContent = formatPrice(tickerData.low_price);
    volumeElement.textContent = formatNumber(
      tickerData.acc_trade_volume_24h,
      2
    );
  } else {
    // 현재가 데이터가 없는 경우 캔들 데이터에서 최신 정보 사용
    const latestData = currentData[currentData.length - 1];
    if (latestData) {
      currentPriceElement.textContent = formatPrice(latestData.trade_price);
      priceChangeElement.textContent = formatPrice(latestData.change_price);
      changeRateElement.textContent = `(${(
        latestData.change_rate * 100
      ).toFixed(2)}%)`;

      const isPositive = latestData.change_price >= 0;
      const colorClass = isPositive ? "positive" : "negative";
      priceChangeElement.className = `price-change ${colorClass}`;
      changeRateElement.className = `change-rate ${colorClass}`;

      highPriceElement.textContent = formatPrice(latestData.high_price);
      lowPriceElement.textContent = formatPrice(latestData.low_price);
      volumeElement.textContent = formatNumber(
        latestData.candle_acc_trade_volume,
        2
      );
    }
  }
}

// 차트 생성
function createCharts() {
  createPriceChart();
  createVolumeChart();
  createChangeRateChart();
}

// 가격 차트 생성
function createPriceChart() {
  const ctx = document.getElementById("priceChart").getContext("2d");

  if (priceChart) {
    priceChart.destroy();
  }

  const labels = currentData.map((item) =>
    new Date(item.candle_date_time_kst).toLocaleDateString("ko-KR", {
      month: "short",
      day: "numeric",
    })
  );

  priceChart = new Chart(ctx, {
    type: "line",
    data: {
      labels: labels,
      datasets: [
        {
          label: "시가",
          data: currentData.map((item) => item.opening_price),
          borderColor: "rgba(54, 162, 235, 1)",
          backgroundColor: "rgba(54, 162, 235, 0.1)",
          borderWidth: 2,
          fill: false,
          tension: 0.1,
        },
        {
          label: "고가",
          data: currentData.map((item) => item.high_price),
          borderColor: "rgba(255, 99, 132, 1)",
          backgroundColor: "rgba(255, 99, 132, 0.1)",
          borderWidth: 2,
          fill: false,
          tension: 0.1,
        },
        {
          label: "저가",
          data: currentData.map((item) => item.low_price),
          borderColor: "rgba(75, 192, 192, 1)",
          backgroundColor: "rgba(75, 192, 192, 0.1)",
          borderWidth: 2,
          fill: false,
          tension: 0.1,
        },
        {
          label: "종가",
          data: currentData.map((item) => item.trade_price),
          borderColor: "rgba(153, 102, 255, 1)",
          backgroundColor: "rgba(153, 102, 255, 0.1)",
          borderWidth: 3,
          fill: false,
          tension: 0.1,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: {
        intersect: false,
        mode: "index",
      },
      plugins: {
        legend: {
          position: "top",
        },
        tooltip: {
          callbacks: {
            label: function (context) {
              return (
                context.dataset.label + ": " + formatPrice(context.parsed.y)
              );
            },
          },
        },
      },
      scales: {
        y: {
          beginAtZero: false,
          ticks: {
            callback: function (value) {
              return formatPrice(value);
            },
          },
        },
        x: {
          ticks: {
            maxTicksLimit: 10,
          },
        },
      },
    },
  });
}

// 거래량 차트 생성
function createVolumeChart() {
  const ctx = document.getElementById("volumeChart").getContext("2d");

  if (volumeChart) {
    volumeChart.destroy();
  }

  const labels = currentData.map((item) =>
    new Date(item.candle_date_time_kst).toLocaleDateString("ko-KR", {
      month: "short",
      day: "numeric",
    })
  );

  volumeChart = new Chart(ctx, {
    type: "bar",
    data: {
      labels: labels,
      datasets: [
        {
          label: "거래량",
          data: currentData.map((item) => item.candle_acc_trade_volume),
          backgroundColor: currentData.map((item) =>
            item.change_price >= 0
              ? "rgba(220, 53, 69, 0.7)"
              : "rgba(0, 123, 255, 0.7)"
          ),
          borderColor: currentData.map((item) =>
            item.change_price >= 0
              ? "rgba(220, 53, 69, 1)"
              : "rgba(0, 123, 255, 1)"
          ),
          borderWidth: 1,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: "top",
        },
        tooltip: {
          callbacks: {
            label: function (context) {
              return "거래량: " + formatNumber(context.parsed.y, 2);
            },
          },
        },
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            callback: function (value) {
              return formatNumber(value, 0);
            },
          },
        },
        x: {
          ticks: {
            maxTicksLimit: 10,
          },
        },
      },
    },
  });
}

// 변동률 차트 생성
function createChangeRateChart() {
  const ctx = document.getElementById("changeRateChart").getContext("2d");

  if (changeRateChart) {
    changeRateChart.destroy();
  }

  const labels = currentData.map((item) =>
    new Date(item.candle_date_time_kst).toLocaleDateString("ko-KR", {
      month: "short",
      day: "numeric",
    })
  );

  changeRateChart = new Chart(ctx, {
    type: "bar",
    data: {
      labels: labels,
      datasets: [
        {
          label: "변동률 (%)",
          data: currentData.map((item) => item.change_rate * 100),
          backgroundColor: currentData.map((item) =>
            item.change_rate >= 0
              ? "rgba(220, 53, 69, 0.7)"
              : "rgba(0, 123, 255, 0.7)"
          ),
          borderColor: currentData.map((item) =>
            item.change_rate >= 0
              ? "rgba(220, 53, 69, 1)"
              : "rgba(0, 123, 255, 1)"
          ),
          borderWidth: 1,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: "top",
        },
        tooltip: {
          callbacks: {
            label: function (context) {
              return "변동률: " + context.parsed.y.toFixed(2) + "%";
            },
          },
        },
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            callback: function (value) {
              return value.toFixed(1) + "%";
            },
          },
        },
        x: {
          ticks: {
            maxTicksLimit: 10,
          },
        },
      },
    },
  });
}

// 분석 토글
function toggleAnalysis() {
  const content = elements.analysisContent;
  const btn = elements.coinAnalysisBtn;

  if (content.style.display === "none" || content.style.display === "") {
    calculateAnalysis();
    content.style.display = "block";
    btn.textContent = "🔬 분석 숨기기";
  } else {
    content.style.display = "none";
    btn.textContent = "🔬 코인 정보/분석 보기";
  }
}

// 분석 계산
function calculateAnalysis() {
  if (!currentData || currentData.length === 0) return;

  // 기술적 분석 계산
  const prices = currentData.map((item) => item.trade_price);
  const volumes = currentData.map((item) => item.candle_acc_trade_volume);
  const changeRates = currentData.map((item) => item.change_rate * 100);

  // 이동평균선
  const ma7 = calculateMovingAverage(prices, 7);
  const ma30 = calculateMovingAverage(prices, 30);

  // 변동성 (표준편차)
  const volatility = calculateStandardDeviation(changeRates);

  // RSI (간단한 버전)
  const rsi = calculateRSI(prices, 14);

  // 가격 분석
  const periodHigh = Math.max(...prices);
  const periodLow = Math.min(...prices);
  const avgPrice = prices.reduce((a, b) => a + b, 0) / prices.length;
  const totalReturn =
    ((prices[prices.length - 1] - prices[0]) / prices[0]) * 100;

  // 거래량 분석
  const avgVolume = volumes.reduce((a, b) => a + b, 0) / volumes.length;
  const maxVolume = Math.max(...volumes);
  const recentVolume = volumes.slice(-7).reduce((a, b) => a + b, 0) / 7;
  const previousVolume = volumes.slice(-14, -7).reduce((a, b) => a + b, 0) / 7;
  const volumeChange = ((recentVolume - previousVolume) / previousVolume) * 100;

  // 거래 활성도
  const tradingActivity =
    avgVolume > maxVolume * 0.5
      ? "높음"
      : avgVolume > maxVolume * 0.3
      ? "보통"
      : "낮음";

  // UI 업데이트
  document.getElementById("ma7").textContent = formatPrice(ma7);
  document.getElementById("ma30").textContent = formatPrice(ma30);
  document.getElementById("volatility").textContent =
    volatility.toFixed(2) + "%";
  document.getElementById("rsi").textContent = rsi.toFixed(1);

  document.getElementById("periodHigh").textContent = formatPrice(periodHigh);
  document.getElementById("periodLow").textContent = formatPrice(periodLow);
  document.getElementById("avgPrice").textContent = formatPrice(avgPrice);
  document.getElementById("totalReturn").textContent =
    (totalReturn >= 0 ? "+" : "") + totalReturn.toFixed(2) + "%";
  document.getElementById("totalReturn").className =
    "value " + (totalReturn >= 0 ? "positive" : "negative");

  document.getElementById("avgVolume").textContent = formatNumber(avgVolume, 2);
  document.getElementById("maxVolume").textContent = formatNumber(maxVolume, 2);
  document.getElementById("volumeChange").textContent =
    (volumeChange >= 0 ? "+" : "") + volumeChange.toFixed(2) + "%";
  document.getElementById("volumeChange").className =
    "value " + (volumeChange >= 0 ? "positive" : "negative");
  document.getElementById("tradingActivity").textContent = tradingActivity;

  // 종합 분석
  generateSummaryAnalysis(
    totalReturn,
    volatility,
    rsi,
    volumeChange,
    tradingActivity
  );
}

// 이동평균선 계산
function calculateMovingAverage(prices, period) {
  if (prices.length < period) return prices[prices.length - 1];

  const recentPrices = prices.slice(-period);
  return recentPrices.reduce((a, b) => a + b, 0) / period;
}

// 표준편차 계산
function calculateStandardDeviation(values) {
  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  const squaredDiffs = values.map((value) => Math.pow(value - mean, 2));
  const avgSquaredDiff =
    squaredDiffs.reduce((a, b) => a + b, 0) / values.length;
  return Math.sqrt(avgSquaredDiff);
}

// RSI 계산 (간단한 버전)
function calculateRSI(prices, period = 14) {
  if (prices.length < period + 1) return 50;

  const changes = [];
  for (let i = 1; i < prices.length; i++) {
    changes.push(prices[i] - prices[i - 1]);
  }

  const recentChanges = changes.slice(-period);
  const gains = recentChanges.filter((change) => change > 0);
  const losses = recentChanges
    .filter((change) => change < 0)
    .map((loss) => Math.abs(loss));

  const avgGain =
    gains.length > 0 ? gains.reduce((a, b) => a + b, 0) / gains.length : 0;
  const avgLoss =
    losses.length > 0 ? losses.reduce((a, b) => a + b, 0) / losses.length : 0;

  if (avgLoss === 0) return 100;

  const rs = avgGain / avgLoss;
  return 100 - 100 / (1 + rs);
}

// 종합 분석 생성
function generateSummaryAnalysis(
  totalReturn,
  volatility,
  rsi,
  volumeChange,
  tradingActivity
) {
  let analysis = "";

  // 수익률 분석
  if (totalReturn > 10) {
    analysis += "📈 선택한 기간 동안 강한 상승세를 보이고 있습니다. ";
  } else if (totalReturn > 0) {
    analysis += "📊 선택한 기간 동안 소폭 상승했습니다. ";
  } else if (totalReturn > -10) {
    analysis += "📉 선택한 기간 동안 소폭 하락했습니다. ";
  } else {
    analysis += "⚠️ 선택한 기간 동안 큰 폭으로 하락했습니다. ";
  }

  // 변동성 분석
  if (volatility > 10) {
    analysis += "변동성이 매우 높아 리스크가 큽니다. ";
  } else if (volatility > 5) {
    analysis += "변동성이 높은 편입니다. ";
  } else {
    analysis += "변동성이 낮아 안정적인 움직임을 보입니다. ";
  }

  // RSI 분석
  if (rsi > 70) {
    analysis += "RSI가 과매수 구간에 있어 조정 가능성이 있습니다. ";
  } else if (rsi < 30) {
    analysis += "RSI가 과매도 구간에 있어 반등 가능성이 있습니다. ";
  } else {
    analysis += "RSI가 중립 구간에 있습니다. ";
  }

  // 거래량 분석
  if (volumeChange > 20) {
    analysis += "최근 거래량이 크게 증가했습니다. ";
  } else if (volumeChange < -20) {
    analysis += "최근 거래량이 크게 감소했습니다. ";
  }

  if (tradingActivity === "높음") {
    analysis += "전반적으로 거래가 활발한 상태입니다.";
  } else if (tradingActivity === "낮음") {
    analysis += "전반적으로 거래가 저조한 상태입니다.";
  }

  document.getElementById("summaryAnalysis").innerHTML = `<p>${analysis}</p>`;
}

// 유틸리티 함수들
function formatPrice(price) {
  if (price >= 1000000) {
    return (price / 1000000).toFixed(1) + "M원";
  } else if (price >= 1000) {
    return (price / 1000).toFixed(1) + "K원";
  } else {
    return price.toLocaleString() + "원";
  }
}

function formatNumber(num, decimals = 0) {
  if (num >= 1000000000) {
    return (num / 1000000000).toFixed(decimals) + "B";
  } else if (num >= 1000000) {
    return (num / 1000000).toFixed(decimals) + "M";
  } else if (num >= 1000) {
    return (num / 1000).toFixed(decimals) + "K";
  } else {
    return num.toFixed(decimals);
  }
}

function showLoading(show) {
  elements.loadingIndicator.style.display = show ? "block" : "none";
  elements.searchBtn.disabled = show;
  elements.searchBtn.textContent = show ? "⏳ 조회 중..." : "🔍 데이터 조회";
}

function showResults() {
  elements.marketInfo.style.display = "block";
  elements.chartsSection.style.display = "block";
  elements.analysisSection.style.display = "block";
}

function hideResults() {
  elements.marketInfo.style.display = "none";
  elements.chartsSection.style.display = "none";
  elements.analysisSection.style.display = "none";
  elements.analysisContent.style.display = "none";
  elements.coinAnalysisBtn.textContent = "🔬 코인 정보/분석 보기";
}

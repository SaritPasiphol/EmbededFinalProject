let distanceChart, lightChart, soundChart;

const MAX_DATA_POINTS = 3600;

const chartConfig = {
  type: "line",
  options: {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: {
        display: false,
      },
      decimation: {
        enabled: true,
        algorithm: "lttb",
        samples: 1000,
      },
    },
    scales: {
      x: {
        type: "time",
        time: {
          unit: "minute",
          displayFormats: {
            minute: "HH:mm",
          },
        },
        ticks: {
          maxTicksLimit: 10,
        },
      },
      y: {
        beginAtZero: true,
      },
    },
    interaction: {
      intersect: false,
      mode: "index",
    },
  },
};

export function initCharts() {
  const distanceCtx = document.getElementById("distanceChart").getContext("2d");
  const lightCtx = document.getElementById("lightChart").getContext("2d");
  const soundCtx = document.getElementById("soundChart").getContext("2d");

  distanceChart = new Chart(distanceCtx, {
    ...chartConfig,
    data: {
      datasets: [
        {
          label: "Distance (cm)",
          data: [],
          borderColor: "rgb(102, 126, 234)",
          backgroundColor: "rgba(102, 126, 234, 0.1)",
          tension: 0.1,
        },
      ],
    },
  });

  lightChart = new Chart(lightCtx, {
    ...chartConfig,
    data: {
      datasets: [
        {
          label: "Light (Inverted)",
          data: [],
          borderColor: "rgb(255, 206, 86)",
          backgroundColor: "rgba(255, 206, 86, 0.1)",
          tension: 0.1,
        },
      ],
    },
  });

  soundChart = new Chart(soundCtx, {
    ...chartConfig,
    data: {
      datasets: [
        {
          label: "Sound",
          data: [],
          borderColor: "rgb(75, 192, 192)",
          backgroundColor: "rgba(75, 192, 192, 0.1)",
          tension: 0.1,
        },
      ],
    },
  });
}

// Updated to accept array instead of object
export function updateCharts(dataArray) {
  if (!dataArray || dataArray.length === 0) return;

  // Ensure array is sorted by timestamp
  const sortedData = dataArray.sort((a, b) => a.timestamp - b.timestamp);

  const distanceData = sortedData
    .filter((d) => d.dist !== undefined)
    .map((d) => ({ x: d.timestamp, y: d.dist }));

  const lightData = sortedData
    .filter((d) => d.light !== undefined)
    .map((d) => ({ x: d.timestamp, y: d.light }));

  const soundData = sortedData
    .filter((d) => d.sound !== undefined)
    .map((d) => ({ x: d.timestamp, y: d.sound }));

  distanceChart.data.datasets[0].data = distanceData;
  lightChart.data.datasets[0].data = lightData;
  soundChart.data.datasets[0].data = soundData;

  distanceChart.update("none");
  lightChart.update("none");
  soundChart.update("none");
}

// Add a single new data point to existing charts
export function addDataPoint(timestamp, data) {
  // Add distance data
  if (data.dist !== undefined) {
    distanceChart.data.datasets[0].data.push({
      x: timestamp,
      y: data.dist,
    });

    // Keep only last MAX_DATA_POINTS
    if (distanceChart.data.datasets[0].data.length > MAX_DATA_POINTS) {
      distanceChart.data.datasets[0].data.shift();
    }
    distanceChart.update("none");
  }

  // Add light data
  if (data.light !== undefined) {
    lightChart.data.datasets[0].data.push({
      x: timestamp,
      y: data.light,
    });

    if (lightChart.data.datasets[0].data.length > MAX_DATA_POINTS) {
      lightChart.data.datasets[0].data.shift();
    }
    lightChart.update("none");
  }

  // Add sound data
  if (data.sound !== undefined) {
    soundChart.data.datasets[0].data.push({
      x: timestamp,
      y: data.sound,
    });

    if (soundChart.data.datasets[0].data.length > MAX_DATA_POINTS) {
      soundChart.data.datasets[0].data.shift();
    }
    soundChart.update("none");
  }
}

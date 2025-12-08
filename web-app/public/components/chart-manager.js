let distanceChart, lightChart, soundChart;

const MAX_DATA_POINTS = 3600;

// Normal/baseline values for each sensor
export const normalValues = {
  distance: 25,
  light: 32,
  sound: 35,
};

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
          label: "Normal Value",
          data: [],
          borderColor: "rgb(220, 53, 69)",
          backgroundColor: "transparent",
          borderWidth: 2,
          borderDash: [15, 5],
          pointRadius: 0,
          pointHoverRadius: 0,
          tension: 0,
        },
        {
          label: "Distance (cm)",
          data: [],
          borderColor: "rgba(108, 133, 241, 1)",
          backgroundColor: "rgba(102, 126, 234, 0.1)",
          tension: 0.1,
          pointRadius: 0,
          pointHoverRadius: 4,
        },
      ],
    },
  });

  lightChart = new Chart(lightCtx, {
    ...chartConfig,
    data: {
      datasets: [
        {
          label: "Normal Value",
          data: [],
          borderColor: "rgb(220, 53, 69)",
          backgroundColor: "transparent",
          borderWidth: 2,
          borderDash: [15, 5],
          pointRadius: 0,
          pointHoverRadius: 0,
          tension: 0,
        },
        {
          label: "Light (Inverted)",
          data: [],
          borderColor: "rgb(255, 206, 86)",
          backgroundColor: "rgba(255, 206, 86, 0.1)",
          tension: 0.1,
          pointRadius: 0,
          pointHoverRadius: 4,
        },
      ],
    },
  });

  soundChart = new Chart(soundCtx, {
    ...chartConfig,
    data: {
      datasets: [
        {
          label: "Normal Value",
          data: [],
          borderColor: "rgb(220, 53, 69)",
          backgroundColor: "transparent",
          borderWidth: 2,
          borderDash: [15, 5],
          pointRadius: 0,
          pointHoverRadius: 0,
          tension: 0,
        },
        {
          label: "Sound",
          data: [],
          borderColor: "rgba(88, 223, 223, 1)",
          backgroundColor: "rgba(75, 192, 192, 0.1)",
          tension: 0.1,
          pointRadius: 0,
          pointHoverRadius: 4,
        },
      ],
    },
  });

  // Initialize reference lines with normal values
  updateNormalValueLines();
}

// Updated to accept array instead of object
export function updateCharts(dataArray) {
  if (!dataArray || dataArray.length === 0) return;

  // Ensure array is sorted by timestamp
  const sortedData = dataArray.sort((a, b) => a.timestamp - b.timestamp);

  // Limit to MAX_DATA_POINTS (keep most recent data)
  const limitedData = sortedData.length > MAX_DATA_POINTS 
    ? sortedData.slice(-MAX_DATA_POINTS) 
    : sortedData;

  const distanceData = limitedData
    .filter((d) => d.dist !== undefined)
    .map((d) => ({ x: d.timestamp, y: d.dist }));

  const lightData = limitedData
    .filter((d) => d.light !== undefined)
    .map((d) => ({ x: d.timestamp, y: d.light }));

  const soundData = limitedData
    .filter((d) => d.sound !== undefined)
    .map((d) => ({ x: d.timestamp, y: d.sound }));

  distanceChart.data.datasets[1].data = distanceData;
  lightChart.data.datasets[1].data = lightData;
  soundChart.data.datasets[1].data = soundData;

  // Update normal value reference lines
  updateNormalValueLines();

  distanceChart.update("none");
  lightChart.update("none");
  soundChart.update("none");
}

// Function to update normal value reference lines
function updateNormalValueLines() {
  // Get time range from actual data in each chart
  const distanceData = distanceChart.data.datasets[1].data;
  const lightData = lightChart.data.datasets[1].data;
  const soundData = soundChart.data.datasets[1].data;

  // Distance reference line - match actual data range
  if (distanceData.length > 0) {
    const minTime = distanceData[0].x;
    const maxTime = distanceData[distanceData.length - 1].x;
    distanceChart.data.datasets[0].data = [
      { x: minTime, y: normalValues.distance },
      { x: maxTime, y: normalValues.distance },
    ];
  } else {
    distanceChart.data.datasets[0].data = [];
  }

  // Light reference line - match actual data range
  if (lightData.length > 0) {
    const minTime = lightData[0].x;
    const maxTime = lightData[lightData.length - 1].x;
    lightChart.data.datasets[0].data = [
      { x: minTime, y: normalValues.light },
      { x: maxTime, y: normalValues.light },
    ];
  } else {
    lightChart.data.datasets[0].data = [];
  }

  // Sound reference line - match actual data range
  if (soundData.length > 0) {
    const minTime = soundData[0].x;
    const maxTime = soundData[soundData.length - 1].x;
    soundChart.data.datasets[0].data = [
      { x: minTime, y: normalValues.sound },
      { x: maxTime, y: normalValues.sound },
    ];
  } else {
    soundChart.data.datasets[0].data = [];
  }
}

// update normal values (fetch from Firebase)
export function setNormalValues(distance, light, sound) {
  normalValues.distance = distance;
  normalValues.light = light;
  normalValues.sound = sound;
  updateNormalValueLines();
  distanceChart.update("none");
  lightChart.update("none");
  soundChart.update("none");
}

// Add a single new data point to existing charts
export function addDataPoint(timestamp, data) {
  // Add distance data
  if (data.dist !== undefined) {
    distanceChart.data.datasets[1].data.push({
      x: timestamp,
      y: data.dist,
    });

    // Keep only last MAX_DATA_POINTS
    if (distanceChart.data.datasets[1].data.length > MAX_DATA_POINTS) {
      distanceChart.data.datasets[1].data.shift();
    }
    distanceChart.update("none");
  }

  // Add light data
  if (data.light !== undefined) {
    lightChart.data.datasets[1].data.push({
      x: timestamp,
      y: data.light,
    });

    if (lightChart.data.datasets[1].data.length > MAX_DATA_POINTS) {
      lightChart.data.datasets[1].data.shift();
    }
    lightChart.update("none");
  }

  // Add sound data
  if (data.sound !== undefined) {
    soundChart.data.datasets[1].data.push({
      x: timestamp,
      y: data.sound,
    });

    if (soundChart.data.datasets[1].data.length > MAX_DATA_POINTS) {
      soundChart.data.datasets[1].data.shift();
    }
    soundChart.update("none");
  }

  // Update reference lines to extend with new data
  updateNormalValueLines();
}

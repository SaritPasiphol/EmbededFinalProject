export function updateSensorDisplay(data) {
  const distanceElement = document.getElementById("distance");
  const lightElement = document.getElementById("light");
  const soundElement = document.getElementById("sound");
  const lastUpdateElement = document.getElementById("lastUpdate");

  if (data.dist !== undefined) {
    distanceElement.textContent = `${data.dist} cm`;
  }

  if (data.light !== undefined) {
    lightElement.textContent = `${data.light} lux`;
  }

  if (data.sound !== undefined) {
    soundElement.textContent = `${data.sound} dB`;
  }

  const now = new Date();
  lastUpdateElement.textContent = now.toLocaleTimeString();
}

import { database } from "./firebase-config.js";
import {
  ref,
  onValue,
  query,
  limitToLast,
  get,
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";
import { updateSensorDisplay } from "../components/sensor-display.js";
import {
  initCharts,
  updateCharts,
  addDataPoint,
  setNormalValues,
} from "../components/chart-manager.js";

console.log("App.js loaded");
console.log("Database:", database);

const statusElement = document.getElementById("status");
const currentRef = ref(database, "sensor/current");
const normalRef = ref(database, "sensor/normal");
// Limit to 3600 data points (1 hour at 1 second intervals)
const historyRef = query(ref(database, "sensor/history"), limitToLast(3600));

let historicalDataLoaded = false;

statusElement.textContent = "Connecting to Firebase...";
statusElement.className = "status connecting";

// Initialize charts
console.log("Initializing charts...");
initCharts();

// Load historical data once on startup
async function loadHistoricalData() {
  console.log("Loading historical data...");
  try {
    const snapshot = await get(historyRef);
    console.log("Historical snapshot received:", snapshot.exists());
    if (snapshot.exists()) {
      const data = snapshot.val();
      console.log("Historical data:", Object.keys(data).length, "records");

      // Convert Firebase push keys to array with timestamps
      const dataArray = Object.entries(data).map(([key, value], index) => ({
        // Use index as pseudo-timestamp since we don't have real timestamps
        // Each record is 1 second apart
        timestamp: Date.now() - (Object.keys(data).length - index) * 1000,
        ...value,
      }));

      updateCharts(dataArray);
      historicalDataLoaded = true;
      console.log("Historical data loaded successfully");
    } else {
      console.log("No historical data available");
      historicalDataLoaded = true;
    }
  } catch (error) {
    console.error("Error loading historical data:", error);
    historicalDataLoaded = true;
  }
}

// Load historical data immediately
loadHistoricalData();

// Listen to normal sensor values in real-time
console.log("Setting up normal values listener...");
onValue(
  normalRef,
  (snapshot) => {
    console.log("Normal values snapshot received");
    const data = snapshot.val();
    console.log("Normal values data:", data);

    if (data) {
      const { dist, light, sound } = data;
      if (dist !== undefined && light !== undefined && sound !== undefined) {
        console.log("Updating normal values:", { dist, light, sound });
        setNormalValues(dist, light, sound);
      }
    }
  },
  (error) => {
    console.error("Error loading normal values:", error);
  }
);

// Listen to current sensor values
console.log("Setting up current value listener...");
onValue(
  currentRef,
  (snapshot) => {
    console.log("Current value snapshot received");
    const data = snapshot.val();
    console.log("Current data:", data);

    if (data) {
      statusElement.textContent = "Connected";
      statusElement.className = "status connected";
      updateSensorDisplay(data);

      // If historical data is loaded, add this new point to charts
      if (historicalDataLoaded) {
        const timestamp = Date.now();
        console.log("Adding data point at:", timestamp);
        addDataPoint(timestamp, data);
      }
    } else {
      statusElement.textContent = "No current data available";
      statusElement.className = "status disconnected";
    }
  },
  (error) => {
    console.error("Firebase error:", error);
    statusElement.textContent = "Connection Error";
    statusElement.className = "status disconnected";
  }
);

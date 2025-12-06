import { database } from "./firebase-config.js";
import {
  ref,
  onValue,
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";
import { updateSensorDisplay } from "../components/sensor-display.js";

const statusElement = document.getElementById("status");
const sensorRef = ref(database, "sensor");

statusElement.textContent = "Connecting to Firebase...";
statusElement.className = "status connecting";

onValue(
  sensorRef,
  (snapshot) => {
    const data = snapshot.val();

    if (data) {
      statusElement.textContent = "Connected";
      statusElement.className = "status connected";
      updateSensorDisplay(data);
    } else {
      statusElement.textContent = "No data available";
      statusElement.className = "status disconnected";
    }
  },
  (error) => {
    console.error("Firebase error:", error);
    statusElement.textContent = "Connection Error";
    statusElement.className = "status disconnected";
  }
);

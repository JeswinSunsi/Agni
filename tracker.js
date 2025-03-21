"use strict";

// Array to record full mouse movement data.
const mouseData = [];
const LOCAL_STORAGE_KEY = "mouseMovementData";

// Save the full mouseData array to local storage for debugging.
function saveMouseData() {
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(mouseData));
}

// Clear stored mouse data from local storage.
function clearMouseData() {
  localStorage.removeItem(LOCAL_STORAGE_KEY);
  console.log("Mouse data cleared from local storage.");
}

// Calculate basic metrics: average speed, speed standard deviation, and total distance.
function calculateMetrics(data) {
  if (data.length < 2) return { avgSpeed: 0, stdDev: 0, totalDistance: 0 };

  const speeds = [];
  let totalDistance = 0;
  for (let i = 1; i < data.length; i++) {
    const dx = data[i].x - data[i - 1].x;
    const dy = data[i].y - data[i - 1].y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    totalDistance += distance;
    const dt = (data[i].t - data[i - 1].t) / 1000; // seconds
    const speed = dt > 0 ? distance / dt : 0;
    speeds.push(speed);
  }
  const avgSpeed = speeds.length ? speeds.reduce((sum, s) => sum + s, 0) / speeds.length : 0;
  const variance = speeds.length ? speeds.reduce((sum, s) => sum + Math.pow(s - avgSpeed, 2), 0) / speeds.length : 0;
  const stdDev = Math.sqrt(variance);
  return { avgSpeed, stdDev, totalDistance, speeds };
}

// Calculate extra features:
//   * Average Turning Angle: the average change in direction (degrees) between consecutive moves.
//   * Idle Time Ratio: fraction of intervals with a pause above a given threshold.
function calculateExtraFeatures(data) {
  if (data.length < 3) return { avgTurnAngle: 0, idleRatio: 0 };

  const turnAngles = [];
  let idleCount = 0;
  const totalIntervals = data.length - 1;
  const idleThreshold = 500; // milliseconds

  let previousAngle = null;
  for (let i = 1; i < data.length; i++) {
    const dx = data[i].x - data[i - 1].x;
    const dy = data[i].y - data[i - 1].y;
    const dt = data[i].t - data[i - 1].t;
    if (dt > idleThreshold) {
      idleCount++;
    }
    if (dx !== 0 || dy !== 0) {
      const angle = Math.atan2(dy, dx) * (180 / Math.PI);
      if (previousAngle !== null) {
        let angleDiff = Math.abs(angle - previousAngle);
        if (angleDiff > 180) {
          angleDiff = 360 - angleDiff;
        }
        turnAngles.push(angleDiff);
      }
      previousAngle = angle;
    }
  }
  const avgTurnAngle = turnAngles.length > 0 ? turnAngles.reduce((sum, a) => sum + a, 0) / turnAngles.length : 0;
  const idleRatio = totalIntervals ? idleCount / totalIntervals : 0;
  return { avgTurnAngle, idleRatio };
}

// Evaluate the mouse data locally and return a classification.
// Returns 1 if bot controlled, 0 if human controlled.
function evaluateLocalClassification() {
  if (mouseData.length < 5) {
    console.log("Not enough mouse movement data to evaluate locally.");
    return null;
  }
  const basicMetrics = calculateMetrics(mouseData);
  const extraFeatures = calculateExtraFeatures(mouseData);

  console.log("=== Local Mouse Data Metrics ===");
  console.log("Total Data Points:", mouseData.length);
  console.log("Average Speed:", basicMetrics.avgSpeed.toFixed(2), "pixels/sec");
  console.log("Speed StdDev:", basicMetrics.stdDev.toFixed(2));
  console.log("Total Distance:", basicMetrics.totalDistance.toFixed(2), "pixels");
  console.log("Average Turning Angle:", extraFeatures.avgTurnAngle.toFixed(2), "degrees");
  console.log("Idle Time Ratio:", extraFeatures.idleRatio.toFixed(2));

  // Basic thresholds for local classification.
  const speedThreshold = 30;   // pixels per second.
  const stdDevThreshold = 10;  // pixels per second.
  
  // Local classification rule: if average speed and stdDev both exceed thresholds, classify as bot (1).
  const localClassification = (basicMetrics.avgSpeed > speedThreshold && basicMetrics.stdDev > stdDevThreshold) ? 1 : 0;
  console.log("Local Classification:", localClassification);
  return localClassification;
}

// Send the full mouse data to the remote AI API (Google 3.5 Turbo) and return a promise.
// The payload instructs the AI to analyze the mouseData and return either 1 (bot controlled) or 0 (human controlled).
function sendDataToRemoteAPI() {
  const payload = {
    prompt: "Analyze the attached full mouse movement data. Return a single numeric classification value: 1 if the movements indicate bot behavior (including automation using PyAutoGUI) or 0 if they indicate human behavior. Only return the number 1 or 0 without any extra text.",
    mouseData: mouseData
  };
  return fetch("https://api.google.com/3.5turbo?key=AIzaSyCFVfJKRePSSL6JPeESMfBq68e-vSfHjYc", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  })
    .then(response => response.json())
    .then(data => {
      // Assume the AI returns a JSON with a 'classification' property.
      const remoteClassification = data.classification;
      console.log("Remote AI Classification:", remoteClassification);
      console.log("Full Remote AI Response:", data);
      return remoteClassification;
    })
    .catch(error => {
      console.error("Error calling remote API:", error);
      return null;
    });
}

// Event listener for mouse movement.
// Logs every mouse move with detailed event data and stores it.
function trackMouse(e) {
  const now = Date.now();
  const dataPoint = {
    x: e.clientX,
    y: e.clientY,
    t: now,
    trusted: e.isTrusted // true if user-initiated; false if synthetic.
  };
  mouseData.push(dataPoint);
  saveMouseData();
  console.log("Mouse Moved:", dataPoint);
}

// Initialize mouse tracking.
document.addEventListener("mousemove", trackMouse);

// After 15 seconds, stop tracking, evaluate locally, send full mouse data to the remote API,
// compare local and remote classification, and output the final answer.
setTimeout(() => {
  document.removeEventListener("mousemove", trackMouse);
  console.log("Stopped mouse tracking after 15 seconds.");

  const localClassification = evaluateLocalClassification();
  if (localClassification === null) {
    console.log("Not enough data for remote evaluation.");
    return;
  }
  
  // Log the full collected mouse data for debugging.
  console.log("Full Collected Mouse Data:", mouseData);

  // Send full mouse data to remote AI.
  sendDataToRemoteAPI().then(remoteClassification => {
    if (remoteClassification === null) {
      console.log("Remote classification failed; final answer will be local classification:", localClassification);
      return;
    }
    
    // Compare local and remote classifications.
    console.log("Comparing Classifications...");
    if (localClassification === remoteClassification) {
      console.log("Both classifications match.");
      console.log("Final Perfect Classification:", localClassification);
    } else {
      console.log("Discrepancy detected!");
      console.log("Local Classification:", localClassification, "| Remote Classification:", remoteClassification);
      // Here you can decide on a method to choose, such as defaulting to human (0) or further logic.
      const finalClassification = 0;
      console.log("Final Perfect Classification (defaulted due to discrepancy):", finalClassification);
    }
  });
}, 15000);
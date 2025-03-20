/* console.log("Mouse tracking script loaded");



const movements = [];
let isTracking = false;
const MAX_MOVEMENTS = 100; // Adjust based on your needs

function startTracking() {
  isTracking = true;
  document.addEventListener('mousemove', trackMouseMovement);
}

function stopTracking() {
  isTracking = false;
  document.removeEventListener('mousemove', trackMouseMovement);
}

function trackMouseMovement(event) {
  if (!isTracking) return;
  
  // Add movement data with timestamp
  movements.push({
    x: event.clientX,
    y: event.clientY,
    t: Date.now()
  });
  
  // Keep array at reasonable size by removing oldest entries
  if (movements.length > MAX_MOVEMENTS) {
    movements.shift();
  }
}

function sendDataToServer() {
  if (movements.length < 5) return;
  
  fetch('http://localhost:8000/mouse-data', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ movements: movements })
  })
  .then(response => response.json())
  .then(data => {
    console.log('Human verification result:', data.human);
    // Take action based on result
  })
  .catch(error => console.error('Error sending mouse data:', error));
}

// Start tracking when page loads
document.addEventListener('DOMContentLoaded', startTracking);

// Example: Send data every 5 seconds
setInterval(sendDataToServer, 5000); */

// background.js
console.log("Background script loaded");

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete') {
    chrome.scripting.executeScript({
      target: { tabId: tabId },
      function: () => {
        console.log("Injected script running");
        document.body.style.backgroundColor = 'yellow'; // Visual confirmation
      }
    });
  }
});
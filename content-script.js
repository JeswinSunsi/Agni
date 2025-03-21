console.log('Content script starting to load...');

let lastUrl = window.location.href;

function checkUrl() {
  const currentUrl = window.location.href;
  const url = "https://agnishield-backend.onrender.com/predict";

  const requestData = {
    url: currentUrl
  };

  fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(requestData)
  })
    .then(response => response.json())
    .then(data => {
      console.log("Prediction Response:", data);
      if (data.prediction != "safe") {
        console.log(data.prediction)
        window.location.href = "https://agni20.netlify.app/site";
      }
    })
    .catch(error => {
      console.error("Error:", error);
    });

}

setInterval(checkUrl, 1000);

// Get the elements for the input box, save button, and change button
var apiKeyInput = document.getElementById("api_key");
var saveButton = document.getElementById("save_button");
var changeButton = document.getElementById("change_button");
var statusMessage = document.getElementById("status_message");

// Load the saved API key if it exists
chrome.storage.sync.get("api_key", function(data) {
  if (data.api_key) {
    // Hide the input box and save button
    apiKeyInput.style.display = "none";
    saveButton.style.display = "none";
    // Show the change button
    changeButton.style.display = "inline-block";
  }
});

// Save the API key when the user clicks the save button
saveButton.addEventListener("click", function() {
  var apiKey = apiKeyInput.value;
  if (apiKey) {
    // Save the API key to Chrome storage
    chrome.storage.sync.set({ "api_key": apiKey }, function() {
      // Hide the input box and save button
      apiKeyInput.style.display = "none";
      saveButton.style.display = "none";
      // Show the change button
      changeButton.style.display = "inline-block";
      // Update the status message to indicate that the key was saved
      statusMessage.textContent = "API key saved.";
      // Clear the status message after 3 seconds
      setTimeout(function() {
        statusMessage.textContent = "";
      }, 3000);
    });
  } else {
    // Update the status message to indicate that the key is empty
    statusMessage.textContent = "Please enter an API key.";
  }
});

// Handle click events for the change button
changeButton.addEventListener("click", function() {
  // Show the input box and save button
  apiKeyInput.style.display = "inline-block";
  saveButton.style.display = "inline-block";
  // Hide the change button
  changeButton.style.display = "none";
  // Clear the API key from Chrome storage
  chrome.storage.sync.remove("api_key");
});
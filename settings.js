document.addEventListener('DOMContentLoaded', function() {
    // Get the API key input element and the save button element
    const apiKeyInput = document.getElementById('api-key');
    const saveButton = document.getElementById('save-button');
  
    // Load the user's API key from storage and populate the input field
    chrome.storage.sync.get('api_key', function(data) {
      apiKeyInput.value = data.api_key || '';
    });
  
    // Save the user's API key to storage when the save button is clicked
    saveButton.addEventListener('click', function() {
      const apiKey = apiKeyInput.value.trim();
      chrome.storage.sync.set({ 'api_key': apiKey }, function() {
        alert('API key saved!');
      });
    });
  });
  
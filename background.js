console.log("Background script running!");

chrome.runtime.onInstalled.addListener(() => {
  console.log("Extension installed!");
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.message === "getApiKey") {
    chrome.storage.local.get("api_key_smartselect", result => {
      const apiKey = result.api_key;
      if (apiKey) {
        console.log("API key found:", apiKey);
        const headers = new Headers();
        headers.append("Content-Type", "application/json");
        headers.append("Authorization", `Bearer ${apiKey}`);
        fetch("https://api.openai.com/v1/engines/davinci-codex/completions", {
          method: "POST",
          headers,
          body: JSON.stringify({
            prompt: request.prompt,
            max_tokens: 100,
            temperature: 0.7,
          }),
        })
          .then(response => response.json())
          .then(data => sendResponse(data))
          .catch(error => console.error(error));
        return true;
      } else {
        console.log("API key not found");
      }
    });
  }
});
// Create a context menu item for "Generate Answer"
chrome.contextMenus.create({
  id: "selected-text",
  title: "Generate Answer",
  contexts: ["selection"],
});


// Create a context menu item for "Generate Alternative"
chrome.contextMenus.create({
  id: "all-content",
  title: "Generate Alternative",
  contexts: ["selection"],
});

chrome.contextMenus.onClicked.addListener(function(info, tab) {
  if (info.menuItemId === "option1") {
    console.log("Option 1 clicked");
    // Handle Option 1 click
  } else if (info.menuItemId === "option2") {
    // Handle Option 2 click
    console.log("Option 2 clicked")
  }
});


// Define the function that will generate the answer
function generateAnswer(info, tab) {
  // Retrieve the selected text
  const selectedText = info.selectionText;

  // Determine which menu item was clicked
  const menuItem = info.menuItemId;
  let prompt = selectedText;

  // Use different prompts for each menu item
  if (menuItem === "Generate Answer") {
    prompt = `Answer the following question: ${selectedText}`;
  } else if (menuItem === "Generate Alternative") {
    prompt = `Provide an alternative to: ${selectedText}`;
  }

  // Send a message to the background script to generate the answer
  chrome.runtime.sendMessage({ message: "getApiKey", prompt: prompt }, response => {
    // Display the generated answer in an alert dialog
    alert(response.choices[0].text);
  });
}

// // Show context menu when text is selected
// chrome.contextMenus.onShown.addListener(info => {
//   if (info.selectionText) {
//     chrome.contextMenus.update("Generate Answer", { visible: true });
//     chrome.contextMenus.update("Generate Alternative", { visible: true });
//   } else {
//     chrome.contextMenus.update("Generate Answer", { visible: false });
//     chrome.contextMenus.update("Generate Alternative", { visible: false });
//   }
// });
let selectionTimeout;
let ui;
let result_ui;

// Map website domains to options
const websiteOptions = {
  "twitter.com": [
    {
      label: "Rewrite the Tweet",
      action: (selectedText) => {
        makeApiCall(selectedText, "Rewrite the Tweet in 240 characters");
      },
    },
    {
      label: "Create Reply",
      action: (selectedText) => {
        makeApiCall(selectedText, "Create the Reply to this Tweet in 240 characters");
      },
    },
  ],
  "linkedin.com": [
    {
      label: "Create Personalised Message",
      action: (selectedText) => {
        makeApiCall(selectedText, "Create Personalised Linkedin Connection Message in 300 characters");
      },
    },
    {
      label: "Create Reply",
      action: (selectedText) => {
        makeApiCall(selectedText, "Create the Reply to this Linkedin Message in 300 characters");
      },
    }
  ],
};

document.addEventListener("selectionchange", () => {
  clearTimeout(selectionTimeout);
  selectionTimeout = setTimeout(() => {
    const selectedUI = window.getSelection()//.anchorNode.parentElement;
    const selection = window.getSelection().toString().trim();
    console.log("selection",selection)
    const websiteDomain = window.location.hostname.replace("www.", "");
    let options = websiteOptions[websiteDomain];
    const isInputOrTextAreaSelectedVal=isInputOrTextAreaSelected();
    console.log("isInputOrTextAreaSelectedVal",isInputOrTextAreaSelectedVal)
    if (isInputOrTextAreaSelected()) {
      options = [
        {
          label: "Generate Content",
          action: (selectedText) => {
            makeApiCall(selectedText, "Generate Content For:");
          },
        },
      ]
    } 
    console.log("websiteDomain",websiteDomain,options,selection)
    if (selection && options) {
      if (!ui) {
        ui = document.createElement("div");
        ui.style.position = "absolute";
        ui.style.zIndex = "99999";
        ui.style.display = "flex";
        ui.style.flexDirection = "column";
        ui.style.alignItems = "center";
        ui.style.backgroundColor = "#fff";
        ui.style.borderRadius = "5px";
        ui.style.boxShadow = "0 0 10px rgba(0, 0, 0, 0.5)";
      
        // Add a loader element to the UI
        const loader = document.createElement("div");
        loader.style.display = "none";
        loader.textContent = "Fetching Data...";
        ui.appendChild(loader);
      
        // Get the coordinates of the selected text
        const selectionCoords = selectedUI.getRangeAt(0).getBoundingClientRect();
        ui.style.top = `${window.pageYOffset + selectionCoords.bottom}px`;
        ui.style.left = `${window.pageXOffset + (selectionCoords.left + selectionCoords.right) / 2}px`;
      
        options.forEach((option) => {
          const button = document.createElement("button");
          button.style.margin = "5px";
          button.style.backgroundColor = "#4CAF50";
          button.style.color = "white";
          button.style.padding = "10px 24px";
          button.style.border = "none";
          button.style.borderRadius = "4px";
          button.style.cursor = "pointer";
          button.textContent = option.label;
          button.addEventListener("click", () => {
            // Show the loader when making an API call
            loader.style.display = "block";
            const promise = option.action(selection);
          if (promise && typeof promise.then === "function") {
            promise.then(() => {
              // Hide the loader when the API call is complete
              loader.style.display = "none";
            });
          }
          });
          ui.appendChild(button);
        });
        
        document.body.appendChild(ui);
      }
      // const range = window.getSelection().getRangeAt(0);
      // const rect = range.getBoundingClientRect();
      // ui.style.top = `${rect.bottom}px`;
      // ui.style.left = `${rect.right + 10}px`;
    } else {
      if (ui) {
        ui.remove();
        ui = null;
      }
    }

    function isInputOrTextAreaSelected() {
      const selectedNode = window.getSelection().anchorNode;
      if (!selectedNode) return false;
      //console.log("selectedNode",selectedNode)

    
      const parentElement = selectedNode.parentElement;
      if (!parentElement) return false;
    
      const childElements = parentElement.getElementsByTagName("*");
      for (let i = 0; i < childElements.length; i++) {
        const tagName = childElements[i].tagName.toLowerCase();
       // console.log("tagName",tagName)

        if (tagName === "input" || tagName === "textarea") {
          return true;
        }
      }
    
      return false;
    }

  }, 200);
});

document.addEventListener("mousedown", (event) => {
  if (ui && !ui.contains(event.target)) {
    ui.remove();
    ui = null;
  }
});

// Make API call
function makeApiCall(selectedText, option) {
  const apiUrl = "https://api.openai.com/v1/chat/completions";
  chrome.storage.sync.get("api_key_smartselect", function(data) {
    var api_key_smartselect = data && data.api_key_smartselect ? data.api_key_smartselect : "";

    if (!api_key_smartselect) {
      console.log("API key not found");

    //   var popupURL = chrome.runtime.getURL('popup.html');

    // // Open the HTML file in a new tab
    // chrome.tabs.create({ url: popupURL });


      if(ui){
      const loader = document.createElement("div");
      loader.textContent = "API Key Not Present.Please add the key from openai console in the extension popup and try again";
      loader.style.fontSize = "18px";
      loader.style.fontWeight = "bold";
      loader.style.color = "#333";
      loader.style.padding = "20px";
      loader.style.textAlign = "center";
      loader.style.border = "2px solid #ccc";
      loader.style.borderRadius = "5px";
      loader.style.boxShadow = "0 2px 5px rgba(0, 0, 0, 0.3)";
      loader.style.margin = "50px auto";
      loader.style.width = "80%";
      ui.appendChild(loader);
      }
      return;
    }
    const model = "gpt-3.5-turbo"
    const messages=  [{"role": "user", "content": option+":\n"+selectedText+":\n"}]
    const data1 = {
      messages,model
    };
    fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer "+api_key_smartselect,
      },
      body: JSON.stringify(data1),
    })
      .then((response) => response.json())
      .then((result) => {
        showResult(result.choices[0].message.content);
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  });
}

function showResult(result) {
  if (!result_ui) {
    result_ui = document.createElement("div");
    result_ui.style.position = "fixed";
    result_ui.style.top = "0";
    result_ui.style.left = "0";
    result_ui.style.right = "0";
    result_ui.style.zIndex = "99999";
    result_ui.style.display = "flex";
    result_ui.style.flexDirection = "column";
    result_ui.style.alignItems = "center";
    result_ui.style.backgroundColor = "#fff";
    result_ui.style.borderRadius = "5px";
    result_ui.style.boxShadow = "0 2px 10px rgba(0, 0, 0, 0.5)";
    result_ui.style.padding = "20px";
    result_ui.style.width = "100%";

    const resultText = document.createElement("p");
    resultText.textContent = result;
    resultText.style.margin = "0 0 10px 0";
    resultText.style.textAlign = "center";
    resultText.style.fontSize = "20px";
    //resultText.style.fontWeight = "bold";
    result_ui.appendChild(resultText);

    const buttonContainer = document.createElement("div");
    buttonContainer.style.display = "flex";
    buttonContainer.style.justifyContent = "center";

    const copyButton = document.createElement("button");
    copyButton.textContent = "Copy to Clipboard";
    copyButton.style.backgroundColor = "#4CAF50";
    copyButton.style.color = "white";
    copyButton.style.padding = "10px 24px";
    copyButton.style.border = "none";
    copyButton.style.borderRadius = "4px";
    copyButton.style.marginRight = "10px";
    copyButton.style.cursor = "pointer";
    copyButton.addEventListener("click", () => {
      navigator.clipboard.writeText(result);
      copyButton.textContent = "Copied!";
      setTimeout(() => {
        copyButton.textContent = "Copy to Clipboard";
      }, 3000);
    });
    buttonContainer.appendChild(copyButton);

    const closeButton = document.createElement("button");
    closeButton.textContent = "Close";
    closeButton.style.backgroundColor = "#f44336";
    closeButton.style.color = "white";
    closeButton.style.padding = "10px 24px";
    closeButton.style.border = "none";
    closeButton.style.borderRadius = "4px";
    closeButton.style.cursor = "pointer";
    closeButton.addEventListener("click", () => {
      result_ui.remove();
      result_ui = null;
    });
    buttonContainer.appendChild(closeButton);

    result_ui.appendChild(buttonContainer);
    document.body.appendChild(result_ui);
  }
}
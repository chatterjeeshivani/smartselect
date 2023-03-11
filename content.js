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
        makeApiCall(selectedText, "Create the Tweet Reply in 240 characters");
      },
    },
  ],
  "linkedin.com": [
    {
      label: "Create Personalised Message",
      action: (selectedText) => {
        makeApiCall(selectedText, "Create Personalised Linkedin Connection Message in 300 characters");
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
          button.textContent = option.label;
          button.addEventListener("click", () => {
            // Show the loader when making an API call
            loader.style.display = "block";
            option.action(selection).then(() => {
              // Hide the loader when the API call is complete
              loader.style.display = "none";
            });
          });
          ui.appendChild(button);
        });
        document.body.appendChild(ui);
      }
      const range = window.getSelection().getRangeAt(0);
      const rect = range.getBoundingClientRect();
      ui.style.top = `${rect.bottom}px`;
      ui.style.left = `${rect.right + 10}px`;
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
  chrome.storage.sync.get("api_key", function(data) {
    if (!data.api_key) {
      console.error("API key not found");
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
        "Authorization": "Bearer "+data.api_key,
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
    result_ui.style.position = "absolute";
    result_ui.style.top = "0";
    result_ui.style.left = "0";
    result_ui.style.zIndex = "99999";
    result_ui.style.display = "flex";
    result_ui.style.flexDirection = "column";
    result_ui.style.alignItems = "center";
    result_ui.style.backgroundColor = "#fff";
    result_ui.style.borderRadius = "5px";
    result_ui.style.boxShadow = "0 0 10px rgba(0, 0, 0, 0.5)";

    const resultText = document.createElement("p");
    resultText.textContent = result;
    result_ui.appendChild(resultText);

    const buttonContainer = document.createElement("div");
    buttonContainer.style.display = "flex";
    buttonContainer.style.marginTop = "10px";

    const copyButton = document.createElement("button");
    copyButton.textContent = "Copy to Clipboard";
    copyButton.addEventListener("click", () => {
      navigator.clipboard.writeText(result);
      copyButton.textContent = "Copied!";
      setTimeout(() => {
        copyButton.textContent = "Copy to Clipboard";
      }, 2000);
    });
    buttonContainer.appendChild(copyButton);

    const closeButton = document.createElement("button");
    closeButton.textContent = "Close";
    closeButton.addEventListener("click", () => {
      result_ui.remove();
      result_ui = null;
    });
    buttonContainer.appendChild(closeButton);

    result_ui.appendChild(buttonContainer);
    document.body.appendChild(result_ui);
  }
}
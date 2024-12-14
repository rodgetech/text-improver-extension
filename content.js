chrome.runtime.onMessage.addListener((message) => {
  if (message.action === "showImprovedText") {
    showImprovedTextPopover(message.improvedText);
  }
});

let preservedRange = null; // Variable to store the range of selected text

function showImprovedTextPopover(improvedText) {
  const selection = window.getSelection();

  // Preserve the current text selection
  if (selection.rangeCount > 0) {
    preservedRange = selection.getRangeAt(0);
  }

  const tooltip = document.createElement("div");
  tooltip.id = "text-improver-tooltip";

  // Style the tooltip
  const range = preservedRange;
  tooltip.style.position = "fixed";
  tooltip.style.top = `${
    range ? range.getBoundingClientRect().bottom + 10 : 100
  }px`;
  tooltip.style.left = `${range ? range.getBoundingClientRect().left : 100}px`;
  tooltip.style.backgroundColor = "white";
  tooltip.style.border = "1px solid black";
  tooltip.style.padding = "10px";
  tooltip.style.zIndex = "9999";
  tooltip.style.boxShadow = "0 2px 10px rgba(0,0,0,0.2)";
  tooltip.style.maxWidth = "300px";
  tooltip.style.fontFamily = "Arial, sans-serif";
  tooltip.style.borderRadius = "5px";

  tooltip.innerHTML = `
      <p style="margin: 0; font-weight: bold;">Improved Text:</p>
      <p style="word-wrap: break-word; margin: 10px 0;">${improvedText}</p>
      <button id="copy-text" style="margin-right: 10px; padding: 5px 10px; border: none; background: #4CAF50; color: white; border-radius: 3px; cursor: pointer;">
        Copy to Clipboard
      </button>
      <button id="cancel-change" style="padding: 5px 10px; border: none; background: #f44336; color: white; border-radius: 3px; cursor: pointer;">
        Cancel
      </button>
    `;

  document.body.appendChild(tooltip);

  // Handle Copy to Clipboard
  document.getElementById("copy-text").onclick = async () => {
    try {
      await navigator.clipboard.writeText(improvedText);

      // Re-highlight the original text
      restoreSelection();
      document.body.removeChild(tooltip);
    } catch (err) {
      console.error("Failed to copy text:", err);
    }
  };

  // Handle Cancel button
  document.getElementById("cancel-change").onclick = () => {
    restoreSelection();
    document.body.removeChild(tooltip);
  };
}

// Function to restore the preserved selection
function restoreSelection() {
  if (preservedRange) {
    const selection = window.getSelection();
    selection.removeAllRanges();
    selection.addRange(preservedRange);
  }
}

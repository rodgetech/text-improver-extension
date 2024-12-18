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

  // Get the selection's bounding rectangle
  const range = preservedRange;
  const rect = range.getBoundingClientRect();

  // Tooltip dimensions
  const tooltipWidth = 300; // Tooltip width
  const tooltipHeight = 200; // Estimated height
  const padding = 10;

  // Default position: below the selection
  let top = rect.bottom + padding;
  let left = rect.left;

  // Adjust vertically if offscreen
  if (top + tooltipHeight > window.innerHeight) {
    top = rect.top - tooltipHeight - padding; // Move above the selection
  }

  // Adjust horizontally if offscreen
  if (left + tooltipWidth > window.innerWidth) {
    left = window.innerWidth - tooltipWidth - padding;
  }
  if (left < padding) {
    left = padding; // Prevent overflowing left
  }

  // Apply tooltip styles
  tooltip.style.position = "fixed";
  tooltip.style.top = `${top}px`;
  tooltip.style.left = `${left}px`;
  tooltip.style.backgroundColor = "white";
  tooltip.style.border = "1px solid black";
  tooltip.style.padding = "10px";
  tooltip.style.zIndex = "9999";
  tooltip.style.boxShadow = "0 2px 10px rgba(0,0,0,0.2)";
  tooltip.style.width = `${tooltipWidth}px`;
  tooltip.style.maxHeight = `${tooltipHeight}px`;
  tooltip.style.fontFamily = "Arial, sans-serif";
  tooltip.style.overflow = "auto";
  tooltip.style.borderRadius = "5px";

  tooltip.innerHTML = `
    <p style="margin: 0; font-weight: bold; font-size: 13px; color: black;">
      Improved Text:
    </p>
    <p style="word-wrap: break-word; margin: 10px 0; font-size: 13px; line-height: 1.4; color: black;">
      ${improvedText}
    </p>
    <button id="copy-text" style="
      margin-right: 10px; 
      padding: 5px 10px; 
      font-size: 13px; 
      border: none; 
      background: #4CAF50; 
      color: white; 
      border-radius: 3px; 
      cursor: pointer;
    ">
      Copy to Clipboard
    </button>
  `;

  document.body.appendChild(tooltip);

  // Handle Copy to Clipboard
  document.getElementById("copy-text").onclick = async () => {
    try {
      await navigator.clipboard.writeText(improvedText);
      restoreSelection();
      document.body.removeChild(tooltip);
    } catch (err) {
      console.error("Failed to copy text:", err);
    }
  };

  // Close tooltip on outside click
  function outsideClickListener(event) {
    if (!tooltip.contains(event.target)) {
      document.body.removeChild(tooltip);
      document.removeEventListener("click", outsideClickListener);
      restoreSelection();
    }
  }
  document.addEventListener("click", outsideClickListener);
}

// Function to restore the preserved selection
function restoreSelection() {
  if (preservedRange) {
    const selection = window.getSelection();
    selection.removeAllRanges();
    selection.addRange(preservedRange);
  }
}

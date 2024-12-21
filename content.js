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
  const tooltipWidth = 320; // Slightly wider tooltip
  const tooltipHeight = 220; // Slightly taller
  const padding = 12;

  // Calculate available space in different directions
  const viewportHeight = window.innerHeight;
  const viewportWidth = window.innerWidth;

  // Get the selection coordinates
  const selectionRect = range.getBoundingClientRect();
  const selectionTop = selectionRect.top;
  const selectionBottom = selectionRect.bottom;
  const selectionCenter = selectionRect.left + selectionRect.width / 2;

  // Calculate available space above and below selection
  const spaceAbove = selectionTop;
  const spaceBelow = viewportHeight - selectionBottom;

  // Determine vertical position
  let top;
  if (spaceBelow >= tooltipHeight + padding) {
    // Prefer below if there's enough space
    top = selectionBottom + padding;
  } else if (spaceAbove >= tooltipHeight + padding) {
    // Try above if there's enough space
    top = selectionTop - tooltipHeight - padding;
  } else {
    // Center in viewport if neither above nor below has enough space
    top = Math.max(padding, (viewportHeight - tooltipHeight) / 2);
  }

  // Determine horizontal position
  let left = selectionCenter - tooltipWidth / 2;
  // Ensure tooltip doesn't go off screen horizontally
  left = Math.max(
    padding,
    Math.min(left, viewportWidth - tooltipWidth - padding)
  );

  // Apply modern tooltip styles
  tooltip.style.position = "fixed";
  tooltip.style.top = `${top}px`;
  tooltip.style.left = `${left}px`;
  tooltip.style.backgroundColor = "#ffffff";
  tooltip.style.border = "none";
  tooltip.style.padding = "16px";
  tooltip.style.zIndex = "9999";
  tooltip.style.boxShadow = "0 4px 20px rgba(0,0,0,0.12)";
  tooltip.style.width = `${tooltipWidth}px`;
  tooltip.style.maxHeight = `${tooltipHeight}px`;
  tooltip.style.fontFamily =
    "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
  tooltip.style.overflow = "auto";
  tooltip.style.borderRadius = "12px";
  tooltip.style.backdropFilter = "blur(8px)";

  tooltip.innerHTML = `
  <p style="margin: 0; font-weight: 600; font-size: 14px; color: #1a1a1a;">
    Improved Text
  </p>
  <p id="improved-text" style="word-wrap: break-word; margin: 12px 0; font-size: 14px; line-height: 1.5; color: #333;">
    ${improvedText}
  </p>
  <div style="display: flex; gap: 8px;">
    <button id="copy-text" style="
      padding: 8px 16px;
      font-size: 13px;
      font-weight: 500;
      border: none;
      background: #2563eb;
      color: white;
      border-radius: 6px;
      cursor: pointer;
      transition: background 0.2s ease;
      flex: 1;
    ">
      Copy
    </button>
    <button id="refresh-text" style="
      padding: 8px 16px;
      font-size: 13px;
      font-weight: 500;
      border: 1px solid #e5e7eb;
      background: #ffffff;
      color: #374151;
      border-radius: 6px;
      cursor: pointer;
      transition: all 0.2s ease;
      flex: 1;
    ">
      Refresh
    </button>
  </div>
`;

  document.body.appendChild(tooltip);

  // Add hover effects
  const copyBtn = document.getElementById("copy-text");
  const refreshBtn = document.getElementById("refresh-text");

  copyBtn.onmouseover = () => {
    copyBtn.style.background = "#1d4ed8";
  };
  copyBtn.onmouseout = () => {
    copyBtn.style.background = "#2563eb";
  };

  refreshBtn.onmouseover = () => {
    refreshBtn.style.background = "#f9fafb";
  };
  refreshBtn.onmouseout = () => {
    refreshBtn.style.background = "#ffffff";
  };

  // Handle Copy to Clipboard
  copyBtn.onclick = async () => {
    try {
      await navigator.clipboard.writeText(improvedText);
      copyBtn.textContent = "Copied!";
      setTimeout(() => {
        document.body.removeChild(tooltip);
        restoreSelection();
      }, 1000);
    } catch (err) {
      console.error("Failed to copy text:", err);
    }
  };

  // Handle Refresh Button
  refreshBtn.onclick = async () => {
    try {
      refreshBtn.style.pointerEvents = "none";
      refreshBtn.textContent = "Refreshing...";

      const response = await fetch(CONFIG.API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: preservedRange.toString() }),
      });

      const data = await response.json();

      if (data && data.improvedText) {
        document.getElementById("improved-text").textContent =
          data.improvedText;
        improvedText = data.improvedText;
      } else {
        console.error("API returned an invalid response.");
      }

      refreshBtn.textContent = "Refresh";
      refreshBtn.style.pointerEvents = "auto";
    } catch (err) {
      console.error("Failed to refresh text:", err);
      refreshBtn.textContent = "Refresh";
      refreshBtn.style.pointerEvents = "auto";
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

  const availableHeight = viewportHeight - top - padding;
  tooltip.style.maxHeight = `${Math.min(tooltipHeight, availableHeight)}px`;
}

// Function to restore the preserved selection
function restoreSelection() {
  if (preservedRange) {
    const selection = window.getSelection();
    selection.removeAllRanges();
    selection.addRange(preservedRange);
  }
}

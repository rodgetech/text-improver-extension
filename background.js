import { CONFIG } from "./config.js";

chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "improveText",
    title: "Improve Text",
    contexts: ["selection"],
  });
});

chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (info.menuItemId === "improveText" && info.selectionText) {
    try {
      const response = await fetch(CONFIG.API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: info.selectionText }),
      });

      const data = await response.json();

      if (data && data.improvedText) {
        chrome.tabs.sendMessage(tab.id, {
          action: "showImprovedText",
          improvedText: data.improvedText,
        });
      } else {
        console.error("API returned an invalid response.");
      }
    } catch (err) {
      console.error("Error fetching improved text:", err);
    }
  }
});

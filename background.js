// background.js
// מאזין לאירועים ומנהל את הצד הלוגי של התוסף

chrome.runtime.onInstalled.addListener(() => {
  console.log("LangFix installed successfully ✅");
});

// מאזין לקיצור המקלדת
chrome.commands.onCommand.addListener((command) => {
  if (command === "fix-text") {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]) {
        chrome.tabs.sendMessage(tabs[0].id, { action: "fixSelected" });
      }
    });
  }
});

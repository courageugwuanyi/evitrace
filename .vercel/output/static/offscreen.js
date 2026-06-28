// Listen for audio triggers sent from the main background service worker
chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message.target === "evitrace-audio") {
    const volume = typeof message.volume === "number" ? message.volume : 0.5;
    const audio = new Audio(chrome.runtime.getURL("assets/sounds/ping.mp3"));
    audio.preload = "auto";
    audio.volume = volume;
    audio.play().then(
      () => sendResponse({ ok: true }),
      (err) => {
        console.error(err);
        sendResponse({ ok: false, reason: err?.message ?? "Audio playback failed" });
      },
    );
    return true;
  }

  return false;
});

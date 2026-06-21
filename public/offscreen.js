// Listen for audio triggers sent from the main background service worker
chrome.runtime.onMessage.addListener((message) => {
    if (message.target === 'evitrace-audio') {
      const audio = new Audio(message.audioUrl);
      audio.volume = message.volume || 0.5; // Set to a clean 50% volume baseline
      
      audio.play()
        .then(() => {
          console.log("Slack-style reminder chime played successfully.");
        })
        .catch((err) => {
          console.error("Audio playback encountered a hurdle:", err);
        });
    }
  });
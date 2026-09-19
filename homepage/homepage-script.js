document.addEventListener('DOMContentLoaded', () => {
  // 1. Navigation handling for image buttons
  const buttons = document.querySelectorAll('.img-button');
  buttons.forEach(button => {
    button.addEventListener('click', (event) => {
      const targetUrl = button.getAttribute('href');
      if (event.ctrlKey || event.metaKey) return;
      if (targetUrl) {
        event.preventDefault();
        window.location.href = targetUrl;
      }
    });
  });

  // 2. Rotating Ticker Logic
  const messages = [
    "AP® and Advanced Placement® are trademarks registered by the College Board, which is not affiliated with, and does not endorse, this website. All course materials, notes, and study resources are independently created by me.",
    "This website is still in the process of early creation. I haven't finished with setting up the table of contents, let alone the actual notes.",
    "AP Season in 2027 goes from May 3 to May 14, with the late testing being from May 17 to May 21."
  ];

  const disclaimerContainer = document.querySelector('.disclaimer');
  const textElement = document.getElementById('disclaimer-text');

  if (!disclaimerContainer || !textElement) return;

  const SPEED_PX_PER_SEC = 120; // Text scroll speed in pixels per second
  const PAUSE_BETWEEN_MS = 2500; // Pause duration (in ms) after a message exits left

  let currentMsgIndex = 0;

  function playNextMessage() {
    textElement.textContent = messages[currentMsgIndex];

    // Reset transition & position text completely past the right edge
    textElement.style.transition = 'none';
    const containerWidth = disclaimerContainer.offsetWidth;
    const textWidth = textElement.offsetWidth;

    textElement.style.transform = `translateX(${containerWidth}px)`;

    // Force browser repaint before triggering animation
    textElement.offsetHeight;

    // Calculate duration so short and long messages scroll at the exact same speed
    const totalDistance = containerWidth + textWidth;
    const durationSec = totalDistance / SPEED_PX_PER_SEC;

    textElement.style.transition = `transform ${durationSec}s linear`;
    textElement.style.transform = `translateX(-${textWidth}px)`;

    // Wait until text clears the left screen, pause, then start next message
    setTimeout(() => {
      currentMsgIndex = (currentMsgIndex + 1) % messages.length;
      setTimeout(playNextMessage, PAUSE_BETWEEN_MS);
    }, durationSec * 1000);
  }

  playNextMessage();
});

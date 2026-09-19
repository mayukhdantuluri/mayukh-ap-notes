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
    "This website is still in the creation phase. I haven't finished setting up the table of contents for each course, let alone the actual notes that this website is supposed to have.",
    "AP Season this school year goes from 2027-05-03 to 2027-05-14, with the late testing week being 2027-05-17 to 2027-05-21."
  ];

  const disclaimerContainer = document.querySelector('.disclaimer');
  const textElement = document.getElementById('disclaimer-text');

  if (!disclaimerContainer || !textElement) return;

  const SPEED_PX_PER_SEC = 120; // Text scroll speed in pixels per second
  const GAP_DELAY_MS = 3000;    // Wait time after tail end enters right edge before spawning next message

  let currentMsgIndex = 0;

  function playMessage() {
    textElement.textContent = messages[currentMsgIndex];

    // Reset transition & place element completely off-screen to the right
    textElement.style.transition = 'none';
    const containerWidth = disclaimerContainer.offsetWidth;
    const textWidth = textElement.offsetWidth;

    textElement.style.transform = `translateX(${containerWidth}px)`;

    // Force browser reflow
    textElement.offsetHeight;

    // Total distance needed to cross off the left screen entirely
    const totalDistance = containerWidth + textWidth;
    const totalDurationSec = totalDistance / SPEED_PX_PER_SEC;

    // Time taken for the tail end of text to clear the right edge (Distance = containerWidth)
    const entryTimeMs = (containerWidth / SPEED_PX_PER_SEC) * 1000;

    // Trigger full scroll animation across the screen
    textElement.style.transition = `transform ${totalDurationSec}s linear`;
    textElement.style.transform = `translateX(-${textWidth}px)`;

    // Schedule the next message to trigger after text tail enters right edge + GAP_DELAY_MS
    setTimeout(() => {
      currentMsgIndex = (currentMsgIndex + 1) % messages.length;
      playMessage();
    }, entryTimeMs + GAP_DELAY_MS);
  }

  playMessage();
});

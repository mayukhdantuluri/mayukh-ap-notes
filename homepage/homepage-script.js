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

  // 2. Overlapping Rotating Ticker Logic
  const messages = [
    "AP® and Advanced Placement® are trademarks registered by the College Board, which is not affiliated with, and does not endorse, this website. All course materials, notes, and study resources are independently created by me.",
    "This website is still in the creation phase. I haven't finished setting up the table of contents for each course, let alone the actual notes that this website is supposed to have.",
    "AP Season this school year goes from 2027-05-03 to 2027-05-14, with the late testing week being 2027-05-17 to 2027-05-21."
  ];

  const disclaimerBar = document.getElementById('disclaimer-bar');
  if (!disclaimerBar) return;

  const SPEED_PX_PER_SEC = 120; // Scrolling speed (pixels per second)
  const GAP_DELAY_MS = 2000;    // Time delay after the tail of Message 1 enters before Message 2 starts sliding in

  let currentMsgIndex = 0;

  function spawnMessage() {
    // Create an independent text node for the current message
    const msgSpan = document.createElement('span');
    msgSpan.className = 'disclaimer-text';
    msgSpan.textContent = messages[currentMsgIndex];
    disclaimerBar.appendChild(msgSpan);

    const containerWidth = disclaimerBar.offsetWidth;
    const textWidth = msgSpan.offsetWidth;

    // Start position: Off-screen to the right
    msgSpan.style.transition = 'none';
    msgSpan.style.transform = `translateX(${containerWidth}px)`;

    // Force browser reflow to apply starting transform
    msgSpan.offsetHeight;

    // Calculations
    const totalDistance = containerWidth + textWidth;
    const totalDurationSec = totalDistance / SPEED_PX_PER_SEC;
    
    // Time taken for the tail end of the message to clear the right edge
    const tailEntryTimeMs = (containerWidth / SPEED_PX_PER_SEC) * 1000;

    // Animate text all the way across to the left
    msgSpan.style.transition = `transform ${totalDurationSec}s linear`;
    msgSpan.style.transform = `translateX(-${textWidth}px)`;

    // Clean up DOM element after it completely exits left edge
    setTimeout(() => {
      msgSpan.remove();
    }, totalDurationSec * 1000);

    // Trigger next message after the tail end enters + set delay
    setTimeout(() => {
      currentMsgIndex = (currentMsgIndex + 1) % messages.length;
      spawnMessage();
    }, tailEntryTimeMs + GAP_DELAY_MS);
  }

  spawnMessage();
});

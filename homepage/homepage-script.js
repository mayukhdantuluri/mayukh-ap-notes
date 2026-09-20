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
    "AP Season in 2027 will go from May 3 to May 14, with the late session being May 17 to May 21.",
    "If you see a course under a grade that isn't the grade YOU did the course, just know I organized the courses by grade based on when I (Mayukh Dantuluri) did those courses.",
    "This website is still in the creation phase. I haven't finished setting up the table of contents for each course, let alone the actual notes that this website is supposed to have.",
  ];

  const disclaimerBar = document.getElementById('disclaimer-bar');
  if (!disclaimerBar) return;

  const SPEED_PX_PER_SEC = 120; // Scrolling speed
  const GAP_DELAY_MS = 2500;    // Wait time after Message 1 tail enters right edge before Message 2 enters

  let currentMsgIndex = 0;

  function spawnMessage() {
    const msgSpan = document.createElement('span');
    msgSpan.className = 'disclaimer-text';
    msgSpan.textContent = messages[currentMsgIndex];
    disclaimerBar.appendChild(msgSpan);

    const containerWidth = disclaimerBar.offsetWidth;
    const textWidth = msgSpan.offsetWidth;

    // Time required for the text to move its own length into the view
    const textEntryTimeMs = (textWidth / SPEED_PX_PER_SEC) * 1000;

    // Total time required for text to scroll completely across the container
    const totalDistance = containerWidth + textWidth;
    const totalDurationSec = totalDistance / SPEED_PX_PER_SEC;

    // Apply animation via CSS Web Animations API
    const animation = msgSpan.animate(
      [
        { transform: `translateX(${containerWidth}px)` },
        { transform: `translateX(-${textWidth}px)` }
      ],
      {
        duration: totalDurationSec * 1000,
        easing: 'linear',
        fill: 'forwards'
      }
    );

    // Remove element after it completely exits the left side
    animation.onfinish = () => {
      msgSpan.remove();
    };

    // Schedule the next message to start AFTER the tail end of Message 1 enters the right edge + GAP_DELAY_MS
    setTimeout(() => {
      currentMsgIndex = (currentMsgIndex + 1) % messages.length;
      spawnMessage();
    }, textEntryTimeMs + GAP_DELAY_MS);
  }

  spawnMessage();
});

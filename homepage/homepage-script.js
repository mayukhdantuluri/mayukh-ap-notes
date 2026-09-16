// Wait for the DOM to fully load before running scripts
document.addEventListener('DOMContentLoaded', () => {

  // Select all course cards on the homepage
  const courseCards = document.querySelectorAll('.card');

  // Add click handler and interaction effects to each card
  courseCards.forEach(card => {

    // Optional visual click effect
    card.addEventListener('mousedown', () => {
      card.style.transform = 'scale(0.97)';
    });

    card.addEventListener('mouseup', () => {
      card.style.transform = 'scale(1)';
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = 'scale(1)';
    });

    // Navigation logic when a card is clicked
    card.addEventListener('click', (event) => {
      // Get the target page URL from the href attribute
      const destination = card.getAttribute('href');

      if (destination) {
        // If holding Ctrl/Cmd key, allow browser to open in new tab naturally
        if (event.ctrlKey || event.metaKey) {
          return;
        }

        // Prevent default instant jump to allow custom transition or logging
        event.preventDefault();

        // Navigate to the targeted page within the same website
        window.location.href = destination;
      }
    });
  });

  console.log('Homepage navigation script loaded successfully.');
});
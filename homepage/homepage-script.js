document.addEventListener('DOMContentLoaded', () => {
  // Target all course card elements on the homepage
  const cards = document.querySelectorAll('.card');

  cards.forEach(card => {
    // Add visual click feedback (pressed effect)
    card.addEventListener('mousedown', () => {
      card.style.transform = 'scale(0.96)';
    });

    card.addEventListener('mouseup', () => {
      card.style.transform = 'scale(1)';
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = 'scale(1)';
    });

    // Handle click navigation
    card.addEventListener('click', (event) => {
      const destination = card.getAttribute('href');

      // Allow default browser behavior if opening in a new tab (Ctrl/Cmd + Click)
      if (event.ctrlKey || event.metaKey) {
        return;
      }

      if (destination) {
        event.preventDefault();
        window.location.href = destination;
      }
    });
  });

  console.log('Homepage JavaScript initialized successfully.');
});

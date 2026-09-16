document.addEventListener('DOMContentLoaded', () => {
  // Select all interactive course cards
  const cards = document.querySelectorAll('.course-card');

  cards.forEach(card => {
    // Click event for navigation
    card.addEventListener('click', (event) => {
      const destination = card.getAttribute('href');

      // Allow default opening behavior if holding Ctrl/Cmd key
      if (event.ctrlKey || event.metaKey) {
        return;
      }

      if (destination) {
        event.preventDefault();
        window.location.href = destination;
      }
    });
  });
});

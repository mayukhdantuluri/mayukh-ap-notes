document.addEventListener('DOMContentLoaded', () => {
  const unitButtons = document.querySelectorAll('.unit-button');

  unitButtons.forEach(button => {
    button.addEventListener('click', (event) => {
      const destination = button.getAttribute('href');

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

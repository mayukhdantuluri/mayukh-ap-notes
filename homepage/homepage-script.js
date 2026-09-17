document.addEventListener('DOMContentLoaded', () => {
  const buttons = document.querySelectorAll('.img-button');

  buttons.forEach(button => {
    // Navigation handling only (scaling effects managed directly via CSS)
    button.addEventListener('click', (event) => {
      const targetUrl = button.getAttribute('href');

      if (event.ctrlKey || event.metaKey) {
        return;
      }

      if (targetUrl) {
        event.preventDefault();
        window.location.href = targetUrl;
      }
    });
  });
});

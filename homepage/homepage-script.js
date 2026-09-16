document.addEventListener('DOMContentLoaded', () => {
  // Select all image button elements
  const buttons = document.querySelectorAll('.img-button');

  buttons.forEach(button => {
    // Click scaling feedback directly on the image button
    button.addEventListener('mousedown', () => {
      button.style.transform = 'scale(0.96)';
    });

    button.addEventListener('mouseup', () => {
      button.style.transform = 'scale(1)';
    });

    button.addEventListener('mouseleave', () => {
      button.style.transform = 'scale(1)';
    });

    // Handle site navigation
    button.addEventListener('click', (event) => {
      const targetUrl = button.getAttribute('href');

      // Preserve default browser action for opening in new tab (Cmd/Ctrl + click)
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

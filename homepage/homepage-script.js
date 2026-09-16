document.addEventListener('DOMContentLoaded', () => {
  const buttons = document.querySelectorAll('.img-button');

  buttons.forEach(button => {
    button.addEventListener('mousedown', () => {
      button.style.transform = 'scale(0.96)';
    });

    button.addEventListener('mouseup', () => {
      button.style.transform = 'scale(1)';
    });

    button.addEventListener('mouseleave', () => {
      button.style.transform = 'scale(1)';
    });

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

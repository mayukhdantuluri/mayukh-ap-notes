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

  // Creating floating chat button for chatbot
  const chatBtn = document.createElement('button');
  chatBtn.id = 'chat-toggle-btn'
  chatBtn.className = 'chat-toggle-btn';
  chatBtn.innerHTML = '💬Chat';

  //Adding the button
  document.body.appendChild(chatBtn)
});

const isHomeScreen = window.location.pathname.includes('homepage-index.html') || window.location.pathname === '/mayukh-ap-notes/';

if (!isHomeScreen) {
    const chatBtn = document.createElement('button');
    chatBtn.id = 'chat-toggle-btn';
    chatBtn.className = 'chat-toggle-btn';
    chatBtn.innerHTML = '💬Chat!';
    // Adding the button
    document.body.appendChild(chatBtn);
}
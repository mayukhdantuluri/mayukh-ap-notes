const isHomeScreen = window.location.pathname.includes('homepage-index.html') || window.location.pathname === '/mayukh-ap-notes/';

if (!isHomeScreen) { //Prevents chatting on the homescreen
    //Floating chat toggle button
    const chatBtn = document.createElement('button');
    chatBtn.id = 'chat-toggle-btn';
    chatBtn.className = 'chat-toggle-btn';
    chatBtn.innerHTML = '💬Chat!';
    // Adding the button
    document.body.appendChild(chatBtn);

    //Creating the chat window
    const chatWindow = document.createElement('div');
    chatWindow.id = 'chat-window';
    chatWindow.className = 'chat-window hidden'; // Starts hidden
    chatWindow.innerHTML = `
        <div class="chat-header">
            <h3>Your AI Assistant</h3>
            <button id="chat-close-btn">&times;</button>
        </div>
        <div class="chat-body">
            <p class="chat-greeting">How can I help?</p>
        </div>
        <div class="chat-footer">
            <input type="text" id="chat-input" placeholder="Type your question..."/>
            <button id="chat-send-btn">Send</button>
        </div>
    `;
    document.body.appendChild(chatWindow);

    chatBtn.addEventListener('click', () => {
        chatWindow.classList.toggle('hidden');
    });

    const closeBtn = document.getElementById('chat-close-btn');
    closeBtn.addEventListener('click', () => {
        chatWindow.classList.toggle('hidden');
    });

}
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
        <div id="chat-body" class="chat-body">
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

    async function getAIResponse(userMessage) {
  try {
    const response = await fetch("https://ap-notes-backend.rianganesh64.workers.dev/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ message: userMessage })
    });

    const data = await response.json();
    return data.reply; // Assuming worker returns JSON with a 'reply' property
  } catch (error) {
    console.error("Error connecting to AP notes backend:", error);
    return "Sorry, I couldn't reach the study assistant right now.";
  }
}

    const chatInput = document.getElementById('chat-input');
    const chatBody = document.getElementById('chat-body');
    const sendBtn = document.getElementById('chat-send-btn')

async function handleUserMessage() {
        const userMessage = chatInput.value.trim();
        if (!userMessage) return;

        // Append to chat UI
        chatBody.innerHTML += `<p class="user-msg"><strong>You:</strong> ${userMessage}</p>`;
        chatInput.value = '';
        chatBody.scrollTop = chatBody.scrollHeight; // Auto-scroll down

        // Showing loading text
        const loadingId = 'loading-' + Date.now();
        chatBody.innerHTML += `<p id="${loadingId}" class="ai-msg"><em>Thinking...</em></p>`;
        chatBody.scrollTop = chatBody.scrollHeight;

        // Fetch reply from Cloudflare Worker backend
        const aiReply = await getAIResponse(userMessage);

        //Remove loading text and show real AI reply
        document.getElementById(loadingId).remove();
        chatBody.innerHTML += `<p class="ai-msg"><strong>AI:</strong> ${aiReply}</p>`;
        chatBody.scrollTop = chatBody.scrollHeight;
    }

    sendBtn.addEventListener('click', handleUserMessage);

    // Trigger on pressing "Enter" key inside the input field
    chatInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            handleUserMessage();
        }
    });

}
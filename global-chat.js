const isHomeScreen = window.location.pathname.includes('homepage-index.html') || window.location.pathname === '/mayukh-ap-notes/';

if (!isHomeScreen) { //Prevents chatting on the homescreen
    //Floating chat toggle button

    let chatHistory = [];
    const chatBtn = document.createElement('button');
    chatBtn.id = 'chat-toggle-btn';
    chatBtn.className = 'chat-toggle-btn';
    chatBtn.innerHTML = '💬Chat!';
    // Adding the button
    document.body.appendChild(chatBtn);

    // Handling markdown with markdown library
    if (!window.marked) {
    const markedScript = document.createElement('script');
    markedScript.src = "https://cdn.jsdelivr.net/npm/marked/marked.min.js";
    document.head.appendChild(markedScript);}

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

    async function getAIResponse(chatHistory) {
  try {

    //Detects which subject the user is in
    const path = window.location.pathname;
    let currentSubject = "AP Courses"; // default fallback

    // Setting currentSubject parameter based on path name
    if (path.includes('u.s.-history')) {
        currentSubject = "AP United States History (APUSH)"
    }

    else if (path.includes('u.s.-government-and-politics')) {
        currentSubject = "AP United States Government and Politics (AP GOV)"
    }

    else if (path.includes('computer-science-a')) {
        currentSubject = "AP Computer Science A (AP CSA)"
    }

    else if (path.includes('calculus-bc')) {
        currentSubject = "AP Calculus BC (AP CALC BC)"
    }

    // Sending to the backend
    const response = await fetch("https://ap-notes-backend.rianganesh64.workers.dev/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ 
        history: chatHistory, 
        subject: currentSubject})
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

        chatHistory.push({ role: "user", parts: [{ text: userMessage }]});


        // Append to chat UI
        chatBody.innerHTML += `<p class="user-msg"><strong>You:</strong> ${userMessage}</p>`;
        chatInput.value = '';
        chatBody.scrollTop = chatBody.scrollHeight; // Auto-scroll down

        // Showing loading text
        const loadingId = 'loading-' + Date.now();
        chatBody.innerHTML += `<p id="${loadingId}" class="ai-msg"><em>Thinking...</em></p>`;
        chatBody.scrollTop = chatBody.scrollHeight;

        // Fetch reply from Cloudflare Worker backend
        const aiReply = await getAIResponse(chatHistory);
        
        chatHistory.push({ role: "model", parts: [{ text: aiReply }]});
        // Parses plain text markdown symbols into HTML tags
        const parsedReply = window.marked ? marked.parse(aiReply) : aiReply;

        //Remove loading text and show real AI reply
        document.getElementById(loadingId).remove();
        chatBody.innerHTML += `<div class="ai-msg"><strong>AI:</strong> ${parsedReply}</div>`;
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
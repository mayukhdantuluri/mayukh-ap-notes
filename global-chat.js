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


    function loadExternalResource(tag, attributes) {
    return new Promise((resolve, reject) => {
        const element = document.createElement(tag);
        for (let key in attributes) {
            element[key] = attributes[key];
        }
        element.onload = resolve;
        element.onerror = reject;
        document.head.appendChild(element);
    });
}

async function loadChatDependencies() {
    try {
        await loadExternalResource('link', {
            rel: 'stylesheet',
            href: 'https://cdn.jsdelivr.net/npm/katex@0.16.8/dist/katex.min.css' });

        await loadExternalResource('script', { 
            src: 'https://cdn.jsdelivr.net/npm/katex@0.16.8/dist/katex.min.js' 
        });
        
        await loadExternalResource('script', { 
            src: 'https://cdn.jsdelivr.net/npm/katex@0.16.8/dist/contrib/auto-render.min.js' 
        });

        await loadExternalResource('script', { 
            src: 'https://cdn.jsdelivr.net/npm/marked/marked.min.js' 
        });

        console.log("All chat dependencies loaded successfully");
    } catch (error) {
        console.error("Failed to load dependency: ", error);
    }
}

loadChatDependencies();

    //Creating the chat window
    const chatWindow = document.createElement('div');
    chatWindow.id = 'chat-window';
    chatWindow.className = 'chat-window hidden';
    chatWindow.innerHTML = `
        <div class="chat-header">
            <h3>rianAI Assistant</h3>
            <button id="chat-close-btn">&times;</button>
        </div>
        <div id="chat-body" class="chat-body">
            <div class="chat-message ai-message"><strong>AI:</strong> How can I help?</div>
        </div>
        <div class="chat-footer">
            <input type="text" id="chat-input" placeholder="Type something"/>
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
        const modelsToTry = ["gemini-3.1-flash-lite", "gemini-3.1-flash", "gemini-2.1-flash-lite"]; //List of models to try if one previous is overloaded
        const maxRetries  = 2; //2 retries per model before moving on

        for (const model of modelsToTry) {
            for (let attempt = 0; attempt <= maxRetries; attempt++) {

                try {
                    //Detects which subject the user is in
                    const path = window.location.pathname;
                    let currentSubject = "AP Courses"; // default fallback

                    // Setting currentSubject parameter based on path name
                    if (path.includes('u.s.-history')) {
                        currentSubject = "AP United States History (APUSH)"
                    }

                    else if (path.includes('u.s.-government-and-politics')) {
                        currentSubject = "AP United States Government and Politics"
                    }

                    else if (path.includes('computer-science-a')) {
                        currentSubject = "AP Computer Science A"
                    }

                    else if (path.includes('calculus-bc')) {
                        currentSubject = "AP Calculus BC"
                    }

                    // Sending to the backend
                    const response = await fetch("https://ap-notes-backend.rianganesh64.workers.dev/", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({ 
                        history: chatHistory, 
                        subject: currentSubject,
                        preferredModel: model
                    })
                });

                //Exponential backoff

                if (response.status == 503 && attempt < maxRetries) {
                    const delay = Math.power(2, attempt) * 1000; //Tries 1 sec delay, 2 sec delay, 4 sec delay, etc.
                    console.warn(`503 overload on ${model}. Retrying in ${delay}ms (Attempt ${attempt + 1})...`);
                    await new Promise(resolve => setTimeout(resolve, delay));
                    continue;
                }

                if (!response.ok) {
                    throw new Error(`HTTP error. status: ${response.status}`);
                }

                const data = await response.json();
                return data.reply;
                
            } catch (error) {
                console.warn(`Failure with model ${model} on attempt ${attempt + 1}:`, error);

                if (attempt == maxRetries) {
                    console.log(`Switching to new model: ${model}`);
                    break;
                }
            }

            }
        }
    }

    const chatInput = document.getElementById('chat-input');
    const chatBody = document.getElementById('chat-body');
    const sendBtn = document.getElementById('chat-send-btn')

async function handleUserMessage() {
        const userMessage = chatInput.value.trim();
        if (!userMessage) return;

        chatHistory.push({ role: "user", parts: [{ text: userMessage }]});


        // Append to user message to chat ui

        chatBody.innerHTML += `
        <div class="chat-message user-message">
            ${userMessage}
        </div>
        `;
        chatInput.value = '';
        chatBody.scrollTop = chatBody.scrollHeight; // Auto-scroll down

        // Showing loading text
        const loadingDiv = document.createElement('div');
        const loadingId = 'loading-' + Date.now();
        loadingDiv.id = loadingId;
        loadingDiv.className = 'chat-message ai-message'; // Uses the exact same bubble class!
        loadingDiv.innerHTML = `
            <strong>AI:</strong> 
            <span class="typing-dots">
                <span></span>
                <span></span>
                <span></span>
            </span>
        `;
        chatBody.appendChild(loadingDiv);
        chatBody.scrollTop = chatBody.scrollHeight;
        chatBody.scrollTop = chatBody.scrollHeight;

        // Fetch reply from Cloudflare Worker backend
        const aiReply = await getAIResponse(chatHistory);
        
        chatHistory.push({ role: "model", parts: [{ text: aiReply }]});

        // Remove loading text
        document.getElementById(loadingId).remove();

        // Final AI reponse bubble container

        const aiMsgDiv = document.createElement('div');
        aiMsgDiv.className = 'chat-message ai-message';
        aiMsgDiv.innerHTML = '<strong>AI:</strong> <span class="ai-text"></span>';
        chatBody.appendChild(aiMsgDiv);

        const textSpan = aiMsgDiv.querySelector('.ai-text');

        // "Typewritter" animation loop
        let charIndex = 0;
        const typingSpeed = 12; //Controls how long it takes in milliseconds to type, lower is faster
        
        function typeWriter() {
            if (charIndex < aiReply.length) {
                 //Gets currentText   
                const currentText = aiReply.substring(0, charIndex + 1);

                //Parsing markdown live
                textSpan.innerHTML = window.marked ? marked.parse(currentText) : currentText;

                //Checking if $$ and $ LaTeX is closed (number of $ or $$ is divisble by 2)
                const doubleDollarMatches = currentText.match(/\$\$/g);
                const isBlockClosed = !doubleDollarMatches || doubleDollarMatches.length % 2 == 0;

                const textWithoutBlocks = currentText.replace(/\$\$/g, '');
                const singleDollarMatches = currentText.match(/\$/g);
                const isInlineClosed = !singleDollarMatches || singleDollarMatches.length % 2 == 0;

                const isMathClosed = isBlockClosed && isInlineClosed;
                
                //Only render if all LaTeX equations are full closed 
                if (isMathClosed && window.renderMathInElement) {
                    renderMathInElement(textSpan, {
                        delimiters: [
                           {left: '$$', right: '$$', display: true}, //Block equations
                            {left: '$', right: '$', display: false} //Inline equations
                        ]
                    });

                }

                charIndex++;
                chatBody.scrollTop = chatBody.scrollHeight;
                setTimeout(typeWriter, typingSpeed);
            } else {
                //One final clean rendering
                textSpan.innerHTML = window.marked ? marked.parse(aiReply) : aiReply;

                //Rendering the LaTeX
                if (window.renderMathInElement) { //Prevents the code from crashing
                    renderMathInElement(textSpan, {
                        delimiters: [
                           {left: '$$', right: '$$', display: true}, //Block equations
                            {left: '$', right: '$', display: false} //Inline equations
                        ]
                    })
                }
                chatBody.scrollTop = chatBody.scrollHeight;
            }
        }
        //Start animation
        typeWriter();
    }

    sendBtn.addEventListener('click', handleUserMessage);

    // Trigger on pressing "Enter" key inside the input field
    chatInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            handleUserMessage();
        }
    });

}

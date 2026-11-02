const isHomeScreen = window.location.pathname.includes('homepage-index.html') || window.location.pathname === '/mayukh-ap-notes/';

if (!isHomeScreen) { //Prevents chatting on the homescreen
    //Floating chat toggle button

    let chatHistory = [];
    const chatBtn = document.createElement('button');
    chatBtn.id = 'chat-toggle-btn';
    chatBtn.className = 'chat-toggle-btn';
    chatBtn.innerHTML = '💬 Chat';
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

let loadChatDependenciesReady = false;
async function loadChatDependencies() {
    try {
        //Loading CSS first
        await loadExternalResource('link', {
            rel: 'stylesheet',
            href: 'https://cdn.jsdelivr.net/npm/katex@0.16.8/dist/katex.min.css' });

        await loadExternalResource('script', { 
            src: 'https://cdn.jsdelivr.net/npm/katex@0.16.8/dist/katex.min.js' 
        });

         await loadExternalResource('script', { 
            src: 'https://cdn.jsdelivr.net/npm/marked/marked.min.js' 
        });
        
        await loadExternalResource('script', { 
            src: 'https://cdn.jsdelivr.net/npm/katex@0.16.8/dist/contrib/auto-render.min.js' 
        });

       
        loadChatDependencies = true;
        console.log("All chat dependencies loaded successfully");
    } catch (error) {
        console.error("Fled to load dependency: ", error);
    }
}

loadChatDependencies();

    //Creating the chat window
    const chatWindow = document.createElement('div');
    chatWindow.id = 'chat-window';
    chatWindow.className = 'chat-window hidden';
    chatWindow.innerHTML = `
        <div class="chat-header">
            <h3><strong>RianGPT</strong></h3>
            <button id="chat-close-btn">&times;</button>
        </div>
        <div id="chat-body" class="chat-body">
            <div class="chat-message ai-message"><strong>RianGPT:</strong> How can I help?</div>
        </div>
        <div id="image-preview-container" class="preview-hidden">
                <img id = "image-preview-thumb" src="" alt="Upload Preview">
                <button id="remove-image-btn" title="Remove image">x</button>
            </div>
        <footer class="chat-footer">
            <div class="chat-input-row">
                <button id="chat-upload-btn" title="Upload image">🞢</button>
                <input type="file" id="chat-file-input" style="display: none;" accept="image/*">
                <input type="text" id="chat-input" placeholder="Type something...">
                <button id="chat-send-btn">⭡</button>
            </div>
            
            <p class="chat-disclaimer">RianGPT can make mistakes & won't always work properly.</p>
            <!-- <p class="chat-disclaimer">The 'GPT' in RianGPT stands for Ganesh Premium Thought.</p> -->
        </footer>
    `;
    document.body.appendChild(chatWindow);

   chatBtn.addEventListener('click', () => {
    chatWindow.classList.toggle('hidden');
});

    const chatCloseBtn = document.getElementById('chat-close-btn');
    chatCloseBtn.addEventListener('click', () => {
        chatWindow.classList.add('hidden');
    })

const fileInput = document.getElementById('chat-file-input');
const uploadBtn = document.getElementById('chat-upload-btn');


const previewContainer = document.getElementById('image-preview-container');
const previewThumb = document.getElementById('image-preview-thumb');
const removeImageBtn = document.getElementById('remove-image-btn');

uploadBtn.addEventListener('click', () => {
    fileInput.click(); // Opens filepicker window on device
});

let imageData = null;
let imageType = null;

fileInput.addEventListener('change', async (Event) => {
    const file = Event.target.files[0]; // Getting the file selected
    if (!file) return;

    imageType = file.type;
    try {
       //reading full data URL
        const fullDataUrl = await new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => resolve(e.target.result); // preserving full URL
            reader.onerror = (error) => reject(error);
            reader.readAsDataURL(file);
        });


        imageData = fullDataUrl.split(',')[1];


        previewThumb.src = fullDataUrl;
        previewContainer.classList.remove('preview-hidden'); //displaying thumbnail preview

        console.log("Image loaded and preview displayed successfully!", imageType);
    } catch (error) {
        console.error("Error reading file:", error);
    }
});

//Listener for clearing images
removeImageBtn.addEventListener('click', () => {
    imageData = null;
    imageType = null;
    fileInput.value = ''; // Reset file input
    previewThumb.src = '';
    previewContainer.classList.add('preview-hidden');
});

    async function getAIResponse(chatHistory) {
        const modelsToTry = ["gemini-3.5-flash-lite", "gemini-3.6-flash", "gemini-3.8-flash"]; //List of models to try if one previous is overloaded
        const maxRetries  = 2; //2 retries per model before moving on

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

        //Iterating through models loop
        
        for (const model of modelsToTry) {
            console.log(`Attempting with model: ${model}`);

            //Handling number of retries
            for (let attempt = 0; attempt < maxRetries; attempt++) {

                try {
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

                //Handling 503 errors with exponetial backoff and random jitter

                if (response.status == 503) {
                    if (attempt < maxRetries - 1) {
                        const jittery = Math.random() * 1000;
                        const delay = Math.pow(2, attempt) * 1000 + jittery;

                        console.warn(`503 overload error on ${model}. Retrying  in ${Math.round(delay)}ms (Attmept ${attempt+ 1} out of ${maxRetries})`)
                    } else {
                         throw new Error(`Model ${model} exhausted after ${maxRetries} attempts with 503 Service Unavailable.`);
                    }
                }

                // Handling all other failures
                if (!response.ok) {
                    throw new Error(`HTTP error. status: ${response.status}`);
                }

                const data = await response.json();
                return data.reply; // Succesful: breaks and returns data

            } catch (error) {
                console.warn(`Failure with model ${model} on attempt ${attempt + 1}:`, error.message);
                
                // If we've reached max retry, exit innner loop and execute model degradation
                if (attempt === maxRetries - 1) {
                    console.log(`Max retries reached for ${model}. Switching to next model`);
                    break; 
                }
            }                
        }
    }
    //Ultimate fallback
    throw new Error("All fallback Gemini models failed. Try againn later")
}

    const chatInput = document.getElementById('chat-input');
    const chatBody = document.getElementById('chat-body');
    const sendBtn = document.getElementById('chat-send-btn')

async function handleUserMessage() {
        const chatInput = document.getElementById('chat-input'); 
        const userMessage = chatInput.value.trim();
        if (!userMessage && !imageData) return; //If message is completely empty

        const messageParts = [];

        if (userMessage) { //Only text input
            messageParts.push({ text: userMessage });
        }

        if (imageData && imageType) { //Both text and image input
            messageParts.push({
                inlineData: {
                    mimeType: imageType,
                    data: imageData
                }
            });
        }


        chatHistory.push({ 
            role: "user", 
            parts: messageParts 
        });

        //Clearing for next time
        chatInput.value = '';
        imageData = null;
        imageType = null;
        fileInput.value = "";
        previewThumb.src = "";
        previewContainer.classList.add('preview-hidden');
        


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
        loadingDiv.className = 'chat-message ai-message';
        loadingDiv.innerHTML = `
            <strong>RianGPT:</strong> 
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
        aiMsgDiv.innerHTML = '<strong>RianGPT:</strong> <span class="ai-text"></span>';
        chatBody.appendChild(aiMsgDiv);

        const textSpan = aiMsgDiv.querySelector('.ai-text');

        //Create hidden staging canvas to parse everything safely once
        const hiddenStage = document.createElement('div');
        hiddenStage.innerHTML = window.marked ? window.marked.parse(aiReply) : aiReply;
        
        if (window.renderMathInElement) {
            window.renderMathInElement(hiddenStage, {
                delimiters: [
                   {left: '$$', right: '$$', display: true}, 
                   {left: '$', right: '$', display: false} 
                ],
                throwOnError: false
            });
        }

        // Create a token list of letters versus math
        const queue = [];
        
        function processNode(node) {
            // If it's a KaTeX math element, do NOT break it apart. Treat it as a single chunk.
            if (node.nodeType === Node.ELEMENT_NODE && (node.classList.contains('katex') || node.classList.contains('katex-display'))) {
                queue.push({ type: 'node', value: node.cloneNode(true) });
                return;
            }
            
            // If it's a structural element (<p>, <strong>, <em>, <ul>), clone its shell and traverse inside
            if (node.nodeType === Node.ELEMENT_NODE) {
                const shell = node.cloneNode(false);
                queue.push({ type: 'openShell', value: shell });
                
                Array.from(node.childNodes).forEach(child => processNode(child));
                
                queue.push({ type: 'closeShell' });
                return;
            }
            
            // If it's raw text, break it apart into character tokens for typewriter
            if (node.nodeType === Node.TEXT_NODE) {
                const textStr = node.textContent;
                for (let i = 0; i < textStr.length; i++) {
                    queue.push({ type: 'char', value: textStr[i] });
                }
            }
        }

        // Populate custom typewriter execution schedule
        Array.from(hiddenStage.childNodes).forEach(node => processNode(node));

        //Run the targeted execution typewriter loop
        let queueIndex = 0;
        let currentTargetContainer = textSpan;
        const typingSpeed = 7.5; // Speed of typewriter, adjust as needed

        function advanceTypewriter() {
            if (queueIndex < queue.length) {
                const token = queue[queueIndex];

                if (token.type === 'char') {
                    // Type individual text letters character-by-character
                    currentTargetContainer.appendChild(document.createTextNode(token.value));
                } else if (token.type === 'node') {
                    // Drop whole math structures onto the DOM layout as a single token instantly
                    currentTargetContainer.appendChild(token.value);
                } else if (token.type === 'openShell') {
                    // Build up inner semantic nesting wrappers (<p>, <strong>, etc.)
                    currentTargetContainer.appendChild(token.value);
                    currentTargetContainer = token.value; // Move nesting focus context inside shell
                } else if (token.type === 'closeShell') {
                    // Escape nesting wrap layers back up to parent depth
                    currentTargetContainer = currentTargetContainer.parentNode || textSpan;
                }

                queueIndex++;
                chatBody.scrollTop = chatBody.scrollHeight;
                setTimeout(advanceTypewriter, typingSpeed);
            } else {
                chatBody.scrollTop = chatBody.scrollHeight;
            }
        }

        // final typewriter sequence
        advanceTypewriter();


    }

    sendBtn.addEventListener('click', handleUserMessage);

    // Trigger on pressing "Enter" key inside the input field
    chatInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            handleUserMessage();
        }
    });
}
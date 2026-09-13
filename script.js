document.addEventListener("DOMContentLoaded", function () {

    /* =========================================
       SMOOTH SCROLLING
       ========================================= */

    document.querySelectorAll('a[href^="#"]').forEach(function (link) {

        link.addEventListener("click", function (event) {

            const id = link.getAttribute("href");
            const target = document.querySelector(id);

            if (target) {

                event.preventDefault();

                target.scrollIntoView({
                    behavior: "smooth",
                    block: "start"
                });
            }
        });
    });


    /* =========================================
       LEARNING PATH CARD ANIMATION
       ========================================= */

    const cards = document.querySelectorAll(".path-card");

    if ("IntersectionObserver" in window) {

        const observer = new IntersectionObserver(
            function (entries) {

                entries.forEach(function (entry) {

                    if (entry.isIntersecting) {
                        entry.target.classList.add("visible");
                    }
                });
            },
            {
                threshold: 0.12
            }
        );

        cards.forEach(function (card) {
            observer.observe(card);
        });

    } else {

        cards.forEach(function (card) {
            card.classList.add("visible");
        });
    }


    /* =========================================
       BRAINY AI ASSISTANT
       ========================================= */

    const brainyLauncher =
        document.getElementById("brainyLauncher");

    const brainyChat =
        document.getElementById("brainyChat");

    const brainyClose =
        document.getElementById("brainyClose");

    const brainyInput =
        document.getElementById("brainyInput");

    const brainySend =
        document.getElementById("brainySend");

    const brainyMessages =
        document.getElementById("brainyMessages");


    let brainyHistory = [];


    /* -----------------------------------------
       OPEN BRAINY
       ----------------------------------------- */

    if (brainyLauncher && brainyChat) {

        brainyLauncher.addEventListener("click", function () {

            brainyChat.classList.add("open");

            setTimeout(function () {

                if (brainyInput) {
                    brainyInput.focus();
                }

            }, 200);
        });
    }


    /* -----------------------------------------
       CLOSE BRAINY
       ----------------------------------------- */

    if (brainyClose && brainyChat) {

        brainyClose.addEventListener("click", function () {

            brainyChat.classList.remove("open");
        });
    }


    /* -----------------------------------------
       ESCAPE HTML
       ----------------------------------------- */

    function escapeHTML(text) {

        const div = document.createElement("div");

        div.textContent = text;

        return div.innerHTML.replace(/\n/g, "<br>");
    }


    /* -----------------------------------------
       ADD MESSAGE
       ----------------------------------------- */

    function addBrainyMessage(message, type) {

        if (!brainyMessages) return;

        const bubble =
            document.createElement("div");

        if (type === "user") {

            bubble.className =
                "brainy-message brainy-message-user";

            bubble.innerHTML =
                `<p>${escapeHTML(message)}</p>`;

        } else {

            bubble.className =
                "brainy-message brainy-message-ai";

            bubble.innerHTML = `
                <strong>Brainy ✨</strong>
                <p>${escapeHTML(message)}</p>
            `;
        }

        brainyMessages.appendChild(bubble);

        brainyMessages.scrollTop =
            brainyMessages.scrollHeight;
    }


    /* -----------------------------------------
       THINKING MESSAGE
       ----------------------------------------- */

    function showThinking() {

        if (!brainyMessages) return;

        const thinking =
            document.createElement("div");

        thinking.id = "brainyThinking";

        thinking.className =
            "brainy-message brainy-message-ai";

        thinking.innerHTML = `
            <strong>Brainy ✨</strong>
            <p>Thinking...</p>
        `;

        brainyMessages.appendChild(thinking);

        brainyMessages.scrollTop =
            brainyMessages.scrollHeight;
    }


    function removeThinking() {

        const thinking =
            document.getElementById("brainyThinking");

        if (thinking) {
            thinking.remove();
        }
    }


    /* -----------------------------------------
       SEND MESSAGE TO BRAINY
       ----------------------------------------- */

    async function sendBrainyMessage(message) {

        message = message.trim();

        if (!message) return;

        addBrainyMessage(message, "user");

        brainyHistory.push({
            role: "user",
            content: message
        });

        if (brainyInput) {
            brainyInput.value = "";
        }

        if (brainySend) {
            brainySend.disabled = true;
        }

        showThinking();


        try {

            const response = await fetch(
                "http://localhost:3000/api/chat",
                {
                    method: "POST",

                    headers: {
                        "Content-Type": "application/json"
                    },

                    body: JSON.stringify({
                        message: message,
                        history: brainyHistory.slice(-10)
                    })
                }
            );


            const data =
                await response.json();


            removeThinking();


            if (!response.ok) {

                throw new Error(
                    data.error ||
                    "Brainy could not respond."
                );
            }


            const reply =
                data.reply ||
                "I didn't receive a response."


            addBrainyMessage(reply, "ai");
            brainySpeak(reply);


            brainyHistory.push({
                role: "assistant",
                content: reply
            });


        } catch (error) {

            console.error(
                "Brainy connection error:",
                error
            );

            removeThinking();

            addBrainyMessage(
                "I'm having trouble connecting to my brain right now. Please try again in a moment. 💜",
                "ai"
            );

        } finally {

            if (brainySend) {
                brainySend.disabled = false;
            }

            if (brainyInput) {
                brainyInput.focus();
            }
        }
    }


    /* -----------------------------------------
       SEND BUTTON
       ----------------------------------------- */

    if (brainySend) {

        brainySend.addEventListener(
            "click",
            function () {

                if (brainyInput) {

                    sendBrainyMessage(
                        brainyInput.value
                    );
                }
            }
        );
    }


    /* -----------------------------------------
       ENTER KEY
       ----------------------------------------- */

    if (brainyInput) {

        brainyInput.addEventListener(
            "keydown",
            function (event) {

                if (event.key === "Enter") {

                    event.preventDefault();

                    sendBrainyMessage(
                        brainyInput.value
                    );
                }
            }
        );
    }


    /* -----------------------------------------
       QUICK QUESTIONS
       ----------------------------------------- */

    document
        .querySelectorAll(
            ".brainy-quick-buttons button"
        )
        .forEach(function (button) {

            button.addEventListener(
                "click",
                function () {

                    const question =
                        button.dataset.question;

                    if (question) {
                        sendBrainyMessage(question);
                    }
                }
            );
        });

    /* =========================================
       BRAINY VOICE
       ========================================= */

    const brainyMic =
        document.getElementById("brainyMic");

    const brainyVoiceStatus =
        document.getElementById("brainyVoiceStatus");

    const SpeechRecognition =
        window.SpeechRecognition ||
        window.webkitSpeechRecognition;

    let brainyRecognition = null;


    if (SpeechRecognition && brainyMic) {

        brainyRecognition =
            new SpeechRecognition();

        brainyRecognition.lang = "en-US";

        brainyRecognition.continuous = false;

        brainyRecognition.interimResults = false;

        brainyRecognition.maxAlternatives = 1;


        brainyRecognition.onstart = function () {

            brainyMic.classList.add("listening");

            brainyVoiceStatus.textContent =
                "Listening... speak to Brainy 🎤";

            brainyVoiceStatus.classList.add("active");
        };


        brainyRecognition.onresult = function (event) {

            const transcript =
                event.results[0][0].transcript;

            brainyInput.value = transcript;

            brainyVoiceStatus.textContent =
                "Brainy heard you. Thinking... 🧠";

            sendBrainyMessage(transcript);
        };


        brainyRecognition.onerror = function (event) {

            console.error(
                "Brainy voice error:",
                event.error
            );

            brainyVoiceStatus.textContent =
                "I couldn't hear you. Please try again.";
        };


        brainyRecognition.onend = function () {

            brainyMic.classList.remove("listening");

            setTimeout(function () {

                brainyVoiceStatus.textContent =
                    "Tap 🎤 to talk to Brainy";

                brainyVoiceStatus.classList.remove("active");

            }, 1200);
        };


        brainyMic.addEventListener(
            "click",
            function () {

                try {

                    brainyRecognition.start();

                } catch (error) {

                    console.log(
                        "Voice is already listening."
                    );
                }
            }
        );


    } else if (brainyMic) {

        brainyMic.addEventListener(
            "click",
            function () {

                brainyVoiceStatus.textContent =
                    "Voice input isn't supported in this browser. Try Chrome or Edge.";
            }
        );
    }


    /* =========================================
       BRAINY SPEAKS
       ========================================= */

    function brainySpeak(text) {

        if (!("speechSynthesis" in window)) {
            return;
        }

        window.speechSynthesis.cancel();

        const speech =
            new SpeechSynthesisUtterance(text);

        speech.lang = "en-US";

        speech.rate = 0.95;

        speech.pitch = 1.08;

        speech.volume = 1;


        const voices =
            window.speechSynthesis.getVoices();

        const englishVoice =
            voices.find(function (voice) {

                return voice.lang &&
                    voice.lang.toLowerCase()
                        .startsWith("en");
            });

        if (englishVoice) {
            speech.voice = englishVoice;
        }


        window.speechSynthesis.speak(speech);
    }

});
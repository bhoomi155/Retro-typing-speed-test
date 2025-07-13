class TypingSpeedTest {
  constructor() {
    this.currentMode = "classic"
    this.currentScreen = "home"
    this.gameState = {
      isActive: false,
      startTime: null,
      endTime: null,
      currentWordIndex: 0,
      currentCharIndex: 0,
      correctChars: 0,
      totalChars: 0,
      errors: 0,
      wpm: 0,
      accuracy: 100,
    }

    this.settings = {
      textType: "words",
      difficulty: "medium",
      duration: 60,
      customText: "",
    }

    this.textData = {
      words: {
        easy: [
          "the",
          "and",
          "for",
          "are",
          "but",
          "not",
          "you",
          "all",
          "can",
          "had",
          "her",
          "was",
          "one",
          "our",
          "out",
          "day",
          "get",
          "has",
          "him",
          "his",
          "how",
          "man",
          "new",
          "now",
          "old",
          "see",
          "two",
          "way",
          "who",
          "boy",
          "did",
          "its",
          "let",
          "put",
          "say",
          "she",
          "too",
          "use",
        ],
        medium: [
          "about",
          "after",
          "again",
          "before",
          "being",
          "below",
          "between",
          "during",
          "each",
          "few",
          "from",
          "further",
          "here",
          "how",
          "other",
          "own",
          "same",
          "should",
          "those",
          "through",
          "very",
          "where",
          "while",
          "with",
          "without",
          "would",
          "your",
          "yourself",
          "above",
          "across",
          "against",
          "along",
          "among",
          "around",
          "because",
          "behind",
          "beside",
          "beyond",
          "down",
          "inside",
          "into",
          "near",
          "off",
          "onto",
          "outside",
          "over",
          "since",
          "toward",
          "under",
          "until",
          "upon",
          "within",
        ],
        hard: [
          "accommodate",
          "achievement",
          "acknowledge",
          "acquaintance",
          "beginning",
          "believe",
          "business",
          "calendar",
          "cemetery",
          "changeable",
          "colleague",
          "committee",
          "conscience",
          "conscious",
          "definitely",
          "embarrass",
          "environment",
          "equipment",
          "existence",
          "experience",
          "experiment",
          "explanation",
          "fascinate",
          "foreign",
          "government",
          "guarantee",
          "harass",
          "height",
          "hierarchy",
          "humorous",
          "independent",
          "intelligence",
          "interrupt",
          "knowledge",
          "laboratory",
          "leisure",
          "library",
          "license",
          "maintenance",
          "maneuver",
          "medieval",
          "millennium",
          "miniature",
          "mischievous",
          "necessary",
          "neighbor",
          "noticeable",
          "occasion",
          "occurrence",
          "pavilion",
          "permanent",
          "personnel",
          "playwright",
          "possession",
          "privilege",
          "pronunciation",
          "publicly",
          "questionnaire",
          "receive",
          "recommend",
          "restaurant",
          "rhythm",
          "schedule",
          "separate",
          "sergeant",
          "supersede",
          "surprise",
          "temperature",
          "threshold",
          "tomorrow",
          "truly",
          "unnecessary",
          "until",
          "vacuum",
          "weird",
          "whether",
        ],
      },
      quotes: [
        "The only way to do great work is to love what you do.",
        "Innovation distinguishes between a leader and a follower.",
        "Life is what happens to you while you're busy making other plans.",
        "The future belongs to those who believe in the beauty of their dreams.",
        "It is during our darkest moments that we must focus to see the light.",
        "The only impossible journey is the one you never begin.",
        "In the end, we will remember not the words of our enemies, but the silence of our friends.",
        "Success is not final, failure is not fatal: it is the courage to continue that counts.",
        "The way to get started is to quit talking and begin doing.",
        "Don't let yesterday take up too much of today.",
      ],
    }

    this.currentText = []
    this.soundEnabled = true
    this.theme = "dark"

    // AI opponent for duel mode
    this.aiOpponent = {
      wpm: 0,
      progress: 0,
      targetWpm: 45,
      isActive: false,
    }

    // Voice recognition
    this.recognition = null
    this.isListening = false

    // AudioContext for sounds
    this.audioContext = null; // Initialize AudioContext as null

    this.init()
  }

  init() {
    this.setupEventListeners()
    this.setupMatrixRain()
    this.setupVoiceRecognition()
    this.loadSettings()
    this.showScreen("home")
  }

  setupEventListeners() {
    // Navigation
    document.getElementById("home-btn").addEventListener("click", () => this.showScreen("home"))
    document.getElementById("try-again-btn").addEventListener("click", () => this.resetGame())
    document.getElementById("home-results-btn").addEventListener("click", () => this.showScreen("home"))

    // Theme and sound toggles
    document.getElementById("theme-toggle").addEventListener("click", () => this.toggleTheme())
    document.getElementById("sound-toggle").addEventListener("click", () => this.toggleSound())

    // Mode selection
    document.querySelectorAll(".mode-card").forEach((card) => {
      card.addEventListener("click", () => {
        this.initAudioContext(); // FIX: Initialize AudioContext on user gesture
        this.currentMode = card.dataset.mode
        this.startGame()
      })
    })

    // Settings
    document.getElementById("text-type").addEventListener("change", (e) => {
      this.settings.textType = e.target.value
      this.toggleCustomTextArea()
    })
    document.getElementById("difficulty").addEventListener("change", (e) => {
      this.settings.difficulty = e.target.value
    })
    document.getElementById("duration").addEventListener("change", (e) => {
      this.settings.duration = Number.parseInt(e.target.value)
    })

    // Game controls
    document.getElementById("start-btn").addEventListener("click", () => {
      this.initAudioContext(); // FIX: Initialize AudioContext on user gesture
      this.startTyping();
    });
    document.getElementById("reset-btn").addEventListener("click", () => this.resetGame())
    document.getElementById("voice-btn").addEventListener("click", () => this.toggleVoiceInput())

    // Text input
    const textInput = document.getElementById("text-input")
    textInput.addEventListener("input", (e) => this.handleInput(e))
    textInput.addEventListener("keydown", (e) => this.handleKeydown(e))

    // Prevent context menu on game area
    document.getElementById("game-screen").addEventListener("contextmenu", (e) => e.preventDefault())

    // Add this line in setupEventListeners method after other event listeners
    document.getElementById("celebration-close").addEventListener("click", () => this.hideCelebration())
    document.getElementById("celebration-overlay").addEventListener("click", (e) => {
      if (e.target === e.currentTarget) this.hideCelebration()
    })
  }

  setupMatrixRain() {
    const canvas = document.getElementById("matrix-canvas")
    const ctx = canvas.getContext("2d")

    canvas.width = window.innerWidth
    canvas.height = window.innerHeight

    const matrix = "ABCDEFGHIJKLMNOPQRSTUVWXYZ123456789@#$%^&*()*&^%+-/~{[|`]}"
    const matrixArray = matrix.split("")

    const fontSize = 10
    const columns = canvas.width / fontSize

    const drops = []
    for (let x = 0; x < columns; x++) {
      drops[x] = 1
    }

    const draw = () => {
      ctx.fillStyle = "rgba(26, 26, 46, 0.04)" // Adjusted for better visibility with new theme
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      ctx.fillStyle = "#4ecdc4" // Adjusted for better visibility with new theme
      ctx.font = fontSize + "px JetBrains Mono"

      for (let i = 0; i < drops.length; i++) {
        const text = matrixArray[Math.floor(Math.random() * matrixArray.length)]
        ctx.fillText(text, i * fontSize, drops[i] * fontSize)

        if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
          drops[i] = 0
        }
        drops[i]++
      }
    }

    setInterval(draw, 35)

    // Resize handler
    window.addEventListener("resize", () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    })
  }

  setupVoiceRecognition() {
    if ("webkitSpeechRecognition" in window || "SpeechRecognition" in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
      this.recognition = new SpeechRecognition()
      this.recognition.continuous = false; // FIX: Set to false for word-by-word recognition
      this.recognition.interimResults = true;
      this.recognition.lang = "en-US";
      this.recognition.maxAlternatives = 1; // FIX: Set to 1 for simpler matching

      this.recognition.onresult = (event) => {
        let interimTranscript = ""
        let finalTranscript = ""

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript
          if (event.results[i].isFinal) {
            finalTranscript += transcript
          } else {
            interimTranscript += transcript
          }
        }

        // Process final result immediately
        if (finalTranscript.trim()) {
          console.log("Voice input received (final):", finalTranscript);
          this.handleVoiceInput(finalTranscript.trim());
          // Do NOT call stopVoiceInput() here. onend will manage the next startRecognition().
        } else if (interimTranscript.trim()) {
          // Optional: display interim results for user feedback
          // document.querySelector(".voice-status-text").textContent = `Heard: ${interimTranscript}...`;
        }
      }

      this.recognition.onerror = (event) => {
        console.error("Speech recognition error:", event.error)
        this.isListening = false; // FIX: Update listening state
        this.updateVoiceButton(); // FIX: Update button state
        document.querySelector(".voice-status-text").textContent = "Error listening. Click to speak again."; // FIX: User feedback

        // Handle different error types
        switch (event.error) {
          case "no-speech":
            console.log("No speech detected.");
            break
          case "audio-capture":
            alert("Microphone not accessible. Please check your microphone permissions.");
            break
          case "not-allowed":
            alert("Microphone access denied. Please allow microphone access and try again.");
            break
          case "network":
            console.log("Network error, retrying...");
            break
          default:
            console.log("Recognition error:", event.error);
        }
        // Do not auto-restart on error to prevent infinite loops
      }

      this.recognition.onend = () => {
        console.log("Voice recognition ended")
        this.isListening = false
        this.updateVoiceButton()
        document.querySelector(".voice-status-text").textContent = "Click to speak the next word."; // FIX: User feedback

        // Only auto-restart if game is still active and in voice mode AND we expect more input
        if (this.gameState.isActive && this.currentMode === "voice" && this.gameState.currentWordIndex < this.currentText.length) {
          setTimeout(() => {
            if (this.gameState.isActive && this.currentMode === "voice") {
              this.startRecognition(); // Auto-restart for continuous input
            }
          }, 200); // Small delay to prevent race conditions
        }
      }
    } else {
      console.warn("Speech recognition not supported in this browser")
      // Provide user feedback if not supported
      document.getElementById("voice-btn").disabled = true;
      document.getElementById("voice-btn").textContent = "Voice Not Supported";
      document.querySelector(".mode-card[data-mode='voice']").style.opacity = 0.5;
      document.querySelector(".mode-card[data-mode='voice']").style.pointerEvents = "none";
    }
  }

  initAudioContext() {
    if (!this.audioContext) {
      try {
        this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        console.log("AudioContext initialized.");
      } catch (e) {
        console.error("Web Audio API not supported or failed to initialize:", e);
        this.soundEnabled = false; // Disable sounds if AudioContext fails
        document.querySelector(".sound-icon").textContent = "🔇";
        alert("Audio features are not supported or failed to initialize in your browser.");
        return false;
      }
    }
    // Always try to resume if suspended (important for browser autoplay policies)
    if (this.audioContext.state === 'suspended') {
      this.audioContext.resume().then(() => {
        console.log("AudioContext resumed successfully.");
      }).catch(e => {
        console.error("Failed to resume AudioContext:", e);
      });
    }
    return true;
  }

  toggleCustomTextArea() {
    const customTextArea = document.getElementById("custom-text-area")
    customTextArea.style.display = this.settings.textType === "custom" ? "block" : "none"
  }

  toggleTheme() {
    this.theme = this.theme === "dark" ? "light" : "dark"
    document.body.setAttribute("data-theme", this.theme)

    const themeIcon = document.querySelector(".theme-icon")
    themeIcon.textContent = this.theme === "dark" ? "🌙" : "☀️"

    this.saveSettings()
  }

  toggleSound() {
    this.soundEnabled = !this.soundEnabled
    const soundIcon = document.querySelector(".sound-icon")
    soundIcon.textContent = this.soundEnabled ? "🔊" : "🔇"
    this.saveSettings()
  }

  playSound(type) {
    if (!this.soundEnabled) return;
    if (!this.initAudioContext()) return; // Ensure AudioContext is ready and resumed

    try {
      const oscillator = this.audioContext.createOscillator();
      const gainNode = this.audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(this.audioContext.destination);

      switch (type) {
        case "keypress":
          oscillator.type = 'sine'; // Use sine wave for a cleaner sound
          oscillator.frequency.setValueAtTime(880, this.audioContext.currentTime); // Higher frequency
          gainNode.gain.setValueAtTime(0.1, this.audioContext.currentTime); // Slightly louder
          gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 0.06); // Slightly longer decay
          oscillator.start(this.audioContext.currentTime);
          oscillator.stop(this.audioContext.currentTime + 0.06);
          break;
        case "error":
          oscillator.type = 'triangle'; // Use triangle wave for a distinct sound
          oscillator.frequency.setValueAtTime(150, this.audioContext.currentTime); // Lower frequency
          gainNode.gain.setValueAtTime(0.25, this.audioContext.currentTime); // Louder
          gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 0.2); // Longer decay
          oscillator.start(this.audioContext.currentTime);
          oscillator.stop(this.audioContext.currentTime + 0.2);
          break;
        case "complete":
          oscillator.type = 'square'; // Square wave for a clear beep
          oscillator.frequency.setValueAtTime(660, this.audioContext.currentTime); // G5 note
          gainNode.gain.setValueAtTime(0.3, this.audioContext.currentTime); // Louder
          gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 0.5); // Longer duration
          oscillator.start(this.audioContext.currentTime);
          oscillator.stop(this.audioContext.currentTime + 0.5);
          break;
        case "celebration":
          const frequencies = [523, 659, 784, 1046]; // Added one more frequency for a richer chord
          const delays = [0, 0.1, 0.2, 0.3]; // Staggered delays for arpeggio effect
          frequencies.forEach((freq, index) => {
            const osc = this.audioContext.createOscillator();
            const gain = this.audioContext.createGain();
            osc.connect(gain);
            gain.connect(this.audioContext.destination);
            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, this.audioContext.currentTime + delays[index]);
            gain.gain.setValueAtTime(0.2, this.audioContext.currentTime + delays[index]); // Louder
            gain.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + delays[index] + 0.7); // Longer duration
            osc.start(this.audioContext.currentTime + delays[index]);
            osc.stop(this.audioContext.currentTime + delays[index] + 0.7);
          });
          return; // Return early as this case handles multiple oscillators
      }
    } catch (error) {
      console.error("Audio playback error:", error);
      // Consider disabling sounds if errors persist
    }
  }

  showScreen(screenName) {
    document.querySelectorAll(".screen").forEach((screen) => {
      screen.classList.remove("active")
    })

    document.getElementById(`${screenName}-screen`).classList.add("active")
    this.currentScreen = screenName

    // Show/hide home button
    const homeBtn = document.getElementById("home-btn")
    homeBtn.style.display = screenName === "home" ? "none" : "block"

    // Focus management
    if (screenName === "game") {
      setTimeout(() => {
        document.getElementById("text-input").focus()
      }, 100)
    }
  }

  generateText() {
    const { textType, difficulty, customText } = this.settings

    if (textType === "custom" && customText.trim()) {
      return customText.trim().split(" ")
    }

    if (textType === "quotes") {
      const randomQuote = this.textData.quotes[Math.floor(Math.random() * this.textData.quotes.length)]
      return randomQuote.split(" ")
    }

    // Generate random words
    const wordList = this.textData.words[difficulty]
    const wordCount = Math.max(20, Math.floor(this.settings.duration / 2))
    const words = []

    for (let i = 0; i < wordCount; i++) {
      words.push(wordList[Math.floor(Math.random() * wordList.length)])
    }

    return words
  }

  startGame() {
    this.settings.customText = document.getElementById("custom-text").value
    this.currentText = this.generateText()
    this.resetGameState()
    this.showScreen("game")
    this.displayText()
    this.setupGameMode()
  }

 // ... (rest of the code)
  setupGameMode() {
    const voiceBtn = document.getElementById("voice-btn")
    const aiOpponent = document.getElementById("ai-opponent")
    const voiceHelper = document.getElementById("voice-helper");
    const textInput = document.getElementById("text-input");
    // Hide all mode-specific elements first
    voiceBtn.style.display = "none"
    aiOpponent.style.display = "none"
    voiceHelper.style.display = "none";
    textInput.disabled = false; // Ensure text input is enabled by default
    switch (this.currentMode) {
      case "voice":
        voiceBtn.style.display = "block"
        voiceHelper.style.display = "block";
        // REMOVE OR COMMENT OUT THE LINE BELOW TO ENABLE TYPING IN VOICE MODE
        // textInput.disabled = true; // This line disables the text input for voice mode
        this.updateVoiceHelper();
        break
      case "ai-duel":
        aiOpponent.style.display = "block"
        this.setupAiOpponent()
        break
      case "classic":
        // No specific elements to show, just ensure others are hidden and input is enabled
        break;
      }
    }  


  updateVoiceHelper() {
    const currentWordDisplay = document.getElementById("current-word-display")
    if (currentWordDisplay) {
      const currentWord = this.currentText[this.gameState.currentWordIndex]
      currentWordDisplay.textContent = currentWord || ""; // Display current word or empty string
    }
  }

  setupAiOpponent() {
    this.aiOpponent = {
      wpm: 0,
      progress: 0,
      targetWpm: 30 + Math.random() * 40, // Random WPM between 30-70
      isActive: false,
    }

    this.updateAiDisplay()
  }

  resetGameState() {
    this.gameState = {
      isActive: false,
      startTime: null,
      endTime: null,
      currentWordIndex: 0,
      currentCharIndex: 0,
      correctChars: 0,
      totalChars: 0,
      errors: 0,
      wpm: 0,
      accuracy: 100,
    }

    this.aiOpponent.isActive = false
    this.stopVoiceInput(); // FIX: Ensure voice input is stopped on reset

    document.getElementById("text-input").value = ""
    document.getElementById("text-input").classList.remove("error")
    document.getElementById("text-input").disabled = false; // FIX: Ensure text input is enabled on reset
    this.updateStats()
    this.updateProgress()
    this.updateTimeDisplay(this.settings.duration); // FIX: Reset time display
  }

  displayText() {
    const textDisplay = document.getElementById("text-display")
    textDisplay.innerHTML = ""

    this.currentText.forEach((word, index) => {
      const wordSpan = document.createElement("span")
      wordSpan.className = "word"
      wordSpan.textContent = word
      wordSpan.dataset.index = index

      if (index === 0) {
        wordSpan.classList.add("current")
      }

      textDisplay.appendChild(wordSpan)
    })
  }

  startTyping() {
    if (this.gameState.isActive) return

    this.gameState.isActive = true
    this.gameState.startTime = Date.now()

    if (this.currentMode === "ai-duel") {
      this.aiOpponent.isActive = true
      this.startAiTyping()
    }

    // Voice mode starts listening only when the voice button is clicked, not automatically with startTyping
    // if (this.currentMode === "voice") {
    //   this.startVoiceInput()
    // }

    document.getElementById("text-input").focus()
    this.startTimer()
  }

  startTimer() {
    // Clear any existing timer to prevent multiple timers running
    if (this.gameTimer) { // FIX: Use this.gameTimer for consistency
      clearInterval(this.gameTimer);
    }

    this.gameTimer = setInterval(() => { // FIX: Assign to this.gameTimer
      if (!this.gameState.isActive) {
        clearInterval(this.gameTimer)
        this.gameTimer = null; // FIX: Clear timer reference
        return
      }

      const elapsed = Math.floor((Date.now() - this.gameState.startTime) / 1000)
      const remaining = Math.max(0, this.settings.duration - elapsed)

      this.updateTimeDisplay(remaining)

      if (remaining === 0) {
        this.endGame()
        clearInterval(this.gameTimer) // FIX: Clear timer reference
        this.gameTimer = null; // FIX: Clear timer reference
      }
    }, 1000)
  }

  startAiTyping() {
    const aiInterval = setInterval(() => {
      if (!this.aiOpponent.isActive) {
        clearInterval(aiInterval)
        return
      }

      // Simulate AI typing with some randomness
      const baseProgress = (this.aiOpponent.targetWpm / 60) * 5 // chars per second
      const randomFactor = 0.8 + Math.random() * 0.4 // ±20% variation
      const progressIncrement = (baseProgress * randomFactor) / this.currentText.join(" ").length

      this.aiOpponent.progress = Math.min(1, this.aiOpponent.progress + progressIncrement)
      this.aiOpponent.wpm = Math.floor(this.aiOpponent.targetWpm * (0.9 + Math.random() * 0.2))

      this.updateAiDisplay()

      if (this.aiOpponent.progress >= 1) {
        this.aiOpponent.isActive = false
        if (this.gameState.isActive) {
          this.endGame()
        }
        clearInterval(aiInterval)
      }
    }, 200)
  }

  handleInput(event) {
    if (!this.gameState.isActive) {
      this.startTyping()
    }

    const input = event.target.value
    const currentWord = this.currentText[this.gameState.currentWordIndex]

    if (!currentWord) return

    this.playSound("keypress")
    this.processInput(input, currentWord)
    this.updateStats()
    this.updateProgress()
    this.updateWordDisplay() // This method is empty, consider removing or implementing
  }

  handleKeydown(event) {
    if (!this.gameState.isActive) return; // FIX: Ensure game is active

    if (event.key === " ") {
      event.preventDefault()
      const input = document.getElementById("text-input")
      const inputValue = input.value.trim()

      // IMPORTANT: Only process space if the user has typed something for the current word.
      if (inputValue.length > 0) { // FIX: Only process space if input is not empty
        this.handleSpaceKey()
      } else {
        console.log("Space pressed on empty input. Ignoring.");
      }
    } else if (event.key === "Tab") { // FIX: Added Tab key handling
      event.preventDefault();
      this.skipCurrentWord();
    }
  }

  skipCurrentWord() { // FIX: Added skipCurrentWord method
    this.gameState.errors++;
    this.gameState.totalChars += this.currentText[this.gameState.currentWordIndex].length + 1;
    this.markWordIncorrect();
    this.playSound("error");
    this.moveToNextWord();
  }

  handleSpaceKey() {
    const input = document.getElementById("text-input")
    const inputValue = input.value.trim()
    const currentWord = this.currentText[this.gameState.currentWordIndex]

    if (!currentWord) return

    // Check if word is correct
    const isCorrect = inputValue === currentWord

    if (isCorrect) {
      this.gameState.correctChars += currentWord.length + 1 // +1 for space
      this.markWordCorrect()
    } else {
      this.gameState.errors++
      this.markWordIncorrect()
      this.playSound("error")
    }

    this.gameState.totalChars += currentWord.length + 1
    // this.gameState.currentWordIndex++ // This is now handled by moveToNextWord()

    // Clear input and move to next word
    input.value = ""
    input.classList.remove("error")
    input.style.borderColor = "var(--border-color)"; // FIX: Reset border color

    this.moveToNextWord(); // FIX: Call moveToNextWord
  }

  moveToNextWord() { // FIX: Centralized word progression
    this.gameState.currentWordIndex++;

    if (this.gameState.currentWordIndex >= this.currentText.length) {
      this.endGame();
      return;
    }

    this.updateCurrentWord();
    this.updateStats();
    this.updateProgress();

    // Update voice helper if in voice mode
    if (this.currentMode === "voice") {
      this.updateVoiceHelper();
    }
  }

  processInput(input, currentWord) {
    const textInput = document.getElementById("text-input")

    if (input.length > currentWord.length) {
      textInput.classList.add("error")
      textInput.style.borderColor = "var(--error-color)"; // FIX: Add visual feedback
      return
    }

    const isCorrectSoFar = currentWord.startsWith(input)
    textInput.classList.toggle("error", !isCorrectSoFar)
    textInput.style.borderColor = isCorrectSoFar ? "var(--accent-primary)" : "var(--error-color)"; // FIX: Add visual feedback
    if (input === currentWord) { // FIX: Visual feedback for complete correct word
      textInput.style.borderColor = "var(--success-color)";
    }
  }

  markWordCorrect() {
    const wordElement = document.querySelector(`.word[data-index="${this.gameState.currentWordIndex}"]`)
    if (wordElement) {
      wordElement.classList.remove("current", "incorrect")
      wordElement.classList.add("correct")
    }
  }

  markWordIncorrect() {
    const wordElement = document.querySelector(`.word[data-index="${this.gameState.currentWordIndex}"]`)
    if (wordElement) {
      wordElement.classList.remove("current", "correct")
      wordElement.classList.add("incorrect")
    }
  }

  updateCurrentWord() {
    document.querySelectorAll(".word").forEach((word) => {
      word.classList.remove("current")
    })

    const currentWordElement = document.querySelector(`.word[data-index="${this.gameState.currentWordIndex}"]`)
    if (currentWordElement) {
      currentWordElement.classList.add("current")
      currentWordElement.scrollIntoView({ behavior: "smooth", block: "center" }); // FIX: Scroll to current word
    }
  }

  updateWordDisplay() {
    // This method can be expanded for more detailed character-by-character feedback
    // Currently, it's not actively used for character feedback, only for word highlighting.
  }

  calculateWPM() {
    if (!this.gameState.startTime) return 0

    const timeElapsed = (Date.now() - this.gameState.startTime) / 1000 / 60 // minutes
    const wordsTyped = this.gameState.correctChars / 5 // Standard: 5 chars = 1 word

    return Math.round(wordsTyped / timeElapsed) || 0
  }

  calculateAccuracy() {
    if (this.gameState.totalChars === 0) return 100
    return Math.round((this.gameState.correctChars / this.gameState.totalChars) * 100)
  }

  updateStats() {
    this.gameState.wpm = this.calculateWPM()
    this.gameState.accuracy = this.calculateAccuracy()

    document.getElementById("wpm-display").textContent = this.gameState.wpm
    document.getElementById("accuracy-display").textContent = `${this.gameState.accuracy}%`
    document.getElementById("errors-display").textContent = this.gameState.errors
  }

  updateProgress() {
    const progress = (this.gameState.currentWordIndex / this.currentText.length) * 100
    document.getElementById("progress-bar").style.width = `${progress}%`
  }

  updateTimeDisplay(seconds) {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    document.getElementById("time-display").textContent = `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`
  }

  updateAiDisplay() {
    document.getElementById("ai-wpm").textContent = this.aiOpponent.wpm
    document.getElementById("ai-progress").textContent = `${Math.round(this.aiOpponent.progress * 100)}%`
    document.getElementById("ai-progress-fill").style.width = `${this.aiOpponent.progress * 100}%`
  }

  showCelebration(wpm, accuracy) {
    let title, message

    if (wpm >= 80) {
      title = "🚀 LIGHTNING FAST!"
      message = `Incredible! ${wpm} WPM with ${accuracy}% accuracy!`
    } else if (wpm >= 60) {
      title = "⚡ SPEED DEMON!"
      message = `Outstanding! ${wpm} WPM - You're flying!`
    } else if (wpm >= 40) {
      title = "🎯 GREAT JOB!"
      message = `Excellent work! ${wpm} WPM is impressive!`
    } else if (accuracy >= 95) {
      title = "🎯 PRECISION MASTER!"
      message = `Perfect accuracy at ${accuracy}%! Quality over speed!`
    } else {
      return // No celebration for lower scores
    }

    document.getElementById("celebration-title").textContent = title
    document.getElementById("celebration-message").textContent = message

    const overlay = document.getElementById("celebration-overlay")
    const popup = document.getElementById("celebration-popup")

    overlay.classList.add("show")
    popup.classList.add("show")

    this.createConfetti()
    this.playSound("celebration")
  }

  createConfetti() {
    const colors = ["var(--accent-primary)", "var(--accent-tertiary)", "var(--accent-quaternary)"]

    for (let i = 0; i < 50; i++) {
      setTimeout(() => {
        const confetti = document.createElement("div")
        confetti.className = "confetti"
        confetti.style.left = Math.random() * 100 + "vw"
        confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)]
        confetti.style.animationDelay = Math.random() * 2 + "s"

        document.body.appendChild(confetti)

        setTimeout(() => {
          confetti.remove()
        }, 4000)
      }, i * 50)
    }
  }

  hideCelebration() {
    const overlay = document.getElementById("celebration-overlay")
    const popup = document.getElementById("celebration-popup")

    overlay.classList.remove("show")
    popup.classList.remove("show")
  }

  toggleVoiceInput() {
    if (!this.gameState.isActive) { // FIX: Start game if not active
      this.startTyping();
    }

    if (this.isListening) {
      this.stopVoiceInput()
    } else {
      this.startVoiceInput()
    }
  }

  startVoiceInput() {
    if (!this.recognition) {
      alert("Voice recognition is not supported in your browser.")
      return
    }

    // Ensure the voice helper is visible and updated
    document.getElementById("voice-helper").style.display = "block"; // FIX: Ensure voice helper is visible
    this.updateVoiceHelper(); // FIX: Update voice helper display
    document.querySelector(".voice-status-text").textContent = "Requesting microphone access..."; // FIX: User feedback

    // Request microphone permission first
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      navigator.mediaDevices
        .getUserMedia({ audio: true })
        .then(() => {
          console.log("Microphone access granted");
          this.startRecognition();
        })
        .catch((error) => {
          console.error("Microphone access denied:", error);
          alert("Please allow microphone access to use voice input mode.");
          this.isListening = false;
          this.updateVoiceButton();
          document.querySelector(".voice-status-text").textContent = "Microphone access denied.";
        });
    } else {
      // Fallback for older browsers or if getUserMedia is not available
      console.warn("navigator.mediaDevices.getUserMedia not supported. Attempting direct recognition start.");
      this.startRecognition();
    }
  }

  startRecognition() {
    if (!this.recognition) return; // Ensure recognition object exists

    this.initAudioContext(); // FIX: Ensure AudioContext is running for voice input feedback

    try {
      if (this.isListening) {
        this.recognition.stop(); // Stop any ongoing recognition before starting new one
      }
      // Small delay before starting to ensure previous stop completes
      setTimeout(() => {
        if (this.gameState.isActive && this.currentMode === "voice") { // Only start if still in active voice game
          this.recognition.start();
          console.log("Attempting to start voice recognition...");
        }
      }, 100);
    } catch (error) {
      console.error("Voice recognition start error:", error);
      this.isListening = false;
      this.updateVoiceButton();
      document.querySelector(".voice-status-text").textContent = "Failed to start listening. Try again.";
      // Do not auto-restart here to prevent infinite loops on persistent errors
    }
  }

  stopVoiceInput() {
    if (this.recognition && this.isListening) {
      this.recognition.stop();
      console.log("Voice recognition stopped.");
    }
    this.isListening = false;
    this.updateVoiceButton();
    document.querySelector(".voice-status-text").textContent = "Click to speak the next word."; // FIX: User feedback
  }

  updateVoiceButton() {
    const voiceBtn = document.getElementById("voice-btn")
    const voiceStatus = document.querySelector(".voice-status")

    if (this.isListening) {
      voiceBtn.classList.add("listening")
      voiceStatus.textContent = "🎤 Listening... Say the word!" // FIX: More descriptive text
      voiceBtn.style.background = "var(--success-color)"; // FIX: Visual feedback
    } else {
      voiceBtn.classList.remove("listening")
      voiceStatus.textContent = "🎤 Click to speak"
      voiceBtn.style.background = "var(--warning-color)"; // FIX: Visual feedback
    }
  }

  handleVoiceInput(transcript) {
    if (!this.gameState.isActive) return; // FIX: Ensure game is active

    const currentWord = this.currentText[this.gameState.currentWordIndex];
    if (!currentWord) {
      this.stopVoiceInput(); // FIX: Stop listening if no more words
      return;
    }

    console.log(`Comparing spoken: "${transcript}" with target: "${currentWord}"`);

    // Clean and normalize the transcript
    const cleanTranscript = transcript
      .toLowerCase()
      .replace(/[^\w\s]/g, "")
      .trim()
    const targetWord = currentWord.toLowerCase().trim()

    let wordMatched = false;

    // Strategy 1: Exact match
    if (cleanTranscript === targetWord) {
      wordMatched = true;
      console.log("Exact match found!");
    } else {
      // Strategy 2: Check if the spoken phrase contains the target word
      const spokenWords = cleanTranscript.split(/\s+/);
      if (spokenWords.includes(targetWord)) {
        wordMatched = true;
        console.log("Target word found within spoken phrase!");
      } else {
        // Strategy 3: Basic phonetic similarity (if exact/contained match fails)
        for (const spoken of spokenWords) {
          if (this.areSimilar(spoken, targetWord)) {
            wordMatched = true;
            console.log(`Similar word match found: "${spoken}" vs "${targetWord}"`);
            break;
          }
        }
      }
    }

    // Process the result
    if (wordMatched) {
      this.gameState.correctChars += currentWord.length + 1
      this.markWordCorrect()
      this.playSound("keypress") // Use keypress sound for correct voice input
      console.log("Word accepted:", currentWord)
    } else {
      this.gameState.errors++
      this.markWordIncorrect()
      this.playSound("error")
      console.log("Word rejected. Spoken:", cleanTranscript, "Expected:", targetWord)
    }

    this.gameState.totalChars += currentWord.length + 1
    this.moveToNextWord(); // FIX: Use moveToNextWord for consistency

    // After processing a word, if game is still active and in voice mode,
    // the onend event will trigger startRecognition for the next word.
    // No explicit startRecognition call here to avoid race conditions.
  }

  areSimilar(word1, word2) { // FIX: Added areSimilar for phonetic matching
    // Simple similarity check for common speech recognition errors
    if (word1.length === 0 || word2.length === 0) return false

    // Check if words start with same letter and have similar length
    if (word1[0] === word2[0] && Math.abs(word1.length - word2.length) <= 1) {
      return true
    }

    // Check for common substitutions
    const commonSubs = {
      c: "k",
      k: "c",
      f: "ph",
      ph: "f",
      s: "z",
      z: "s",
      i: "y",
      y: "i",
    }

    let similarity = 0
    const maxLen = Math.max(word1.length, word2.length)

    for (let i = 0; i < Math.min(word1.length, word2.length); i++) {
      if (word1[i] === word2[i]) {
        similarity++
      } else if (commonSubs[word1[i]] === word2[i] || commonSubs[word2[i]] === word1[i]) {
        similarity += 0.8
      }
    }

    return similarity / maxLen > 0.7
  }

  endGame() {
    // Clear any running game timer
    if (this.gameTimer) {
      clearInterval(this.gameTimer);
      this.gameTimer = null;
    }

    this.gameState.isActive = false
    this.gameState.endTime = Date.now()
    this.aiOpponent.isActive = false
    this.stopVoiceInput() // Ensure voice input is stopped when game ends

    this.playSound("complete")
    this.showResults()
  }

  showResults() {
    // Calculate final stats
    const finalWPM = this.calculateWPM()
    const finalAccuracy = this.calculateAccuracy()
    const totalTime = this.gameState.endTime - this.gameState.startTime
    const minutes = Math.floor(totalTime / 60000)
    const seconds = Math.floor((totalTime % 60000) / 1000)

    // Update results display
    document.getElementById("final-wpm").textContent = finalWPM
    document.getElementById("final-accuracy").textContent = `${finalAccuracy}%`
    document.getElementById("final-errors").textContent = this.gameState.errors
    document.getElementById("final-time").textContent = `${minutes}:${seconds.toString().padStart(2, "0")}`

    // Handle AI duel results
    if (this.currentMode === "ai-duel") {
      this.showAiDuelResults(finalWPM)
    } else {
      document.getElementById("ai-result").style.display = "none"
    }

    this.showScreen("results")

    // Show celebration for good performance
    setTimeout(() => {
      this.showCelebration(finalWPM, finalAccuracy)
    }, 500)
  }

  showAiDuelResults(playerWPM) {
    const aiResult = document.getElementById("ai-result")
    const duelOutcome = document.getElementById("duel-outcome")
    const duelDetails = document.getElementById("duel-details")

    aiResult.style.display = "block"

    const aiWPM = this.aiOpponent.wpm
    const playerProgress = (this.gameState.currentWordIndex / this.currentText.length) * 100
    const aiProgress = this.aiOpponent.progress * 100

    let outcome, details

    if (playerProgress > aiProgress || (playerProgress === aiProgress && playerWPM > aiWPM)) {
      outcome = "Victory!"
      duelOutcome.className = "duel-outcome win"
      details = `You defeated the AI! Your WPM: ${playerWPM}, AI WPM: ${aiWPM}`
    } else if (playerProgress < aiProgress || (playerProgress === aiProgress && playerWPM < aiWPM)) {
      outcome = "Defeat!"
      duelOutcome.className = "duel-outcome lose"
      details = `The AI won this round. Your WPM: ${playerWPM}, AI WPM: ${aiWPM}`
    } else {
      outcome = "Tie!"
      duelOutcome.className = "duel-outcome tie"
      details = `It's a tie! Both achieved ${playerWPM} WPM`
    }

    duelOutcome.textContent = outcome
    duelDetails.textContent = details
  }

  resetGame() {
    this.resetGameState()
    this.displayText()
    this.setupGameMode()
    document.getElementById("text-input").focus()
  }

  saveSettings() {
    const settings = {
      theme: this.theme,
      soundEnabled: this.soundEnabled,
      textType: this.settings.textType,
      difficulty: this.settings.difficulty,
      duration: this.settings.duration,
    }

    localStorage.setItem("typingTestSettings", JSON.stringify(settings))
  }

  loadSettings() {
    try {
      const saved = localStorage.getItem("typingTestSettings")
      if (saved) {
        const settings = JSON.parse(saved)

        this.theme = settings.theme || "dark"
        this.soundEnabled = settings.soundEnabled !== false
        this.settings.textType = settings.textType || "words"
        this.settings.difficulty = settings.difficulty || "medium"
        this.settings.duration = settings.duration || 60

        // Apply loaded settings
        document.body.setAttribute("data-theme", this.theme)
        document.querySelector(".theme-icon").textContent = this.theme === "dark" ? "🌙" : "☀️"
        document.querySelector(".sound-icon").textContent = this.soundEnabled ? "🔊" : "🔇"

        // Update form elements
        document.getElementById("text-type").value = this.settings.textType
        document.getElementById("difficulty").value = this.settings.difficulty
        document.getElementById("duration").value = this.settings.duration

        this.toggleCustomTextArea()
      }
    } catch (error) {
      console.error("Error loading settings:", error)
    }
  }
}

// Initialize the application when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  new TypingSpeedTest()
})

// Service Worker registration for PWA capabilities (optional)
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("/sw.js")
      .then((registration) => {
        console.log("SW registered: ", registration)
      })
      .catch((registrationError) => {
        console.log("SW registration failed: ", registrationError)
      })
  })
}

// Prevent zoom on double tap for mobile
let lastTouchEnd = 0
document.addEventListener(
  "touchend",
  (event) => {
    const now = new Date().getTime()
    if (now - lastTouchEnd <= 300) {
      event.preventDefault()
    }
    lastTouchEnd = now
  },
  false,
)

// Handle visibility change to pause/resume game
document.addEventListener("visibilitychange", () => {
  if (document.hidden) {
    // Page is hidden, could pause timers here if needed
    console.log("Page hidden")
  } else {
    // Page is visible again
    console.log("Page visible")
  }
})

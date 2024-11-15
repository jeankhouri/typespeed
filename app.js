const textDisplay = document.querySelector(".display-text");
const messageBar = document.getElementById("message-bar");
const textInput = document.querySelector("#input-field");
const restartBtn = document.querySelector(".restart-btn");
const timeRef = document.querySelector(".time-data");
const countOptions = document.querySelector(".option-bar");
const typedWords = document.getElementById("typed-words");
const wordSlider = document.querySelector(".word-slider");
const formWrapper = document.querySelector(".form-wrapper");
const themeToggle = document.querySelector(".theme-toggle");
const colorPicker = document.querySelector(".color-picker");
const statsSection = document.getElementById("stats");

const startTypingTooltip = tippy("#input-field", {
  content: "Press any key to Start!",
  placement: "top", // Position the tooltip above the element
  showOnCreate: false, // Show the tooltip as soon as it is created
  trigger: "manual", // Prevent the tooltip from being hidden
  hideOnClick: false, // Prevent the tooltip from being hidden when clicked
  theme: "custom",
});

// Initialize variables
let quantityOption = 10;
let randomWords = [];
let wordList = [];
let currentWordIndex = 0;
let letterIndex = 0; //keeps track of the position of the active letter

// Timer variables
let [milliseconds, seconds, minutes] = [0, 0, 0];
let totalSeconds = 0;
let timerInterval = null;
let laps = [];

// Stats variables
let wpm = 0;
let spw = 0;
let typpos = 0;
let missingCount = 0;
let extraCount = 0;
let totalChars = 0;

const wordStats = {};

colorPicker.addEventListener("click", (event) => {
  loadColorPicker();
});

function loadColorPicker() {
  const colorTooltip = tippy(".color-picker", {
    content:
      '<input class="color-range" type="range" min="0" max="100" value="75" title="Drag me, baby.">',
    allowHTML: true,
    showOnCreate: false, // Show the tooltip as soon as it is created
    interactive: true,
    placement: "left",
    trigger: "manual",
  });
  colorTooltip[0].show();

  let colorRange = document.querySelector(".color-range");

  colorRange.addEventListener("input", function (e) {
    let hue = ((this.value / 100) * 360).toFixed(0);
    let hsl = "hsl(" + hue + ", 100%, 50%)";
    //var bgHsl = "hsl("+ hue + ", 100%, 95%)"
    colorRange.style.color = hsl;
    document.documentElement.style.setProperty("--hue", hue);
    setCookie("hue", hue, 7);
  });
}

// Function to set a cookie
function setCookie(name, value, days) {
  const d = new Date();
  d.setTime(d.getTime() + days * 24 * 60 * 60 * 1000);
  const expires = "expires=" + d.toUTCString();
  document.cookie = name + "=" + value + ";" + expires + ";path=/";
}

// Function to get a cookie by name
function getCookie(name) {
  const nameEQ = name + "=";
  const ca = document.cookie.split(";");
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) == " ") {
      c = c.substring(1);
    }
    if (c.indexOf(nameEQ) == 0) {
      return c.substring(nameEQ.length, c.length);
    }
  }
  return null;
}

// Apply the stored theme on page load
document.addEventListener("DOMContentLoaded", () => {
  const themeState = getCookie("themeState") || "light";
  const hue = getCookie("hue") || "218";
  document.documentElement.style.setProperty("--hue", hue);
  const themeIcon = document.querySelector(".theme-icon");

  if (themeState === "dark") {
    themeIcon.textContent = "🌙";
    document.body.classList.add("lightMode");
    themeToggle.dataset.state = "dark";
  } else {
    themeIcon.textContent = "☀️";
    document.body.classList.remove("lightMode");
    themeToggle.dataset.state = "light";
  }
});

// Event listener for the theme toggle
themeToggle.addEventListener("click", (event) => {
  const themeIcon = document.querySelector(".theme-icon");

  if (themeToggle.dataset.state == "light") {
    themeIcon.textContent = "🌙";
    document.body.classList.add("lightMode");
    themeToggle.dataset.state = "dark";
    setCookie("themeState", "dark", 7); // Store "dark" theme in cookie for 7 days
  } else if (themeToggle.dataset.state == "dark") {
    themeIcon.textContent = "☀️";
    document.body.classList.remove("lightMode");
    themeToggle.dataset.state = "light";
    setCookie("themeState", "light", 7); // Store "light" theme in cookie for 7 days
  }
});

countOptions.addEventListener("click", (event) => {
  const optionValue = event.target.getAttribute("value");
  setOptions(optionValue);
  document.querySelector(".selected").classList.remove("selected");
  event.target.classList.add("selected");
});

formWrapper.addEventListener("click", (event) => {
  textInput.focus();
});

// Staggered animation script
const items = document.querySelectorAll(".fade-up");
const options = {
  rootMargin: "0px 0px -5%",
  threshold: 0.0,
};

const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry, index) => {
    if (entry.isIntersecting) {
      setTimeout(() => {
        entry.target.style.opacity = 1;
        entry.target.style.transform = "translateY(0)";
      }, index * 100);
    }
  });
}, options);

items.forEach((item) => observer.observe(item));

function setOptions(option) {
  wordList = [];
  resetTimer();
  resetStats();
  resetUI();
  quantityOption = option === "random" ? getRandomNumber() : option;
  fetchWords(quantityOption);
}

function getRandomNumber() {
  return Math.floor(Math.random() * 91) + 10;
}

async function fetchWords(numberOfWords) {
  const url = `https://random-word-api.vercel.app/api?words=${numberOfWords}`;
  const randomWords = ["the", "be", "of", "and", "a", "to", "in", "he", "have", "it", "that", "for", "they", "I", "with", "as", "not", "on", "she", "at", "by", "this", "we", "you", "do", "but", "from", "or", "which", "one", "would", "all", "will", "there", "say", "who", "make", "when", "can", "more", "if", "no", "man", "out", "other", "so", "what", "time", "up", "go", "about", "than", "into", "could", "state", "only", "new", "year", "some", "take", "come", "these", "know", "see", "use", "get", "like", "then", "first", "any", "work", "now", "may", "such", "give", "over", "think", "most", "even", "find", "day", "also", "after", "way", "many", "must", "look", "before", "great", "back", "through", "long", "where", "much", "should", "well", "people", "down", "own", "just", "because", "good", "each", "those", "feel", "seem", "how", "high", "too", "place", "little", "world", "very", "still", "nation", "hand", "old", "life", "tell", "write", "become", "here", "show", "house", "both", "between", "need", "mean", "call", "develop", "under", "last", "right", "move", "thing", "general", "school", "never", "same", "another", "begin", "while", "number", "part", "turn", "real", "leave", "might", "want", "point", "form", "off", "child", "few", "small", "since", "against", "ask", "late", "home", "interest", "large", "person", "end", "open", "public", "follow", "during", "present", "without", "again", "hold", "govern", "around", "possible", "head", "consider", "word", "program", "problem", "however", "lead", "system", "set", "order", "eye", "plan", "run", "keep", "face", "fact", "group", "play", "stand", "increase", "early", "course", "change", "help", "line"];
  const timeout = 3000;
  const controller = new AbortController();
  const { signal } = controller;
  const fetchPromise = fetch(url, { signal });
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  // Display a loading message
  messageBar.innerHTML = "<span>Loading words...</span>";
  startTypingTooltip[0].hide();

  try {
    const response = await fetchPromise;
    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`Error: ${response.status} ${response.statusText}`);
    }
    wordList = await response.json();
    setRound();
    return;
  } catch (error) {
    if (error.name === "AbortError") {
      console.warn("Request timed out. Fetching local file...");
    } else {
      console.error("Fetch error:", error);
    }
  }
  // If there's an error, use local data as a fallback
  for (let i = wordList.length; i < numberOfWords; i = wordList.length) {
    const randomWord =
      randomWords[Math.floor(Math.random() * randomWords.length)];
    if (
      wordList[wordList.length - 1] !== randomWord ||
      wordList[wordList.length - 1] === undefined
    ) {
      wordList.push(randomWord);
    }
  }
  setRound();
  return;
}

function setRound() {
  messageBar.innerHTML = "<span>Number of Words</span>";
  displayWords(wordList);
  setTimeout(() => {
    startTypingTooltip[0].show();
  }, 1200);
  scrollToElement(textInput, "center");
  totalChars = wordList.reduce((acc, word) => acc + word.length, 0);
  displayStats();
  textInput.focus();
}

tippy(".random", {
  content: "Random Number of Words",
  touch: false,
});

tippy(".theme-toggle", {
  content: "Toggle Dark Mode",
  touch: false,
});

// ----------------------------------------------------- Word display & verification Logic ----------------------------------------------------- //

// Event listeners
document.addEventListener("keydown", (e) => {
  startTypingTooltip[0].hide();
  textInput.focus();
  if (currentWordIndex < wordList.length) verifyLetters(e.key);
  if (currentWordIndex === 0 && textInput.textContent === "") startTimer(); //starts timer only when current word index is 0 and field is empty
  if (e.key === " " || e.key === "Enter") {
    e.preventDefault();
    verifyWord();
    textInput.textContent = "";
  }
});

function displayWords(list) {
  const createWordHTML = (word, index) =>
    `<span index="${index}" class="word">${word}</span>`;
  const wordHTML = list.map(createWordHTML).join("");
  textDisplay.innerHTML = wordHTML;
  wordSlider.innerHTML = wordHTML;

  textDisplay.classList.add("highlight");
  setTimeout(() => {
    textDisplay.classList.remove("highlight");
    textDisplay.firstChild.classList.add("highlight");
  }, 300);
}

function verifyLetters(key) {
  const arrayOfLetters = wordList[currentWordIndex].split("");
  const allowedKeys = /^[a-z'.,;]$/;
  let isCorrect;

  if (key !== "Backspace" && allowedKeys.test(key)) {
    let inputText = (textInput.textContent + key).trim(); //Append key and trim
    let arrayOfTyppedLetters = [...inputText];

    if (inputText === arrayOfLetters.slice(0, letterIndex + 1).join("")) {
      wordSlider.firstChild.textContent = arrayOfLetters
        .slice(letterIndex + 1)
        .join("");

      if (arrayOfTyppedLetters.length !== arrayOfLetters.length) {
        letterIndex++;
        isCorrect = true;
      }

      textInput.classList.remove("mistake");
    } else {
      textInput.classList.add("mistake");
      isCorrect = false;
    }
  } else if (key === "Backspace" && textInput.textContent) {
    let inputTextAfterDelete = textInput.textContent.slice(0, -1);

    if (!isCorrect) {
      textInput.classList.add("mistake");
      letterIndex = inputTextAfterDelete.length;

      if (
        inputTextAfterDelete !== arrayOfLetters.slice(0, letterIndex).join("")
      ) {
        textInput.classList.add("mistake");
      } else {
        wordSlider.firstChild.textContent = arrayOfLetters
          .slice(letterIndex)
          .join("");
        isCorrect = true;
        textInput.classList.remove("mistake");
      }
    } else {
      wordSlider.firstChild.textContent = arrayOfLetters
        .slice(letterIndex)
        .join("");
    }
  }
}

function verifyWord() {
  const input = textInput.textContent.trim(); // Trim whitespace

  if (input === "") return; // Early exit if input is empty
  if (input === wordList[currentWordIndex]) {
    styleWord("correct");
    typedWords.innerHTML += `<span class="typpedWord">${wordList[currentWordIndex]}</span>`;
    wordSlider.firstChild.remove();
  } else {
    typedWords.innerHTML += `<span class="incorrect">${input}</span>`;
    styleWord("incorrect");
    countTypos(input, wordList[currentWordIndex]);
    wordSlider.firstChild.remove();
  }

  incrementWord();
  lap();
}

// ----------------------------------------------------- Stats Logic and Actions ----------------------------------------------------- //

function countTypos(input, output) {
  const arr1 = [...input];
  const arr2 = [...output];

  if (arr1.length === arr2.length) {
    arr1.forEach((char, i) => {
      if (char !== arr2[i]) {
        typpos++;
        highlightText(".typpos", "spark");
      }
    });
  } else if (arr1.length < arr2.length) {
    missingCount += arr2.length - arr1.length;
    highlightText(".missing-data", "spark");
  } else {
    extraCount += arr1.length - arr2.length;
    highlightText(".extra-data", "spark");
  }
}

function highlightText(target, style) {
  const item = document.querySelector(target);
  item.classList.add(style);
  setTimeout(() => item.classList.remove(style), 300);
}

function glowStats() {
  const stats = document.querySelectorAll(".stat");
  stats.forEach(function (stat) {
    stat.classList.add("pulse");
  });

  // Remove the class after 2 seconds
  setTimeout(function () {
    stats.forEach(function (stat) {
      stat.classList.remove("pulse");
    });
  }, 2000); // 2000 milliseconds = 2 seconds
}

function incrementWord() {
  if (currentWordIndex < wordList.length - 1) {
    currentWordIndex++;
    typedWords.innerHTML += `<span class="space"></span>`;
    styleWord("highlight");
    let highlightedWord = document.querySelector(".highlight");
    scrollToElement(highlightedWord, "center");
  } else {
    textInput.contentEditable = false;
    textInput.style.opacity = "0";
    pauseTimer();
    calculateStats();
    displayStats();
    scrollToElement(statsSection, "start");
    glowStats();
  }
  letterIndex = 0;
  textInput.value = "";
  displayStats();
}

function styleWord(className) {
  textDisplay.children[currentWordIndex].classList.remove("highlight");
  textDisplay.children[currentWordIndex].classList.add(className);
  wordSlider.firstChild.classList.add("highlight");
}

function restart() {
  resetStats();
  resetUI();
  displayWords(wordList);
}

function newRound() {
  wordList = [];
  resetStats();
  resetUI();
  setOptions(quantityOption);
}

function resetStats() {
  resetTimer();
  currentWordIndex = 0;
  typpos = 0;
  missingCount = 0;
  extraCount = 0;
  wpm = 0;
  spw = 0;
  laps = [];
  letterIndex = 0;
  displayStats();
}

function resetUI() {
  textInput.contentEditable = true;
  textInput.textContent = "";
  textInput.className = "";
  textInput.style.opacity = "1";
  typedWords.innerHTML = "";
  textInput.focus();
  startTypingTooltip[0].show();
}

function scrollToElement(element, position) {
  element.scrollIntoView({
    behavior: "smooth", // Smooth scrolling
    block: position, // Center the element vertically in the viewport
    inline: "center", // Center the element horizontally in the viewport (useful for inline elements)
  });
}

function startApp() {
  document.getElementById("intro").style.display = "none";
  document.getElementById("dashboard").style.display = "block";
  document.getElementById("stats").style.display = "grid";
  fetchWords(quantityOption);
  textInput.focus();
}

// Stats functions
function calculateStats() {
  wpm = (wordList.length / totalSeconds) * 60; //words per minute
  spw = totalSeconds / wordList.length; //seconds per word
}

function displayStats() {
  document.querySelector(".wpm-data").textContent = wpm.toFixed(2);
  document.querySelector(".spw-data").textContent = spw.toFixed(2);
  document.querySelector(".typpos").textContent = typpos;
  document.querySelector(
    ".missing-data"
  ).textContent = `${missingCount}/${totalChars}`;
  document.querySelector(
    ".extra-data"
  ).textContent = `${extraCount}/${totalChars}`;
}

// Timer functions
function startTimer() {
  if (timerInterval !== null) clearInterval(timerInterval);
  timerInterval = setInterval(displayTimer, 10);
}

function pauseTimer() {
  clearInterval(timerInterval);
}

function lap() {
  laps.push(totalSeconds);
}

function resetTimer() {
  clearInterval(timerInterval);
  [milliseconds, seconds, minutes] = [0, 0, 0];
  totalSeconds = 0;
  timeRef.textContent = "00:00:000";
}

function displayTimer() {
  milliseconds += 10;
  if (milliseconds === 1000) {
    milliseconds = 0;
    seconds++;
    totalSeconds++;
    if (seconds === 60) {
      seconds = 0;
      minutes++;
    }
  }
  timeRef.textContent = `${minutes.toString().padStart(2, "0")}:${seconds
    .toString()
    .padStart(2, "0")}:${milliseconds.toString().padStart(3, "0")}`;
}

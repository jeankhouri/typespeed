// DOM Elements
const textDisplay = document.querySelector(".display-text");
const textInput = document.querySelector("#input-field");
const restartBtn = document.querySelector(".restart-btn");
const timeRef = document.querySelector(".time-data");
const countOptions = document.querySelector('.leftbar');
const typedWords = document.getElementById('typed-words')
const wordSlider = document.querySelector('.word-slider');
const formWrapper = document.querySelector('.form-wrapper');

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

// Event listeners
countOptions.addEventListener("click", event => {
    const optionValue = event.target.getAttribute('value');
    setOptions(optionValue);
    document.querySelector('.selected').classList.remove('selected');
    event.target.classList.add('selected');
});

formWrapper.addEventListener("click", event => {
    textInput.focus();
});

// Staggered animation script	
const items = document.querySelectorAll('.fade-up');
const options = {
    rootMargin: '0px 0px -5%',
    threshold: 0.0
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry, index) => {
        if (entry.isIntersecting) {
            setTimeout(() => {
                entry.target.style.opacity = 1;
                entry.target.style.transform = 'translateY(0)';
            }, index * 150);
        }
    });
}, options);

items.forEach(item => observer.observe(item));

function startApp() {
    document.getElementById("intro").style.display = 'none';
    document.getElementById("dashboard").style.display = 'block';
    document.getElementById("stats").style.display = 'grid';
}

function setOptions(option) {
    wordList = [];
    resetTimer();
    resetStats();
    resetUI();
    quantityOption = option === 'random' ? getRandomNumber() : option;
    fetchWords(quantityOption);
}

function getRandomNumber() {
    return Math.floor(Math.random() * 91) + 10;
}

async function fetchWords(numberOfWords) {
    // Display a loading message
    textDisplay.innerHTML = '<p>Loading words...</p>';
    const url = `https://random-word-api.vercel.app/api?words=${numberOfWords}`;

    try {
        const response = await fetch(url);
        
        if (!response.ok) {
            throw new Error('Failed to fetch data from the API');
        }

        wordList = await response.json();
        
    } catch (error) {
        console.error('Error fetching data from API:', error.message);
        
        // If there's an error, use local data as a fallback
        const randomWords = ["the", "be", "of", "and", "a", "to", "in", "he", "have", "it", "that", "for", "they", "I", "with", "as", "not", "on", "she", "at", "by", "this", "we", "you", "do", "but", "from", "or", "which", "one", "would", "all", "will", "there", "say", "who", "make", "when", "can", "more", "if", "no", "man", "out", "other", "so", "what", "time", "up", "go", "about", "than", "into", "could", "state", "only", "new", "year", "some", "take", "come", "these", "know", "see", "use", "get", "like", "then", "first", "any", "work", "now", "may", "such", "give", "over", "think", "most", "even", "find", "day", "also", "after", "way", "many", "must", "look", "before", "great", "back", "through", "long", "where", "much", "should", "well", "people", "down", "own", "just", "because", "good", "each", "those", "feel", "seem", "how", "high", "too", "place", "little", "world", "very", "still", "nation", "hand", "old", "life", "tell", "write", "become", "here", "show", "house", "both", "between", "need", "mean", "call", "develop", "under", "last", "right", "move", "thing", "general", "school", "never", "same", "another", "begin", "while", "number", "part", "turn", "real", "leave", "might", "want", "point", "form", "off", "child", "few", "small", "since", "against", "ask", "late", "home", "interest", "large", "person", "end", "open", "public", "follow", "during", "present", "without", "again", "hold", "govern", "around", "possible", "head", "consider", "word", "program", "problem", "however", "lead", "system", "set", "order", "eye", "plan", "run", "keep", "face", "fact", "group", "play", "stand", "increase", "early", "course", "change", "help", "line"]
        
        while (wordList.length < numberOfWords) {
            const randomWord = randomWords[Math.floor(Math.random() * randomWords.length)];
            if (wordList[wordList.length - 1] !== randomWord || wordList[wordList.length - 1] === undefined) {
                wordList.push(randomWord);
            }
        }

    } finally {
        // Remove the loading message and display the words
        textDisplay.innerHTML = '';  // Clear the loading message
        displayWords(wordList);
        totalChars = wordList.reduce((acc, word) => acc + word.length, 0);
        resetTimer();
        displayStats();
    }
}

fetchWords(quantityOption);

tippy('.form-wrapper', {
    content: 'Start Typing!',
  });

// ----------------------------------------------------- Word display & verification Logic ----------------------------------------------------- //

// Event listeners
textInput.addEventListener('keydown', e => {
    if (currentWordIndex < wordList.length) verifyLetters(e.key);
    if (currentWordIndex === 0 && textInput.textContent === '') startTimer(); //starts timer only when current word index is 0 and field is empty
    if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        verifyWord();
        textInput.textContent = '';
    }
});

function displayWords(list) {
    textDisplay.innerHTML = list.map((word, index) => `<span index="${index}">${word}</span>`).join('');
    wordSlider.innerHTML = list.map((word, index) => `<span index="${index}" class="word">${word}</span>`).join('');
    textDisplay.children[0].classList.add('highlight');
    wordSlider.children[0].classList.add('highlight');
    highlightText('.display-text', 'glow');
}

function verifyLetters(key) {
    const arrayOfLetters = wordList[currentWordIndex].split('');
    const allowedKeys = /^[a-z'.,;]$/;
    let isCorrect;
    if (key !== 'Backspace' && allowedKeys.test(key)) {
        let inputText = (textInput.textContent + key).trim(); //Append key and trim
        let arrayOfTyppedLetters = [...inputText];

        if (inputText === arrayOfLetters.slice(0, letterIndex + 1).join('')) {
            wordSlider.firstChild.textContent = arrayOfLetters.slice(letterIndex + 1).join('');

            if (arrayOfTyppedLetters.length !== arrayOfLetters.length) {
                letterIndex++;
                isCorrect = true;
            }

            textInput.classList.remove('mistake');
        } else {
            textInput.classList.add('mistake');
            isCorrect = false;
        }

    } else if (key === 'Backspace' && textInput.textContent) {
        let inputTextAfterDelete = textInput.textContent.slice(0, -1);

        if (!isCorrect) {
            textInput.classList.add('mistake');
            letterIndex = inputTextAfterDelete.length

            if (inputTextAfterDelete !== arrayOfLetters.slice(0, letterIndex).join('')) {
                textInput.classList.add('mistake');
            } else {
                wordSlider.firstChild.textContent = arrayOfLetters.slice(letterIndex).join('');
                isCorrect = true
                textInput.classList.remove('mistake');
            }
        } else {
            wordSlider.firstChild.textContent = arrayOfLetters.slice(letterIndex).join('');
        }
    }
}

function verifyWord() {
    const input = textInput.textContent.trim();  // Trim whitespace

    if (input === '') return;  // Early exit if input is empty
    if (input === wordList[currentWordIndex]) {
        styleWord('correct');
        typedWords.innerHTML += `<span class="typpedWord">${wordList[currentWordIndex]}</span>`;
        wordSlider.firstChild.remove();

    } else {
        typedWords.innerHTML += `<span class="incorrect">${input}</span>`;
        styleWord('incorrect');
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
                highlightText('.typpos', 'spark');
            }
        });
    } else if (arr1.length < arr2.length) {
        missingCount += arr2.length - arr1.length;
        highlightText('.missing-data', 'spark');
    } else {
        extraCount += arr1.length - arr2.length;
        highlightText('.extra-data', 'spark');
    }
}

function highlightText(target, style) {
    const item = document.querySelector(target);
    item.classList.add(style);
    setTimeout(() => item.classList.remove(style), 300);
}



function incrementWord() {
    if (currentWordIndex < wordList.length - 1) {
        currentWordIndex++;
        typedWords.innerHTML += `<span class="space"></span>`;
        styleWord('highlight')
    } else {
        textInput.disabled = true;
        textInput.style.opacity = "0";
        pauseTimer();
        calcWPM();
        calcSPW();
    }
    letterIndex = 0;
    textInput.value = '';
    displayStats();
}

function styleWord(className) {
    textDisplay.children[currentWordIndex].classList.remove('highlight');
    textDisplay.children[currentWordIndex].classList.add(className);
    wordSlider.firstChild.classList.add('highlight');
}

function restart() {
    resetTimer();
    resetStats();
    resetUI();
    displayWords(wordList);
}

function newRound() {
    wordList = [];
    resetTimer();
    resetStats();
    resetUI();
    setOptions(quantityOption);
}

function resetStats() {
    currentWordIndex = 0;
    typpos = 0;
    missingCount = 0;
    extraCount = 0;
    wpm = 0;
    spw = 0;
    laps = [];
    letterIndex = 0;
    Object.keys(wordStats).forEach(key => delete wordStats[key]);
    displayStats();
}

function resetUI() {
    textInput.textContent = '';
    textInput.className = '';
    //textInput.style.opacity = "1";
    typedWords.innerHTML = '';
    textInput.focus();
}

function startApp() {
    document.getElementById("intro").style.display = 'none';
    document.getElementById("dashboard").style.display = 'block';
    document.getElementById("stats").style.display = 'grid';
}

// Stats functions
function calcWPM() {
    wpm = (wordList.length / totalSeconds) * 60;
}

function calcSPW() {
    spw = totalSeconds / wordList.length;
}

function displayStats() {
    document.querySelector('.wpm-data').textContent = wpm.toFixed(2);
    document.querySelector('.spw-data').textContent = spw.toFixed(2);
    document.querySelector('.typpos').textContent = typpos;
    document.querySelector('.missing-data').textContent = `${missingCount}/${totalChars}`;
    document.querySelector('.extra-data').textContent = `${extraCount}/${totalChars}`;
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
    timeRef.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}:${milliseconds.toString().padStart(3, '0')}`;
}
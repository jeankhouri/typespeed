const api = "https://random-word-api.herokuapp.com/";

// DOM Elements
const textDisplay = document.querySelector(".display-text");
const textInput = document.querySelector("#input-field");
const restartBtn = document.querySelector(".restart-btn");
const timeRef = document.querySelector(".time-data");
const countOptions = document.querySelector('.leftbar');

// Initialize variables
let quantityOption = 10;
let randomWords = [];
let wordList = [];
let currentWord = 0;

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

class Word {
    constructor(typpedWord, time, typpos, missingChars, extraChars) {
        this.typpedWord = typpedWord;
        this.time = time;
        this.typpos = typpos;
        this.missingChars = missingChars;
        this.extraChars = extraChars;
    }
}

// Event listeners
countOptions.addEventListener("click", event => {
    const optionValue = event.target.getAttribute('value');
    setOptions(optionValue);
    document.querySelector('.selected').classList.remove('selected');
    event.target.classList.add('selected');
});

textInput.addEventListener('keydown', e => {
    if (currentWord < wordList.length) styleInput(e);
    if (currentWord === 0 && textInput.value === '') startTimer();
    if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        verifyWord();
    }
});

function setOptions(option) {
    wordList = [];
    quantityOption = option === 'random' ? getRandomNumber() : option;
    fetchWords(quantityOption);
}

function getRandomNumber() {
    return Math.floor(Math.random() * 91) + 10;
}

async function fetchWords(numberOfWords) {
    // Display a loading message
    textDisplay.innerHTML = '<p>Loading words...</p>';

    try {
        const response = await fetch(api + `word?number=${numberOfWords}`);
        
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


function displayWords(list) {
    textDisplay.innerHTML = list.map((word, index) => `<span index="${index}">${word}</span>`).join('');
    textDisplay.children[0].classList.add('highlight');
    highlightText('.display-text', 'glow');
}

function verifyWord() {
    const input = textInput.value.trim();  // Trim whitespace for better accuracy
    
    if (input === '') return;  // Early exit if input is empty
    
    const isCorrect = input === wordList[currentWord];

    isCorrect ? styleWord('correct') : styleWord('incorrect');
    
    if (!isCorrect) {
        countTypos(input, wordList[currentWord]);
    }
    
    incrementWord();
    lap();
}


function styleInput(e) {
    const allowedKeys = /^[a-z'.,;]$/;
    const inputLetters = textInput.value + e.key;
    const currentWordLetters = wordList[currentWord].slice(0, inputLetters.length);

    if (allowedKeys.test(e.key)) {
        textInput.className = inputLetters === currentWordLetters ? '' : 'mistake';
    } else if (e.key === 'Backspace') {
        textInput.className = inputLetters.slice(0, -1) === currentWordLetters ? '' : 'mistake';
    } else if (e.key === ' ') {
        textInput.className = '';
    }
}

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

function styleWord(className) {
    textDisplay.children[currentWord].classList.add(className);
    textDisplay.children[currentWord].classList.remove('highlight');
    textInput.value = '';
}

function incrementWord() {
    if (currentWord < wordList.length - 1) {
        currentWord++;
        textDisplay.children[currentWord].classList.add('highlight');
    } else {
        textInput.disabled = true;
        textInput.style.opacity = "0";
        pauseTimer();
        calcWPM();
        calcSPW();
    }
    displayStats();
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

function resetUI() {
    textInput.value = '';
    textInput.className = '';
    textInput.disabled = false;
    textInput.style.opacity = "1";
}

function startApp() {
    document.getElementById("intro").style.display = 'none';
    document.getElementById("dashboard").style.display = 'block';
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

function resetStats() {
    currentWord = 0;
    typpos = 0;
    missingCount = 0;
    extraCount = 0;
    wpm = 0;
    spw = 0;
    laps = [];
    Object.keys(wordStats).forEach(key => delete wordStats[key]);
    displayStats();
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

fetchWords(quantityOption);

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

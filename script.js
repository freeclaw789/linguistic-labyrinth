const levels = [
    { target: 'happy', hint: 'Find a synonym for "happy" to advance.' },
    { target: 'fast', hint: 'The path is blocked by speed. Find a synonym for "fast".' },
    { target: 'cold', hint: 'It is freezing here. Find a synonym for "cold".' },
    { target: 'brave', hint: 'Only the courageous may pass. Find a synonym for "brave".' },
    { target: 'silent', hint: 'The Labyrinth demands quiet. Find a synonym for "silent".' }
];

let currentLevelIndex = 0;

const board = document.getElementById('board');
const levelDisplay = document.getElementById('current-level');
const wordInput = document.getElementById('word-input');
const submitBtn = document.getElementById('submit-btn');
const message = document.getElementById('message');

function initLevel() {
    if (currentLevelIndex >= levels.length) {
        board.innerText = '✨';
        message.innerText = 'You have escaped the Linguistic Labyrinth!';
        wordInput.style.display = 'none';
        submitBtn.style.display = 'none';
        return;
    }

    const level = levels[currentLevelIndex];
    board.innerText = level.target;
    levelDisplay.innerText = currentLevelIndex + 1;
    message.innerText = level.hint;
    wordInput.value = '';
}

async function checkSynonym(word, target) {
    if (word.toLowerCase() === target.toLowerCase()) return false; // Prevent cheating by typing the word itself
    try {
        const response = await fetch(`https://api.datamuse.com/words?ml=${target}`);
        const data = await response.json();
        return data.some(item => item.word.toLowerCase() === word.toLowerCase());
    } catch (error) {
        console.error('API Error:', error);
        return false;
    }
}

async function handleMove() {
    const input = wordInput.value.trim().toLowerCase();
    if (!input) return;

    const target = levels[currentLevelIndex].target;
    message.innerText = 'Consulting the lexicon...';
    
    const isSynonym = await checkSynonym(input, target);

    if (isSynonym) {
        message.innerText = 'Correct! The walls shift...';
        board.style.transform = 'scale(1.2)';
        board.style.opacity = '0';
        
        setTimeout(() => {
            currentLevelIndex++;
            board.style.transform = 'scale(1)';
            board.style.opacity = '1';
            initLevel();
        }, 1000);
    } else {
        message.innerText = 'The word is rejected. Try again.';
        board.classList.add('shake');
        setTimeout(() => board.classList.remove('shake'), 500);
    }
}

submitBtn.addEventListener('click', handleMove);
wordInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') handleMove();
});

initLevel();
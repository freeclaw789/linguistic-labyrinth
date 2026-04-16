const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const targetDisplay = document.getElementById('target-word');
const levelDisplay = document.getElementById('level-val');
const scoreDisplay = document.getElementById('score-val');
const overlay = document.getElementById('overlay');
const startBtn = document.getElementById('start-btn');
const overlayTitle = document.getElementById('overlay-title');
const overlayDesc = document.getElementById('overlay-desc');

let gameState = 'START';
let score = 0;
let level = 1;
let targetWord = '';
let synonyms = [];
let activeWords = [];
let player = { x: 0, y: 0, radius: 20, color: '#38bdf8' };
let spawnTimer = 0;
let gameSpeed = 3;

const WORD_LIST = ['happy', 'fast', 'cold', 'brave', 'silent', 'large', 'small', 'bright', 'dark', 'strong', 'weak', 'angry', 'calm', 'heavy', 'light'];

function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    player.x = canvas.width / 2;
    player.y = canvas.height * 0.85;
}

window.addEventListener('resize', resize);
resize();

async function fetchWords() {
    targetWord = WORD_LIST[Math.floor(Math.random() * WORD_LIST.length)];
    targetDisplay.innerText = targetWord;

    try {
        const response = await fetch(`https://api.datamuse.com/words?ml=${targetWord}&max=10`);
        const data = await response.json();
        synonyms = data.map(item => item.word);
        
        if (synonyms.length === 0) {
            synonyms = [targetWord + '_syn'];
        }
    } catch (e) {
        synonyms = [targetWord + '_syn'];
    }
}

function spawnWord() {
    const isCorrect = Math.random() > 0.7;
    let word = '';
    
    if (isCorrect && synonyms.length > 0) {
        word = synonyms[Math.floor(Math.random() * synonyms.length)];
    } else {
        const noise = ['cloud', 'stone', 'blue', 'run', 'jump', 'fast', 'slow', 'apple', 'desk', 'wind', 'fire', 'water', 'void', 'null', 'echo'];
        word = noise[Math.floor(Math.random() * noise.length)];
    }

    activeWords.push({
        text: word,
        x: Math.random() * (canvas.width - 100) + 50,
        y: -50,
        speed: gameSpeed + Math.random() * 2,
        isCorrect: isCorrect && synonyms.includes(word),
        fontSize: 20 + Math.random() * 10
    });
}

function update() {
    if (gameState !== 'PLAYING') return;

    spawnTimer++;
    if (spawnTimer > 60) {
        spawnWord();
        spawnTimer = 0;
    }

    activeWords.forEach((w, index) => {
        w.y += w.speed;

        const dx = w.x - player.x;
        const dy = w.y - player.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < player.radius + 30) {
            if (w.isCorrect) {
                score += 10;
                scoreDisplay.innerText = score;
                activeWords.splice(index, 1);
                
                if (score % 50 === 0) {
                    level++;
                    levelDisplay.innerText = level;
                    gameSpeed += 0.5;
                    fetchWords();
                }
            } else {
                gameOver();
            }
        }

        if (w.y > canvas.height + 50) {
            activeWords.splice(index, 1);
        }
    });
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.beginPath();
    ctx.arc(player.x, player.y, player.radius, 0, Math.PI * 2);
    ctx.fillStyle = player.color;
    ctx.fill();
    ctx.shadowBlur = 15;
    ctx.shadowColor = player.color;
    ctx.closePath();
    ctx.shadowBlur = 0;

    ctx.textAlign = 'center';
    activeWords.forEach(w => {
        ctx.font = `bold ${w.fontSize}px monospace`;
        ctx.fillStyle = '#f8fafc';
        ctx.fillText(w.text, w.x, w.y);
    });
}

function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop);
}

function gameOver() {
    gameState = 'OVER';
    overlayTitle.innerText = 'GAME OVER';
    overlayDesc.innerText = `You survived to Level ${level} with ${score} points.`;
    startBtn.innerText = 'Try Again';
    overlay.style.display = 'flex';
}

function start() {
    score = 0;
    level = 1;
    gameSpeed = 3;
    activeWords = [];
    scoreDisplay.innerText = '0';
    levelDisplay.innerText = '1';
    overlay.style.display = 'none';
    gameState = 'PLAYING';
    fetchWords();
}

function handleInput(e) {
    if (gameState !== 'PLAYING') return;
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    player.x = clientX;
}

canvas.addEventListener('mousemove', handleInput);
canvas.addEventListener('touchmove', (e) => {
    e.preventDefault();
    handleInput(e);
}, { passive: false });

startBtn.addEventListener('click', start);

gameLoop();
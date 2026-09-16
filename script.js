// ============================================================
// CANVAS
// ============================================================

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");


// ============================================================
// PENGATURAN
// ============================================================

const GRID_SIZE = 20;
const JUMLAH_MAKANAN = 20;

let WIDTH = window.innerWidth;
let HEIGHT = window.innerHeight;

canvas.width = WIDTH;
canvas.height = HEIGHT;


// ============================================================
// WARNA
// ============================================================

const BACKGROUND = "rgb(15, 18, 26)";
const BACKGROUND_TOP = "rgb(24, 29, 41)";

const GRID_COLOR = "rgb(28, 33, 45)";
const GRID_COLOR_LIGHT = "rgb(34, 40, 54)";
const GRID_DECORATION = "rgb(40, 47, 63)";

const WHITE = "rgb(255, 255, 255)";
const BLACK = "rgb(20, 20, 25)";

const TEXT_MAIN = "rgb(245, 247, 250)";
const TEXT_SECONDARY = "rgb(155, 163, 180)";

const SOFT_HEAD = "rgb(255, 170, 195)";

const SOFT_COLORS = [
    "rgb(255, 205, 160)",
    "rgb(255, 225, 145)",
    "rgb(180, 225, 180)",
    "rgb(155, 215, 215)",
    "rgb(170, 200, 235)",
    "rgb(200, 180, 225)",
    "rgb(235, 180, 215)",
    "rgb(215, 195, 165)"
];

const FOOD_COLORS = [
    "rgb(255, 120, 135)",
    "rgb(255, 175, 110)",
    "rgb(255, 220, 100)",
    "rgb(160, 225, 160)",
    "rgb(140, 210, 235)",
    "rgb(205, 170, 230)",
    "rgb(240, 160, 200)",
    "rgb(255, 195, 135)"
];


// ============================================================
// GAME STATE
// ============================================================

let snake = [];
let foods = [];

let direction = {
    x: 0,
    y: 0
};

let score = 0;
let level = 1;
let speed = 8;

let gameRunning = false;
let gameOver = false;

let niceTimer = 0;

let lastMoveTime = 0;


// ============================================================
// ELEMENT
// ============================================================

const splashScreen = document.getElementById("splashScreen");
const menuScreen = document.getElementById("menuScreen");
const hud = document.getElementById("hud");
const mobileControls = document.getElementById("mobileControls");
const gameOverScreen = document.getElementById("gameOverScreen");

const scoreElement = document.getElementById("score");
const levelElement = document.getElementById("level");
const finalScoreElement = document.getElementById("finalScore");

const niceText = document.getElementById("niceText");

const startButton = document.getElementById("startButton");
const exitMenuButton = document.getElementById("exitMenuButton");

const restartButton = document.getElementById("restartButton");
const exitGameButton = document.getElementById("exitGameButton");


// ============================================================
// RESIZE
// ============================================================

function resizeCanvas() {

    WIDTH = window.innerWidth;
    HEIGHT = window.innerHeight;

    canvas.width = WIDTH;
    canvas.height = HEIGHT;

}

window.addEventListener("resize", resizeCanvas);


// ============================================================
// GRID
// ============================================================

function snap(value) {

    return Math.floor(value / GRID_SIZE) * GRID_SIZE;

}


// ============================================================
// BACKGROUND
// ============================================================

function drawBackground() {

    ctx.fillStyle = BACKGROUND;
    ctx.fillRect(0, 0, WIDTH, HEIGHT);


    // Bagian atas
    ctx.fillStyle = BACKGROUND_TOP;

    ctx.fillRect(
        0,
        0,
        WIDTH,
        180
    );


    // Grid
    ctx.strokeStyle = GRID_COLOR;
    ctx.lineWidth = 1;

    for (
        let x = 0;
        x < WIDTH;
        x += GRID_SIZE
    ) {

        ctx.beginPath();

        ctx.moveTo(x, 0);
        ctx.lineTo(x, HEIGHT);

        ctx.stroke();

    }


    for (
        let y = 0;
        y < HEIGHT;
        y += GRID_SIZE
    ) {

        ctx.beginPath();

        ctx.moveTo(0, y);
        ctx.lineTo(WIDTH, y);

        ctx.stroke();

    }


    // Dekorasi kotak
    const ukuran = 20;

    const positions = [

        [40, 220],
        [80, 220],
        [40, 260],

        [WIDTH - 100, 220],
        [WIDTH - 60, 220],
        [WIDTH - 100, 260],

        [40, HEIGHT - 130],
        [80, HEIGHT - 130],
        [40, HEIGHT - 90],

        [WIDTH - 100, HEIGHT - 130],
        [WIDTH - 60, HEIGHT - 130],
        [WIDTH - 100, HEIGHT - 90]

    ];


    ctx.fillStyle = GRID_DECORATION;

    positions.forEach(pos => {

        ctx.fillRect(
            pos[0],
            pos[1],
            ukuran,
            ukuran
        );

    });


    // Titik kecil
    ctx.fillStyle = GRID_COLOR_LIGHT;

    for (
        let x = 20;
        x < WIDTH;
        x += 80
    ) {

        ctx.fillRect(
            x,
            190,
            4,
            4
        );

    }

}


// ============================================================
// SPLASH SCREEN
// ============================================================

function startSplash() {

    let progress = 0;

    const interval = setInterval(() => {

        progress += 2;

        document.getElementById(
            "loadingProgress"
        ).style.width = progress + "%";


        let dots = ".".repeat(
            Math.floor(progress / 15) % 4
        );

        document.getElementById(
            "loadingText"
        ).textContent =
            "Menyiapkan permainan" + dots;


        if (progress >= 100) {

            clearInterval(interval);

            setTimeout(() => {

                splashScreen.classList.add("hidden");
                menuScreen.classList.remove("hidden");

            }, 250);

        }

    }, 50);

}


// ============================================================
// MENU
// ============================================================

function showMenu() {

    splashScreen.classList.add("hidden");
    gameOverScreen.classList.add("hidden");

    menuScreen.classList.remove("hidden");

    hud.classList.add("hidden");
    mobileControls.classList.add("hidden");

    gameRunning = false;

}


function startGame() {

    menuScreen.classList.add("hidden");
    gameOverScreen.classList.add("hidden");

    hud.classList.remove("hidden");
    mobileControls.classList.remove("hidden");

    resetGame();

    gameRunning = true;
    gameOver = false;

    lastMoveTime = performance.now();

    requestAnimationFrame(gameLoop);

}


// ============================================================
// BUAT ULAR
// ============================================================

function createSnake() {

    const centerX =
        snap(WIDTH / 2);

    const centerY =
        snap(HEIGHT / 2);

    return [

        {
            x: centerX,
            y: centerY
        },

        {
            x: centerX - GRID_SIZE,
            y: centerY
        },

        {
            x: centerX - GRID_SIZE * 2,
            y: centerY
        }

    ];

}


// ============================================================
// RANDOM FOOD
// ============================================================

function createFoodPosition() {

    let position;

    while (true) {

        const maxColumn =
            Math.floor(WIDTH / GRID_SIZE);

        const maxRow =
            Math.floor(HEIGHT / GRID_SIZE);

        const x =
            Math.floor(
                Math.random() * maxColumn
            ) * GRID_SIZE;

        const y =
            (4 +
                Math.floor(
                    Math.random() *
                    Math.max(1, maxRow - 4)
                )
            ) * GRID_SIZE;


        position = {
            x: x,
            y: y
        };


        let hitSnake =
            snake.some(part =>
                part.x === position.x &&
                part.y === position.y
            );


        let hitFood =
            foods.some(food =>
                food.x === position.x &&
                food.y === position.y
            );


        if (!hitSnake && !hitFood) {

            return position;

        }

    }

}


// ============================================================
// BUAT SEMUA MAKANAN
// ============================================================

function createAllFoods() {

    foods = [];

    for (
        let i = 0;
        i < JUMLAH_MAKANAN;
        i++
    ) {

        foods.push(
            createFoodPosition()
        );

    }

}


// ============================================================
// RESET GAME
// ============================================================

function resetGame() {

    snake = createSnake();

    direction = {
        x: 0,
        y: 0
    };

    score = 0;

    speed = 8;
    level = 1;

    gameOver = false;

    niceTimer = 0;

    createAllFoods();

    updateHUD();

}


// ============================================================
// UPDATE HUD
// ============================================================

function updateHUD() {

    scoreElement.textContent = score;

    levelElement.textContent = level;

    finalScoreElement.textContent =
        score;

}


// ============================================================
// SET DIRECTION
// ============================================================

function setDirection(x, y) {

    if (gameOver) {
        return;
    }


    // Atas / bawah
    if (y !== 0) {

        if (direction.y !== 0) {
            return;
        }

    }


    // Kiri / kanan
    if (x !== 0) {

        if (direction.x !== 0) {
            return;
        }

    }


    direction = {
        x: x,
        y: y
    };

}


// ============================================================
// KEYBOARD
// ============================================================

document.addEventListener("keydown", event => {

    if (
        event.key === "Enter" &&
        !menuScreen.classList.contains("hidden")
    ) {

        startGame();

    }


    if (
        event.key === "Escape" &&
        !menuScreen.classList.contains("hidden")
    ) {

        showExitMessage();

    }


    if (!gameOver) {

        switch (event.key.toLowerCase()) {

            case "arrowup":
            case "w":
                setDirection(0, -GRID_SIZE);
                break;

            case "arrowdown":
            case "s":
                setDirection(0, GRID_SIZE);
                break;

            case "arrowleft":
            case "a":
                setDirection(-GRID_SIZE, 0);
                break;

            case "arrowright":
            case "d":
                setDirection(GRID_SIZE, 0);
                break;

        }

    } else {

        if (
            event.key.toLowerCase() === "r"
        ) {

            restartGame();

        }

        if (
            event.key === "Escape"
        ) {

            showMenu();

        }

    }

});


// ============================================================
// TOMBOL HP
// ============================================================

document
    .getElementById("upButton")
    .addEventListener(
        "click",
        () => setDirection(0, -GRID_SIZE)
    );


document
    .getElementById("downButton")
    .addEventListener(
        "click",
        () => setDirection(0, GRID_SIZE)
    );


document
    .getElementById("leftButton")
    .addEventListener(
        "click",
        () => setDirection(-GRID_SIZE, 0)
    );


document
    .getElementById("rightButton")
    .addEventListener(
        "click",
        () => setDirection(GRID_SIZE, 0)
    );


// Touch langsung
document.addEventListener(
    "touchstart",
    event => {

        const target =
            event.target.closest(
                ".control-button"
            );

        if (target) {
            event.preventDefault();
        }

    },
    {
        passive: false
    }
);


// ============================================================
// START BUTTON
// ============================================================

startButton.addEventListener(
    "click",
    startGame
);


// ============================================================
// EXIT MENU
// ============================================================

exitMenuButton.addEventListener(
    "click",
    showExitMessage
);


function showExitMessage() {

    alert(
        "Terima kasih sudah bermain Snake Game!"
    );

}


// ============================================================
// RESTART
// ============================================================

function restartGame() {

    gameOverScreen.classList.add("hidden");

    hud.classList.remove("hidden");
    mobileControls.classList.remove("hidden");

    resetGame();

    gameRunning = true;

    lastMoveTime =
        performance.now();

    requestAnimationFrame(gameLoop);

}


restartButton.addEventListener(
    "click",
    restartGame
);


// ============================================================
// EXIT GAME
// ============================================================

exitGameButton.addEventListener(
    "click",
    showMenu
);


// ============================================================
// MOVE SNAKE
// ============================================================

function moveSnake() {

    if (
        direction.x === 0 &&
        direction.y === 0
    ) {

        return;

    }


    const oldHead = {
        x: snake[0].x,
        y: snake[0].y
    };


    const newHead = {

        x:
            snake[0].x +
            direction.x,

        y:
            snake[0].y +
            direction.y

    };


    // Tambahkan kepala
    snake.unshift(newHead);


    // Cek makanan
    let ateFood = false;

    for (
        let i = 0;
        i < foods.length;
        i++
    ) {

        if (
            newHead.x === foods[i].x &&
            newHead.y === foods[i].y
        ) {

            score++;

            niceTimer = 30;

            ateFood = true;


            // Buat makanan baru
            foods[i] =
                createFoodPosition();

            break;

        }

    }


    // Kalau tidak makan,
    // ekor dihapus
    if (!ateFood) {

        snake.pop();

    }


    // ========================================================
    // BATAS LAYAR
    // ========================================================

    if (

        newHead.x < 0 ||

        newHead.y < 0 ||

        newHead.x + GRID_SIZE > WIDTH ||

        newHead.y + GRID_SIZE > HEIGHT

    ) {

        setGameOver();

        return;

    }


    // ========================================================
    // TABRAK BADAN SENDIRI
    // ========================================================

    for (
        let i = 1;
        i < snake.length;
        i++
    ) {

        if (

            newHead.x === snake[i].x &&
            newHead.y === snake[i].y

        ) {

            setGameOver();

            return;

        }

    }


    // ========================================================
    // LEVEL
    // ========================================================

    speed =
        8 +
        Math.floor(score / 3);

    if (speed > 18) {

        speed = 18;

    }

    level = speed - 7;


    updateHUD();

}


// ============================================================
// GAME OVER
// ============================================================

function setGameOver() {

    gameOver = true;

    gameRunning = false;

    finalScoreElement.textContent =
        score;

    hud.classList.add("hidden");

    mobileControls.classList.add("hidden");

    gameOverScreen.classList.remove(
        "hidden"
    );

}


// ============================================================
// DRAW SNAKE
// ============================================================

function drawSnake() {

    // Badan
    for (
        let i = snake.length - 1;
        i > 0;
        i--
    ) {

        const part = snake[i];

        const color =
            SOFT_COLORS[
                (i - 1) %
                SOFT_COLORS.length
            ];


        ctx.fillStyle = color;

        ctx.fillRect(
            part.x,
            part.y,
            GRID_SIZE + 1,
            GRID_SIZE + 1
        );

    }


    // Kepala
    const head = snake[0];

    ctx.fillStyle = SOFT_HEAD;

    ctx.fillRect(
        head.x,
        head.y,
        GRID_SIZE,
        GRID_SIZE
    );


    // Mata
    let eye1;
    let eye2;


    if (direction.x > 0) {

        eye1 = {
            x: head.x + 14,
            y: head.y + 5
        };

        eye2 = {
            x: head.x + 14,
            y: head.y + 15
        };

    }

    else if (direction.x < 0) {

        eye1 = {
            x: head.x + 6,
            y: head.y + 5
        };

        eye2 = {
            x: head.x + 6,
            y: head.y + 15
        };

    }

    else if (direction.y < 0) {

        eye1 = {
            x: head.x + 5,
            y: head.y + 6
        };

        eye2 = {
            x: head.x + 15,
            y: head.y + 6
        };

    }

    else if (direction.y > 0) {

        eye1 = {
            x: head.x + 5,
            y: head.y + 14
        };

        eye2 = {
            x: head.x + 15,
            y: head.y + 14
        };

    }

    else {

        eye1 = {
            x: head.x + 14,
            y: head.y + 5
        };

        eye2 = {
            x: head.x + 14,
            y: head.y + 15
        };

    }


    drawEye(eye1);
    drawEye(eye2);

}


function drawEye(eye) {

    ctx.fillStyle = WHITE;

    ctx.beginPath();

    ctx.arc(
        eye.x,
        eye.y,
        4,
        0,
        Math.PI * 2
    );

    ctx.fill();


    ctx.fillStyle = BLACK;

    ctx.beginPath();

    ctx.arc(
        eye.x,
        eye.y,
        2,
        0,
        Math.PI * 2
    );

    ctx.fill();

}


// ============================================================
// DRAW FOOD
// ============================================================

function drawFoods() {

    foods.forEach(
        (food, index) => {

            const centerX =
                food.x + GRID_SIZE / 2;

            const centerY =
                food.y + GRID_SIZE / 2;


            // Glow luar
            ctx.fillStyle =
                "rgb(45, 48, 60)";

            ctx.beginPath();

            ctx.arc(
                centerX,
                centerY,
                11,
                0,
                Math.PI * 2
            );

            ctx.fill();


            // Makanan
            ctx.fillStyle =
                FOOD_COLORS[
                    index %
                    FOOD_COLORS.length
                ];

            ctx.beginPath();

            ctx.arc(
                centerX,
                centerY,
                7,
                0,
                Math.PI * 2
            );

            ctx.fill();


            // Cahaya
            ctx.fillStyle = WHITE;

            ctx.beginPath();

            ctx.arc(
                centerX - 2,
                centerY - 2,
                2,
                0,
                Math.PI * 2
            );

            ctx.fill();

        }
    );

}


// ============================================================
// NICE
// ============================================================

function drawNice() {

    if (niceTimer <= 0) {

        niceText.style.opacity = "0";

        return;

    }


    niceText.style.opacity = "1";

    niceText.style.transform =
        `translate(-50%, calc(-50% - ${
            (30 - niceTimer) * 2
        }px))`;

}


// ============================================================
// GAME LOOP
// ============================================================

function gameLoop(timestamp) {

    if (!gameRunning) {

        return;

    }


    const moveDelay =
        1000 / speed;


    if (
        timestamp - lastMoveTime >=
        moveDelay
    ) {

        moveSnake();

        lastMoveTime =
            timestamp;

    }


    if (niceTimer > 0) {

        niceTimer--;

    }


    drawBackground();

    drawFoods();

    drawSnake();

    drawNice();


    requestAnimationFrame(
        gameLoop
    );

}


// ============================================================
// START
// ============================================================

startSplash();
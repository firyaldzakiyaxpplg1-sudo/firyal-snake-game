"use strict";

/* ============================================================
   KONFIGURASI
============================================================ */

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const splashScreen = document.getElementById("splashScreen");
const menuScreen = document.getElementById("menuScreen");
const gameScreen = document.getElementById("gameScreen");

const startButton = document.getElementById("startButton");
const exitButton = document.getElementById("exitButton");

const restartButton = document.getElementById("restartButton");
const gameExitButton = document.getElementById("gameExitButton");

const gameOverOverlay = document.getElementById("gameOverOverlay");

const scoreElement = document.getElementById("score");
const levelElement = document.getElementById("level");
const finalScoreElement = document.getElementById("finalScore");

const niceText = document.getElementById("niceText");

const loadingProgress = document.getElementById("loadingProgress");
const loadingText = document.getElementById("loadingText");

const mobileControls = document.getElementById("mobileControls");


/* ============================================================
   GRID
============================================================ */

const GRID_SIZE = 20;
const JUMLAH_MAKANAN = 20;


/* ============================================================
   WARNA
============================================================ */

const COLORS = {

    background: "#0f121a",
    backgroundTop: "#181d29",

    grid: "#1c212d",
    gridLight: "#222836",
    gridDecoration: "#282f3f",

    head: "#ffabc3",

    snake: [
        "#ffcdA0",
        "#b4e1b4",
        "#9bd7d7",
        "#aac8eb",
        "#c8b4e1",
        "#ebb4d7",
        "#d7c3a5"
    ],

    food: [
        "#ff7887",
        "#ffaf6e",
        "#ffdc64",
        "#a0e1a0",
        "#8cd2eb",
        "#cdaaE6",
        "#f0a0c8",
        "#ffc387"
    ],

    white: "#ffffff",
    black: "#141419"
};


/* ============================================================
   GAME STATE
============================================================ */

let snake = [];
let direction = {
    x: 0,
    y: 0
};

let foods = [];

let score = 0;
let level = 1;
let speed = 8;

let gameOver = false;
let gameRunning = false;

let lastUpdate = 0;
let niceTimeout = null;


/* ============================================================
   CANVAS RESIZE
============================================================ */

function resizeCanvas() {

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

}

window.addEventListener("resize", resizeCanvas);

resizeCanvas();


/* ============================================================
   SPLASH SCREEN
============================================================ */

function runSplashScreen() {

    const startTime = performance.now();
    const duration = 2500;

    function animate(currentTime) {

        const elapsed = currentTime - startTime;

        let progress = elapsed / duration;

        if (progress > 1) {
            progress = 1;
        }

        loadingProgress.style.width =
            `${progress * 100}%`;

        const dots =
            ".".repeat(
                Math.floor(
                    (elapsed / 400) % 4
                )
            );

        loadingText.textContent =
            "Menyiapkan permainan" + dots;

        if (elapsed < duration) {

            requestAnimationFrame(animate);

        } else {

            splashScreen.classList.add("hidden");
            menuScreen.classList.remove("hidden");

        }

    }

    requestAnimationFrame(animate);
}


/* ============================================================
   MENU
============================================================ */

startButton.addEventListener("click", () => {

    mulaiGame();

});

exitButton.addEventListener("click", () => {

    keluarGame();

});

document.addEventListener("keydown", (event) => {

    if (!menuScreen.classList.contains("hidden")) {

        if (event.key === "Enter") {

            mulaiGame();

        }

        if (event.key === "Escape") {

            keluarGame();

        }

    }

});


/* ============================================================
   KELUAR GAME
============================================================ */

function keluarGame() {

    /*
       Browser tidak mengizinkan halaman menutup
       dirinya sendiri pada sebagian besar kondisi.

       Jadi kita coba menutup window terlebih dahulu.
    */

    window.close();

    /*
       Jika browser menolak window.close(),
       tampilkan halaman kosong sederhana.
    */

    setTimeout(() => {

        document.body.innerHTML = `
            <div style="
                width:100vw;
                height:100vh;
                display:flex;
                align-items:center;
                justify-content:center;
                background:#0f121a;
                color:white;
                font-family:Arial;
                text-align:center;
            ">
                <div>
                    <h1>GAME SELESAI</h1>
                    <p>Silakan tutup tab browser ini.</p>
                </div>
            </div>
        `;

    }, 100);

}


/* ============================================================
   MULAI GAME
============================================================ */

function mulaiGame() {

    menuScreen.classList.add("hidden");
    gameScreen.classList.remove("hidden");

    gameRunning = true;

    resetGame();

    lastUpdate = performance.now();

    requestAnimationFrame(gameLoop);

}


/* ============================================================
   RESET GAME
============================================================ */

function resetGame() {

    const centerX =
        Math.floor(
            canvas.width / 2 / GRID_SIZE
        ) * GRID_SIZE;

    const centerY =
        Math.floor(
            canvas.height / 2 / GRID_SIZE
        ) * GRID_SIZE;

    snake = [

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

    direction = {
        x: 0,
        y: 0
    };

    score = 0;

    speed = 8;
    level = 1;

    gameOver = false;

    gameOverOverlay.classList.add("hidden");

    updateHUD();

    foods = [];

    for (let i = 0; i < JUMLAH_MAKANAN; i++) {

        foods.push(
            createRandomFood()
        );

    }

}


/* ============================================================
   MEMBUAT MAKANAN ACAK
============================================================ */

function createRandomFood() {

    const columns =
        Math.floor(
            canvas.width / GRID_SIZE
        );

    const rows =
        Math.floor(
            canvas.height / GRID_SIZE
        );

    let food;

    while (true) {

        const x =
            Math.floor(
                Math.random() * columns
            ) * GRID_SIZE;

        /*
           Makanan tidak diletakkan terlalu dekat
           dengan bagian atas HUD.
        */
        const minRow = 4;

        const y =
            (
                Math.floor(
                    Math.random() *
                    (rows - minRow)
                ) + minRow
            ) * GRID_SIZE;

        food = {
            x: x,
            y: y,
            color:
                COLORS.food[
                    Math.floor(
                        Math.random() *
                        COLORS.food.length
                    )
                ]
        };

        let menabrakUlar = false;

        for (const segment of snake) {
            if (
                segment.x === food.x &&
                segment.y === food.y
            ) {
                menabrakUlar = true;
                break;
            }
        }

        if (!menabrakUlar) {
            return food;
        }
    }
}